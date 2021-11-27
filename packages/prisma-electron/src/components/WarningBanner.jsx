/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *
 * Displays a snackbar warning banner, that is styled. If no message
 * is given, will render null. This allows you to insert the
 * banner without checking if the message exists first.
 *
 * ## Usage
 * ```
 * <WarningBanner message={warningBannerMessage} />
 * ```
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

// Component Imports
import ContentViewGroup from 'components/layout/ContentViewGroup';

import {
  SnackbarContent,
  Paper,
  Typography,
} from '@material-ui/core';

WarningBanner.propTypes = {
  /**
   * Message to display in the warning banner. Banner will not render if set to null.
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
};

WarningBanner.defaultProps = {
  message: null,
  compact: false,
  contentGroup: false,
};

function WarningBanner({ message, contentGroup, compact, classes }) {
  if (message === '' || message === null || message === undefined) {
    return null;
  }

  if (contentGroup) {
    return (
      <ContentViewGroup
        classes={{ component: `${classes.contentGroup} ${classes.banner}` }}
        component={Paper}
        componentProps={{ elevation: 2 }}
      >
        <Typography variant="body2">{message}</Typography>
      </ContentViewGroup>
    );
  }

  return (
    <SnackbarContent
      className={`${classes.banner} ${compact ? classes.compact : ''}`}
      message={message}
    />
  );
}

export default withStyles(theme => ({
  banner: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.secondary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
  compact: {
    minWidth: '200px',
  },
  contentGroup: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
}))(WarningBanner);
