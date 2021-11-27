/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ----------------------
 * Incident Details provides a detailed view of a single Incident. The view is a SplitView, where
 * the content is a list of log entries and the sidebar contains actions and general
 * actionable information. The header contains some of the details of the incident.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withRouter } from 'react-router-dom';
import { withIncident } from './withIncident';
import 'moment';
const fs = require('fs');
const { dialog } = require('electron').remote;

// Component Imports
import SplitView from 'components/layout/SplitView';
import FlexContainer from 'components/FlexContainer';
import DownloadLink from 'components/DownloadLink';
import InfoBanner from 'components/InfoBanner';
import Header from 'components/Header';
import SitePickerDialog from 'components/site/SitePickerDialog';
import AssignIncidentDialog from 'components/incidents/AssignIncidentDialog';
import Timeline from './Timeline';
import IncidentDetailsAppBar from './IncidentDetailsAppBar';
import EditIncidentSidebar from './EditIncidentSidebar';

import {
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Button,
} from '@material-ui/core';

// Icons
import GoBack from 'components/icon/GoBack';
import WarningIcon from '@material-ui/icons/Warning';
import EditIcon from '@material-ui/icons/Edit';

// Actions & Helpers
import { isClosed, isTransferred, getPhase } from './helpers';
import { avatarInitials, friendlyName } from 'lib/user_helpers';
import { types } from 'incident/log-entries';
import { flname } from 'auth/name';
import { getIncident, getIncidentAuditLog } from 'incident/incident'
import { getFeature } from 'map/features';
import getFormatterForTrack from '../../format/format';

/**
 * IncidentDetails
 *
 * Split View that displays incident information and actions in the sidebar
 * and the timeline contains a list of all log entries and search objects.
 */
class IncidentDetails extends React.Component {
  static propTypes = {
    /** TODO Deprecated. Replace with branch HOC to render null state */
    incidentId: PropTypes.string,

    /** withIncident provided */
    incident: PropTypes.object,
    /** withIncident provided */
    multicasts: PropTypes.array.isRequired,
    /** True when incident is loading */
    incidentIsLoading: PropTypes.bool.isRequired,
    /** Provided when the incident load/update has a failure */
    errorBannerText: PropTypes.string,

    /** @private withIncident */
    onSave: PropTypes.func.isRequired,
    /** @private withIncident */
    onLogEntryAdd: PropTypes.func.isRequired,
    /** @private withIncident */
    onLogEntrySave: PropTypes.func.isRequired,
    /** @private withIncident */
    onLogEntryRemove: PropTypes.func.isRequired,
    /** @private withIncident */
    forwardIncidentToSite: PropTypes.func.isRequired,
    /** @private withIncident */
    assignIncidentToUser: PropTypes.func.isRequired,

    // TODO incident should just already have this data on the object.
    // This is passed through the withIncident right now, but that's a side effect to keep things
    // moving and should not be relied on
    users: PropTypes.array,

    // TODO as above, there must be a better way to get this, but we need the current
    // user to check roles for showing the re-open closed incident button.
    currentUser: PropTypes.object,

    /** @private withRouter() */
    match: PropTypes.object.isRequired,
    /** @private withRouter() */
    history: PropTypes.object.isRequired,
  };

  static defaultProps = {
    incidentId: '',
    incident: undefined,
    errorBannerText: null,
    users: [],
  };

  state = {
    /**
     * SitePickerDialog configuration
     * These props will be sent to the SitePickerDialog component.
     */
    sitePickerDialogOpts: {
      open: false,
    },
    /**
     * AssignIncidentDialog configuration
     * These props will be sent to the AssignIncidentDialog component.
     */
    assignDialogOpts: {
      open: false,
      errorBannerText: null,
      assignmentType: 'assignee',
      isLoading: false,
    },
    /**
     * Share menu configuration. These options will be sent to the <Menu>
     * component displaying the shareMenuOptions
     */
    shareMenuOpts: {
      open: false,
      anchorEl: null,
    },
    /**
     * Sidebars list passed to <SplitView />
     */
    sidebars: [],
  };

  // TODO this should be in the new getStateFromProps function in React 16.3
  // TODO if the incident is not assigned, go force dialog to assign OR go back to previous
  // page in history. For now this may have to be in will recieve props, but in reality, with HOC
  // proper, incident must be required in this component, otherwise other comps will be rendered
  // by parent HOC.
  componentWillReceiveProps(newProps) {
    if (isTransferred(newProps.incident)) {
      this.showAssignIncidentDialog(newProps);
    }
  }

