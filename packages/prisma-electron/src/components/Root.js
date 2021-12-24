import React from 'react';
import PropTypes from 'prop-types';
import { HashRouter as Router, Switch } from 'react-router-dom';
import { getSession } from 'session/session';
import { __ } from 'lib/i18n';

// Providers
import { connect, Provider } from 'react-redux';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

// Components
import { FlexContainer } from 'components/layout/Container';
import { ProfileDrawerRoute } from 'components/layout/ProfileDrawer';
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';
import { RightDrawerRoute } from 'components/layout/RightDrawer';
import { RightDetailsDrawerRoute } from 'components/layout/RightDetailsDrawer';
import NavigationBar from 'components/navigation/NavigationBar';
import Authorization from 'components/security/Authorization';
import UserSignIn from 'components/user/UserSignIn';
import MeasurePanel from 'components/measure/MeasurePanel';
import ListZonesPanel from 'components/zones/ListZonesPanel';
import EditZonePanel from 'components/zones/EditZonePanel';
import FitlerTracksPanel from "components/filter-tracks/FilterTracksPanel";
import ManualTrackPanel from 'components/manual-track/ManualTrackPanel';
import MarkerPanel from 'components/marker/MarkerPanel';
import ListAlertsPanel from 'components/alerts/ListAlertsPanel';
import PriorityAlertsList from 'components/alerts/PriorityAlertsList';
import UserProfile from 'components/profile/UserProfile';
import EditProfile from 'components/profile/EditProfile';
import InfoPanel from 'components/info/InfoPanel';
import Search from 'components/search/Search';
import MapPanel from 'components/map/MapPanel';
import AudibleAlert from 'components/alerts/AudibleAlert';
import StatusBanner from './StatusBanner';
import SnackBanner from './SnackBanner';
import DeviceReloadableInfoSideBar from './fleet/devices/DeviceInfoSidebar/DeviceReloadableInfoSideBar';
// import MapConfig from 'components/mapconfig/MapConfigPanel';

import {
  CssBaseline,
} from '@material-ui/core';

// Modules
import Fleets from 'components/fleet';
import Incidents from 'components/incidents';
import Notes from 'components/notes';
import User from 'components/user';
import Audit from 'components/audit';
import Config from 'components/config';
import RemoteSiteConfig from 'components/remotesite-config';
import Message from 'components/message';
import MapConfig from 'components/mapconfig';

const containerStyle = {
  alignContent: 'stretch',
};

/**
 * This is the Root component that encompasses an entire window application.
 * The component wraps a container that has the navigation bar and the main content
 * with providers for the store, theme, and I18.
 */
class Root extends React.Component {
  componentDidMount() {
    const { getSession, config } = this.props;

    getSession();

    if (config && config.brand) {
      document.title = config.brand.name;
    }
  }

