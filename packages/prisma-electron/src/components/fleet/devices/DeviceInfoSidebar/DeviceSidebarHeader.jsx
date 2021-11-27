/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Renders the header for a device sidebar.
 *
 * ---------------------------------
 * | TITLE                       > |
 * ---------------------------------
 * |                               |
 * |        Device Image           |
 * |                               |
 * |                               |
 * ---------------------------------
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

// Components
import Header from 'components/Header';

import {
  IconButton,
} from '@material-ui/core';

// Icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// Helpers
import { getDeviceTypeDisplayString, getDeviceImagePathByType } from '../index';

DeviceSidebarHeader.propTypes = {
  /**
   * Device being displayed
   */
  device: PropTypes.object.isRequired,
  /**
   * Callback when close button is clicked.
   */
  onClose: PropTypes.func,
  /** @private withStyles */
  classes: PropTypes.object.isRequired,
};

function DeviceSidebarHeader({ device, onClose, classes }) {
  return (
    <React.Fragment>
      <Header
        variant="h3"
        margin="dense"
        noDivider
        action={
          onClose && (
            <IconButton onClick={() => onClose()}>
              <ChevronRightIcon />
            </IconButton>
          )
        }
      >
        {getDeviceTypeDisplayString(device.type)}
      </Header>
      <img
        alt={`Device Type ${device.type}`}
        src={getDeviceImagePathByType(device.type, '-display')}
        className={classes.image}
      />
    </React.Fragment>
  );
}

export default withStyles({
  image: {
    width: '100%',
  },
})(DeviceSidebarHeader);
