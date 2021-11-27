/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 *
 * Displays the Devices section for a vessel. Includes header, add icon, and the list
 * of devices on the vessel.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withStyles } from '@material-ui/styles';

// Components
import DeviceListItem from 'components/fleet/devices/DeviceListItem';

import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@material-ui/core';

// Icons
import FleetIcon from '@material-ui/icons/DirectionsBoat';

// Actions and Helpers
import { VesselShape } from './propTypes';

VesselCard.propTypes = {
  /**
   * @private Provided by withStyles
   */
  classes: PropTypes.object.isRequired,
  /**
   * The vessel object being displayed
   */
  vessel: PropTypes.shape(VesselShape).isRequired,
  /**
   * Function called on click of device
   */
  onClick: PropTypes.func,
};
/**
 * VesselCard
 * Display a single vessel with its devices
 */
function VesselCard({ classes, vessel, onClick }) {
  return (
    <List>
      <ListItem dense>
        <ListItemAvatar>
          <FleetIcon className={classes.avatar} />
        </ListItemAvatar>
        <ListItemText
          primary={vessel.name}
          secondary={vessel.fleet ? vessel.fleet.name : __('No Fleet')}
        />
      </ListItem>
      {vessel.devices.map(device => (
        <DeviceListItem
          dense
          device={device}
          key={device.id}
          onClick={device => onClick(device, vessel)}
        />
      ))}
    </List>
  );
}

export default withStyles(theme => ({
  avatar: {
    color: theme.palette.primary.contrastText,
  },
}))(VesselCard);