  render() {
    const { theme, store } = this.props;
    
    // Global styles
    theme.overrides = {
      MuiTableRow: {
        root: {
          height: '48px',
        },
      },
      MuiMenuItem: {
        root: {
          color: '#fff',
        },
      },
      MuiFormLabel: {
        root: {
          '&$focused': {
            color: '#668ec4',
          },
        },
      },
      MuiInput: {
        underline: {
          '&:after': {
            borderBottom: '2px solid #668ec4',
          },
        },
      },
    };

    return (
      <div>
        <CssBaseline />
        <Router>
          <ThemeProvider theme={theme}>
            <Provider store={store}>
              <FlexContainer
                align="start stretch"
                className="c2-root-container"
                style={containerStyle}
              >
                {/* Alerts Drawer */}
                <PriorityAlertsList />

                {/* Profile Drawer */}
                <Switch>
                  <ProfileDrawerRoute
                    exact
                    path="/profile"
                    component={UserProfile}
                    routeOnClose="/"
                  />
                  <ProfileDrawerRoute
                    exact
                    path="/profile/edit"
                    component={EditProfile}
                    routeOnClose="/profile"
                    backButton
                  />
                </Switch>

                {/* Navigation Bar */}
                <Authorization>
                  <NavigationBar />
                </Authorization>

                {/* Fleets */}
                <Fleets />
                {/* Incidents */}
                <Incidents />
                {/* Notes */}
                <Notes />
                {/* User */}
                <User />
                {/* Audit */}
                <Audit />
                {/* Site Config */}
                <Config />
                {/* Remote Site Config */}
                <RemoteSiteConfig />
                {/* Messages */}
                <Message />
                {/* Map Config */}
                <MapConfig />

                {/* Left Drawer */}
                <Switch>
                  <LeftDrawerRoute
                    exact
                    path="/alerts"
                    component={ListAlertsPanel}
                    title={__('Notices')}
                    routeOnClose="/"
                  />
                  <LeftDrawerRoute
                    exact
                    path="/search"
                    component={Search}
                    title={__('Search')}
                    routeOnClose="/"
                  />
                  {/* <LeftDrawerRoute
                    exact
                    path="/mapconfig"
                    component={MapConfig}
                    title="Track Display Timeout"
                    routeOnClose="/"
                  /> */}
                  <LeftDrawerRoute
                    exact
                    path="/info/track/:id"
                    component={props => <InfoPanel trackId={props.match.params.id} />}
                    routeOnClose="/"
                  />
                  <LeftDrawerRoute
                    exact
                    path="/info/registry/:id"
                    component={props => <InfoPanel registryId={props.match.params.id} />}
                    routeOnClose="/"
                  />
                  <LeftDrawerRoute
                    exact
                    path="/info/history/:id"
                    component={props => (
                      <InfoPanel databaseId={props.match.params.id} type="history" />
                    )}
                    routeOnClose="/"
                  />
                  <LeftDrawerRoute
                    exact
                    path="/info/site/:id"
                    component={props => (
                      <InfoPanel databaseId={props.match.params.id} type="site" />
                    )}
                    routeOnClose="/"
                  />
                  <LeftDrawerRoute
                    exact
                    path="/info/device/:deviceId/vessel/:vesselId"
                    component={({ history, match }) => (
                      <DeviceReloadableInfoSideBar
                        titleHeader
                        deviceId={match.params.deviceId}
                        vesselId={match.params.vesselId}
                        device={
                          history.location &&
                          history.location.state &&
                          history.location.state.device
                        }
                        vessel={
                          history.location &&
                          history.location.state &&
                          history.location.state.device
                        }
                        onAction={
                          history.location &&
                          history.location.state &&
                          history.location.state.onAction
                        }
                      />
                    )}
                    routeOnClose="/"
                  />
                  <LeftDrawerRoute
                    exact
                    path="/info/marker/:id"
                    component={props => <InfoPanel markerId={props.match.params.id} />}
                    routeOnClose="/"
                  />
                </Switch>

                {/* Main Content */}
                <MapPanel />
                {/* Right Drawer */}
                <RightDrawerRoute
                  exact
                  path="/measure"
                  component={MeasurePanel}
                  title={__('Measure')}
                  routeOnClose="/"
                />
                <RightDrawerRoute
                  path="/filter-tracks"
                  component={FitlerTracksPanel}
                  title={__('Filter Tracks')}
                  routeOnClose="/"
                  width="400px"
                />
                <RightDrawerRoute
                  path="/zones"
                  component={ListZonesPanel}
                  title={__('Zones')}
                  routeOnClose="/"
                />
                <RightDrawerRoute
                  path="/manual-track"
                  component={ManualTrackPanel}
                  title={__('Manual Tracks')}
                  routeOnClose="/"
                />
                <RightDrawerRoute
                  path="/manual-track/:id/:label/:lat/:lon"
                  component={props => (
                    <ManualTrackPanel
                      registryId={props.match.params.id}
                      previousLabel={props.match.params.label}
                      previousLatitude={props.match.params.lat}
                      previousLongitude={props.match.params.lon}
                    />
                  )}
                  title={__('Manual Tracks')}
                  routeOnClose="/"
                />
                <RightDrawerRoute
                  path="/marker"
                  component={MarkerPanel}
                  title={__('Marker')}
                  routeOnClose="/"
                />
                <RightDrawerRoute
                  path="/marker/:id/:lat/:lon"
                  component={props => (
                    <MarkerPanel
                      markerId={props.match.params.id}
                      previousLatitude={props.match.params.lat}
                      previousLongitude={props.match.params.lon}
                    />
                  )}
                  title={__('Marker')}
                  routeOnClose="/"
                />
                <RightDrawerRoute
                  exact
                  path="/info/zone/:id"
                  component={ListZonesPanel}
                  routeOnClose="/"
                />

                {/* Right Drawer Extension */}
                <Switch>
                  <RightDetailsDrawerRoute
                    path="/zones/edit"
                    component={EditZonePanel}
                    title={__('Edit Zone')}
                    backButton
                  />
                  <RightDetailsDrawerRoute
                    path="/zones/create"
                    component={EditZonePanel}
                    title={__('Create Zone')}
                    backButton
                  />
                </Switch>

                {/* Login  */}
                <UserSignIn />

                {/* Banners and Alerting */}
                <AudibleAlert />
                <StatusBanner />
                <SnackBanner />
              </FlexContainer>
            </Provider>
          </ThemeProvider>
        </Router>
      </div>
    );
  }
}

/**
 * Root component takes the following props to set up the
 * providers and pass the app and ui objects to the AppWindow component
 * that contains the main content.
 */
Root.propTypes = {
  store: PropTypes.object.isRequired,
  i18n: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired, // The MuiTheme object
  getSession: PropTypes.func.isRequired,
  config: PropTypes.object,
};

const mapStateToProps = state => ({
  theme: state.theme,
  config: state.config,
});

const mapDispatchToProps = dispatch => ({
  getSession: () => {
    dispatch(getSession());
  },
});

export default (Root = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Root));
