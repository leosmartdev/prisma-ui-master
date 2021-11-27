import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import DeviceField from 'components/person/DeviceField';

import {
  TextField,
  Button,
  IconButton,
  Divider,
} from '@material-ui/core';

// Icons
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

// Helpers
import { PersonShape, DefaultPerson } from './propTypes';
import generateNewDevice from './generateNewDevice';

const propTypes = {
  // default value for person.
  person: PropTypes.shape(PersonShape),
  /**
   * Callback for when the person object has changed.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Object with errors for the fields in this form.
   */
  fieldErrors: PropTypes.object,
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
};

const defaultProps = {
  person: DefaultPerson,
  fieldErrors: null,
};

class PersonForm extends Component {
  constructor(props) {
    super(props);

    const person = props.person || DefaultPerson;
    this.state = {
      ...DefaultPerson,
      ...person,
    };
  }

  onChange = propName => event => {
    if (event == null) return;
    const newState = { ...this.state };
    let value = event;

    // Did device update?
    if (propName === 'devices') {
      newState.devices = this.state.devices.map(d => (d.id === event.id ? { ...event } : d));
      value = newState.devices;
    } else {
      // Name or Address was updated.
      value = event.target.value;
      newState[propName] = value;
    }

    this.props.onChange(propName)(value);
    this.setState(newState);
  };

  addDevice = type => () => {
    const currentDevices = this.state.devices || [];
    const devices = [...currentDevices, generateNewDevice(type)];

    this.props.onChange('devices')(devices);
    this.setState({ devices });
  };

  /**
   * Removes the device from the devices list.
   * @param {object} device The device to remove. Will do comparisons based on device.id to remove
   *                        from person.devices
   */
  removeDevice = device => {
    const { onChange } = this.props;
    this.setState(prevState => {
      const newDevices = prevState.devices.filter(d => d.id !== device.id);

      onChange('devices')(newDevices);

      return { devices: newDevices };
    });
  };

  render() {
    const { name, address, devices } = this.state;

    const { fieldErrors, classes } = this.props;

    /**
     * Split devices into email/phone lists.
     */
    const deviceList = devices || [];
    const fields = deviceList.reduce(
      (obj, device) => {
        const deviceField = (
          <FlexContainer align="start baseline" key={device.id}>
            <DeviceField device={device} onChange={this.onChange('devices')} />
            <IconButton onClick={() => this.removeDevice(device)}>
              <RemoveCircleIcon />
            </IconButton>
          </FlexContainer>
        );

        if (device.type === 'phone') {
          obj.phoneFields.push(deviceField);
        } else if (device.type === 'email') {
          obj.emailFields.push(deviceField);
        }
        return obj;
      },
      { emailFields: [], phoneFields: [] },
    );

    const { emailFields, phoneFields } = fields;

    return [
      /* Name */
      <TextField
        key="name"
        aria-label="name"
        name="person.name"
        label={__('Name')}
        margin="dense"
        fullWidth
        value={name}
        onChange={this.onChange('name')}
        error={fieldErrors && fieldErrors.hasErrorForField('name')}
        helperText={fieldErrors && fieldErrors.getHelperTextForField('name')}
      />,
      /* Address */
      <TextField
        key="address"
        aria-label="address"
        name="address"
        label={__('Address')}
        placeholder={__('123 Main Street\nCity, ST 12345')}
        margin="dense"
        fullWidth
        value={address}
        onChange={this.onChange('address')}
        multiline
        rows={2}
        error={fieldErrors && fieldErrors.hasErrorForField('address')}
        helperText={fieldErrors && fieldErrors.getHelperTextForField('address')}
      />,
      /* Phone */
      <Divider className={classes.divider} key="divider_phone" />,
      ...phoneFields,
      <Button key="add_phone" onClick={this.addDevice('phone')}>
        {__('Add Phone #')}
      </Button>,
      /* Email */
      <Divider className={classes.divider} key="divider_email" />,
      ...emailFields,
      <Button key="add_email" onClick={this.addDevice('email')}>
        {__('Add Email')}
      </Button>,
      <Divider className={classes.divider} key="divider_end_of_form" />,
    ];
  }
}

PersonForm.propTypes = propTypes;
PersonForm.defaultProps = defaultProps;

export default withStyles(theme => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))(PersonForm);
