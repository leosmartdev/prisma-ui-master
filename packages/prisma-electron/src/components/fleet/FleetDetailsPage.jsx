import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';
import loglevel from 'loglevel';

// Component Imports
import FlexContainer from 'components/FlexContainer';
import SplitView, { BasicAppBar } from 'components/layout/SplitView';
import ErrorBanner from 'components/error/ErrorBanner';
import VesselGroupList from 'components/fleet/vessel/VesselGroupList';
import OwnerContact from 'components/person/OwnerContact';
import Header from 'components/Header';
import EditFleetSidebar from 'components/fleet/EditFleetSidebar';
import NoVesselsCard from 'components/fleet/vessel/NoVesselsCard';
import CreateVesselExpansionPanel from 'components/fleet/vessel/CreateVesselExpansionPanel';
import ContentViewGroup from 'components/layout/ContentViewGroup';
import DeviceRegistrationSidebar from 'components/fleet/devices/DeviceRegistrationSidebar';
import DeviceInfoSidebar from 'components/fleet/devices/DeviceInfoSidebar';

import {
  IconButton,
  CircularProgress,
  Typography,
} from '@material-ui/core';

// Actions && Helpers
import { getFleet } from 'fleet/fleet';
import getOwnerFromFleet from 'components/fleet/getOwnerFromFleet';

// Icons
import EditIcon from '@material-ui/icons/Edit';

const log = loglevel.getLogger('fleet');

const propTypes = {
  // withStyles provided
  classes: PropTypes.objectOf(PropTypes.string).isRequired,

  // withRouter provided
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      fleetId: PropTypes.string,
    }),
  }).isRequired,

  // withTransaction provided
  createTransaction: PropTypes.func.isRequired,
};

/**
 * FleetManagement
 * SplitView that displays list of fleets in sidebar, and list of vessels
 * in the ContentView.
 */
class FleetDetailsPage extends React.Component {
  sidebarLoadingState = (
    <FlexContainer column align="center center" style={{ height: '100px' }}>
      <CircularProgress size={50} />
    </FlexContainer>
  );

