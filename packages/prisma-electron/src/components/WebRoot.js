import React from 'react';
import PropTypes from 'prop-types';
import { HashRouter as Router, Switch } from 'react-router-dom';
import { getSession } from 'session/session';
import { __ } from 'lib/i18n';

// Providers
import { connect, Provider } from 'react-redux';
import ThemeProvider from '@material-ui/styles';

// Components
import { FlexContainer } from 'components/layout/Container';
import { ProfileDrawerRoute } from 'components/layout/ProfileDrawer';
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';
import { RightDrawerRoute } from 'components/layout/RightDrawer';
import NavigationBar from 'components/navigation/NavigationBar';
import Authorization from 'components/security/Authorization';
import UserSignIn from 'components/user/UserSignIn';
import MeasurePanel from 'components/measure/MeasurePanel';
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

import {
  CssBaseline,
} from '@material-ui/core';

// Modules
import Fleets from 'components/fleet';
import Incidents from 'components/incidents';
import User from 'components/user';
import Audit from 'components/audit';

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
    this.props.getSession();

    if (this.props.config && this.props.config.brand) {
      document.title = this.props.config.brand.name;
    }
  }

  render() {
    return (
      <div>
        <CssBaseline />
        <Router>
          <ThemeProvider theme={this.props.theme}>
            <Provider store={this.props.store}>
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
                {/* User */}
                <User />
                {/* Audit */}
                <Audit />

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
