import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import loglevel from 'loglevel';
import { withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';

// Components
import Infinite from 'react-infinite';

import FlexContainer from 'components/FlexContainer';
import ErrorBanner from 'components/error/ErrorBanner';
import DropDownButton from 'components/DropDownButton';

import {
  Typography,
  Button,
  IconButton,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Chip,
} from "@material-ui/core";

// Icons
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import FlagIcon from '@material-ui/icons/Flag';

import { __ } from 'lib/i18n';
import { withTransaction } from 'server/transaction';

// Actions & Helpers
import * as noticeActions from 'notices/notices';
import * as mapActions from 'map/map';
import { getLookup } from 'map/lookup';
import * as bannerActions from 'banner/banner';

const log = loglevel.getLogger('notices');

const styles = theme => ({
  newButton: {
    float: 'right',
    marginBottom: '10px',
  },
  name: {
    verticalAlign: 'middle',
  },
  ago: {
    marginLeft: '53px',
    fontSize: '8pt',
  },
  ackCell: {
    textAlign: 'right',
    verticalAlign: 'middle',
  },
  matchRow: {
    paddingLeft: '10px',
  },
  flyCell: {
    verticalAlign: 'middle',
  },
  container: {
    height: 'calc(100vh - 110px);',
  },
  header: {
    height: '50px',
    marginBottom: '5px',
  },
  flyToTooltip: {
    minWidth: '75px',
  },
  /*
   * Formats icon button with a left icon
   */
  leftIcon: {
    marginRight: theme.spacing(1),
  },
});

class ListAlertsPanel extends React.Component {

  static filterOptions = [
    {
      title: __('All'),
      id: 'none',
      icon: null
    }, {
      title: __('Alert'),
      id: 'alert',
      icon: null
    }, {
      title: __('Notice'),
      id: 'notice',
      icon: null
    }, {
      title: __('Message'),
      id: 'message',
      icon: null
    },
  ];

  _isMounted = false;

  state = {
    filter: ListAlertsPanel.filterOptions[0],
    editMode: false,
    selected: {},
  };

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  componentDidUpdate = prev => {
    if (!prev.animationError && this.props.animationError) {
      log.error('Unable to fly to', this.props.animationError);
      this.props.showSnackBanner(__('Target No Longer Available'));
      this.props.clearAnimation();
    }
  };

  onSelected = (notice, selected) => {
    if (selected) {
      this.setState(prevState => ({
        selected: {
          ...prevState.selected,
          [notice.databaseId]: notice,
        },
      }));
    } else {
      this.setState(prevState => {
        delete prevState.selected[notice.databaseId];
        return {
          selected: prevState.selected,
        };
      });
    }
  };

  setFilter = filter => {
    this.setState((prevState, props) => ({
      filter,
    }));
  };

  onAcknowledgeSelected = () => {
    // TODO this should use withTransactions batch transaction handling.
    for (const nid in this.state.selected) {
      if ({}.hasOwnProperty.call(this.state.selected, nid)) {
        const notice = this.state.selected[nid];
        this.props.createTransaction(noticeActions.acknowledge(notice)).catch(error => {
          log.error(`Failed to ACK notice ${notice.noticeId}`, error);
          if (this._isMounted) {
            this.setState({
              errorBannerMessage: __(
                'An error occured. One or more notices may not have been acknowledged',
              ),
            });
          }
        });
      }
    }

    if (this._isMounted) {
      this.setState({
        editMode: false,
        selected: {},
      });
    }
  };

  onAcknowledgeAll = () => {
    if (this.state.filter.id !== 'none') {
      this.onAcknowledgeAllFiltered();
    } else {
      this.props.createTransaction(noticeActions.acknowledgeAll()).catch(error => {
        log.error(`Failed to ACK_ALL notice`, error);
        if (this._isMounted) {
          this.setState({
            errorBannerMessage: __(
              'An error occured. One or more notices may not have been acknowledged',
            ),
          });
        }
      });
    }
    this.props.history.push('/');
  };

  onAcknowledgeAllFiltered = () => {
    let selected = this.state.selected
    for (let n of this.filterList()) {
      selected[n.databaseId] = n
    }
    this.setState({ selected })
    this.onAcknowledgeSelected()
  }

  onFlyTo = notice => {
    if (notice.target.registryId) {
      this.props.flyTo(notice.target.registryId, 'registry');
    } else if (notice.target.trackId) {
      this.props.flyTo(notice.target.trackId, 'track');
    } else {
      log.error('unknown notice source', notice);
    }
  };

  filterList = () => {
    return this.props.list.filter(n => {
      if (this.state.filter.id === 'alert') {
        return n.priority === 'Alert'
      }
      if (this.state.filter.id === 'notice') {
        return !("priority" in n)
      }
      if (this.state.filter.id === 'message') {
        return n.priority === 'Message'
      }
      return true
    })
  }

  render = () => {
    const { filter } = this.state;

    return (
      <FlexContainer column align="start stretch" classes={{ root: this.props.classes.container }}>
        <FlexContainer align="space-between">
          <DropDownButton
            label="Filter"
            options={ListAlertsPanel.filterOptions}
            selected={filter}
            onChange={this.setFilter}
          >
            {__('Filter')}
          </DropDownButton>
        </FlexContainer>
        {filter && filter.id !== 'none' && (
          <FlexContainer align="start center">
            <Chip
              avatar={filter.icon}
              label={filter.title}
              onDelete={() => this.setFilter(ListAlertsPanel.filterOptions[0])}
            />
          </FlexContainer>
        )}
        <ErrorBanner message={this.state.errorBannerMessage} />
        {/** **********************
         * Action Button Header
         ********************** */}
        {this.state.editMode && (
          <div style={{ overflow: 'visible' }}>
            <FlexContainer align="space-between start" classes={{ root: this.props.classes.header }}>
              {/* Ack Buttons */}
              <FlexContainer>
                <Tooltip title={__('Acknowledge All Notices')}>
                  <Button variant="contained" color="primary" onClick={this.onAcknowledgeAll}>
                    <CheckIcon />
                    {__(' All')}
                  </Button>
                </Tooltip>
                {Object.keys(this.state.selected).length > 0 && (
                  <Tooltip title={__('Acknowledge Selected Notices')}>
                    <Button variant="contained" color="primary" onClick={this.onAcknowledgeSelected}>
                      <CheckIcon />
                      {__(' Selected')}
                    </Button>
                  </Tooltip>
                )}
              </FlexContainer>

              {/* Cancel Button */}
              <Button
                variant="contained"
                color="default"
                onClick={() => this.setState({ editMode: false })}
              >
                {__('Cancel')}
              </Button>
            </FlexContainer>
          </div>
        )}
        {!this.state.editMode && (
          <div style={{ overflow: 'visible' }}>
            <FlexContainer align="flex-end" classes={{ root: this.props.classes.header }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.setState({ editMode: true })}
              >
                <EditIcon fontSize="small" className={this.props.classes.leftIcon} />
                {__(' Edit')}
              </Button>
            </FlexContainer>
          </div>
        )}

        {/** **********************
         * List Contents
         ********************** */}
        {this.state.editMode && (
          <Typography variant="subtitle1">{__('Select notices to acknowledge.')}</Typography>
        )}
        <List style={{ overflowY: 'auto' }}>
          <Infinite elementHeight={68} containerHeight={window.innerHeight - 190}>
            {this.filterList().map(notice => (
              <AlertListItem
                key={notice.databaseId}
                notice={notice}
                checked={!!this.state.selected[notice.databaseId]}
                editMode={this.state.editMode}
                onSelected={this.onSelected}
                onFlyTo={this.onFlyTo}
              />
            ))}
          </Infinite>
        </List>
      </FlexContainer>
    );
  }
}

ListAlertsPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  // state to props
  list: PropTypes.array,
  animationError: PropTypes.object,
  // dispatch to props
  flyTo: PropTypes.func.isRequired,
  clearAnimation: PropTypes.func.isRequired,
  // withTransaction
  createTransaction: PropTypes.func.isRequired,
  createTransactions: PropTypes.func.isRequired,
  showSnackBanner: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  list: state.notifications.list,
  animationError: state.map.animationError,
});

