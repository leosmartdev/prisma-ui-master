import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import {
  Input,
  InputLabel,
  FormHelperText,
  FormControl,
} from '@material-ui/core';

// helpers
import generateNewDevice from 'components/person/generateNewDevice';
import { EmailDeviceShape } from 'components/person/propTypes';

/**
 * PropTypes for EmailField.
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
   * The value containing the email device. Must be an email device with 1 smtp network.
   */
  value: PropTypes.shape(EmailDeviceShape),
  /**
   * Callback when the value changes. Function takes 1 parameter that is the updated device.
   * `null` will be passed when the user has removed the email and field is cleared.
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
  value: generateNewDevice('email'),
  margin: 'none',
};

/**
 * Validates the provided email.
 *
 * Found regex and function on stack overflow:
 * https://stackoverflow.com/a/46181
 *
 * @param {string} email Email string to validate.
 * @return {bool} true if the email is valid.
 */
function validateEmail(email) {
  // TODO use formik
  // eslint-disable-next-line max-len
  const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  return re.test(email.toLowerCase());
}

class EmailField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      fieldError: null,
    };

    if (props.value && props.value.networks.length === 1) {
      this.state = {
        email: props.value.networks[0].subscriberId,
      };
    }
  }

  onChange = event => {
    const email = event.target.value;

    this.setState({ email, fieldError: null });

    // if we cleared the email, then send null to inform the parent
    // the email was removed.
    if (!email || email === '') {
      this.props.onChange(null);
    }

    // Only call onChange for the parent if the email is valid.
    // This way an invalid email is never set.
    if (email && email !== '' && validateEmail(email)) {
      const value = this.props.value || generateNewDevice('email');

      this.props.onChange({
        ...value,
        networks: [
          {
            ...value.networks[0],
            subscriberId: email,
          },
        ],
      });
    }
  };

  onBlur = event => {
    const email = event.target.value;

    // Is the email a valid string AND valid email?
    if (email && email !== '' && !validateEmail(email)) {
      this.setState({
        fieldError: __('Please enter a valid email address.'),
      });
    }
  };

  render() {
    const { label, margin, value } = this.props;

    return (
      <FormControl margin={margin} error={this.state.fieldError} fullWidth>
        {label && <InputLabel html-for={value.id}>{label}</InputLabel>}
        <Input
          id={value.id}
          value={this.state.email}
          onChange={this.onChange}
          onBlur={this.onBlur}
          inputProps={{
            'aria-label': 'Email',
          }}
        />
        <FormHelperText>{this.state.fieldError}</FormHelperText>
      </FormControl>
    );
  }
}

EmailField.propTypes = propTypes;
EmailField.defaultProps = defaultProps;

export default EmailField;
