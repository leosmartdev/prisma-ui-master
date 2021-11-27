/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *
 * Displays a snackbar information banner, that is styled. If no message
 * is given, will render null. This allows you to insert the
 * banner without checking if the message exists first.
 *
 * ## Usage
 * ```
 * <InfoBanner message={infoBanner} />
 * ```
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import color from 'color';

// Component Imports
import ContentViewGroup from 'components/layout/ContentViewGroup';

import {
  Paper,
  Typography,
  SnackbarContent,
} from '@material-ui/core';

InfoBanner.propTypes = {
  /**
   * Message to display in the banner. Banner will not render if set to null.
   */
  message: PropTypes.string,
  /**
   * When set to true, will use compact padding. Used in sidebars to the banner doesnt overflow
   * the sidebar side.
   */
  compact: PropTypes.bool,
  /**
   * When true will render as as a content group. Used when displaying banner inside the Content
   * of a `<SplitView>` page.
   */
  contentGroup: PropTypes.bool,
  /** @private withStyles */
  classes: PropTypes.object.isRequired,

  /** forwarded ref */
  innerRef: PropTypes.any,
};

InfoBanner.defaultProps = {
  message: null,
  compact: false,
  contentGroup: false,
};

function InfoBanner({ message, contentGroup, compact, classes, innerRef }) {
  if (message === '' || message === null || message === undefined) {
    return null;
  }

  if (contentGroup) {
    return (
      <ContentViewGroup
        classes={{ component: classes.contentGroup }}
        component={Paper}
        componentProps={{ elevation: 2, ref: innerRef }}
      >
        <Typography variant="body2" className={classes.bannerText}>
          {message}
        </Typography>
      </ContentViewGroup>
    );
  }

  return <SnackbarContent className={compact ? classes.compact : ''} message={message} />;
}

const WrappedInfoBanner = React.forwardRef((props, ref) => (
  <InfoBanner innerRef={ref} {...props} compact />
));

export default withStyles(theme => {
  // invert current background colors for emphasis
  let background = color(theme.palette.background.default).negate();

  // Style like the snackbars. Slightly off white or off black
  if (background.luminosity() > 0.5) {
    background = background.lighten(0.8).string();
  } else {
    background = background.darken(0.8).string();
  }
  const text = theme.palette.getContrastText(background);

  return {
    bannerText: {
      color: text,
    },
    compact: {
      minWidth: '200px',
    },
    contentGroup: {
      color: text,
      backgroundColor: background,
      padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
    },
  };
})(WrappedInfoBanner);
