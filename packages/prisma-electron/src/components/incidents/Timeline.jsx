import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { __ } from 'lib/i18n';

// Component Imports
import FlexContainer from 'components/FlexContainer';
import LogEntryList from './log-entries/LogEntryList';
import ErrorBanner from 'components/error/ErrorBanner';
import InfoBanner from 'components/InfoBanner';
import ContentViewGroup from 'components/layout/ContentViewGroup';
import IncidentForwardProgress from 'components/incidents/IncidentForwardProgress';
import SearchObjectTimeline from 'components/incidents/SearchObjectTimeline';
import AddLogEntryContentViewGroup from 'components/incidents/log-entries/AddLogEntryContentViewGroup';

import {
  Paper,
  Typography,
  Button,
} from '@material-ui/core';

import {
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction
} from "@material-ui/lab";

// Icons
import MessageIcon from '@material-ui/icons/Message';
import FolderIcon from '@material-ui/icons/Folder';
import TargetIcon from '@material-ui/icons/LocationSearching';

// Helpers & actions
import { types } from 'incident/log-entries';
import * as time from 'lib/time';
import { isClosed } from './helpers';

/**
 * Timeline
 */
class Timeline extends React.Component {
  static propTypes = {
    incident: PropTypes.object.isRequired,
    /**
     * Array of multicasts associated with this incident. Required
     * to be set, but not required to have multicasts.
     */
    multicasts: PropTypes.array.isRequired,
    groupBy: PropTypes.oneOf(['type', 'time']),
    /**
     * When not null an error banner will be displayed
     * with the message here displayed.
     */
    errorBannerText: PropTypes.string,
    /**
     * When not null an info banner will be displayed
     * with the message here displayed.
     */
    infoBannerText: PropTypes.string,

    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,

    classes: PropTypes.object.isRequired,

    onLogEntrySelected: PropTypes.func.isRequired,

    /** @private withIncident */
    onLogEntryAdd: PropTypes.func.isRequired,
    /** @private withIncident */
    onLogEntrySave: PropTypes.func.isRequired,
    /** @private withIncident */
    onLogEntryRemove: PropTypes.func.isRequired,
  };

