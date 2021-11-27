import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import log from 'loglevel';
import { withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';
import AISInfoPanel from './AISInfoPanel';
import ManualInfoPanel from './ManualInfoPanel';
import OmnicomInfoPanel from './OmnicomInfoPanel';
import RadarInfoPanel from './RadarInfoPanel';
import SARSATInfoPanel from './SARSATInfoPanel';
import SARTInfoPanel from './SARTInfoPanel';
import SpidertrackInfoPanel from './SpidertrackInfoPanel';
import ADSBInfoPanel from './ADSBInfoPanel';
import MarkerInfoPanel from './MarkerInfoPanel';
import ErrorBanner from 'components/error/ErrorBanner';
import IncidentList from 'components/incidents/IncidentList';
import TrackHistorySelect from './TrackHistorySelect';
import Header from 'components/Header';
import VesselCard from 'components/fleet/vessel/VesselCard';
import ChangeIconPanel from 'components/info/change-icon/ChangeIconPanel';

import {
  Typography,
  Button,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from '@material-ui/core';

// Icons
import PlaceIcon from '@material-ui/icons/Place';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RefreshIcon from '@material-ui/icons/Refresh';

// Actions & helpers
import * as info from 'info/info';
import { getLookup } from 'map/lookup';
import * as logEntryActions from 'incident/log-entries';
import * as incidentActions from 'incident/incident';
import * as mapActions from 'map/map';
import * as noticeActions from 'notices/notices';
import { filterIncidents } from 'components/incidents/helpers';
import { getVesselByImei } from 'fleet/vessel';
import {
  requestLastPositionReport,
  getDeviceIdByImei,
  getDeviceByImei,
  refreshOmniComConfiguration,
} from 'device/omnicom';

// Formatters
// can't import format directly or build with fail because format is in node modules
import getFormatterForTrack from '../../format/format';

const styles = {
  container: {
    overflow: 'auto',
  },
  button: {
    marginBottom: '10px',
  },
  buttonDivider: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  historySelect: {
    marginTop: '50px',
  },
  history: {
    marginBottom: '20px',
  },
  collapse: {
    marginBottom: '20px',
  },
};

class InfoPanel extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      historyExpanded: false,
      fleetExpanded: false,
      errorBannerMessage: null,
      vessel: {},
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.update({}, this.props);
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    this.props.clearInfo();
  };

  componentWillReceiveProps(nextProps) {
    this.update(this.props, nextProps);
  }

  overrideShowButtons() {
    const params = new URLSearchParams(this.props.location.search);
    if (params.has('hideCreateIncident')) {
      return params.get('hideCreateIncident') === 'true';
    }
    return false;
  }

  update = (prev, next) => {
    let id = null;
    let type = null;
    if (prev.registryId !== next.registryId) {
      id = next.registryId;
      type = 'registry';
    } else if (prev.trackId !== next.trackId) {
      id = next.trackId;
      type = 'track';
    } else if (prev.databaseId !== next.databaseId) {
      id = next.databaseId;
      type = next.type;
    } else if (prev.markerId !== next.markerId) {
      id = next.markerId;
      type = 'marker';
    }
    this.getInfo(id, type);
  };

  getInfo = (id, type) => {
    if (id !== null && type !== null) {
      // Clear errors and vessel
      this.setState({ vessel: {}, fleetExpanded: false, errorBannerMessage: null });

      // Get new information
      this.props
        .createTransaction(info.get(id, type))
        .then(response => {
          // Get vessel information
          if (!this.state.vessel.id && response.target && response.target.imei) {
            try {
              this.props
                .createTransaction(
                  getVesselByImei(this.props.info.target.imei, { withFleet: true }),
                )
                .then(vessels => {
                  if (vessels.length > 0) {
                    if (this._isMounted) {
                      this.setState({
                        vessel: vessels[0],
                        fleetExpanded: true,
                        errorBannerMessage: null,
                      });
                    }
                  }
                });
            } catch (error) {
              if (this._isMounted) {
                this.setState({
                  errorBannerMessage: `${'An error occurred getting vessel results.'} ${error.statusText ||
                    ''}`,
                });
              }
            }
          }
        })
        .catch(response => {
          if (this._isMounted) {
            this.setState({ errorBannerMessage: response.statusText || response.message });
          }
        });
    }
  };

  flyTo = () => {
    if (this.props.info) {
      if (this.props.info.registryId) {
        this.props.flyTo(this.props.info.registryId, 'registry');
      } else if (this.props.info.trackId) {
        this.props.flyTo(this.props.info.trackId, 'track');
      } else if (this.props.info.markerId) {
        this.props.flyTo(this.props.info.markerId, 'marker');
      }
    }
  };

  toggleHistory = () => {
    this.setState(prevState => ({ historyExpanded: !prevState.historyExpanded }));
  };

  toggleHistoryIcon = () => (this.state.historyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  toggleFleet = () => {
    this.setState(prevState => ({ fleetExpanded: !prevState.fleetExpanded }));
  };

  toggleFleetIcon = () => (this.state.fleetExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  toggleDevice = (device, vessel) => {
    this.props.history.push({
      pathname: `/info/device/${device.id}/vessel/${vessel.id}`,
      state: {
        device,
        vessel,
        goBackOnClose: true,
        onAction: null,
      },
    });
  };

  parseInfo = () => {
    const formatter = getFormatterForTrack(this.props.info, this.props.config);
    let infoComponent = null;
    let showIncidents = false;
    let showChangeIcon = false;

    let type = '';
    if (this.props.info.target && this.props.info.target.type) {
      type = this.props.info.target.type;
    }

    switch (type) {
      case 'AIS':
      case 'VTSAIS': {
        infoComponent = <AISInfoPanel track={this.props.info} />;
        showIncidents = true;
        showChangeIcon = true;
        break;
      }
      case 'OmnicomVMS':
      case 'OmnicomSolar': {
        const device = getDeviceByImei(this.state.vessel.devices, this.props.info.target.imei);
        if (device) {
          infoComponent = <OmnicomInfoPanel track={this.props.info} device={device} />;
        }
        showIncidents = true;
        showChangeIcon = true;
        break;
      }
      case 'Radar':
      case 'VTSRadar': {
        infoComponent = <RadarInfoPanel track={this.props.info} />;
        showChangeIcon = true;
        break;
      }
      case 'SARSAT': {
        infoComponent = <SARSATInfoPanel track={this.props.info} />;
        showIncidents = true;
        showChangeIcon = true;
        break;
      }
      case 'SART': {
        infoComponent = <SARTInfoPanel track={this.props.info} />;
        showIncidents = true;
        showChangeIcon = true;
        break;
      }
      case 'Manual': {
        infoComponent = <ManualInfoPanel track={this.props.info} />;
        showIncidents = true;
        showChangeIcon = true;
        break;
      }
      case 'Spidertracks': {
        infoComponent = <SpidertrackInfoPanel track={this.props.info} />;
        showIncidents = true;
        showChangeIcon = true;
        break;
      }
      case 'ADSB': {
        infoComponent = <ADSBInfoPanel track={this.props.info} />;
        showChangeIcon = true;
        break
      }
      case 'Marker': {
        infoComponent = <MarkerInfoPanel track={this.props.info} />;
        showIncidents = true;
        break;
      }
    }

    return {
      formatter,
      infoComponent,
      showIncidents,
      showChangeIcon,
      trackType: type,
    };
  };

  render() {
    const { requestLastPositionReport, info, classes } = this.props;

    if (!info && this.state.errorBannerMessage) {
      return <ErrorBanner message={this.state.errorBannerMessage} />;
    }
    if (!info) {
      return null;
    }

    const {
      infoComponent,
      formatter,
      showIncidents,
      showLastPositionRequest,
      showChangeIcon,
      trackType,
    } = this.parseInfo();
    let basicInfoComponent = infoComponent;

    if (this.props.error) {
      basicInfoComponent = <ErrorBanner message={this.props.error} />;
    }

    // Just return an error if the info component can't load
    if (formatter === null || typeof formatter === 'undefined') {
      return (
        <FlexContainer column align="start stretch" classes={{ root: classes.container }}>
          <ErrorBanner
            message={__(
              'Sorry the information for your selection could not be loaded at this time. Try again later or contact your system administrator.',
            )}
          />
        </FlexContainer>
      );
    }
    return (
      <FlexContainer column align="start stretch" classes={{ root: classes.container }}>
        {/* HEADER */}
        <Typography variant="h5">{formatter.label(this.props.info)}</Typography>
        <Typography variant="subtitle1">
          <FlexContainer column align="start stretch">
            {formatter.sublabel && <span>{formatter.sublabel(this.props.info)}</span>}
            <FlexContainer align="start stretch">
              {formatter.flag && (
                <span style={{ paddingRight: '5px' }}>{formatter.flag(this.props.info)}</span>
              )}
              {formatter.country && <span>{formatter.country(this.props.info)}</span>}
            </FlexContainer>
          </FlexContainer>
        </Typography>

        <ErrorBanner message={this.state.errorBannerMessage} />

        {/* Basic Details */}
        <Table>
          <TableBody>
            <TableRow hover onClick={this.flyTo}>
              <TableCell padding="none">
                <PlaceIcon title={__('Position')} />
              </TableCell>
              <TableCell padding="none">{formatter.coordinates(this.props.info)}</TableCell>
            </TableRow>
            {formatter.coordinates2 && formatter.coordinates2(this.props.info) && (
              <TableRow hover onClick={this.flyTo}>
                <TableCell padding="none">
                  <PlaceIcon title={__('Position')} />
                </TableCell>
                <TableCell padding="none">{formatter.coordinates2(this.props.info)}</TableCell>
              </TableRow>
            )}
            {formatter.course &&
              (this.props.info.target && this.props.info.target.heading ? (
                <TableRow>
                  <TableCell padding="none">{__('Course / Heading')}</TableCell>
                  <TableCell padding="none">
                    {`${formatter.course(this.props.info)} / ${formatter.heading(this.props.info)}`}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell padding="none">{__('Course')}</TableCell>
                  <TableCell padding="none">{formatter.course(this.props.info)}</TableCell>
                </TableRow>
              ))}
            {formatter.speed && (
              <TableRow>
                <TableCell padding="none">{__('Speed')}</TableCell>
                <TableCell padding="none">{formatter.speed(this.props.info)}</TableCell>
              </TableRow>
            )}
            {formatter.updateTime && (
              <React.Fragment>
                <TableRow>
                  <TableCell padding="none">{__('Last Message')}</TableCell>
                  <TableCell padding="none">{formatter.updateTime(this.props.info)}</TableCell>
                  {showLastPositionRequest && (
                    <TableCell padding="none">
                      {this.props.lastPositionReportIsLoading ? (
                        <IconButton>
                          <CircularProgress
                            variant="indeterminate"
                            size={32}
                            style={{ position: 'absolute' }}
                          />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => requestLastPositionReport(info, this.state.vessel)}
                        >
                          <RefreshIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
                <TableRow>
                  <TableCell padding="none">{__('Last Message (UTC)')}</TableCell>
                  <TableCell padding="none">{formatter.updateTimeUtc(this.props.info)}</TableCell>
                  {showLastPositionRequest && (
                    <TableCell padding="none">
                      {this.props.lastPositionReportIsLoading ? (
                        <IconButton>
                          <CircularProgress
                            variant="indeterminate"
                            size={32}
                            style={{ position: 'absolute' }}
                          />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => requestLastPositionReport(info, this.state.vessel)}
                        >
                          <RefreshIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              </React.Fragment>
            )}
          </TableBody>
        </Table>

        {/* Component specific details */}
        {basicInfoComponent}

        {/* History */}
        {formatter.showHistory() && !this.overrideShowButtons() && (
          <FlexContainer column align="start stretch" classes={{ root: classes.history }}>
            <Header
              onClick={this.toggleHistory}
              variant="h6"
              margin="normal"
              action={<IconButton>{this.toggleHistoryIcon()}</IconButton>}
            >
              {__('History')}
            </Header>
            <Collapse in={this.state.historyExpanded}>
              <TrackHistorySelect track={this.props.info} fullWidth dense />
            </Collapse>
          </FlexContainer>
        )}

        {/* Incident */}
        {showIncidents && (
          <InfoPanelIncidents
            info={this.props.info}
            hideCreateIncidentButtons={this.overrideShowButtons()}
            onUpdate={() => this.update({}, this.props)}
          />
        )}

        {/* Fleet */}
        {!this.overrideShowButtons() && (
          <FlexContainer column align="start stretch" classes={{ root: classes.collapse }}>
            <Header
              onClick={this.toggleFleet}
              variant="h6"
              margin="normal"
              action={<IconButton>{this.toggleFleetIcon()}</IconButton>}
            >
              {__('Fleet')}
            </Header>
            <Collapse in={this.state.fleetExpanded}>
              {!this.state.vessel.id && (
                <Typography variant="body2">{__('No associated vessel')}</Typography>
              )}
              {this.state.vessel.id && (
                <VesselCard onClick={this.toggleDevice} vessel={this.state.vessel} />
              )}
            </Collapse>
          </FlexContainer>
        )}

        {/* Change Icon */}
        {showChangeIcon && (
          <ChangeIconPanel
            info={info}
            trackType={trackType ? `track:${trackType}` : 'unknown'}
          />
        )}
      </FlexContainer>
    );
  }
}

InfoPanel.propTypes = {
  registryId: PropTypes.string,

  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,

  // state to props
  info: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  config: PropTypes.object.isRequired,
  multicasts: PropTypes.object,
  // dispatch to props
  clearInfo: PropTypes.func.isRequired,
  flyTo: PropTypes.func.isRequired,
  requestLastPositionReport: PropTypes.func,
  refreshConfiguration: PropTypes.func,
  lastPositionReportIsLoading: PropTypes.bool,
  // withTransaction
  createTransaction: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  info: state.info.info,
  loading: state.info.loading,
  error: state.info.error,
  config: state.config,
  multicasts: state.multicasts,
});

const mapDispatchToProps = dispatch => ({
  clearInfo: () => {
    dispatch(info.clear());
  },
  flyTo: (id, type) => {
    dispatch(mapActions.animate(id, type));
  },
  acknowledgeNoticeForTarget: target => {
    dispatch(noticeActions.acknowledgeForTarget(target)).catch(error => {
      log.warn('Could not acknowledge notice when target added to incident', error);
    });
  },
  requestLastPositionReport: (info, vessel) => {
    const imei = info.target.imei;
    if (imei) {
      const deviceId = getDeviceIdByImei(vessel.devices, imei);
      if (deviceId) {
        dispatch(requestLastPositionReport(deviceId));
      }
    }
  },
  refreshConfiguration: device => {
    dispatch(refreshOmniComConfiguration(device.id));
  },
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTransaction(withStyles(styles)(InfoPanel))),
);

class InfoPanelIncidents extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      showIncidentList: false,
      fleetExpanded: false,
      incidentsExpanded: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.props.listIncidents();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  createNewIncident = () => {
    const { id, type } = getLookup(this.props.info);
    if (type == 'marker') {
      this.props.history.push({
        pathname: '/incidents/create',
        search: `?markerId=${id}&type=${type}`,
        state: {
          goBackOnClose: true,
        },
      });
    } else {
      this.props.history.push({
        pathname: '/incidents/create',
        search: `?trackId=${id}&type=${type}`,
        state: {
          goBackOnClose: true,
        },
      });
    }
  };

  hideIncidentList = () => {
    this.setState({
      showIncidentList: false,
    });
  };

  showIncidentList = () => {
    this.setState({
      showIncidentList: true,
    });
  };

  hideFleetList = () => {
    this.setState({
      fleetExpanded: false,
    });
  };

  showFleetList = () => {
    this.setState({
      fleetExpanded: true,
    });
  };

  onIncidentSelected = incident => {
    this.hideIncidentList();
    const { id, type } = getLookup(this.props.info);
    let action
    if (type == 'marker') {
      action = logEntryActions.createMarkerLogEntry(incident, id, type);
    } else {
      action = logEntryActions.createTrackLogEntry(incident, id, type);
    }
    this.props.createTransaction(action).then(
      () => {
        this.props.onUpdate();

        if (type !== 'marker') {
          this.props.acknowledgeNoticeForTarget(this.props.info);
        }

        if (this._isMounted) {
          this.setState({
            errorBannerMessage: '',
          });
        }
      },
      response => {
        log.error(`Failed to add feature to incident ${incident.id}`, response);
        if (this._isMounted) {
          this.setState({
            errorBannerMessage: __(
              'Sorry, we can not add this feature to the selected Incident as this time.',
            ),
          });
        }
      },
    );
  };

  onAssignedIncidentSelected = incident => {
    this.props.history.push(`/incidents/details/${incident.id}`);
  };

  getAssignedIncidents = () => this.props.incidents.filter(this.assignedIncidentsFilter);

  getOpenedIncidents = () => filterIncidents(this.props.incidents, 'opened');

  assignedIncidentsFilter = incident => {
    if (this.props.info.registry && this.props.info.registry.incidents) {
      return this.props.info.registry.incidents.find(i => i === incident.id);
    }
    return false;
  };

  toggleIncidents = () => {
    this.setState(prevState => ({ incidentsExpanded: !prevState.incidentsExpanded }));
  };

  toggleIncidentIcon = () => {
    const { incidentsExpanded } = this.state;
    return incidentsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />;
  };

  render = () => {
    const { info, hideCreateIncidentButtons, classes } = this.props;

    const incidents = this.getOpenedIncidents();
    const numIncidents = incidents ? incidents.length : 0;
    const numAssignedIncidents =
      info.registry && info.registry.incidents ? info.registry.incidents.length : 0;
    let assignedIncidents = [];
    if (numAssignedIncidents > 0) {
      assignedIncidents = this.getAssignedIncidents();
    }

    // If we aren't showing the buttons AND there are no incidents, then just hide the whole
    // component
    if (hideCreateIncidentButtons && numAssignedIncidents === 0) {
      return null;
    }
    return (
      <FlexContainer column align="start stretch" classes={{ root: classes.collapse }}>
        <Header
          onClick={this.toggleIncidents}
          variant="h6"
          margin="normal"
          action={<IconButton>{this.toggleIncidentIcon()}</IconButton>}
        >
          {__('Assigned Incidents')}
        </Header>
        <ErrorBanner contentGroup message={this.state.errorBannerMessage} />
        <Collapse in={this.state.incidentsExpanded}>
          {numAssignedIncidents > 0 ? (
            <IncidentList
              onSelect={this.onAssignedIncidentSelected}
              incidents={assignedIncidents}
            />
          ) : (
            <Typography variant="body2">
              {__(
                'Not currently assigned to any Incidents. Use the Create or Assign button below to add to an Incident.',
              )}
            </Typography>
          )}

          {!hideCreateIncidentButtons && (
            <FlexContainer align="space-between stretch">
              <Button
                variant="contained"
                className={classes.button}
                onClick={this.createNewIncident}
              >
                {__('Create Incident')}
              </Button>
              {this.state.showIncidentList ? (
                <Button
                  variant="contained"
                  className={classes.button}
                  onClick={this.hideIncidentList}
                >
                  {__('Cancel')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  className={classes.button}
                  onClick={this.showIncidentList}
                >
                  {__('Assign to Incident')}
                </Button>
              )}
            </FlexContainer>
          )}
          {this.state.showIncidentList && numIncidents === 0 && (
            <Typography variant="body1">
              {__('There are no open Incidents. Click Create Incident above to create and assign.')}
            </Typography>
          )}
          {this.state.showIncidentList && numIncidents > 0 && (
            <IncidentList onSelect={this.onIncidentSelected} incidents={incidents} />
          )}
        </Collapse>
      </FlexContainer>
    );
  };
}

InfoPanelIncidents.propTypes = {
  hideCreateIncidentButtons: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,

  // state to props
  info: PropTypes.object.isRequired,
  incidents: PropTypes.array,

  // dispatch to props
  acknowledgeNoticeForTarget: PropTypes.func.isRequired,
  listIncidents: PropTypes.func.isRequired,

  // withTransaction
  createTransaction: PropTypes.func.isRequired,
};

InfoPanelIncidents.defaultProps = {
  hideCreateIncidentButtons: false,
};

const mapInfoPanelIncidentsStateToProps = state => ({
  loading: state.info.loading,
  error: state.info.error,
  incidents: state.incidents.incidents,
});

const mapInfoPanelIncidentsDispatchToProps = dispatch => ({
  listIncidents: () => {
    dispatch(incidentActions.listIncidents());
  },
  acknowledgeNoticeForTarget: target => {
    dispatch(noticeActions.acknowledgeForTarget(target)).catch(error => {
      log.warn('Could not acknowledge notice when target added to incident', error);
    });
  },
});

InfoPanelIncidents = withRouter(
  connect(
    mapInfoPanelIncidentsStateToProps,
    mapInfoPanelIncidentsDispatchToProps,
  )(withTransaction(withStyles(styles)(InfoPanelIncidents))),
);
