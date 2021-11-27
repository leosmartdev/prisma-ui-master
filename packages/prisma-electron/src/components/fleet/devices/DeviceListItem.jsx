/**
 * Renders a single device list item for a vessel.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

// Components
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core';

// Helpers
import {
  getDeviceTypeDisplayString,
  getNetworkTypeDisplayString,
  getDeviceImagePathByType,
} from 'components/fleet/devices';

DeviceListItem.propTypes = {
  /**
   * The device to render.
   */
  device: PropTypes.object.isRequired,
  /**
   * Callback when the item is clicked.
   * ## Signature
   * `onClick(device: object, event: obeject) => void`
   */
  onClick: PropTypes.func,
  /**
   * High density
   */
  dense: PropTypes.bool,
  /** @private withStyles */
  classes: PropTypes.object.isRequired,
};

DeviceListItem.defaultProps = {
  onClick: () => { },
};

function DeviceListItem({ device, onClick, classes, dense }) {
  const deviceTypeString = getDeviceTypeDisplayString(device.type);
  return (
    <ListItem button dense={dense} onClick={event => onClick(device, event)}>
      <ListItemAvatar className={classes.avatar}>
        <Avatar alt="Device Avatar" src={getDeviceImagePathByType(device.type)} />
      </ListItemAvatar>
      <ListItemText
        primary={deviceTypeString}
        secondary={device.deviceId}
        className={classes.primary}
      />
      {device.networks && device.networks.length > 0 && (
        <ListItemText
          primary={getNetworkTypeDisplayString(device.networks[0])}
          secondary={device.networks[0].subscriberId}
          className={classes.secondary}
        />
      )}
      <ListItemSecondaryAction />
    </ListItem>
  );
}

export default withStyles({
  avatar: {},
  primary: {
    flex: 4,
  },
  secondary: {
    flex: 3,
  },
})(DeviceListItem);
