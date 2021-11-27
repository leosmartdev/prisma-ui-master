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
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import PrimaryButton from 'components/PrimaryButton';
import FlexContainer from 'components/FlexContainer';
import DeviceListItem from 'components/fleet/devices/DeviceListItem';

import {
  Typography,
  IconButton,
  List,
} from '@material-ui/core';

// Icons
import AddIcon from '@material-ui/icons/Add';

// Helpers
import { VesselShape } from './propTypes';

const propTypes = {
  /**
   * Vessel being displayed.
   */
  vessel: PropTypes.shape(VesselShape).isRequired,
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
  /**
   * Callback to inform the parent of an action that should be performed.
   * Used to propogate actions that child components don't know how to handle,
   * but will propogate up the stack until a component can handle it.
   */
  onAction: PropTypes.func.isRequired,
};

const defaultProps = {};

class VesselDevices extends React.Component {
  onDeviceAddClicked = event => {
    const { vessel } = this.props;
    this.props.onAction('device/REGISTER', { vessel, event });
  };

  onDeviceClicked = device => {
    const { vessel } = this.props;
    this.props.onAction('device/SELECTED', { vessel, device, onAction: this.props.onAction });
  };

  render() {
    const { classes, vessel } = this.props;

    let devices = null;
    if (vessel && vessel.devices && vessel.devices.length > 0) {
      devices = vessel.devices;
    }

    return (
      <FlexContainer column align="start stretch" className={classes.container}>
        <FlexContainer align="space-between center">
          <Typography variant="h6">{__('Devices')}</Typography>
          <IconButton onClick={this.onDeviceAddClicked}>
            <AddIcon />
          </IconButton>
        </FlexContainer>

        {devices !== null ? (
          <List>
            {devices.map(device => (
              <DeviceListItem device={device} key={device.id} onClick={this.onDeviceClicked} />
            ))}
          </List>
        ) : (
          <PrimaryButton onClick={this.onDeviceAddClicked} className={classes.createDeviceButton}>
            {__('Register a Device')}
          </PrimaryButton>
        )}
      </FlexContainer>
    );
  }
}

VesselDevices.propTypes = propTypes;
VesselDevices.defaultProps = defaultProps;

export default withStyles({
  container: {
    width: '100%',
  },
  createDeviceButton: {
    alignSelf: 'start',
  },
})(VesselDevices);
