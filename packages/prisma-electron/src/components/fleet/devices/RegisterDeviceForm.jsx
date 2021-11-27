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
 * Form for registering a device.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withFormik } from 'formik';

// Components
import FlexContainer from 'components/FlexContainer';
import DeviceAutocompleteList from './DeviceAutocompleteList';

import {
  TextField,
  Button,
  MenuItem,
  CircularProgress,
} from '@material-ui/core';

/**
 * Takes the type and returns a boolean value if the type is
 * an Omnicom beacon.
 *
 * @param {string} type The type of device being registered.
 * @return {bool} True if the device is one of the Omnicom family beacons.
 */
function isOmnicomBeacon(type) {
  if (type && type !== '') {
    return type.toLowerCase().startsWith('omnicom');
  }
  return false;
}

// Regular expression for validating mmsi.
const mmsiRegex = /[0-9]/i;

RegisterDeviceForm.propTypes = {
  /**
   * Callback when form is saved. The callback must return a promise that
   * resolves or rejects depening on the success of the save. This lets
   * the form update appropriately based on the response.
   *
   * ## Signature
   * `  onSave(device: object) => Promise`
   */
  onSave: PropTypes.func.isRequired,
  /** @private formik */
  values: PropTypes.object.isRequired,
  /** @private formik */
  errors: PropTypes.object.isRequired,
  /** @private formik */
  touched: PropTypes.object.isRequired,
  /** @private formik */
  isValid: PropTypes.bool.isRequired,
  /** @private formik */
  isSubmitting: PropTypes.bool.isRequired,
  /** @private formik */
  handleChange: PropTypes.func.isRequired,
  /** @private formik */
  setFieldValue: PropTypes.func.isRequired,
  /** @private formik */
  setFieldTouched: PropTypes.func.isRequired,
  /** @private formik */
  handleBlur: PropTypes.func.isRequired,
  /** @private formik */
  handleSubmit: PropTypes.func.isRequired,
};

function RegisterDeviceForm({
  values,
  errors,
  isValid,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
  isSubmitting,
}) {
  const isOmnicom = isOmnicomBeacon(values.type);
  const typeHelperText = __('Select the type of device you are registering to continue.');
  const mmsiHelperText = __('Enter the MMSI for the device.');

  const type = values.type;
  const value = isOmnicom ? values.deviceId : values.mmsi;
  const helperText = isOmnicom
    ? (touched.deviceId && errors.deviceId) || null
    : (touched.mmsi && errors.mmsi) || mmsiHelperText;
  const isError = isOmnicom
    ? !!(touched.deviceId && errors.deviceId)
    : !!(touched.mmsi && errors.mmsi);
  const id = isOmnicom ? 'deviceId' : 'mmsi';
  const name = isOmnicom ? 'deviceId' : 'mmsi';
  const label = isOmnicom ? __('Device ID') : __('MMSI');

  return (
    <FlexContainer column align="start stretch" padding="dense">
      <TextField
        name="type"
        label={__('Device Type')}
        margin="normal"
        fullWidth
        select
        required
        value={values.type}
        onChange={handleChange}
        helperText={errors.type || typeHelperText}
        error={!!(touched.type && errors.type)}
      >
        <MenuItem name="type" value="OmnicomVMS">
          {__('OmniCom VMS')}
        </MenuItem>
        <MenuItem name="type" value="OmnicomSolar">
          {__('OmniCom Solar')}
        </MenuItem>
        <MenuItem name="type" value="AIS">
          {__('AIS Device')}
        </MenuItem>
        <MenuItem name="type" value="SART">
          {__('Man Overboard (MOB)')}
        </MenuItem>
        <MenuItem name="type" value="SARSAT">
          {__('EPIRB')}
        </MenuItem>
      </TextField>
      {type && isOmnicom && (
        <DeviceAutocompleteList
          name={name}
          label={label}
          fullWidth
          margin="normal"
          id={id}
          type={type}
          required={isOmnicom}
          value={value}
          onChange={setFieldValue}
          onBlur={setFieldTouched}
          helperText={helperText}
          error={isError}
        />
      )}
      {type && !isOmnicom && (
        <TextField
          name={name}
          label={label}
          fullWidth
          margin="normal"
          required={!isOmnicom}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          error={isError}
          helperText={helperText}
        />
      )}
      <Button
        type="submit"
        disabled={!isValid}
        onClick={handleSubmit}
        variant="contained"
        color="primary"
      >
        {isSubmitting ? (
          <CircularProgress size={24} variant="indeterminate" color="secondary" />
        ) : (
          __('Register Device')
        )}
      </Button>
    </FlexContainer>
  );
}

export default withFormik({
  handleSubmit: async (values, formikBag) => {
    const device = {
      type: values.type,
      networks: [],
    };
    // Handle the mmsi to network
    if (!isOmnicomBeacon(values.type)) {
      device.networks.push({
        type: 'radio',
        subscriberId: values.mmsi,
      });
    } else {
      device.deviceId = values.deviceId;
      device.networks = [...values.networks];
    }

    try {
      const savedDevice = await formikBag.props.onSave(device);
      formikBag.props.onClose(savedDevice);
      return;
    } catch (error) {
      formikBag.setErrors({ ...error.fieldErrors });
    }
    formikBag.setSubmitting(false);
  },
  validate: values => {
    const errors = {};
    if (values.type === '') {
      errors.type = __('Type is required. Please select the type of device you wish to register.');
    }

    if (isOmnicomBeacon(values.type)) {
      if (values.deviceId === '') {
        errors.deviceId = __('Device ID is required for Omnicom Beacons.');
      }

      // validate networks
      values.networks.map((network, index) => {
        if (network.type === null || typeof network.type === 'undefined' || network.type === '') {
          errors[`networks[${index}].type`] = __(
            'Network type is required for each network connection. Please select a network type from the dropdown.',
          );
        }

        if (
          network.subscriberId === null ||
          typeof network.subscriberId === 'undefined' ||
          network.subscriberId === ''
        ) {
          errors[`networks[${index}].subscriberId`] = __(
            'IMEI is required for each network conection.',
          );
        }
      });
    }

    if (!isOmnicomBeacon(values.type)) {
      if (values.mmsi === '') {
        errors.mmsi = __('MMSI is required for AIS connected device.');
      } else if (values.mmsi.length !== 9 || !mmsiRegex.test(values.mmsi)) {
        errors.mmsi = __('MMSI must be exactly 9 digits.');
      }
    }

    return errors;
  },
  mapPropsToValues: () => ({
    deviceId: '',
    type: '',
    mmsi: '',
    networks: [],
  }),
  validateOnChange: true,
  validateOnBlur: true,
})(RegisterDeviceForm);
