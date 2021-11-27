/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * <ListItem> for showing position reporting interval of an OmniCom device.
 * When edit button is clicked will show the PositionReportingIntervalEdit below the <ListItem>
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
} from "@material-ui/core";

// Icons
import EditIcon from '@material-ui/icons/Edit';

PositionReportingIntervalListItem.propTypes = {
  /**
   * The current positionReportingInterval value
   */
  value: PropTypes.number,
  /**
   * User is currently editing the interval, so we should hide the edit button.
   */
  isEditing: PropTypes.bool,
  /**
   * When true, the interval is being set on the device and we are awaiting the response.
   */
  isLoading: PropTypes.bool,
  /**
   * callback when edit button is clicked by the user.
   */
  onEditClick: PropTypes.func.isRequired,
};

PositionReportingIntervalListItem.defaultProps = {
  isEditing: false,
  isLoading: false,
};

export default function PositionReportingIntervalListItem({
  value,
  isEditing,
  isLoading,
  onEditClick,
}) {
  const intervalUnit = __('minutes');
  return (
    <ListItem divider>
      <ListItemText
        primary="Update Interval"
        secondary={value ? `${value} ${intervalUnit}` : __('unknown')}
      />
      <ListItemSecondaryAction>
        {!isEditing && (
          <IconButton edge="end" onClick={onEditClick} disabled={isLoading}>
            {isLoading ? (
              <CircularProgress
                variant="indeterminate"
                size={32}
                style={{ position: 'absolute' }}
              />
            ) : (
              <EditIcon />
            )}
          </IconButton>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
}
