import React from 'react';
import PropTypes from 'prop-types';

// Components
import PhoneDevice from 'components/person/PhoneDevice';
import EmailDevice from 'components/person/EmailDevice';

const phonePropTypes = {
  /**
   * The device to display.
   */
  device: PropTypes.object.isRequired,
};

const Device = ({ device }) => {
  if (device.type.startsWith('phone')) {
    return <PhoneDevice device={device} />;
  }
  if (device.type === 'email') {
    return <EmailDevice device={device} />;
  }
  return null;
};

Device.propTypes = phonePropTypes;

export default Device;
