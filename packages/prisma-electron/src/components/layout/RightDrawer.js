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
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CloseIcon from '@material-ui/icons/Close';

// Right Drawer Actions
import { openRightDrawer, closeRightDrawer } from 'layout/right-drawer';

const drawerStyles = theme => ({
  '@keyframes rightDrawerClose': {
    from: { right: theme.c2.drawers.rightDetails.width },
    to: { right: 0 },
  },
  '@keyframes rightDrawerOpen': {
    from: { right: 0 },
    to: { right: theme.c2.drawers.rightDetails.width },
  },
  paper: {
    minWidth: theme.c2.drawers.right.width,
    maxWidth: theme.c2.drawers.right.width,
    width: theme.c2.drawers.right.width,
    zIndex: '1199',
    boxShadow: `-1px 1px 10px ${color(theme.palette.background.default)}`,
  },
  anchorRight: {
    right: '0',
    // animation: "rightDrawerClose 225ms cubic-bezier(0, 0, 0.2, 1)",
    borderLeft: 'none',
    top: '0px',
  },
  anchorRightWithDetails: {
    // right: theme.c2.drawers.rightDetails.width,
    // animation: "rightDrawerOpen 225ms cubic-bezier(0, 0, 0.2, 1)",
    borderLeft: 'none',
    right: '0',
  },
  content: {
    padding: '10px',
    overflow: 'auto',
    height: 'calc(100vh - 50px)',
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
 * RightDrawer
 * Defines the drawer on the right side of the main content, but
 * inside the NavigationBar. This drawer is used to display lists
 * like alerts and incidents and is generally opened by clicking
 * an item on the navbar
 */
class RightDrawer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      drawerStyle: this.props.detailsDrawerOpen
        ? this.props.classes.anchorRightWithDetails
        : this.props.classes.anchorRight,
    };
  }

  componentWillReceiveProps(props) {
    if (props.detailsDrawerOpen) {
      this.setState({
        drawerStyle: props.classes.anchorRightWithDetails,
      });
    } else {
      this.setState({
        drawerStyle: props.classes.anchorRight,
      });
    }
  }

  render = () => {
    let closeIcon = <CloseIcon />;
    if (
      this.props.drawer.backButton ||
      this.props.detailsDrawerOpen ||
      this.props.drawer.goBackOnClose
    ) {
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
        classes={{ paper: this.props.classes.paper, paperAnchorRight: this.state.drawerStyle }}
      >
        {appBar}
        <Container className={this.props.classes.content}>{this.props.children}</Container>
      </Drawer>
    );
  };
}

RightDrawer.propTypes = {
  children: PropTypes.object,
  classes: PropTypes.object.isRequired, // withStyles()
  history: PropTypes.object.isRequired,
  // State Props
  detailsDrawerOpen: PropTypes.bool.isRequired,
  drawer: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  drawer: state.rightDrawer,
  detailsDrawerOpen: state.rightDrawer.details.open,
});

export default (RightDrawer = withRouter(
  connect(mapStateToProps)(withStyles(drawerStyles)(RightDrawer)),
));

/**
 * RightDrawerContent
 * Wrapper for content inside the drawer. This component is expected to be used
 * Inside a <Route> component and does one thing, on mount it will dispatch the open
 * drawer action, and on unmount, dispatch the close action.
 * Drawer takes 1 prop: title, that it will pass to the open drawer action so the
 * drawer populates its title bar.
 */
class RightDrawerContent extends React.Component {
  componentDidMount() {
    this.props.openRightDrawer(this.props);
  }

  componentWillUnmount() {
    this.props.closeRightDrawer();
  }

  componentWillReceiveProps(props) {
    this.props.openRightDrawer(props);
  }

  render() {
    return this.props.children;
  }
}

RightDrawerContent.propTypes = {
  children: PropTypes.element.isRequired,
  openRightDrawer: PropTypes.func.isRequired,
  closeRightDrawer: PropTypes.func.isRequired,
};

const mapRightDrawerContentDispatchToProps = dispatch => ({
  openRightDrawer: opts => {
    dispatch(openRightDrawer(opts));
  },
  closeRightDrawer: () => {
    dispatch(closeRightDrawer());
  },
});

RightDrawerContent = connect(
  null,
  mapRightDrawerContentDispatchToProps,
)(RightDrawerContent);

/**
 * Composted Route component.
 * This takes the Route and wraps the child component passed in with the
 * RightDrawerContent so the route will automatically open/close the drawer when the route
 * resolves.
 */
const RightDrawerRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      <RightDrawer modal>
        <RightDrawerContent
          title={rest.title}
          routeOnClose={rest.routeOnClose}
          goBackOnClose={props.location.state && props.location.state.goBackOnClose}
          backButton={rest.backButton}
        >
          <Component {...props} />
        </RightDrawerContent>
      </RightDrawer>
    )}
  />
);

RightDrawerRoute.propTypes = {
  component: PropTypes.oneOfType([PropTypes.object, PropTypes.element, PropTypes.func]).isRequired,
  location: PropTypes.object,
};

export { RightDrawerContent, RightDrawerRoute };
