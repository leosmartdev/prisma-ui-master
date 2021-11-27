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
import {
  ListSubheader,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';

// Icons
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

DeviceSidebarNetworks.propTypes = {
  /**
   * Device being displayed
   */
  device: PropTypes.object.isRequired,
  /**
   * Vesselt he device is assigned to.
   */
  vessel: PropTypes.object.isRequired,
  /**
   * Callback to inform the parent of an action that should be performed.
   * Used to propogate actions that child components don't know how to handle,
   * but will propogate up the stack until a component can handle it. Called
   * by this component when device is being removed from the vessel.
   *
   * ## Signature
   * `onAction(action: string, payload: object) -> void`
   */
  onAction: PropTypes.func,
};

/**
 * Maps onAction to a wrapped function that calls onAction('device/UNASSIGN', { device, vessel })
 */
function unassignDevice({ vessel, device, onAction }) {
  return () => {
    onAction('device/UNASSIGN', { device, vessel });
  };
}

export default function DeviceSidebarNetworks({ vessel, device, onAction }) {
  return (
    <React.Fragment>
      <ListSubheader>{__('Vessel')}</ListSubheader>
      <ListItem divider>
        <ListItemText primary="Assigned to Vessel" secondary={vessel.name} />
        {onAction && (
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={unassignDevice({ vessel, device, onAction })}>
              <RemoveCircleIcon />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </React.Fragment>
  );
}
