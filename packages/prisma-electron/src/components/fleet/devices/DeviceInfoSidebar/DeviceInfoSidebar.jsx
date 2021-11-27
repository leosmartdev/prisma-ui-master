/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * Device Information Sidebar to display basic information about a device and it's configuration.
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import FlexContainer from 'components/FlexContainer';
import DeviceSidebarHeader from './DeviceSidebarHeader';
import DeviceSidebarGeneralInfo from './DeviceSidebarGeneralInfo';
import DeviceSidebarConfiguration from './DeviceSidebarConfiguration';
import DeviceSidebarNetworks from './DeviceSidebarNetworks';
import DeviceSidebarVesselInfo from './DeviceSidebarVesselInfo';


import {
  List,
} from '@material-ui/core';

DeviceInfoSidebar.propTypes = {
  /**
   * Callback when the sidebar is to be closed. The provided function
   * should handle the actual close.
   */
  onClose: PropTypes.func,
  /**
   * Device being displayed.
   */
  device: PropTypes.object.isRequired,
  /**
   * Vessel the object belongs to.
   */
  vessel: PropTypes.object.isRequired,
  /**
   * Callback to inform the parent of an action that should be performed.
   * Used to propagate actions that child components don't know how to handle,
   * but will propagate up the stack until a component can handle it.
   */
  onAction: PropTypes.func,
};

DeviceInfoSidebar.defaultProps = {
  onAction: () => { },
};

function DeviceInfoSidebar({ device, vessel, onClose, onAction }) {
  return (
    <FlexContainer column align="start stretch">
      <DeviceSidebarHeader device={device} onClose={onClose} />
      <List disablePadding dense>
        <DeviceSidebarGeneralInfo device={device} />
        <DeviceSidebarConfiguration device={device} />
        <DeviceSidebarNetworks device={device} />
        <DeviceSidebarVesselInfo device={device} vessel={vessel} onAction={onAction} />
      </List>
    </FlexContainer>
  );
}

export default DeviceInfoSidebar;
