import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';
import Ipv4Input from 'components/remotesite-config/Ipv4Input';

import {
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Switch,
  Input,
  InputLabel,
  InputAdornment,
  IconButton,
} from '@material-ui/core';

// Icons
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

const style = theme => ({
  switch: {
    marginTop: 8,
    marginBottom: 4,
  },
});

class FtpConfigEdit extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    ftpConfig: PropTypes.object,
    fieldErrors: PropTypes.object,
    getHelperText: PropTypes.func.isRequired,

    /** @private withStyles */
    classes: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // Group of input fields
    this.formField = [];

    this.noValue = '';

    this.state = {
      showPassword: false,
    };
  }

  getValue = (key, noValue) => {
    const { ftpConfig } = this.props;

    if (ftpConfig && key in ftpConfig && ftpConfig[key]) {
      return ftpConfig[key];
    }

    if (noValue != undefined) {
      return noValue;
    }

    return this.noValue;
  };

  getHelperText = (fieldName) => {
    const { getHelperText } = this.props;

    let helperText = getHelperText(fieldName);

    return helperText;
  };

  onChange = (fieldName) => event => {
    const { onChange } = this.props;

    onChange(fieldName, event.target.value);
  };

  onIpAddrChange = fieldName => value => {
    const { onChange } = this.props;

    onChange(fieldName, value);
  };

  onSwitchChange = (fieldName) => event => {
    const { onChange } = this.props;

    onChange(fieldName, event.target.checked);
  };

  handleClickShowPassword = () => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword,
    }));
  };

  handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Focus on the next input once enter key is pressed
  onKeyPress = (event, idx) => {
    if (event.key == 'Enter') {
      this.formField[idx + 1].focus();
    }
  };

  render() {
    const {
      classes,
      fieldErrors,
    } = this.props;

    const {
      showPassword,
    } = this.state;

    return (
      <FlexContainer column align="start stretch">
        <TextField
          id="hostname"
          label={__('Hostname')}
          margin="dense"
          value={this.getValue('hostname')}
          error={fieldErrors && fieldErrors.hostname !== undefined}
          helperText={this.getHelperText('hostname')}
          inputRef={input => { this.formField.push(input); }}
          onChange={this.onChange('hostname')}
          onKeyPress={event => this.onKeyPress(event, 0)}
        />
        <Ipv4Input
          defaultValue={this.getValue('ip_address')}
          label={__('IP Address')}
          helperText={this.getHelperText('ip_address')}
          hasError={fieldErrors && fieldErrors.ip_address !== undefined}
          onChange={this.onIpAddrChange('ip_address')}
        />
        <TextField
          id="username"
          label={__('Username')}
          margin="dense"
          value={this.getValue('username')}
          error={fieldErrors && fieldErrors.username !== undefined}
          helperText={this.getHelperText('username')}
          inputRef={input => { this.formField.push(input); }}
          onChange={this.onChange('username')}
          onKeyPress={event => this.onKeyPress(event, 1)}
        />
        <TextField
          id="starting_directory"
          label={__('Starting Directory')}
          margin="dense"
          value={this.getValue('starting_directory')}
          error={fieldErrors && fieldErrors.starting_directory !== undefined}
          helperText={this.getHelperText('starting_directory')}
          inputRef={input => { this.formField.push(input); }}
          onChange={this.onChange('starting_directory')}
          onKeyPress={event => this.onKeyPress(event, 2)}
          placeholder="~/"
        />
        <FormControl>
          <InputLabel htmlFor="password">Password</InputLabel>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={this.getValue('password')}
            error={fieldErrors && fieldErrors.password !== undefined}

            onChange={this.onChange('password')}
            inputRef={input => { this.formField.push(input); }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={this.handleClickShowPassword}
                  onMouseDown={this.handleMouseDownPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
          {fieldErrors && fieldErrors.password && (
            <FormHelperText>{this.getHelperText('password')}</FormHelperText>
          )}
        </FormControl>
        <FormControlLabel
          classes={{ root: classes.switch }}
          control={
            <Switch
              checked={this.getValue('fallback_to_ftp', false)}
              onChange={this.onSwitchChange('fallback_to_ftp')}
              color="secondary"
            />
          }
          label="Attempt FTP After SFTP Failure"
        />
      </FlexContainer>
    );
  }
}

export default withStyles(style)(
  FtpConfigEdit
);