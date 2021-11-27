/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Renders OmniCom device specific configuration options as <ListItems> for <DeviceInfoSidebar>
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import PositionReportingInterval from './PositionReportingInterval';
import OmniComConfigurationLastUpdate from './OmniComConfigurationLastUpdate';

OmniComConfiguration.propTypes = {
  /**
   * The full device object
   */
  device: PropTypes.object.isRequired,
  /**
   * OmniCom specific configuration for the device.
   */
  omniComConfiguration: PropTypes.object.isRequired,
};

export default function OmniComConfiguration({ device, omniComConfiguration }) {
  return (
    <div>
      <OmniComConfigurationLastUpdate device={device} omniComConfiguration={omniComConfiguration} />
      <PositionReportingInterval device={device} omniComConfiguration={omniComConfiguration} />
    </div>
  );
}