  static defaultProps = {
    groupBy: 'time',
    infoBannerText: null,
    errorBannerText: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      showSpeedDial: false,
      errorBannerText: null,
      warningBannerText: null,
      groupBy: props.groupBy,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      groupBy: props.groupBy,
    });
  }

  /** ********************************
   * Log Entry CRUD
   ********************************* */

  showNoteAdd = () => {
    this.setState({
      showLogEntryAdd: true,
      logEntryToAdd: 'note',
    });
  };

  showSearchObjectAdd = () => {
    this.setState({
      showLogEntryAdd: true,
      logEntryToAdd: 'searchObject',
    });
  };

  showFileAdd = () => {
    this.setState({
      showLogEntryAdd: true,
      logEntryToAdd: 'file',
    });
  };

  closeAdd = () => {
    this.setState({
      showLogEntryAdd: false,
      logEntryToAdd: null,
    });
  };

  addLogEntryNote = async (note, isTarget = false) => {
    this.setState({ logEntryErrorBannerText: null });

    const entry = {
      note,
      type: types.NOTE,
      target: isTarget,
    };

    try {
      await this.onLogEntryAdd(entry);
      this.setState({
        showLogEntryAdd: false,
        logEntryToAdd: null,
      });
    } catch (error) {
      this.setState({
        logEntryErrorBannerText: __('An error occured creating the note. Try again later.'),
      });
    }
  };

  addLogEntryFile = (files, failedFiles) => {
    this.setState({ logEntryErrorBannerText: null });
    // process the successful files
    const filePromises = [];

    files.map(file => {
      const entry = {
        attachment: file,
        type: types.FILE,
      };
      filePromises.push(this.onLogEntryAdd(entry));
    });

    // batches up all the log entry adds. Shows error if any fail.
    Promise.all(filePromises).then(
      () => {
        // leave the upload if one or more files failed to upload from the file upload
        // components so that shows the upload failure.
        if (!failedFiles || failedFiles.length === 0) {
          this.closeAdd();
        }
      },
      response => {
        this.setState({
          logEntryErrorBannerText:
            __('An error occurred while creating one or morelog entries: ') +
            (response.statusText || response.message),
        });
      },
    );
  };

  onLogEntryAdd = async logEntry => {
    this.setState({ logEntryErrorBannerText: null });
    try {
      return await this.props.onLogEntryAdd(logEntry);
    } catch (error) {
      this.setState({ logEntryErrorBannerText: error.message });
      throw error;
    }
  };

  onLogEntryRemoved = async logEntry => {
    this.setState({ logEntryErrorBannerText: null });
    try {
      await this.props.onLogEntryRemove(logEntry);
    } catch (error) {
      this.setState({ logEntryErrorBannerText: error.message });
    }
  };

  /**
   * Toggles speed dial actions being show when the speed dial is clicked.
   */
  onSpeedDialClick = () => {
    this.setState(prevState => ({ showSpeedDial: !prevState.showSpeedDial }));
  };

  showSpeedDialActions = () => {
    this.setState({ showSpeedDial: true });
  };

  hideSpeedDialActions = () => {
    this.setState({ showSpeedDial: false });
  };

  // Closes the details if the provided log entry match the opened
  // details panel
  closeDetails = logEntry => {
    if (this.props.location.pathname.includes(`logEntry/${logEntry.id}`)) {
      this.props.history.goBack();
    }
  };

  /** ********************************
   *
   * Sorting and Filtering
   *
   ********************************* */

  groupByType = () =>
    this.props.incident.log.reduce((obj, entry) => {
      // Skip search objects
      if (entry.target === true) {
        return obj;
      }

      let type = entry.type;
      if (type.startsWith('ACTION')) {
        type = 'ACTION';
      }
      if (obj[type]) {
        obj[type].entries.push(entry);
      } else {
        obj[type] = { label: type, entries: [entry] };
      }

      return obj;
    }, {});

  /**
   * Group entitites by time. Time groups are.
   *  * Today.
   *  * Yesterday
   *  * This Week
   *  * This Month
   *  * Date
   */
  groupByTime = () =>
    this.props.incident.log.reduce((obj, entry) => {
      // Skip search objects
      if (entry.target === true) {
        return obj;
      }

      const { label, order } = time.getDisplayTimeGroup(entry.timestamp.seconds * 1000);
      if (obj[order]) {
        obj[order].entries.push(entry);
      } else {
        obj[order] = { label, entries: [entry] };
      }

      return obj;
    }, {});

  /** ********************************
   *
   *  Render
   *
   ********************************* */

  /**
   * Renders the null state of the log entry list
   */
  renderNullState() {
    const { classes, incident } = this.props;

    if (incident.log && incident.log.length > 1) {
      return null;
    }

    // Hide the null state when adding log entries.
    if (this.state.showLogEntryAdd) {
      switch (this.state.logEntryToAdd) {
        case 'note':
        case 'file': {
          return null;
        }
      }
    }
    return (
      <ContentViewGroup
        title={__('No Entries')}
        component={Paper}
        componentProps={{ elevation: 0 }}
      >
        <Paper elevation={2}>
          <FlexContainer column align="start stretch" padding="normal">
            <Typography variant="body2" align="center">
              {__('No entries for this Incident.')}
            </Typography>
            {!isClosed(incident) && (
              <React.Fragment>
                <Typography variant="body1" align="center">
                  {__('You can add a new entry by clicking one of the buttons below.')}
                </Typography>
                <FlexContainer align="center" className={classes.addButtonRow}>
                  <Button
                    variant="contained"
                    onClick={this.showNoteAdd}
                    className={classes.addButton}
                  >
                    {__('Create Note')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={this.showFileAdd}
                    className={classes.addButton}
                  >
                    {__('Upload File')}
                  </Button>
                </FlexContainer>
              </React.Fragment>
            )}
          </FlexContainer>
        </Paper>
      </ContentViewGroup>
    );
  }

  render() {
    const {
      incident,
      multicasts,
      classes,
      onLogEntrySelected,
      onLogEntrySave,
      infoBannerText,
      errorBannerText,
    } = this.props;

    const {
      groupBy,
      logEntryErrorBannerText,
      showSpeedDial,
      showLogEntryAdd,
      logEntryToAdd,
    } = this.state;

    const searchObjects = incident.log ? incident.log.filter(entry => entry.target === true) : [];
    let groups = {};
    if (incident.log && incident.log.length !== 0) {
      switch (groupBy) {
        case 'type': {
          groups = this.groupByType();
          break;
        }
        case 'time': {
          groups = this.groupByTime();
          break;
        }
        default: {
          groups = {
            [__('Entities')]: { label: __('Entities'), entries: incident.log },
          };
        }
      }
    }

    return (
      <FlexContainer column align="start center" classes={{ root: classes.entries }}>
        {/* Action Bar */}
        <FlexContainer align="end center" className={classes.contentActions}>
          {groupBy === 'type' && (
            <Button onClick={() => this.setState({ groupBy: 'time' })}>
              {__('Group By Time')}
            </Button>
          )}
          {groupBy === 'time' && (
            <Button onClick={() => this.setState({ groupBy: 'type' })}>
              {__('Group By Type')}
            </Button>
          )}
        </FlexContainer>

        {/* Error and info banners */}
        <ErrorBanner message={logEntryErrorBannerText} contentGroup />
        <ErrorBanner message={errorBannerText} contentGroup />
        <InfoBanner message={infoBannerText} contentGroup />

        {/* Multicast Progress */}
        {multicasts.length > 0 && (
          <ContentViewGroup>
            {multicasts.map(multicast => (
              <IncidentForwardProgress multicast={multicast} key={multicast.id} />
            ))}
          </ContentViewGroup>
        )}

        {/* Add Search Object Content */}
        <AddLogEntryContentViewGroup
          show={showLogEntryAdd && logEntryToAdd === 'searchObject'}
          entryType={logEntryToAdd}
          onNoteSave={this.addLogEntryNote}
          onClose={this.closeAdd}
        />

        {/* Search Objects. Only show when not adding a search object */}
        {!(showLogEntryAdd && logEntryToAdd === 'searchObject') && (
          <SearchObjectTimeline
            searchObjects={searchObjects}
            incident={incident}
            onRemove={this.onLogEntryRemoved}
            onSave={onLogEntrySave}
            onSelect={onLogEntrySelected}
            onCreateClicked={this.showSearchObjectAdd}
          />
        )}

        {/* Null State for Log Entries */}
        {this.renderNullState(groups)}

        {/* Add Log Entry Content */}
        <AddLogEntryContentViewGroup
          show={showLogEntryAdd && (logEntryToAdd === 'note' || logEntryToAdd == 'file')}
          entryType={logEntryToAdd}
          onNoteSave={this.addLogEntryNote}
          onUploadFinished={this.addLogEntryFile}
          onClose={this.closeAdd}
        />

        {/* Log Entry Groups */}
        {Object.keys(groups)
          .sort()
          .map(group => (
            <ContentViewGroup key={group} title={groups[group].label}>
              <LogEntryList
                onRemove={this.onLogEntryRemoved}
                onSave={onLogEntrySave}
                onSelect={onLogEntrySelected}
                incident={incident}
                entries={groups[group].entries}
              />
            </ContentViewGroup>
          ))}

        {/*
         * FAB
         */}
        {!isClosed(incident) && (
          <SpeedDial
            ariaLabel="Add Log Entries to Incident"
            className={classes.speedDial}
            icon={<SpeedDialIcon />}
            onBlur={this.hideSpeedDialActions}
            onClick={this.onSpeedDialClick}
            onClose={this.hideSpeedDialActions}
            onFocus={this.showSpeedDialActions}
            onMouseEnter={this.showSpeedDialActions}
            onMouseLeave={this.hideSpeedDialActions}
            open={showSpeedDial}
          >
            <SpeedDialAction
              icon={<TargetIcon />}
              tooltipTitle={__('Add Search Object')}
              onClick={this.showSearchObjectAdd}
            />
            <SpeedDialAction
              icon={<MessageIcon />}
              tooltipTitle={__('Add Note')}
              onClick={this.showNoteAdd}
            />
            <SpeedDialAction
              icon={<FolderIcon />}
              tooltipTitle={__('Upload File')}
              onClick={this.showFileAdd}
            />
          </SpeedDial>
        )}
      </FlexContainer>
    );
  }
}

export default withStyles(theme => ({
  entries: {
    overflowY: 'auto',
    width: '100%',
    // make space for FAB icon when scrolled all the way to the bottom.
    paddingBottom: '100px',
  },
  contentActions: {
    width: '100%',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  addButton: {
    margin: theme.spacing(2),
  },
  closeIcon: {
    position: 'absolute',
    paddingRight: theme.spacing(2),
    top: `-${theme.spacing(4)}px`,
    right: '0px',
  },
  speedDial: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: `calc(${theme.spacing(3)}px + ${theme.c2.drawers.right.width})`,
  },
}))(withRouter(Timeline));
