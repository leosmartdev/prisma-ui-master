/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Displays a text field and cancel save buttons to set position reporting intervals.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import PrimaryButton from 'components/PrimaryButton';
import PositionReportingIntervalTextField from './PositionReportingIntervalTextField';

import {
  Button,
} from "@material-ui/core";

const MIN_INTERVAL = 5; // 5 minutes
const MAX_INTERVAL = 1440; // 24 hours

export default class PositionReportingIntervalForm extends React.Component {
  static propTypes = {
    /**
     * Initial value for the reporting interval
     */
    value: PropTypes.number,
    /**
     * Called when the user hits cancel.
     *
     * ## Signature
     * `onCancel(void) -> void`
     */
    onCancel: PropTypes.func.isRequired,
    /**
     * Called when the user hits save.
     *
     * ## Signature
     * `onSave(positionReportingInterval) -> Promise`
     */
    onSave: PropTypes.func.isRequired,
  };

  state = {
    interval: this.props.value,
    fieldErrors: {},
  };

  /**
   * Sets state interval when the text field updates the interval. This is the value that will be
   * sent to the onSave callback when the user clicks save.
   */
  setInterval = interval => {
    this.setState({ interval });
  };

  /**
   * Checks if the interval is valid, and if not sets a field
   * error on the state, `this.state.fieldErrors.positionReportingInterval`
   */
  checkIntervalValidity = () => {
    const { interval } = this.state;
    if (interval < MIN_INTERVAL || MAX_INTERVAL < interval) {
      this.setState({
        fieldErrors: {
          positionReportingInterval: {
            property: 'positionReportingInterval',
            rule: 'OutOfBand',
            message: __(
              `Position Reporting interval must be between ${MIN_INTERVAL} and ${MAX_INTERVAL} minutes.`,
            ),
          },
        },
      });
      return false;
    }
    if (interval % 5 !== 0) {
      this.setState({
        fieldErrors: {
          positionReportingInterval: {
            property: 'positionReportingInterval',
            rule: 'Increment',
            message: __('5 minute increments only'),
          },
        },
      });
      return false;
    }
    return true;
  };

  /**
   * Calls onSave callback with the interval set in the text field.
   */
  saveInterval = () => {
    if (!this.checkIntervalValidity()) {
      return;
    }

    this.props.onSave(this.state.interval);
  };

  render() {
    const { value, onCancel } = this.props;

    const { fieldErrors } = this.state;
    const interval = value || 5;
    return (
      <FlexContainer column align="start stretch" padding="dense">
        <FlexContainer
          align="space-between stretch"
          style={{ marginLeft: '16px', marginRight: '16px' }}
        >
          <PositionReportingIntervalTextField
            value={interval}
            onChange={this.setInterval}
            fieldError={fieldErrors.positionReportingInterval}
          />
        </FlexContainer>
        <FlexContainer align="end">
          <Button onClick={onCancel}>{__('Cancel')}</Button>
          <PrimaryButton onClick={this.saveInterval}>{__('Save')}</PrimaryButton>
        </FlexContainer>
      </FlexContainer>
    );
  }
}
