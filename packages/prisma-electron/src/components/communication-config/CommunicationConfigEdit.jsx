import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';
import FtpConfigEdit from 'components/communication-config/FtpConfigEdit';

import {
  FormControl,
  Input,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
} from '@material-ui/core';

// Actions & Helpers
import * as actions from 'remotesite-config/remotesite-config';

import { getIpAddressForDisplay } from './helpers';

const style = theme => ({
  button: {
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
});

class CommunicationConfigEdit extends React.Component {
  static propTypes = {
    /** @private withRouter */
    history: PropTypes.object.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private connect(mapStateToProps) */
    currentRemoteSiteConfig: PropTypes.object,
  };

  constructor(props) {
    super(props);

    // Group of input fields
    this.formField = [];

    this.typeMenuOptions = [
      __('FTP'),
    ];

    this.noValue = '';

    this.state = {
      type: 'FTP',
      ftp_communication: {
        hostname: this.getValue('ftp_communication', true, 'hostname'),
        ip_address: this.getValue('ftp_communication', true, 'ip_address'),
        username: this.getValue('ftp_communication', true, 'username'),
        password: this.getValue('ftp_communication', true, 'password'),
        starting_directory: this.getValue('ftp_communication', true, 'starting_directory'),
        fallback_to_ftp: this.getValue('ftp_communication', true, 'fallback_to_ftp', false),
      },

      fieldErrors: {},
    };
  }

  getValue = (key, isChild = false, childKey, noValue) => {
    const { currentRemoteSiteConfig } = this.props;

    if (!isChild) {
      if (currentRemoteSiteConfig && key in currentRemoteSiteConfig && currentRemoteSiteConfig[key]) {
        return currentRemoteSiteConfig[key];
      }
    } else {
      if (currentRemoteSiteConfig && childKey && key in currentRemoteSiteConfig && childKey in currentRemoteSiteConfig[key] && currentRemoteSiteConfig[key][childKey]) {
        return currentRemoteSiteConfig[key][childKey];
      }
    }

    if (noValue !== undefined) {
      return noValue;
    }

    return this.noValue;
  };

  validate = () => {
    const {
      type,
      ftp_communication,
    } = this.state;

    // Initialize
    this.setState({
      fieldErrors: {},
    });

    switch (type) {
      case 'FTP':
        if (ftp_communication.hostname.length == 0) {
          this.setError('ftp_communication', 'Hostname is required', 'hostname');
          return false;
        }

        let ip_address = ftp_communication.ip_address;
        if (ip_address.length == 0) {
          this.setError('ftp_communication', 'IP Address is required', 'ip_address');
          return false;
        } else if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01\s]?[0-9\s][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01\s]?[0-9\s][0-9]?)$/.test(ip_address)) {
          this.setError('ftp_communication', 'Invalid IPv4 Address', 'ip_address');
          return false;
        }

        if (ftp_communication.username.length == 0) {
          this.setError('ftp_communication', 'Username is required', 'username');
          return false;
        }

        if (ftp_communication.password.length == 0) {
          this.setError('ftp_communication', 'Password is required', 'password');
          return false;
        }

        break;
    }

    return true;
  };

  setError = (fieldName, errorMsg, childName) => {
    if (childName) {
      this.setState(prevState => ({
        fieldErrors: {
          ...prevState.fieldErrors,
          [fieldName]: {
            ...prevState.fieldErrors[fieldName],
            [childName]: errorMsg,
          },
        },
      }));
    } else {
      this.setState(prevState => ({
        fieldErrors: {
          ...prevState.fieldErrors,
          [fieldName]: errorMsg,
        },
      }));
    }
  };

  getHelperText = (fieldName, childName) => {
    const { fieldErrors } = this.state;

    if (childName) {
      return fieldErrors[fieldName] && fieldErrors[fieldName][childName] ? fieldErrors[fieldName][childName] : '';
    } else {
      return fieldErrors[fieldName] ? fieldErrors[fieldName] : '';
    }
  };

  onChange = (fieldName, childName, value) => {
    if (childName) {
      this.setState(prevState => ({
        ...prevState,
        [fieldName]: {
          ...prevState[fieldName],
          [childName]: value,
        },
      }));
    } else {
      this.setState({
        [fieldName]: value,
      });
    }
  };

  onSave = async () => {
    const {
      currentRemoteSiteConfig,
      createTransaction,
      history,
    } = this.props;

    const {
      ftp_communication,
    } = this.state;

    let prevConfig = currentRemoteSiteConfig && 'ftp_communication' in currentRemoteSiteConfig ? { ...currentRemoteSiteConfig.ftp_communication } : {};

    const newConfig = {
      ...currentRemoteSiteConfig,
      ftp_communication: {
        ...prevConfig,
        hostname: ftp_communication.hostname,
        ip_address: getIpAddressForDisplay(ftp_communication.ip_address),
        username: ftp_communication.username,
        password: ftp_communication.password,
        starting_directory: ftp_communication.starting_directory,
        fallback_to_ftp: ftp_communication.fallback_to_ftp,
      },
    };

    // Validate form data
    let validated = this.validate();

    if (!validated) {
      return;
    }
    
    await createTransaction(actions.updateRemoteSiteConfig(currentRemoteSiteConfig.id, newConfig));

    history.push(`/communication-config/show`);
  };

  onCancel = () => {
    const {
      history,
      currentRemoteSiteConfig,
    } = this.props;

    if (!currentRemoteSiteConfig) {
      history.push(`/communication-config/list`);
    } else {
      history.push(`/communication-config/show`);
    }
  };

  render() {
    const {
      classes,
    } = this.props;

    const {
      type,
      ftp_communication,
      fieldErrors,
    } = this.state;

    let content;

    switch (type) {
      case 'FTP':
        content = (
          <FtpConfigEdit
            onChange={(key, value) => this.onChange('ftp_communication', key, value)}
            ftpConfig={ftp_communication}
            fieldErrors={fieldErrors['ftp_communication']}
            getHelperText={key => this.getHelperText('ftp_communication', key)}
          />
        );
        break;
    }

    return (
      <FlexContainer column align="start stretch">
        <FormControl margin="dense">
          <FlexContainer column align="center stretch">
            <InputLabel htmlFor="type">{__('Communication Type')}</InputLabel>
            <Select
              value={type}
              onChange={() => this.onChange('type')}
              input={<Input id="type" fullWidth />}
            >
              {this.typeMenuOptions.map(option => (
                <MenuItem value={option} key={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FlexContainer>
        </FormControl>

        {/* Config */}
        {content}

        <Divider className={classes.divider} />

        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.onSave}
        >
          {__('Save Changes')}
        </Button>

        <Button
          variant="contained"
          className={classes.button}
          onClick={this.onCancel}>
          {__('Cancel')}
        </Button>
      </FlexContainer>
    );
  }
}

const mapStateToProps = state => ({
  currentRemoteSiteConfig: state.remoteSiteConfig.currentRemoteSiteConfig,
});

export default withRouter(
  withTransaction(
    withStyles(style)(
      connect(
        mapStateToProps,
      )(CommunicationConfigEdit)
    )
  )
);