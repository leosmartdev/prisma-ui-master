import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  TextField,
} from '@material-ui/core';

// Helpers
import generateNewDevice from 'components/person/generateNewDevice';

/**
 * Phone network prop types shape.
 * Every phone number is required to be the network from a Device of type `phone`
 * Currently two types of networks are suppported, satellite and cellular.
 */
const PhoneShape = {
  type: PropTypes.oneOf(['phone']).isRequired,
  networks: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['cellular-voice', 'satellite-voice']).isRequired,
      subscriberId: PropTypes.string.isRequired,
    }).isRequired,
  ),
};

/**
 * PropTypes for PhoneField.
 */
const propTypes = {
  /**
   * Name of the input component.
   */
  name: PropTypes.string,
  /**
   * When provided will be used for the input floating label.
   */
  label: PropTypes.string,
  /**
   * The value containing the phone network. Must be an phone network object.
   */
  value: PropTypes.shape(PhoneShape),
  /**
   * Callback when the value changes. Function takes 1 parameter that is the updated device.
   * `null` will be passed when the user has removed the phone and field is cleared.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Sets margin on the form control.
   */
  margin: PropTypes.oneOf(['dense', 'normal', 'none']),
};

const defaultProps = {
  name: '',
  label: null,
  value: generateNewDevice('phone'),
  margin: 'none',
};

class PhoneField extends React.Component {
  constructor(props) {
    super(props);

    const state = {
      phoneNumber: '',
      fieldError: null,
    };

    if (props.value && props.value.networks) {
      state.phoneNumber = props.value.networks[0].subscriberId;
    }

    this.state = state;
  }

  onChange = event => {
    const phoneNumber = event.target.value;

    this.setState({ phoneNumber, fieldError: null });

    // if we cleared the phone, then send null to inform the parent
    // the phone was removed.
    if (!phoneNumber || phoneNumber === '') {
      this.props.onChange(null);
    }

    // Only call onChange for the parent if the phone is valid.
    // This way an invalid phone is never set.
    if (phoneNumber && phoneNumber !== '') {
      this.props.onChange({
        ...this.props.value,
        networks: [
          {
            ...(this.props.value.networks
              ? this.props.value.networks[0]
              : generateNewDevice('phone').networks[0]),
            subscriberId: phoneNumber,
          },
        ],
      });
    }
  };

  render() {
    const { label, margin, value, name } = this.props;

    const { fieldError, phoneNumber } = this.state;

    return (
      <TextField
        id={value.id}
        name={name}
        margin={margin}
        error={fieldError}
        fullWidth
        label={label}
        value={phoneNumber}
        onChange={this.onChange}
        helperText={fieldError}
      />
    );
  }
}

PhoneField.propTypes = propTypes;
PhoneField.defaultProps = defaultProps;

export default PhoneField;
