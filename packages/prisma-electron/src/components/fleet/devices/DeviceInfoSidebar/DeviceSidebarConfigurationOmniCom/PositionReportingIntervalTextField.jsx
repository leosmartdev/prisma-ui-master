/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Renders a text field to show position reporting interval.
 *
 * This component will also use the configuration inside the redux store to get min/max values
 * allowed for the reporting interval.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import {
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
  FormHelperText,
} from "@material-ui/core";

export default class PositionReportingIntervalTextField extends React.Component {
  static propTypes = {
    /**
     * Default value for the interval.
     */
    value: PropTypes.number.isRequired,
    /**
     * Callback when the value changes.
     *
     * ## Signature
     * `onChange(interval: number) -> void`
     */
    onChange: PropTypes.func.isRequired,
    /**
     * When non null, the field is in error. This object is the fieldError object
     */
    fieldError: PropTypes.shape({
      property: PropTypes.oneOf(['positionReportingInterval']),
      rule: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    }),
  };

  state = {
    interval: this.props.value,
  };

  onChange = event => {
    const interval = event.target.value;
    this.setState({
      interval: event.target.value,
    });

    this.props.onChange(interval);
  };

  render() {
    const { fieldError } = this.props;
    const { interval } = this.state;

    return (
      <FormControl fullWidth error={!!fieldError}>
        <InputLabel htmlFor="positionReportingInterval">{__('Update Interval')}</InputLabel>
        <Input
          name="positionReportingInterval"
          value={interval}
          onChange={this.onChange}
          endAdornment={<InputAdornment position="end">{__('minutes')}</InputAdornment>}
          type="number"
        />
        {fieldError && fieldError.message && <FormHelperText>{fieldError.message}</FormHelperText>}
      </FormControl>
    );
  }
}

/*
      <TextField
        label={__('Update Interval')}
        type="number"
        fullWidth

        value={interval}
        onChange={this.onChange}
        error={!!fieldError}
        helperText={fieldError && fieldError.message}
      />
*/
