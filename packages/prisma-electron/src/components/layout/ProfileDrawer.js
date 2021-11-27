import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { __ } from 'lib/i18n';
import color from 'color';
import { withStyles } from '@material-ui/styles';

// Component Imports
import { Link, Route } from 'react-router-dom';

import { FlexContainer } from 'components/layout/Container';

import {
  Drawer,
  Button,
  IconButton,
  Typography,
} from '@material-ui/core';

// Icons
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CloseIcon from '@material-ui/icons/Close';

// Profile Drawer Actions
import { openProfileDrawer, closeProfileDrawer } from 'layout/profile-drawer';
import * as sessionActions from 'session/session';

const drawerStyles = theme => ({
  paper: {
    minWidth: theme.c2.drawers.profile.width,
    maxWidth: theme.c2.drawers.profile.width,
    width: theme.c2.drawers.profile.width,
    zIndex: '1199',
  },
  anchorLeft: {
    top: '0px',
    bottom: 0,
  },
  outerContent: {
    boxSizing: 'border-box',
    padding: '10px',
    height: '100vh',
  },
  content: {
    flexGrow: 1,
  },
  logout: {
    alignSelf: 'center',
    bottom: 0,
    textDecoration: 'none',
  },
  header: {
    borderBottom: `1px solid ${color(theme.palette.background.default).lighten(1)}`,
    paddingTop: '20px',
    paddingBottom: '5px',
    marginBottom: '10px',
  },
});

/**
 * ProfileDrawer
 * Defines the drawer on the left side of the main content AND to the left
 * of the NavigationBar. This drawer is used to display profile information
 */
class ProfileDrawer extends React.Component {
  render = () => {
    let closeIcon = <CloseIcon />;
    if (this.props.profileDrawer.backButton) {
      closeIcon = <ChevronLeftIcon />;
    }

    const link = (
      <Link to={this.props.profileDrawer.routeOnClose}>
        <IconButton>{closeIcon}</IconButton>
      </Link>
    );
    let appBar = <FlexContainer align="end">{link}</FlexContainer>;
    if (this.props.profileDrawer.title) {
      appBar = (
        <FlexContainer align="space-between center" className={this.props.classes.header}>
          <Typography variant="h4" style={{ flex: 'auto', marginLeft: '10px' }}>
            {this.props.profileDrawer.title}
          </Typography>
          {link}
        </FlexContainer>
      );
    }

    return (
      <Drawer
        anchor="left"
        open={this.props.profileDrawer.open}
        variant="persistent"
        classes={{
          paper: this.props.classes.paper,
          paperAnchorLeft: this.props.classes.anchorLeft,
        }}
      >
        {appBar}
        <FlexContainer column align="start stretch" className={this.props.classes.outerContent}>
          <FlexContainer column className={this.props.classes.content} align="start stretch">
            {this.props.children}
          </FlexContainer>
          <Link to="/" className={this.props.classes.logout}>
            <Button variant="contained" onClick={() => this.props.logout()}>
              {__('Logout')}
            </Button>
          </Link>
        </FlexContainer>
      </Drawer>
    );
  };
}

ProfileDrawer.propTypes = {
  children: PropTypes.object,
  classes: PropTypes.object.isRequired, // withStyles()
  // State Props
  profileDrawer: PropTypes.object.isRequired,
  // dispatch to props
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  profileDrawer: state.profileDrawer,
});

const mapDispatchToProps = dispatch => ({
  logout: () => {
    dispatch(sessionActions.deleteSession());
  },
});

export default (ProfileDrawer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(drawerStyles)(ProfileDrawer)));

/**
 * ProfileDrawerContent
 * Wrapper for content inside the drawer. This component is expected to be used
 * Inside a <Route> component and does one thing, on mount it will dispatch the open
 * drawer action, and on unmount, dispatch the close action.
 * Drawer takes 1 prop: title, that it will pass to the open drawer action so the
 * drawer populates its title bar.
 */
class ProfileDrawerContent extends React.Component {
  componentDidMount() {
    this.props.openProfileDrawer(this.props);
  }

  componentWillUnmount() {
    this.props.closeProfileDrawer();
  }

  componentWillReceiveProps(props) {
    this.props.openProfileDrawer(props);
  }

  render() {
    return this.props.children;
  }
}

ProfileDrawerContent.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.string,
  backButton: PropTypes.bool,
  routeOnClose: PropTypes.string,
  // Dispatch Props
  openProfileDrawer: PropTypes.func.isRequired,
  closeProfileDrawer: PropTypes.func.isRequired,
};

const mapProfileDrawerContentDispatchToProps = dispatch => ({
  openProfileDrawer: options => {
    dispatch(openProfileDrawer(options));
  },
  closeProfileDrawer: () => {
    dispatch(closeProfileDrawer());
  },
});

ProfileDrawerContent = connect(
  null,
  mapProfileDrawerContentDispatchToProps,
)(ProfileDrawerContent);

/**
 * Composted Route component.
 * This takes the Route and wraps the child component passed in with the
 * ProfileDrawerContent so the route will automatically open/close the drawer when the route
 * resolves.
 */
const ProfileDrawerRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      <ProfileDrawer>
        <ProfileDrawerContent
          title={rest.title}
          routeOnClose={rest.routeOnClose}
          backButton={rest.backButton}
        >
          <Component {...props} />
        </ProfileDrawerContent>
      </ProfileDrawer>
    )}
  />
);

ProfileDrawerRoute.propTypes = {
  component: PropTypes.any.isRequired,
};

export { ProfileDrawerContent, ProfileDrawerRoute };
