/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Returns list items for specific configuration options based on device type.
 *
 * Currently the only config options available are for omni com devices.
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import DeviceSidebarConfigurationOmniCom from './DeviceSidebarConfigurationOmniCom';

// Helpers
import { hasSpecificConfiguration } from 'device';

DeviceSidebarConfigurationSpecificDetails.propTypes = {
  /**
   * The Device object.
   * Required to have `configuration` on the device at this point.
   */
  device: PropTypes.shape({
    configuration: PropTypes.shape({
      configuration: PropTypes.shape({
        '@type': PropTypes.string,
      }),
    }),
  }),
};

DeviceSidebarConfigurationSpecificDetails.defaultProps = {
  device: {
    configuration: {
      configuration: {},
    },
  },
};

export default function DeviceSidebarConfigurationSpecificDetails({ device }) {
  if (!hasSpecificConfiguration(device)) {
    return null;
  }
  const specificConfiguration = device.configuration.configuration;
  switch (specificConfiguration['@type']) {
    case 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration': {
      return (
        <DeviceSidebarConfigurationOmniCom
          device={device}
          omniComConfiguration={specificConfiguration}
        />
      );
    }
  }

  return null;
}