const mapDispatchToProps = dispatch => ({
  flyTo: (id, type) => {
    dispatch(mapActions.animate(id, type));
  },
  clearAnimation: () => {
    dispatch(mapActions.clearAnimation());
  },
  showSnackBanner: message => {
    dispatch(bannerActions.showSnackBanner(message));
  },
});

export default (ListAlertsPanel = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withStyles(styles)(withTransaction(ListAlertsPanel))),
));

class AlertListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: props.checked && this.props.editMode,
    };
  }

  componentWillReceiveProps(props) {
    if (this.props.editMode && !props.editMode) {
      this.setState({ checked: false });
    }
  }

  onFlyTo = () => {
    this.props.onFlyTo(this.props.notice);
  };

  listItemClicked = () => {
    if (this.props.editMode) {
      this.setState(prevState => {
        this.props.onSelected(this.props.notice, !prevState.checked);
        return { checked: !prevState.checked };
      });
    }
  };

  listTextClicked = () => {
    if (!this.props.editMode) {
      if (this.props.notice.priority === 'Message') {
        return
      }
      if (this.props.notice.event === 'IncidentTransfer') {
        // Incident forward notice so open incident details.
        this.props.history.push({
          pathname: `/incidents/details/${this.props.notice.source.incidentid}`,
          state: { goBackOnClose: true },
        });
      } else {
        // It's a target so open the info panel.
        const { id, type } = getLookup(this.props.notice.target);
        this.props.history.push({
          pathname: `/info/${type}/${id}`,
          state: { goBackOnClose: true },
        });
      }
    }
  };

  formatTarget = target => {
    if (target.name) {
      return target.name;
    }
    if (target.mmsi) {
      return __('MMSI: {{mmsi}}', { mmsi: target.mmsi });
    }
    if (target.imei) {
      return __('IMEI: {{imei}}', { imei: target.imei });
    }
    if (target.sarsatBeacon && target.sarsatBeacon.hexId) {
      return __('Beacon: {{beacon}}', { beacon: target.sarsatBeacon.hexId });
    }
    if (target.radarTarget) {
      return __('Radar Target: {{target}}', { target: target.radarTarget });
    }
    if (target.ingenuNodeId) {
      return __('Node ID: {{node}}', { beacon: target.nodeId });
    }
    return null;
  };

  formatNotice = notice => {
    let primary = 'Unknown';
    let secondary = null;
    switch (notice.event) {
      case 'EnterZone':
        primary = __('Enter zone {{zone}}', { zone: notice.source.name });
        secondary = this.formatTarget(notice.target);
        break;
      case 'ExitZone':
        primary = __('Exit zone {{zone}}', { zone: notice.source.name });
        secondary = this.formatTarget(notice.target);
        break;
      case 'Sart':
      case 'OmnicomAssistance':
        primary = __('Assistance requested');
        secondary = this.formatTarget(notice.target);
        break;
      case 'Sarsat':
        primary = __('SARSAT Beacon Alert');
        secondary = this.formatTarget(notice.target);
        break;
      case 'Rule':
        primary = __('Rule Notice');
        secondary = this.formatTarget(notice.target);
        break;
      case 'IncidentTransfer':
        primary = __('Incident Received');
        secondary = notice.source.name;
        break;
      case 'OmnicomTransmission':
      case 'OmnicomPositionReport':
        primary = __('OmniCom communication failed');
        secondary = this.formatTarget(notice.target);
        break;
      case 'SarsatMessage':
        primary = `${__('Message from')} ${notice.source.name}`;
        secondary = notice.target.message;
        break;
    }
    return <ListItemText primary={primary} secondary={secondary} onClick={this.listTextClicked} />;
  };

  render = () => {
    const notice = this.props.notice;

    return (
      <ListItem key={notice.noticeId} button onClick={this.listItemClicked}>
        {this.props.editMode && <Checkbox checked={this.state.checked} />}
        {this.formatNotice(notice)}
        <ListItemSecondaryAction>
          {!this.props.editMode && notice.event !== 'IncidentTransfer' && notice.event !== 'SarsatMessage' && (
            <Tooltip
              title={__('Show on Map')}
              placement="left"
              classes={{ tooltip: this.props.classes.flyToTooltip }}
            >
              <IconButton edge="end" onClick={this.onFlyTo}>
                <MyLocationIcon />
              </IconButton>
            </Tooltip>
          )}
          {!this.props.editMode && notice.event === 'IncidentTransfer' && notice.event !== 'SarsatMessage' && (
            <IconButton edge="end" onClick={this.listTextClicked}>
              <FlagIcon />
            </IconButton>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    );
  };
}

AlertListItem.propTypes = {
  notice: PropTypes.object.isRequired,
  onSelected: PropTypes.func.isRequired,
  onFlyTo: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  checked: PropTypes.bool,
};

AlertListItem.defaultProps = {
  editMode: true,
  checked: false,
};

AlertListItem = withRouter(withStyles(styles)(AlertListItem));