  onIncidentEditCancel = () => {
    // close sidebar
    this.setState({
      sidebars: [],
    });
  };

  /**
   * Calls the withIncident save to save the incident, if successful, then it closes the
   * sidebar and returns the incident. If an error occurs, the error will be raised.
   */
  onIncidentEditSave = async updatedIncident => {
    try {
      const incident = await this.props.onSave(updatedIncident);
      this.setState({
        sidebars: [],
      });
      return incident;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Re opens the incident
   */
  reopenIncident = () => {
    const { incident } = this.props;

    this.onIncidentEditSave({
      ...incident,
      state: 1, // set new state to open
    });
  };

  onLogEntrySelected = logEntry => {
    switch (logEntry.type) {
      case types.MARKER:
      case types.TRACK: {
        this.onTrackSelected(logEntry);
        break;
      }
    }
  };

  /**
   * @deprecated for expansion panel
   * All the log entries should in the future open as expansion panels, or when a sidebar
   * is needed, just push a sidebar and now modify the route.
   */
  openDetails = location => {
    if (!this.props.match.isExact) {
      this.props.history.replace(location);
    } else {
      this.props.history.push(location);
    }
  };

  onTrackSelected = logEntry => {
    const newLocation = {
      pathname: `/incidents/details/${this.props.incident.id}/logEntry/${logEntry.id}/${logEntry.entity.type
        }/${logEntry.entity.id}`,
      search: '?hideCreateIncident=true',
    };
    this.openDetails(newLocation);
  };

  onShareMenuClose = () => {
    this.setState(prevState => ({
      shareMenuOpts: {
        ...prevState.shareMenuOpts,
        open: false,
      },
    }));
  };

  onSitePickerDialogClose = async (okClicked, selectedSite) => {
    this.setState(prevState => ({
      sitePickerDialogOpts: {
        ...prevState.sitePickerDialogOpts,
        open: false,
      },
    }));

    if (okClicked) {
      try {
        await this.props.forwardIncidentToSite(selectedSite);
      } catch (error) {
        // Do nothing here, withIncident actually handles the error and passes the error banner to
        // this component, so we just need to keep the error from propagating.
      }
    }
  };

  /**
   * Called when the user hits ok or cancel on the assign incident dialog.
   * If the user hit cancel the dialog is closed. If the user hits ok, then assign the incident
   * and when successful response from the server, close the modal, otherwise, show an error.
   *
   * If the user hits cancel and the incident was forwarded from another site, then we do a history
   * go back instead of close. The incident must be assigned before it can be worked on.
   *
   * @param {boolean} okClicked Did the user hit ok or cancel.
   * @param {object} userAccount The user account that was selected to assign the incident to.
   * @param {string} assignmentType What are we assigning? Commander or assignee
   * @return {boolean} True if the assign was successful. False if an error occured and the
   * dialog will remain open.
   */
  onAssignDialogClose = async (okClicked, userAccount, assignmentType) => {
    // If the user hit cancel, just close the modal and return.
    if (!okClicked) {
      // If incident is transferring, it means the incident was receieved but not assigned yet, so
      // go back in history. We can't allow incident details without assignee.
      if (isTransferred(this.props.incident)) {
        this.props.history.goBack();
        return true;
      }

      this.setState(prevState => ({
        assignDialogOpts: {
          ...prevState.assignDialogOpts,
          open: false,
        },
      }));

      return true;
    }

    // User hit ok
    try {
      await this.props.assignIncidentToUser(userAccount, assignmentType);
      this.setState(prevState => ({
        assignDialogOpts: {
          ...prevState.assignDialogOpts,
          errorBannerText: null,
          open: false,
        },
      }));
    } catch (error) {
      this.setState(prevState => ({
        assignDialogOpts: {
          ...prevState.assignDialogOpts,
          errorBannerText: error.message,
        },
      }));

      return false;
    }

    return true;
  };

  /**
   * Called whenever the incident edit button is clicked. This will
   * push the EditIncidentSidebar onto the sidebars stack;
   */
  onEditButtonClick = () => {
    this.pushSidebar(
      <EditIncidentSidebar
        incident={this.props.incident}
        onClose={this.onIncidentEditCancel}
        onSave={this.onIncidentEditSave}
      />,
    );
  };

  getAssignee = () => {
    const { users, incident } = this.props;

    if (users) {
      return users.find(user => user.userId === incident.assignee);
    }
  };

  getCommander = () => {
    const { users, incident } = this.props;

    if (users) {
      return users.find(user => user.userId === incident.commander);
    }
  };


  /**
   * Returns true if the current user is the incident commander.
   */
  isCurrentUserCommander = () => {
    const { currentUser } = this.props;
    const user = this.getCommander();
    if (user && user.userId) {
      return user.userId === currentUser.userId;
    }
    return false;
  };

  /**
   * Returns true if the current user is an administrator.
   */
  isCurrentUserAnAdministrator = () => {
    const { currentUser } = this.props;

    if ((currentUser.roles || []).includes('Administrator')) {
      return true;
    }

    return false;
  };

  /**
   * Returns true if the user is SAR controller or administrator and the incident is closed.
   * Returns false if the above is not the case and the re-open button shouldn't be shown to
   * the user.
   */
  shouldShowReopenButton = () => {
    const { incident } = this.props;
    // Incident must be closed
    if (isClosed(incident)) {
      // and user must be commander (SAR Mission Controller) or have role Administrator
      return this.isCurrentUserCommander() || this.isCurrentUserAnAdministrator();
    }

    return false;
  };

  /**
   * Opens the share menu.
   */
  showShareMenu = event => {
    const target = event.currentTarget;
    this.setState(prevState => ({
      shareMenuOpts: {
        ...prevState.shareMenuOpts,
        open: true,
        anchorEl: target,
      },
    }));
  };

  /**
   * Opens the site picker dialog so the user can select a site to
   * transfer an incident to another site.
   */
  showSitePickerDialog = () => {
    this.onShareMenuClose();
    this.setState(prevState => ({
      sitePickerDialogOpts: {
        ...prevState.sitePickerDialogOpts,
        open: true,
        title: __('Transfer Incident'),
        message: __(
          'Select a site from the list below or start typing to search for a site. Click on a site to start the transfer of the Incident to that site.',
        ),
        selectedTitle: __('Confirm Site for Transfer'),
        selectedMessage: __(
          'You are about to initiate a transfer of this Incident to the following site. If this is not the correct site, you can click the remove icon below next to the site to return to the site selection list.\n\nWhen the transfer is initiated by clicking Start Transfer, the Incident will be closed as Handoff and the transfer will begin. If the transfer to the site fails, the Incident will be re-opened. If the transfer successfully completes, you will get a notification and the incident will be updated to show the completed transfer and left in the closed state.',
        ),
        okButtonText: __('Start Transfer'),
      },
    }));
  };

  exportIncidentToCSV = async () => {
    this.onShareMenuClose();

    let getIncidentAction = getIncident(this.props.incident.id, true); // with deleted
    let incident;
    try {
      incident = await this.props.createTransaction(getIncidentAction, true);
    } catch (err) {
      dialog.showErrorBox(__('Error'), `${__('Unable to export')}: ${err}`);
      return;
    }

    let getLogAction = getIncidentAuditLog(incident.id, true, true); // force update, and with all entries
    let activity;
    try {
      activity = await this.props.createTransaction(getLogAction, true);
    } catch (err) {
      dialog.showErrorBox(__('Error'), `${__('Unable to export')}: ${err}`);
      return;
    }

    for (let entry of incident.log) {
      if (entry.type !== 'TRACK') {
        continue;
      }
      let { id, type } = entry.entity;
      let action = getFeature(id, type);
      let response = await this.props.createTransaction(action)
      entry.track = response;
    }

    let users = this.props.users;
    let owner = users.find((u) => u.userId === incident.assignee);
    let smc = users.find((u) => u.userId === incident.commander);
    let csv = [
      `${__('Incident')},${incident.incidentId}`,
      `${__('Name')},${incident.name}`,
      `${__('Type')},${incident.type}`,
      `${__('Phase')},${getPhase(incident)}`,
      `${__('Owner')},${flname(owner)} (${owner.userId})`,
      `${__('SAR Mission Controller')},${flname(smc)} (${smc.userId})`,
      '',
      `${__('Date')},${__('Time')},${__('Activity')},${__('Deleted')},${__('Description')}`
    ];
    for (let entry of incident.log) {
      let timestamp = moment(entry.timestamp.seconds * 1000)
      let date = moment(timestamp).format('YYYY-MM-DD');
      let time = moment(timestamp).format('HH:mm:ss z');
      let descript = '';
      if (entry.note) {
        descript = entry.note;
      } else if (entry.attachment) {
        descript = entry.attachment.name;
      } else if (entry.track) {
        descript = getFormatterForTrack(entry.track, null).label(entry.track) // config not needed for label
      }
      let deleted = entry.deleted ? __('Yes') : "";
      csv.push(`${date},${time},${entry.type},${deleted},"${descript}"`);
    }
    csv.push('');
    csv.push(`${__('Date')},${__('Time')},${__('User')},${__('Action')},${__('Outcome')}`);
    for (let entry of activity) {
      let timestamp = moment(entry.created);
      let date = moment(timestamp).format('YYYY-MM-DD');
      let time = moment(timestamp).format('HH:mm:ss z');
      csv.push(`${date},${time},${entry.userId},${entry.action},${entry.outcome}`);
    }
    csv.push('');

    let path = dialog.showSaveDialog({
      title: __('Export incident'),
      buttonLabel: __('Export'),
      filters: [
        { name: __('Comma separated values'), extensions: ['csv'] }
      ],
      defaultPath: `${__('Incident')}-${incident.incidentId}.csv`
    })
    if (!path) {
      return;
    }
    try {
      fs.writeFileSync(path, csv.join('\n'), {
        encoding: 'utf-8'
      })
    } catch (err) {
      dialog.showErrorBox(__('Error'), `${__('Unable to export')}: ${err}`)
    }
  }

  /**
   * Opens the assign incident dialog so the user can select a new assignee.
   *
   * @params {object} newProps If the assign show is being driven by a component props update, then
   * the new props are passed in as a parameter. If newProps is undefined, then the function will
   * use this.props.
   */
  showAssignIncidentDialog = newProps => {
    const props = newProps || this.props;

    // If the incident is already assigned then this is a normal reassign. Otherwise, its an
    // incident forward so the text needs to reflect that.
    let title = __('Assign Incident');
    let message = __(
      'Select a user from the list below, or use the search box to find the user account.',
    );
    const okButtonText = __('Assign');

    if (isTransferred(props.incident)) {
      title = __('Incident Received');
      message = __(
        'This incident was recieved from site {{site}}. To accept this incident and open it, please selected a user to be assigned the incident from the list below or use the search box to find a user.',
      );
    }

    this.setState(prevState => ({
      assignDialogOpts: {
        ...prevState.assignDialogOpts,
        title,
        message,
        okButtonText,
        assignmentType: 'assignee',
        open: true,
      },
    }));
  };

  /**
   * Opens the assign incident dialog so the user can select a new SAR Mission Co-Ordinator
   */
  showAssignCommanderIncidentDialog = () => {
    this.setState(prevState => ({
      assignDialogOpts: {
        ...prevState.assignDialogOpts,
        assignmentType: 'commander',
        open: true,
        title: __('Assign SAR Mission Controller'),
        selectedTitle: __('Confirm SAR Mission Controller Assignment'),
        message: __(
          'Select a user from the list below or use the search box to find the user account. ',
        ),
        selectedMessage: __(
          'Click Assign to confirm this user as the new SAR Mission Controller. You can remove the user below if you want to go back to select a different user.',
        ),
        okButtonText: __('Assign'),
      },
    }));
  };

  /**
   * Replaces the current sidebar with the provided sidebar.
   * @param {Component} sidebar The new sidebar to display.
   */
  pushSidebar = sidebar => {
    this.setState({
      sidebars: [sidebar],
    });
  };

  /**
   * Returns text for info panel saying the incident is closed, or
   * if open, returns null so banner does not display.
   * @return {string} text content or null if the incident is open.
   */
  getIncidentClosedBannerText = () => {
    const { incident } = this.props;
    let infoBannerText = null;


    if (isClosed(incident)) {
      if (this.isCurrentUserCommander() || this.isCurrentUserAnAdministrator()) {
        // Show a nice banner if you can re-open
        infoBannerText = `${__('Incident Closed. ')} ${__(
          'You can re-open this incident by clicking Re-Open Incident below.',
        )}`;
      } else {
        // Show the contact another user to re-open if you don't have privs
        infoBannerText = `${__('Incident Closed. ')} ${__(
          'Please contact user {{name}} or an Administrator to re-open this incident.',
          { name: incident.commander },
        )}`;
      }
    }

    return infoBannerText;
  };

  // The component render for when no data is found
  nullCase = incidentId => {
    const header = (
      <FlexContainer align="space-between center">
        <FlexContainer align="start center">
          <GoBack to="/incidents" />
          <Typography variant="h4">{__('Not Found')}</Typography>
        </FlexContainer>
        <WarningIcon />
      </FlexContainer>
    );
    return (
      <SplitView header={header}>
        <FlexContainer align="center start">
          <Typography variant="h6">
            {`${__('Sorry, we could not find an Incident')} ${incidentId &&
              ` with the ID ${incidentId}`}`}
          </Typography>
        </FlexContainer>
      </SplitView>
    );
  };

  loadingCase = () => {
    const header = (
      <FlexContainer align="space-between center">
        <FlexContainer align="start center">
          <GoBack to="/incidents" />
          <Typography variant="h4">{__('Loading')}</Typography>
        </FlexContainer>
        <FlexContainer align="center start">
          <FlexContainer column align="start stretch">
            <Typography variant="h6">{__('Loading Incident Details...')}</Typography>
            <CircularProgress variant="indeterminate" color="primary" size={64} />
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    );
    return <SplitView header={header} />;
  };

  renderSidebar = ({ incident }) => (
    <FlexContainer column>
      <FlexContainer align="stretch" padding="dense">
        <InfoBanner compact message={this.getIncidentClosedBannerText()} />
      </FlexContainer>

      {this.shouldShowReopenButton() && (
        <FlexContainer align="center center" padding="dense">
          <Button fullWidth variant="contained" color="default" onClick={this.reopenIncident}>
            Re-Open Incident
          </Button>
        </FlexContainer>
      )}

      <Header variant="h6" margin="normal">
        {__('Assignments')}
      </Header>
      <List>
        <ListItem divider>
          <ListItemAvatar>
            <Avatar>{avatarInitials(this.getAssignee())}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={friendlyName(this.getAssignee())} secondary={__('Assignee')} />
          {!isClosed(incident) && (
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={this.showAssignIncidentDialog}>
                <EditIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>{avatarInitials(this.getCommander())}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={friendlyName(this.getCommander())}
            secondary={__('SAR Mission Controller')}
          />
          {!isClosed(incident) && (
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={this.showAssignCommanderIncidentDialog}>
                <EditIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      </List>
    </FlexContainer>
  );

  render() {
    const { shareMenuOpts, sidebars, sitePickerDialogOpts, assignDialogOpts } = this.state;

    const {
      incident,
      multicasts,
      incidentIsLoading,

      errorBannerText,

      onLogEntryAdd,
      onLogEntryRemove,
      onLogEntrySave,
    } = this.props;

    // If transaction loaded, but the incident isn't found, show error case.
    if (!incident) {
      if (incidentIsLoading) {
        return this.loadingCase();
      }
      return this.nullCase(this.props.incidentId || this.props.match.params.id);
    }

    const incidentDetailsHeader = (
      <IncidentDetailsAppBar
        incident={incident}
        onShareMenuClick={this.showShareMenu}
        onEditButtonClick={this.onEditButtonClick}
      />
    );

    return (
      <SplitView
        header={incidentDetailsHeader}
        sidebars={sidebars}
        sidebar={this.renderSidebar(this.props)}
      >
        <FlexContainer>
          {/* CONTENT */}
          <Timeline
            incident={incident}
            multicasts={multicasts}
            errorBannerText={errorBannerText}
            onLogEntrySelected={this.onLogEntrySelected}
            onLogEntryAdd={onLogEntryAdd}
            onLogEntryRemove={onLogEntryRemove}
            onLogEntrySave={onLogEntrySave}
          />

          {/* Dialogs */}
          <SitePickerDialog onClose={this.onSitePickerDialogClose} {...sitePickerDialogOpts} />
          <AssignIncidentDialog onClose={this.onAssignDialogClose} {...assignDialogOpts} />

          {/* Menus */}
          <Menu id="share-menu" onClose={this.onShareMenuClose} {...shareMenuOpts}>
            <MenuItem onClick={this.showSitePickerDialog}>
              {__('Transfer Incident to another Site')}
            </MenuItem>
            <DownloadLink
              uri={`/incident/${incident.id}/processing`}
              filename={incident.name}
              onClick={this.onShareMenuClose}
            >
              <MenuItem>{__('Generate Incident Processing Form')}</MenuItem>
            </DownloadLink>
            <MenuItem onClick={this.exportIncidentToCSV}>
              {__('Export Incident to CSV File')}
            </MenuItem>
          </Menu>
        </FlexContainer>
      </SplitView>
    );
  }
}

function mapPropsToRequest(props) {
  return {
    incidentId: props.incidentId || props.match.params.id,
  };
}

export default withRouter(withIncident(mapPropsToRequest)(IncidentDetails));
// With router must be before withIncident, or the mapPropsToRequest won't have the match prop
// to get the incident ID
