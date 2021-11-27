/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 *
 * FleetManagement
 * SplitView that displays list of fleets in sidebar, and list of all vessels
 * in the ContentView.
 *
 * This is the main entry point into Fleet Management and the first view seen
 * From the fleets icon on the navbar.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';
import loglevel from 'loglevel';

// Component Imports
import SplitView, { BasicAppBar } from 'components/layout/SplitView';
import FlexContainer from 'components/FlexContainer';
import ErrorBanner from 'components/error/ErrorBanner';
import VesselGroupList from 'components/fleet/vessel/VesselGroupList';
import NoVesselsCard from 'components/fleet/vessel/NoVesselsCard';
import FleetListSidebar from 'components/fleet/FleetListSidebar';
import CreateFleetSidebar from 'components/fleet/CreateFleetSidebar';
import CreateVesselExpansionPanel from 'components/fleet/vessel/CreateVesselExpansionPanel';
import ContentViewGroup from 'components/layout/ContentViewGroup';
import VesselsLoading from 'components/fleet/vessel/VesselsLoading';
import DeviceRegistrationSidebar from 'components/fleet/devices/DeviceRegistrationSidebar';
import DeviceInfoSidebar from 'components/fleet/devices/DeviceInfoSidebar';

// Actions
import { searchVessels } from 'fleet/vessel';
import { searchFleets, getPaged } from 'fleet/fleet';

const log = loglevel.getLogger('fleet');

/* eslint-disable no-unused-vars */
const MOCK_OPTS = {
  headers: {
    'x-mock-response-name': 'fishing, pleasure ship',
  },
};
const FLEET_MOCK_OPTS = {
  headers: {
    'x-mock-response-name': 'get all fleets many',
  },
};
/* eslint-enable no-unused-vars */

/**
 * Component for the FleetManagement page.
 *
 * Fleet Management page is a split view, with Vessels expansion cards in the Main Content area
 * and Fleets list in the sidebar.
 */

const propTypes = {
  history: PropTypes.object.isRequired, // withRouter
  match: PropTypes.object.isRequired, // withRouter
  createTransaction: PropTypes.func.isRequired, // withTransaction
  classes: PropTypes.object.isRequired, // withStyles
};

