/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Non raised button with color set to primary the text color uses the correct shade of primary
 * color so you can actually read the text on darking background.
 *
 * TODO: If Material UI finally correctly renders a primary button on dark backgrounds so the
 * contrast is readable, then this component should be removed and <Button> used directly.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

// Components
import {
  Button,
} from '@material-ui/core';

PrimaryButton.propTypes = {
  /** @private withStyles */
  classes: PropTypes.object.isRequired,
  /**
   * if provided we will merge the classes together so our change isn't overidden by the user.
   */
  className: PropTypes.string,
  /** children, same as <Button> */
  children: PropTypes.any.isRequired,
};

function PrimaryButton({ classes, className, children, ...props }) {
  // If the user is using classNames we need to combine them with our styles changes so they all
  // take effect not just their changes.
  let combinedClassNames = classes.root;
  if (className) {
    combinedClassNames = `${classes.root} ${className}`;
  }

  return (
    <Button color="primary" className={combinedClassNames} {...props}>
      {children}
    </Button>
  );
}

export default withStyles(theme => ({
  root: {
    color: theme.palette.primary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
}))(PrimaryButton);
