import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import color from 'color';
import { Link, Route, withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/styles';

// Component Imports
import Container, { FlexContainer } from 'components/layout/Container';

import {
  Drawer,
  IconButton,
  Typography,
} from '@material-ui/core';

// Icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CloseIcon from '@material-ui/icons/Close';

// Right Drawer Actions
import { openRightDetailsDrawer, closeRightDetailsDrawer } from 'layout/right-drawer';

const drawerStyles = theme => ({
  paper: {
    minWidth: theme.c2.drawers.rightDetails.width,
    maxWidth: theme.c2.drawers.rightDetails.width,
    width: theme.c2.drawers.rightDetails.width,
    zIndex: '1199',
  },
  anchorRight: {
    right: '0',
    top: '0px',
  },
  content: {
    padding: '10px',
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
 * RightDetailsDrawer
 * Defines the drawer on the right side of the main content, but
 * inside the NavigationBar. This drawer is used to display lists
 * like alerts and incidents and is generally opened by clicking
 * an item on the navbar
 */
class RightDetailsDrawer extends React.Component {
  render = () => {
    let closeIcon = <CloseIcon />;
    if (this.props.drawer.backButton || this.props.drawer.goBackOnClose) {
      closeIcon = <ChevronRightIcon />;
    }

    let link = <IconButton onClick={() => this.props.history.goBack()}>{closeIcon}</IconButton>;
    if (this.props.drawer.routeOnClose && !this.props.drawer.goBackOnClose) {
      link = (
        <Link to={this.props.drawer.routeOnClose}>
          <IconButton>{closeIcon}</IconButton>
        </Link>
      );
    }

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
    }

    return (
      <Drawer
        anchor="right"
        open={this.props.drawer.open}
        variant="persistent"
        classes={{
          paper: this.props.classes.paper,
          paperAnchorRight: this.props.classes.anchorRight,
        }}
      >
        {appBar}
        <Container className={this.props.classes.content}>{this.props.children}</Container>
      </Drawer>
    );
  };
}

RightDetailsDrawer.propTypes = {
  children: PropTypes.element,
  classes: PropTypes.object.isRequired, // withStyles()
  history: PropTypes.object.isRequired,
  // State Props
  drawer: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  drawer: state.rightDrawer.details,
});

export default (RightDetailsDrawer = withRouter(
  connect(mapStateToProps)(withStyles(drawerStyles)(RightDetailsDrawer)),
));

/**
 * RightDetailsDrawerContent
 * Wrapper for content inside the drawer. This component is expected to be used
 * Inside a <Route> component and does one thing, on mount it will dispatch the open
 * drawer action, and on unmount, dispatch the close action.
 * Drawer takes 1 prop: title, that it will pass to the open drawer action so the
 * drawer populates its title bar.
 */
class RightDetailsDrawerContent extends React.Component {
  componentDidMount() {
    this.props.openRightDetailsDrawer(this.props);
  }

  componentWillUnmount() {
    this.props.closeRightDetailsDrawer();
  }

  componentWillReceiveProps(props) {
    this.props.openRightDetailsDrawer(props);
  }

  render() {
    return this.props.children;
  }
}

RightDetailsDrawerContent.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.string,
  routeOnClose: PropTypes.string,
  backButton: PropTypes.bool,
  // Dispatch Props
  openRightDetailsDrawer: PropTypes.func.isRequired,
  closeRightDetailsDrawer: PropTypes.func.isRequired,
};

const mapRightDetailsDrawerContentDispatchToProps = dispatch => ({
  openRightDetailsDrawer: opts => {
    dispatch(openRightDetailsDrawer(opts));
  },
  closeRightDetailsDrawer: () => {
    dispatch(closeRightDetailsDrawer());
  },
});

RightDetailsDrawerContent = connect(
  null,
  mapRightDetailsDrawerContentDispatchToProps,
)(RightDetailsDrawerContent);

/**
 * Composted Route component.
 * This takes the Route and wraps the child component passed in with the
 * RightDetailsDrawerContent so the route will automatically open/close the drawer when the route
 * resolves.
 */
const RightDetailsDrawerRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      <RightDetailsDrawer>
        <RightDetailsDrawerContent
          title={rest.title}
          routeOnClose={rest.routeOnClose}
          goBackOnClose={props.location.state && props.location.state.goBackOnClose}
          backButton={rest.backButton}
        >
          <Component {...props} />
        </RightDetailsDrawerContent>
      </RightDetailsDrawer>
    )}
  />
);

RightDetailsDrawerRoute.propTypes = {
  component: PropTypes.oneOfType([PropTypes.object, PropTypes.element, PropTypes.func]).isRequired,
  location: PropTypes.object,
};

export { RightDetailsDrawerContent, RightDetailsDrawerRoute };
