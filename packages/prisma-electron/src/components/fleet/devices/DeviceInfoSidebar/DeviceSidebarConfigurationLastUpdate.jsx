/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *  Displays last update time for a device configuration in a list item.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import moment from 'moment';

// Components
import {
  ListItem,
  ListItemText,
} from '@material-ui/core';

// Icons
// import RefreshIcon from '@material-ui/icons/Refresh';

DeviceSidebarConfigurationLastUpdate.propTypes = {
  /**
   * The DeviceConfiguration object.
   */
  configuration: PropTypes.shape({
    lastUpdate: PropTypes.string,
  }),
};

DeviceSidebarConfigurationLastUpdate.defaultProps = {
  configuration: {},
};

export default function DeviceSidebarConfigurationLastUpdate({ configuration }) {
  if (!{}.hasOwnProperty.call(configuration, 'lastUpdate') || configuration.lastUpdate === '') {
    return null;
  }

  const lastUpdateTime = moment(configuration.lastUpdate).fromNow();
  return (
    <ListItem>
      <ListItemText primary={__('Configuration Last Received')} secondary={lastUpdateTime} />
    </ListItem>
  );
}
