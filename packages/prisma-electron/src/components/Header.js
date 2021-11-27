/**
 * Header
 * Displays a header with a an underline and
 * optional action button.
 *
 * Usage:
 * <Header
 *   variant="subtitle1"
 *   margin="dense"
 *   align="left"
 * >
 *   {__("TITLE")}
 * </Header>
 *
 * With Action:
 * <Header
 *   variant="h6"
 *   action={(
 *     <IconButton onClick={() => {}} />
 *   )}
 * >
 *   {__("TITLE")}
 * </Header>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import color from 'color';

// Component Imports
import FlexContainer from 'components/FlexContainer';

import {
  Typography,
} from '@material-ui/core';

const propTypes = {
  children: PropTypes.string.isRequired,
  /**
   * Passed to Typography.
   */
  variant: PropTypes.oneOf(['subtitle1', 'h6', 'h5', 'h4', 'h3', 'h2', 'h1']),
  align: PropTypes.oneOf(['right', 'center', 'left']),
  margin: PropTypes.oneOf(['dense', 'none', 'normal']),
  action: PropTypes.element, // Option action component that can be placed on the right side.
  onClick: PropTypes.func, // Called when anywhere on the header is clicked

  classes: PropTypes.object.isRequired, // with styles

  /**
   * When true, the divider under the header will not be displayed.
   */
  noDivider: PropTypes.bool,
};

const defaultProps = {
  variant: 'title',
  align: 'left',
  margin: 'none',
  action: null,
  noDivider: false,
};

function Header({ classes, onClick, variant, align, children, action, margin, noDivider }) {
  const dividerClass = classes[noDivider ? 'noDivider' : 'divider'];
  const marginClass = classes[margin];
  return (
    <FlexContainer
      align="space-between center"
      className={`${classes.header} ${marginClass} ${dividerClass}`}
      onClick={onClick}
    >
      <Typography variant={variant} align={align}>
        {children}
      </Typography>
      {action}
    </FlexContainer>
  );
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default withStyles(theme => {
  const borderColor = color(theme.palette.background.default).lighten(1);
  // const borderColor = theme.palette.primary['400'];

  return {
    header: {
      '& > button': {
        height: '24px',
        width: '24px',
        marginRight: theme.spacing(1),
        '& > span > svg': {
          transform: `translatey(-${theme.spacing(1.5)}px)`,
        },
      },
      minHeight: 'min-content',
    },
    none: {},
    dense: {
      paddingLeft: theme.spacing(1),
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    normal: {
      paddingLeft: theme.spacing(1),
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(3),
    },
    /*
     * Dividers
     */
    noDivider: {
      borderBottom: 'none',
    },
    divider: {
      borderBottom: `1px solid ${borderColor}`,
      paddingBottom: theme.spacing(1),
    },
  };
})(Header);
