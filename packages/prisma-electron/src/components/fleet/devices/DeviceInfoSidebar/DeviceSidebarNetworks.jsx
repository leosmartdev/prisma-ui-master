/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Renders the networks for a device. as list items in a "Network Connections" section.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import NetworkListItem from 'components/fleet/devices/NetworkListItem';

import {
  ListSubheader,
} from '@material-ui/core';

DeviceSidebarNetworks.propTypes = {
  /**
   * Device being displayed
   */
  device: PropTypes.object.isRequired,
};

export default function DeviceSidebarNetworks({ device }) {
  if (device.networks && device.networks.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <ListSubheader>{__('Network Connections')}</ListSubheader>
      {device.networks &&
        device.networks.map(network => (
          <NetworkListItem
            key={`${device.id}.${network.subscriberId}`}
            device={device}
            network={network}
          />
        ))}
      {/*
      <ListItem divider button>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText
          primary={__('Add Network Connection')}
        />
      </ListItem>
      */}
    </React.Fragment>
  );
}