  loadingState = (
    <SplitView
      header={<BasicAppBar title={__('Loading')} goBackTo="/fleet" />}
      sidebar={this.sidebarLoadingState}
    >
      <FlexContainer column align="center center">
        <Typography variant="h4">{__('Loading Fleet...')}</Typography>
        <CircularProgress size={50} />
      </FlexContainer>
    </SplitView>
  );

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      fleetErrorBannerText: null,
      vesselErrorBannerText: null,
      vessels: null,
      fleet: null,
      sidebars: [],
      // Used to override the page title to a custom title
      // in certain conditions, like Fleet not found.
      fleetTitle: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.getFleet();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /**
   * Creates a transaction to retrieve all the vessels.
   * When the promise resolves, the state is updated to
   * display the vessels. While loading, `this.state.loadingVessels`
   * is true so any loading indicators can be used in the view.
   */
  getFleet = () => {
    const { createTransaction } = this.props;

    this.setState({
      loadingFleet: true,
    });

    createTransaction(getFleet(this.props.match.params.fleetId)).then(
      fleet => {
        if (this._isMounted) {
          this.setState({
            fleet,
            fleetErrorBannerText: null,
            loadingFleet: false,
            fleetTitle: null,
          });
        }
      },
      error => {
        log.error('Failed to get fleet', error);
        let fleetErrorBannerText = null;
        let fleetTitle = null;
        const fleet = null;
        switch (error.status) {
          case 401:
          case 403: {
            fleetErrorBannerText = __(
              'Your account does not have the correct permissions to access this page. Contact your administrator.',
            );
            break;
          }
          case 404: {
            fleetErrorBannerText = __('The fleet you requested could not be found.');
            fleetTitle = __('Not Found');
            break;
          }
          default: {
            fleetTitle = __('Ooops');
            fleetErrorBannerText = __(
              'Sorry, we encountered a problem getting the fleet details from the server. Please try again later or contact your administrator.',
            );
          }
        }

        if (this._isMounted) {
          this.setState({
            fleet,
            fleetTitle,
            fleetErrorBannerText,
            loadingFleet: false,
          });
        }
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
      case 'vessel/CREATE': {
        this.createVessel();
        break;
      }
      case 'vessel/UPDATED': {
        this.onVesselUpdated(params);
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

  onSidebarClose = fleet => {
    this.setState(prevState => {
      const sidebars = [...prevState.sidebars];
      sidebars.shift();

      const newState = { sidebars };

      if (fleet) {
        // The sidebar was an edit sidebar, so we need to apply the new fleet information
        // so the page renders correctly.
        newState.fleet = fleet;
      }

      return newState;
    });
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
    this.getFleet();
  };

  /**
   * User cancelled the create vessel.
   */
  onCreateVesselCancelled = () => {
    this.setState({
      showCreateVessel: false,
    });
  };

  onDelete = () => {
    this.onSidebarClose();
    this.props.history.goBack();
  };

  editFleet = () => {
    this.setState(prevState => ({
      sidebars: [
        <EditFleetSidebar
          onClose={this.onSidebarClose}
          onDelete={this.onDelete}
          fleet={prevState.fleet}
        />,
        ...prevState.sidebars,
      ],
    }));
  };

  /**
   * Callback when a vessel was updated. This ensures the data passed into the vessel
   * card is up to date.
   * @param {object} updatedVessel The vessel that is updated.
   */
  onVesselUpdated = updatedVessel => {
    // ({ vessel, vesselId }) => {
    this.setState(prevState => ({
      fleet: {
        ...prevState.fleet,
        vessels: prevState.fleet.vessels.map(vessel => {
          if (vessel.id === updatedVessel.id) {
            return updatedVessel;
          }
          return vessel;
        }),
      },
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

  render() {
    if (this.state.loadingFleet) {
      return this.loadingState;
    }

    const { classes } = this.props;

    const {
      fleet,
      fleetTitle,
      fleetErrorBannerText,
      vesselErrorBannerText,
      showCreateVessel,
    } = this.state;

    const appBarTitle = (fleet && fleet.name) || fleetTitle || __('Fleet');
    const { owner, ownerType } = getOwnerFromFleet(fleet);

    const actionButton = (
      <IconButton onClick={this.editFleet}>
        <EditIcon />
      </IconButton>
    );

    let noVesselsCard = null;
    if (fleet !== null && (!fleet.vessels || fleet.vessels.length === 0)) {
      noVesselsCard = <NoVesselsCard onAddClicked={this.createVessel} />;
    }

    return (
      <SplitView
        header={<BasicAppBar title={appBarTitle} goBackTo="/fleet" />}
        sidebars={this.state.sidebars}
        sidebar={
          fleet &&
          fleet.id && (
            <FlexContainer column align="space-between stretch">
              <Header margin="normal" variant="h4" action={actionButton}>
                {__('Details')}
              </Header>
              <span className={classes.sidebarContent}>
                <div className={classes.sidebarContentGroup}>
                  <Typography variant="caption">{__('Name')}</Typography>
                  <Typography variant="body1" className={classes.multiline}>
                    {fleet.name}
                  </Typography>
                </div>
                {fleet.description && (
                  <div className={classes.sidebarContentGroup}>
                    <Typography variant="caption">{__('Description')}</Typography>
                    <Typography variant="body1" className={classes.multiline}>
                      {fleet.description}
                    </Typography>
                  </div>
                )}
              </span>
              {owner && [
                <Header margin="normal" variant="h4" key="owner-title">
                  {__('Owner')}
                </Header>,
                <span className={classes.sidebarContent} key="owner-content">
                  <OwnerContact owner={owner} type={ownerType} />
                </span>,
              ]}
            </FlexContainer>
          )
        }
      >
        <FlexContainer column align="start stretch">
          <FlexContainer align="center start">
            <ErrorBanner message={fleetErrorBannerText} contentGroup />
            <ErrorBanner message={vesselErrorBannerText} contentGroup />
          </FlexContainer>

          {!showCreateVessel && noVesselsCard}
          {showCreateVessel ? (
            <FlexContainer column align="start center">
              <ContentViewGroup>
                <CreateVesselExpansionPanel
                  onSave={this.onCreateVesselSave}
                  onCancel={this.onCreateVesselCancelled}
                  fleet={fleet}
                />
              </ContentViewGroup>
            </FlexContainer>
          ) : (
            <VesselGroupList
              vessels={(fleet && fleet.vessels) || []}
              groupVessels={false}
              onAddClicked={this.createVessel}
              onAction={this.onChildAction}
            />
          )}
        </FlexContainer>
      </SplitView>
    );
  }
}

FleetDetailsPage.propTypes = propTypes;

export default withRouter(
  withTransaction(
    withStyles(theme => ({
      sidebarContent: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
      },
      sidebarContentGroup: {
        '& > p': {
          paddingTop: theme.spacing(1),
        },
        '&:not(:first-child)': {
          paddingTop: theme.spacing(2),
        },
      },
      multiline: {
        whiteSpace: 'pre-line',
        wordWrap: 'break-word',
      },
    }))(FleetDetailsPage),
  ),
);
