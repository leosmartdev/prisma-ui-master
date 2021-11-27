import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import color from 'color';

// Routing
import { Route } from 'react-router-dom';

// Components
import SplitView from 'components/layout/SplitView';

import {
  Paper,
  Slide,
} from '@material-ui/core';

const paperStyles = theme => ({
  root: {
    position: 'absolute',
    zIndex: '1000',
    height: '100vh',
    width: props => {
      if (props.navigationBarExpanded) {
        return `calc(100vw - ${theme.c2.navBar.expandedWidth})`;
      }
      return `calc(100vw - ${theme.c2.navBar.width})`;
    },
    top: '0',
    left: props => {
      if (props.navigationBarExpanded) {
        return theme.c2.navBar.expandedWidth;
      }

      return theme.c2.navBar.width;
    },
    backgroundColor: props => {
      if (props.light) {
        return `${color(theme.palette.background.paper).lighten(0.4)}`;
      }
      return `${theme.palette.background.paper}`;
    },
  },
});

class Page extends React.Component {
  render = () => {
    const { children, classes, innerRef } = this.props;
    return (
      <Paper ref={innerRef} elevation={2} square id="page" classes={{ root: classes.root }}>
        {children}
      </Paper>
    );
  };
}

Page.propTypes = {
  classes: PropTypes.object.isRequired, // Provided by withStyles wrapper
  children: PropTypes.object,
  navigationBarExpanded: PropTypes.bool.isRequired,
  light: PropTypes.bool,
  innerRef: PropTypes.any,
};

Page.defaultProps = {
  light: false,
};

const mapStateToProps = state => ({
  navigationBarExpanded: state.navigationBar.expanded,
});

export default (Page = connect(mapStateToProps)(withStyles(paperStyles)(Page)));

const AnimatedPageRoute = ({ path, exact, direction, children }) => {
  const SlideContent = React.forwardRef((props, ref) => {
    if (props.match && props.status !== 'unmounted') {
      return <Page light innerRef={ref}>{children}</Page>;
    }
    return (
      <Page light>
        <SplitView innerRef={ref} />
      </Page>
    );
  });

  return (
    <Route path={path} exact={exact}>
      {({ match }) => (
        <Slide in={match !== null} direction={direction} mountOnEnter unmountOnExit>
          <SlideContent match={match} status={status} />
        </Slide>
      )}
    </Route>
  )
};

AnimatedPageRoute.propTypes = {
  exact: PropTypes.bool,
  path: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  children: PropTypes.element.isRequired,
  direction: PropTypes.oneOf(['left', 'right', 'down', 'up']),
};

AnimatedPageRoute.defaultProps = {
  exact: false,
  direction: 'right',
};

export { AnimatedPageRoute };
