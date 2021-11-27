import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';

// Icons
import SatelliteIcon from '@material-ui/icons/Satellite';
import NetworkCellIcon from '@material-ui/icons/NetworkCell';

// Helpers
import { getNetworkTypeDisplayString } from './index';

NetworkListItem.propTypes = {
  /**
   * Device this network is on.
   */
  device: PropTypes.object.isRequired,
  /**
   * The network object being displayed.
   */
  network: PropTypes.object.isRequired,
};

export default function NetworkListItem({
  network,
}) {
  let icon = null;
  switch (network.type) {
    case 'cellular-data':
    case 'cellular-voice': {
      icon = <NetworkCellIcon />;
      break;
    }
    case 'satellite-data':
    case 'satellite-voice': {
      icon = <SatelliteIcon />;
      break;
    }
  }

  return (
    <ListItem divider>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText
        primary={getNetworkTypeDisplayString(network)}
        secondary={network.subscriberId || null}
      />
    </ListItem>
  );
}
