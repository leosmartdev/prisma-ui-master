/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Renders the ListItem Section with General Device Information
 *
 * 'General Device Information' Subheader
 * > ListItem -> Device ID
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import {
  ListSubheader,
  ListItem,
  ListItemText,
} from '@material-ui/core';

DeviceSidebarGeneralInfo.propTypes = {
  /**
   * Device being displayed
   */
  device: PropTypes.object.isRequired,
};

export default function DeviceSidebarGeneralInfo({ device }) {
  /*
   * TODO: Only returning null because we aren't showing the last update time right now.
   * When we start showing more information, the section will always be displayed.
   */
  if (!device.deviceId || device.deviceId === '') {
    return null;
  }

  return (
    <React.Fragment>
      <ListSubheader>{__('General Device Information')}</ListSubheader>
      <ListItem divider>
        <ListItemText
          // inset
          primary={__('Device ID')}
          secondary={device.deviceId}
        />
      </ListItem>
      {/* TODO: Last Update time to be added later when registry issues are worked out.
      <ListItem divider>
        <ListItemText
          // inset
          primary="Last Position Update"
          secondary="1 minute ago"
        />
      </ListItem>
      <ListItem divider>
        <ListItemIcon>
          <PlaceIcon />
        </ListItemIcon>
        <ListItemText
          primary="Last Position"
          secondary="0 N 1 W"
        />
        <ListItemSecondaryAction>
          <IconButton edge="end" onClick={() => {}}>
            <RefreshIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      */}
    </React.Fragment>
  );
}
