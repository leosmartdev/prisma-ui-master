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
import { withOmniComDevice } from 'device';

// Components
import ErrorBanner from 'components/error/ErrorBanner';
import PositionReportingIntervalForm from './PositionReportingIntervalForm';
import PositionReportingIntervalListItem from './PositionReportingIntervalListItem';

import {
  Collapse,
  Divider,
} from "@material-ui/core";

/**
 * Enahnces the configuration component buy providing a state variable isEditing and callbacks
 * to set isEditing to true/false. Then we can use the isEditing variable to show
 * and hide a edit view/edit button
 */
PositionReportingInterval.propTypes = {
  /**
   * The full Device object.
   */
  device: PropTypes.object.isRequired,
  /**
   * OmniCom specific configuration for the device.
   */
  omniComConfiguration: PropTypes.object.isRequired,
  /**
   * @private withOmniComDevice
   * When true, positionReportingInterval is loading
   */
  positionReportingIntervalIsLoading: PropTypes.bool,
  /**
   * @private withOmniComDevice
   * Error banner message to display when positionReportingInterval fails to save.
   */
  positionReportingIntervalErrorMessage: PropTypes.string,
  /**
   * @private withOmniComDevice
   * Callback to set the position reporting interval on the device. Returns a promise so we can get
   * feeback on if there is an error that occurred.
   */
  setOmniComPositionReportingInterval: PropTypes.func.isRequired,
  /**
   * @private withOmniComDevice
   * Callback clear the error banner message for positionReportingInterval. This allows for when
   * the edit button is clicked, the error banner goes away since the user is address the propblem.
   */
  clearOmniComPositionReportingIntervalErrorBanner: PropTypes.func.isRequired,
};

PositionReportingInterval.defaultProps = {
  positionReportingIntervalErrorMessage: null,
};

function PositionReportingInterval({
  omniComConfiguration,
  positionReportingIntervalIsLoading,
  positionReportingIntervalErrorMessage,
  clearOmniComPositionReportingIntervalErrorBanner,
  setOmniComPositionReportingInterval,
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const showEdit = () => {
    clearOmniComPositionReportingIntervalErrorBanner();
    setIsEditing(true);
  };
  const onSave = () => interval => {
    setIsEditing(false);
    setOmniComPositionReportingInterval(interval);
  };
  const { positionReportingInterval } = omniComConfiguration;

  return (
    <React.Fragment>
      <PositionReportingIntervalListItem
        value={positionReportingInterval}
        isEditing={isEditing}
        isLoading={positionReportingIntervalIsLoading}
        onEditClick={showEdit}
      />

      <ErrorBanner message={positionReportingIntervalErrorMessage} compact />
      <Collapse in={isEditing} unmountOnExit>
        <PositionReportingIntervalForm
          value={positionReportingInterval}
          onSave={onSave}
          onCancel={() => setIsEditing(false)}
        />
        <Divider />
      </Collapse>
    </React.Fragment>
  );
}

export default withOmniComDevice(PositionReportingInterval);
