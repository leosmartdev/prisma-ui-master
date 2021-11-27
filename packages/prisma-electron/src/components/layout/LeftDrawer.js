import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import color from 'color';
import { withStyles } from '@material-ui/styles';
import { Link, Route, withRouter } from 'react-router-dom';

// Component Imports
import Container, { FlexContainer } from 'components/layout/Container';

import {
  Drawer,
  IconButton,
  Typography,
} from '@material-ui/core';

// Icons
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CloseIcon from '@material-ui/icons/Close';

// Left Drawer Actions
import { openLeftDrawer, closeLeftDrawer } from 'layout/left-drawer';

const drawerStyles = theme => ({
  paper: {
    minWidth: theme.c2.drawers.left.width,
    maxWidth: theme.c2.drawers.left.width,
    width: theme.c2.drawers.left.width,
    zIndex: '1199',
    transition: 'top 225ms ease-in-out',
    overflow: 'visible',
  },
  anchorLeft: {
    left: theme.c2.navBar.width,
  },
  anchorLeftNavExtended: {
    left: `${theme.c2.navBar.expandedWidth}`,
  },
  content: {
    padding: '10px',
    position: 'relative',
    height: 'calc(100vh - 50px)',
    overflow: 'auto',
  },
  header: {
    borderBottom: `1px solid ${color(theme.palette.background.default).lighten(1)}`,
    paddingTop: '20px',
    paddingBottom: '5px',
    marginBottom: '10px',
    minHeight: '48px',
  },
});

/**
 * LeftDrawer
 * Defines the drawer on the left side of the main content, but
 * inside the NavigationBar. This drawer is used to display lists
 * like alerts and incidents and is generally opened by clicking
 * an item on the navbar
 */
class LeftDrawer extends React.Component {
  render = () => {
    let closeIcon = <CloseIcon />;
    if (this.props.drawer.backButton || this.props.drawer.goBackOnClose) {
      closeIcon = <ChevronLeftIcon />;
    }

    let link = <IconButton onClick={() => this.props.history.goBack()}>{closeIcon}</IconButton>;
    if (this.props.drawer.routeOnClose && !this.props.drawer.goBackOnClose) {
      link = (
        <Link to={this.props.drawer.routeOnClose}>
          <IconButton>{closeIcon}</IconButton>
        </Link>
      );
    }
    let style = {};
    let appBar = <FlexContainer align="end">{link}</FlexContainer>;
    if (this.props.drawer.title) {
      appBar = (
        <FlexContainer align="space-between center" className={this.props.classes.header}>
          <Typography variant="h4" style={{ flex: 'auto', marginLeft: '10px' }}>
            {this.props.drawer.title}
          </Typography>
          {link}
        </FlexContainer>
      );
    } else {
      style = { marginTop: '-20px' };
    }

    let anchorLeftClass = this.props.classes.anchorLeft;
    if (this.props.navigationBarExpanded) {
      anchorLeftClass = this.props.classes.anchorLeftNavExtended;
    }

    return (
      <Drawer
        anchor="left"
        open={this.props.drawer.open}
        variant="persistent"
        classes={{ paper: this.props.classes.paper, paperAnchorLeft: anchorLeftClass }}
      >
        {appBar}
        <Container className={this.props.classes.content} style={style}>
          {this.props.children}
        </Container>
      </Drawer>
    );
  };
}

LeftDrawer.propTypes = {
  children: PropTypes.object,
  classes: PropTypes.object.isRequired, // withStyles()
  history: PropTypes.object.isRequired,
  // State Props
  drawer: PropTypes.object.isRequired,
  navigationBarExpanded: PropTypes.bool.isRequired,
  // Dispatch Props
  closeLeftDrawer: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  drawer: state.leftDrawer,
  navigationBarExpanded: state.navigationBar.expanded,
});

const mapDispatchToProps = dispatch => ({
  closeLeftDrawer: () => {
    dispatch(closeLeftDrawer());
  },
});

export default (LeftDrawer = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withStyles(drawerStyles)(LeftDrawer)),
));

/**
 * LeftDrawerContent
 * Wrapper for content inside the drawer. This component is expected to be used
 * Inside a <Route> component and does one thing, on mount it will dispatch the open
 * drawer action, and on unmount, dispatch the close action.
 * Drawer takes 1 prop: title, that it will pass to the open drawer action so the
 * drawer populates its title bar.
 */
class LeftDrawerContent extends React.Component {
  componentDidMount() {
    this.props.openLeftDrawer(this.props);
  }

  componentWillUnmount() {
    this.props.closeLeftDrawer();
  }

  componentWillReceiveProps(props) {
    this.props.openLeftDrawer(props);
  }

  render() {
    return this.props.children;
  }
}

LeftDrawerContent.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.string,
  routeOnClose: PropTypes.string,
  backButton: PropTypes.bool,
  goBackOnClose: PropTypes.bool,
  // Dispatch Props
  openLeftDrawer: PropTypes.func.isRequired,
  closeLeftDrawer: PropTypes.func.isRequired,
};

const mapLeftDrawerContentDispatchToProps = dispatch => ({
  openLeftDrawer: opts => {
    dispatch(openLeftDrawer(opts));
  },
  closeLeftDrawer: () => {
    dispatch(closeLeftDrawer());
  },
});

LeftDrawerContent = connect(
  null,
  mapLeftDrawerContentDispatchToProps,
)(LeftDrawerContent);

/**
 * Composted Route component.
 * This takes the Route and wraps the child component passed in with the
 * LeftDrawerContent so the route will automatically open/close the drawer when the route
 * resolves.
 */
const LeftDrawerRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={({ location, ...props }) => (
      <LeftDrawer>
        <LeftDrawerContent
          title={rest.title}
          routeOnClose={rest.routeOnClose}
          goBackOnClose={location.state && location.state.goBackOnClose}
          backButton={rest.backButton}
        >
          <Component {...props} />
        </LeftDrawerContent>
      </LeftDrawer>
    )}
  />
);

LeftDrawerRoute.propTypes = {
  component: PropTypes.oneOfType([PropTypes.object, PropTypes.element, PropTypes.func]).isRequired,
};

export { LeftDrawerContent, LeftDrawerRoute };
