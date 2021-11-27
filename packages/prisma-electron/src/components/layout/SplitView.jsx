/**
 * SplitView
 *
 * Comprised of 3 views, AppBar, SideBar, ContentView.
 * __________________________________________
 * | AppBar                                 |
 * |________________________________________|
 * |                            |           |
 * |                            |           |
 * |  ContentView               |  SideBar  |
 * |                            |           |
 * |                            |           |
 * |                            |           |
 * |                            |           |
 * |                            |           |
 * |                            |           |
 * |                            |           |
 * |____________________________|___________|
 *
 * The SideBar can be updated to push new views, and pop existing views, with a slide animation
 * as the sidebar slides in on a push, or out on a pop. Any number of new sidebars can be pushed,
 * but only additional pushed sidebars can be popped. To use this functionality, use the `sidebars`
 * prop and push/pop elements from 0 index of the array. When `sidebars` is used, `sidebar` will be
 * ignored. If `sidebars` is empty and `sidebar` is not used, then the sidebar will not be displayed
 * and main content will span the entire page.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import loglevel from 'loglevel';
import { __ } from 'lib/i18n';

// Component Imports
import FlexContainer from 'components/FlexContainer';
import ErrorBanner from 'components/error/ErrorBanner';
import BasicAppBar from './BasicAppBar';

import {
  Paper,
} from '@material-ui/core';

// Transitions
// import Slide from '@material-ui/core/transitions/Slide';

export { BasicAppBar };

const log = loglevel.getLogger('layout');

class SplitView extends React.Component {
  static propTypes = {
    /**
     * Component to be used in the AppBar as the header for the page.
     */
    header: PropTypes.element,
    /**
     * Component to be displayed in the SideBar. Use one of sidebar or sidebars to control the
     * sidebar, never both. If sidebars is used it will supercede sidebar.
     */
    sidebar: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
    /**
     * If you need to handle pushing and popping multiple sidebars, use sidebars instead of
     * sidebar.
     */
    sidebars: PropTypes.arrayOf(PropTypes.element),
    /**
     * Component to be used in the MainContent area of the SplitView.
     */
    children: PropTypes.element,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    // forwarded ref
    innerRef: PropTypes.any,
  };

  static defaultProps = {
    header: null,
    sidebar: null,
    sidebars: [],
    children: null,
  };

  state = {
    error: null,
    hasError: false,
  };

  // constructor(props) {
  //   super(props);

  //   this.state = {
  //     currentSidebar: null,
  //     nextSidebar: null,
  //   };
  // }

  // componentWillReceiveProps(nextProps) {
  //   if (this.props.sidebars.length != nextProps.sidebars.lengt) {
  //     const newLength = nextProps.sidebars.length;
  //     const oldLength = this.props.sidebars.length;
  //     if (newLength < oldLength) {
  //       // pop
  //     } else if (newLength > oldLength) {
  //       // push
  //     }
  //   }
  // }

  componentDidCatch(error, info) {
    log.error(error, info);
    this.setState({
      error,
      hasError: true,
    });
  }

  render() {
    const { classes, header, sidebar, sidebars, children, innerRef } = this.props;

    const { hasError } = this.state;

    let currentSidebar = sidebar;
    if (sidebars && sidebars.length > 0) {
      currentSidebar = sidebars[0];
    }

    return (
      <FlexContainer innerRef={innerRef} column align="start stretch" className={classes.root}>
        {/* App Bar */}
        {header && !hasError && (
          <Paper elevation={10} square className={classes.header}>
            {header}
          </Paper>
        )}
        {/* Error condition, show error header instead of blank screen. */}
        {hasError && (
          <Paper elevation={10} square className={classes.header}>
            <BasicAppBar title={__('Something went wrong')} goBackTo="/" />
          </Paper>
        )}
        {/* Main Content */}
        <FlexContainer align="start stretch" className={classes.pageContent}>
          {/* ContentView */}
          <FlexContainer column align="start stretch" className={classes.contentView}>
            {!hasError ? (
              children
            ) : (
              <FlexContainer align="center center">
                <ErrorBanner
                  contentGroup
                  message={__(
                    'We are sorry, but an error occured loading this page. Please try agin later or contact your system administrator',
                  )}
                />
              </FlexContainer>
            )}
          </FlexContainer>
          {/* SideBar */}
          {currentSidebar && (
            <Paper elevation={6} className={classes.sidebar}>
              {currentSidebar}
            </Paper>
          )}
        </FlexContainer>
      </FlexContainer>
    );
  }
}

export default withStyles(theme => ({
  root: {
    height: '100%',
    width: '100%',
  },
  pageContent: {
    position: 'relative',
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  contentView: {
    position: 'relative',
    height: '100%',
    width: '100%',
    overflow: 'auto',
    boxSizing: 'border-box',
    paddingTop: '20px',
  },
  header: {
    boxSizing: 'border-box',
    minHeight: '50px',
    paddingTop: '10px',
    paddingBottom: '10px',
    zIndex: 1500,
  },
  sidebar: {
    // flex: 1,
    minWidth: theme.c2.drawers.right.width,
    width: theme.c2.drawers.right.width,
    marginTop: '0px',
    marginBottom: '0px',
    marginRight: '0px',
    marginLeft: '10px',
    boxSizing: 'border-box',
    overflow: 'auto',
  },
}))(SplitView);