class FleetManagement extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    // Reference to the split view for pushing and popping sidebars.
    this.splitViewRef = null;

    // Query params. Used to decide which actions to dispatch, search or normal fleet
    // and vessel get.
    this.query = null;

    this.state = {
      areFleetsLoading: false,
      fleetsErrorBannerText: null,
      fleets: [],
      fleetsRequestNext: null,
      areVesselsLoading: false,
      vesselErrorBannerText: null,
      vessels: null,
      sidebars: [],
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.getFleets();
    this.getVessels();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(props) {
    // only change things if the match object is different.
    if (props.match !== this.props.match) {
      if (props.match.isExact) {
        // Reload the vessels and fleets because we are now the frontfacing page again.
        this.getVessels();
        this.getFleets();
      } else {
        // we just stopped being the front facing page (details page is probably covering us)
        // so allow for transition time of the incoming page, then clear the lists. If we dont
        // do this, we can have huge performance issues on large datasets with the details page.
        // (like 5-10 second load times when clicking edit on a vessel).
        this.setState({
          vessels: null,
          fleets: [],
          areVesselsLoading: false,
          areFleetsLoading: false,
          fleetsErrorBannerText: null,
          vesselErrorBannerText: null,
        });
      }
    }
  }

  /* ******************************************************
   *
   * Data Loading
   *
   * The following functions handle loading vessel and fleet
   * data using createTransaction.
   ***************************************************** */

  /**
   * Creates a transaction to retrieve all the vessels.
   * When the promise resolves, the state is updated to
   * display the vessels. While loading, `this.state.areVesselsLoading`
   * is true so any loading indicators can be used in the view.
   *
   * If this.query is not null or undefined, this function will instead query the
   * vessel search endpoint with this.query string.
   */
  getVessels = (directionNext, anchor) => {
    const { createTransaction } = this.props;
    const { requestNext, requestPrevious } = this.state;
    let path = '/vessel/fleet';
    let opts = MOCK_OPTS;
    opts.params = { limit: 100 };
    if (anchor) {
      opts.params.anchor = anchor;
    }
    if ((directionNext && requestNext) || (!directionNext && requestPrevious)) {
      opts = directionNext ? { requestNext } : { requestPrevious };
      path = '/pagination';
    }
    let action;
    if (this.query !== null && typeof this.query !== 'undefined') {
      action = searchVessels(this.query);
    } else {
      action = getPaged(path, opts);
    }
    this.setState({
      areVesselsLoading: true,
    });
    createTransaction(action).then(
      response => {
        if (response.json && response.json.length === 0) {
          if (this._isMounted) {
            this.setState({
              requestNext: null,
              vesselErrorBannerText: null,
              areVesselsLoading: false,
            });
          }
        } else {
          if (this._isMounted) {
            this.setState(prevState => {
              let vessels = response.json || response;
              if (anchor) {
                // it means in response will be 1 item for specific query
                const respondedVessel = response.json || response;
                if (respondedVessel && respondedVessel.length > 0) {
                  const arrIdOfIncomingVessel = respondedVessel.map(({ id }) => id);
                  if (prevState.vessels) {
                    vessels = prevState.vessels
                      .filter(({ id }) => !arrIdOfIncomingVessel.includes(id))
                      .concat(respondedVessel);
                  } else {
                    vessels = respondedVessel;
                  }
                }
              }

              return {
                vessels,
                requestNext: response.next,
                requestPrevious: response.prev,
                vesselErrorBannerText: null,
                areVesselsLoading: false,
              };
            });
          }
        }
      },

      error => {
        log.error('Failed to get vessels', error);
        let errorText = null;
        switch (error.status) {
          case 401:
          case 403: {
            errorText = __(
              'Your account does not have the correct permissions to access this page. Contact your administrator.',
            );
            break;
          }
          case 404: {
            errorText = __('Vessels for the provided filter or Fleet could not be found.');
            break;
          }
          default: {
            errorText = __(
              'Sorry, we encountered a problem getting Vessels from the server. Please try again later.',
            );
          }
        }
        this.setState({
          areVesselsLoading: false,
          vesselErrorBannerText: errorText,
        });
      },
    );
  };

  /**
   * Callback used when getFleets transaction fails. Error object is provided as the only object.
   * @param {object} error - The error returned from the server or the internal error dictating
   *                         the failure.
   */
  fleetsLoadFailed(error) {
    log.error('Failed to get fleets', error);
    let fleetsErrorBannerText = null;

    switch (error.status) {
      case 401:
      case 403: {
        fleetsErrorBannerText = __(
          'Your account does not have the correct permissions to access this page. Contact your administrator.',
        );
        break;
      }
      case 404: {
        fleetsErrorBannerText = __('Fleets for the provided filter could not be found.');
        break;
      }
      default: {
        fleetsErrorBannerText = __(
          'Sorry, we encountered a problem getting Fleets from the server. Please try again later.',
        );
      }
    }

    if (this._isMounted) {
      this.setState({
        fleetsErrorBannerText,
        areFleetsLoading: false,
      });
    }
  }

  /**
   * Creates a transaction to retrieve all the fleets.
   * When the promise resolves, the state is updated to
   * display the fleets. While loading, `this.state.areFleetsLoading`
   * is true so any loading indicators can be used in the view.
   */
  getFleets = async () => {
    if (this.state.areFleetsLoading) return;
    const { createTransaction } = this.props;
    const { fleetsRequestNext } = this.state;
    let path = '/fleet';
    let opts = FLEET_MOCK_OPTS;
    FLEET_MOCK_OPTS.params = { limit: 10 };
    if (fleetsRequestNext) {
      opts = { requestNext: fleetsRequestNext };
      path = '/pagination';
    }
    let action;
    if (this.query !== null && typeof this.query !== 'undefined') {
      action = searchFleets(this.query);
    } else {
      action = getPaged(path, opts);
    }
    this.setState({
      areFleetsLoading: true,
    });
    createTransaction(action).then(
      response => {
        if (response.json && response.json.length === 0) {
          if (this._isMounted) {
            this.setState({
              fleetsRequestNext: null,
              fleetsErrorBannerText: null,
              areFleetsLoading: false,
            });
          }
        } else {
          let newFleets;
          if (path === '/fleet') {
            newFleets = response.json;
          } else {
            newFleets = this.state.fleets.concat(response.json);
          }
          if (this._isMounted) {
            this.setState({
              fleets: newFleets,
              fleetsRequestNext: response.next,
              fleetsErrorBannerText: null,
              areFleetsLoading: false,
            });
          }
        }
      },
      error => {
        this.fleetsLoadFailed(error);
      },
    );
  };

  /* ******************************************************
   *
   * Action handler API
   *
   * The following functions handle actions propogated to
   * this component from other components. Default entry is
   * the onChildAction function which takes a string action
   * and a list of parameters and calls the appropriate
   * action handler.
   *
   * Eg. to select a fleet. `onChildAction('fleet/SELECT', fleet);`
   * To open the vessel create view `onChildAction('vessel/CREATE');`
   *
   * Actions follow a similar pattern to the REDUX actions.
   *
   * TODO: This section is a copy of the same section from
   * FleetManagement. We need to figure out how to turn this into
   * a HOC API or something more generic so other components
   * aren't copying code.
   ***************************************************** */

  /**
   * Called by a child component when an action needs to be propogated up. If any
   * params need to be passed to the ending action handler, they should be passed inside
   * the params object.
   *
   * @param {string} action Action string.
   * @param {object} params Params to pass to the action handler.
   */
  onChildAction = (action, params) => {
    switch (action) {
      case 'fleet/SELECTED': {
        this.fleetSelected(params);
        break;
      }
      case 'fleet/CREATE': {
        this.createFleet();
        break;
      }
      case 'vessel/CREATE': {
        this.createVessel();
        break;
      }
      case 'vessel/UPDATED': {
        this.onVesselUpdated(params);
        break;
      }
      case 'vessel/RELOAD': {
        this.reloadVessel(params);
        break;
      }
      case 'device/REGISTER': {
        this.showRegisterDeviceSidebar(params);
        break;
      }
      case 'device/SELECTED': {
        this.showDeviceSidebar(params);
        break;
      }
      case 'device/UNASSIGN:success': {
        this.onSidebarClose();
        break;
      }
      default: {
        // If we don't know what the event is, then just ignore it.
      }
    }
  };

  /**
   * Pushes a new sidebar to the top of the sidebar list.
   * @param {Component} sidebar The new sidebar to display.
   */
  pushSidebar = sidebar => {
    this.setState({
      sidebars: [sidebar],
    });
  };

  /**
   * Pops the provided Sidebar off the stack, or if its not the top sidebar, will remove it from the
   * sidebars list so it is not displayed.
   * @param {Component} Sidebar The component to be removed.
   */
  popSidebar = Sidebar => () => {
    this.setState(prevState => ({
      sidebars: prevState.sidebars.filter(sidebar => sidebar !== Sidebar),
    }));
  };

  onSidebarClose = () => {
    this.setState(prevState => {
      const sidebars = [...prevState.sidebars];
      sidebars.shift();

      return { sidebars };
    });
  };

  onCreateFleetClosed = fleet => {
    this.onSidebarClose();
    if (fleet) {
      this.fleetSelected(fleet);
    }
  };

  /**
   * Callback when a fleet is selected in the sidebar.
   */
  fleetSelected = fleet => {
    this.props.history.push(`/fleet/${fleet.id}`);
  };

  /**
   * Opens the CreateFleet form in the sidebar.
   */
  createFleet = () => {
    this.pushSidebar(<CreateFleetSidebar onClose={this.onCreateFleetClosed} />);
  };

  /**
   * Opens the CreateVessel form in the main content.
   */
  createVessel = () => {
    this.setState({
      showCreateVessel: true,
    });
  };

  /**
   * Callback when a new vessel is created.
   */
  onCreateVesselSave = vessel => {
    // reload the vessels list, by going directly to the ID of the new vessel in the list.
    log.info('Vessel created', vessel);
    this.setState({ showCreateVessel: false });
    this.getVessels(undefined, vessel.id);
  };

  /**
   * User cancelled the create vessel.
   */
  onCreateVesselCancelled = () => {
    this.setState({
      showCreateVessel: false,
    });
  };

  /**
   * Callback when a vessel was updated. This ensures the data passed into the vessel
   * card is up to date.
   * @param {object} updatedVessel The vessel that is updated.
   */
  onVesselUpdated = updatedVessel => {
    // ({ vessel, vesselId }) => {
    this.setState(prevState => ({
      vessels: prevState.vessels.map(vessel => {
        if (vessel.id === updatedVessel.id) {
          return updatedVessel;
        }
        return vessel;
      }),
    }));
  };

  /**
   * Opens sidebar to register a device.
   */
  showRegisterDeviceSidebar = ({ vessel, onRegistered }) => {
    this.pushSidebar(
      <DeviceRegistrationSidebar
        // TODO this should really use onAction
        // then we can easily determine if the sidebar was
        // saved or cancelled (instead of just checking if device)
        // exists or not.
        onClose={device => {
          if (device) {
            onRegistered(device);
          }
          this.onSidebarClose();
        }}
        vessel={vessel}
      />,
    );
  };

  /**
   * Opens sidebar to view a device
   */
  showDeviceSidebar = params => {
    this.pushSidebar(<DeviceInfoSidebar onClose={this.onSidebarClose} {...params} />);
  };

  /**
   * Callback from the search component in the header. This function gets the query string from
   * the search input and calls the fleets and vessel search endpoints to update the current
   * vessel and fleet lists.
   *
   * @param {string} query The query string from the search box.
   */
  onSearch = query => {
    this.query = query;
    this.getVessels();
    this.getFleets();
  };

  reloadVessel = id => {
    this.getVessels(false, id);
  };

  /** ******************************************************
   *
   * render()
   *
   ****************************************************** */
  render() {
    const { classes } = this.props;
    const {
      sidebars,
      showCreateVessel,
      fleets,
      areFleetsLoading,
      fleetsErrorBannerText,
      areVesselsLoading,
      vesselErrorBannerText,
      vessels,
    } = this.state;

    let vesselNext;
    if (this.state.requestNext) {
      vesselNext = () => this.getVessels(true);
    }
    let vesselPrevious;
    if (this.state.requestPrevious) {
      vesselPrevious = () => this.getVessels(false);
    }
    let fleetsNext;
    if (this.state.fleetsRequestNext) {
      fleetsNext = () => this.getFleets(true);
    }

    const header = (
      <BasicAppBar title={__('Fleets & Vessels')} goBackTo="/" search onSearch={this.onSearch} />
    );

    const sidebar = (
      <FleetListSidebar
        fleets={fleets}
        next={fleetsNext}
        isLoading={areFleetsLoading}
        errorBannerText={fleetsErrorBannerText}
        onAction={this.onChildAction}
      />
    );

    return (
      <SplitView
        ref={c => {
          this.splitViewRef = c;
        }}
        header={header}
        sidebars={sidebars}
        sidebar={sidebar}
      >
        {areVesselsLoading ? (
          <VesselsLoading />
        ) : (
          <FlexContainer column align="start stretch" className={classes.root}>
            <ErrorBanner message={vesselErrorBannerText} contentGroup />
            {!showCreateVessel && (!vessels || vessels.length === 0) && (
              <NoVesselsCard onAddClicked={this.createVessel} />
            )}
            {showCreateVessel ? (
              <FlexContainer column align="start center">
                <ContentViewGroup>
                  <CreateVesselExpansionPanel
                    onSave={this.onCreateVesselSave}
                    onCancel={this.onCreateVesselCancelled}
                  />
                </ContentViewGroup>
              </FlexContainer>
            ) : (
              <VesselGroupList
                vessels={vessels}
                next={vesselNext}
                previous={vesselPrevious}
                onAddClicked={this.createVessel}
                onAction={this.onChildAction}
              />
            )}
          </FlexContainer>
        )}
      </SplitView>
    );
  }
}

FleetManagement.propTypes = propTypes;

export default withStyles({
  root: {
    height: '100%',
  },
})(withRouter(withTransaction(FleetManagement)));
