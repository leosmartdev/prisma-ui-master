import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import EmailField from 'components/form/fields/EmailField';
import PhoneField from 'components/form/fields/PhoneField';

const propTypes = {
  device: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

const DeviceField = ({ device, onChange }) => {
  switch (device.type) {
    case 'phone-satellite':
    case 'phone-cellular':
    case 'phone': {
      return (
        <PhoneField
          key={device.id}
          name="person.phone"

          margin="dense"
          fullWidth

          value={device}
          onChange={onChange}
        />
      );
    }
    case 'email': {
      return (
        <EmailField
          key={device.id}
          name="person.email"
          label={__('Email')}

          margin="dense"

          value={device}
          onChange={onChange}
        />
      );
    }
    default: return null;
  }
};

DeviceField.propTypes = propTypes;

export default DeviceField;
