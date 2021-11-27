/**
 * ContentViewGroup
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
// import {__} from 'lib/i18n';

// Component Imports
import {
  Typography,
} from '@material-ui/core';

// Icons

const propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element])
    .isRequired,
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  classes: PropTypes.object.isRequired,
  /**
   * Properties that will be passed to the component when rendered.
   *
   * ## Example:
   * ```
   * <ContentViewGroup
   *  component={Paper}
   *  componentProps={{ elevation: 1 }}
   * />
   * ```
   */
  componentProps: PropTypes.object,
};

const defaultProps = {
  title: null,
  component: 'span',
  componentProps: {},
};

function ContentViewGroup({ classes, children, title, component, componentProps }) {
  const GroupComponent = component;

  return (
    <GroupComponent
      className={classes.group}
      classes={{ root: classes.component }}
      {...componentProps}
    >
      {title && (
        <Typography variant="caption" className={classes.groupTitle}>
          {title}
        </Typography>
      )}
      {children}
    </GroupComponent>
  );
}

ContentViewGroup.propTypes = propTypes;
ContentViewGroup.defaultProps = defaultProps;

export default withStyles({
  group: {
    position: 'relative',
    marginTop: '25px',
    marginBottom: '25px',
    width: '95%',
    maxWidth: '1000px',
    padding: '0px -4px',
    boxSizing: 'border-box',
  },
  groupTitle: {
    position: 'absolute',
    paddingLeft: '15px',
    top: '-25px',
  },
  component: {}, // can be overriden by caller. Passed to component classes.root
})(ContentViewGroup);
