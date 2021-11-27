/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Renders device configuration list items
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import DeviceSidebarConfigurationLastUpdate from './DeviceSidebarConfigurationLastUpdate';
import DeviceSidebarConfigurationSpecificDetails from './DeviceSidebarConfigurationSpecificDetails';

import {
  ListSubheader,
} from '@material-ui/core';

// Helpers
import { hasSpecificConfiguration } from 'device';

DeviceSidebarConfiguration.propTypes = {
  /**
   * Device being displayed
   */
  device: PropTypes.object.isRequired,
};

export default function DeviceSidebarConfiguration({ device }) {
  if (device.configuration === null || typeof device.configuration === 'undefined') {
    return null;
  }

  // Show configuration last update if we have one
  let configurationLastUpdate = null;
  if (device.configuration.lastUpdate && !hasSpecificConfiguration(device)) {
    configurationLastUpdate = (
      <DeviceSidebarConfigurationLastUpdate configuration={device.configuration} />
    );
  }

  return (
    <React.Fragment>
      <ListSubheader>{__('Configuration')}</ListSubheader>
      {configurationLastUpdate}
      <DeviceSidebarConfigurationSpecificDetails device={device} />
    </React.Fragment>
  );
}
