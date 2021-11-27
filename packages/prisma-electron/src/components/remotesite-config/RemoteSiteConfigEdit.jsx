import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';
import Header from 'components/Header';
import FtpConfigEdit from 'components/remotesite-config/FtpConfigEdit';
import CountrySelector from './CountrySelector';

import {
  TextField,
  FormControl,
  Input,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
  IconButton,
  Collapse,
} from '@material-ui/core';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// Actions & Helpers
import * as actions from 'remotesite-config/remotesite-config';

const style = theme => ({
  button: {
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
});

class RemoteSiteConfigEdit extends React.Component {
  static propTypes = {
    /** @private withRouter */
    history: PropTypes.object.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private connect(mapStateToProps) */
    config: PropTypes.object.isRequired,
    currentRemoteSiteConfig: PropTypes.object,
  };

  constructor(props) {
    super(props);

    // Group of input fields
    this.formField = [];

    this.typeMenuOptions = [
      __('MCC'),
      __('RCC'),
    ];

    this.commLinkTypeMenuOptions = [
      __('FTP'),
    ];

    this.noValue = '';

    const remoteSiteConfig = props.currentRemoteSiteConfig;

    this.state = {
      type: remoteSiteConfig && remoteSiteConfig.type ? remoteSiteConfig.type : 'RCC',
      name: remoteSiteConfig && remoteSiteConfig.name ? remoteSiteConfig.name : '',
      description: remoteSiteConfig && remoteSiteConfig.description ? remoteSiteConfig.description : '',
      address: remoteSiteConfig && remoteSiteConfig.address ? remoteSiteConfig.address : '',
      country: remoteSiteConfig && remoteSiteConfig.country ? remoteSiteConfig.country : '',
      cscode: remoteSiteConfig && remoteSiteConfig.cscode ? remoteSiteConfig.cscode : '',
      csname: remoteSiteConfig && remoteSiteConfig.csname ? remoteSiteConfig.csname : '',
      comm_link_type: 'FTP',
      ftp_communication: {
        hostname: this.getValue('ftp_communication', true, 'hostname'),
        ip_address: this.getValue('ftp_communication', true, 'ip_address'),
        username: this.getValue('ftp_communication', true, 'username'),
        password: this.getValue('ftp_communication', true, 'password'),
        starting_directory: this.getValue('ftp_communication', true, 'starting_directory'),
        fallback_to_ftp: this.getValue('ftp_communication', true, 'fallback_to_ftp', false),
      },

      commConfigExpanded: true,

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
      cscode,
      csname,
      comm_link_type,
      ftp_communication,
    } = this.state;

    const { config } = this.props;

    // Initialize
    this.setState({
      fieldErrors: {},
    });

    if (cscode.length == 0) {
      this.setError('cscode', 'C/S code is required');
      return false;
    }

    if (cscode.length !== 4) {
      this.setError('cscode', 'Must be 4 characters');
      return false;
    } else if (!/^[A-Z0-9]{4}$/.test(cscode)) {
      this.setError('cscode', 'Can only contain digits and capital letters');
      return false;
    } else if (cscode == config.site.cscode) {
      this.setError('cscode', 'Cannot conflict with local site C/S code');
      return false;
    }

    if (csname.length == 0) {
      this.setError('csname', 'C/S name is required');
      return false;
    }

    if (csname.length > 8) {
      this.setError('csname', 'Max length is 8 characters');
      return false;
    } else if (!/^[A-Z0-9]{0,8}$/.test(csname)) {
      this.setError('csname', 'Can only contain digits and capital letters');
      return false;
    }

    switch (comm_link_type) {
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

  toggleCommConfig = () => {
    this.setState(prevState => ({ commConfigExpanded: !prevState.commConfigExpanded }));
  };

  toggleCommConfigIcon = () => (this.state.commConfigExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  onChange = (fieldName, value, childName) => {
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

  onCountryChange = country => {
    this.setState({
      country,
    });
  };

  // Focus on the next input once enter key is pressed
  onKeyPress = (event, idx) => {
    if (event.key == 'Enter') {
      this.formField[idx + 1].focus();
    }
  };

  onSave = async () => {
    const {
      currentRemoteSiteConfig,
      createTransaction,
      history,
    } = this.props;

    const {
      type,
      name,
      description,
      address,
      country,
      cscode,
      csname,
      ftp_communication,
    } = this.state;

    let prevConfig = currentRemoteSiteConfig && 'ftp_communication' in currentRemoteSiteConfig ? { ...currentRemoteSiteConfig.ftp_communication } : {};

    const newConfig = {
      ...currentRemoteSiteConfig,
      type,
      name,
      description,
      address,
      country,
      cscode,
      csname,
      ftp_communication: {
        ...prevConfig,
        hostname: ftp_communication.hostname,
        ip_address: ftp_communication.ip_address,
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

    if (!currentRemoteSiteConfig) {
      await createTransaction(actions.createRemoteSiteConfig(newConfig));
    } else {
      await createTransaction(actions.updateRemoteSiteConfig(currentRemoteSiteConfig.id, newConfig));
    }

    history.push(`/remotesite-config/show`);
  };

  onDelete = async () => {
    const {
      history,
      createTransaction,
      currentRemoteSiteConfig,
    } = this.props;

    await createTransaction(actions.deleteRemoteSiteConfig(currentRemoteSiteConfig.id));

    history.push(`/remotesite-config/list`);
  };

  onCancel = () => {
    const {
      history,
      currentRemoteSiteConfig,
    } = this.props;

    if (!currentRemoteSiteConfig) {
      history.push(`/remotesite-config/list`);
    } else {
      history.push(`/remotesite-config/show`);
    }
  };

  render() {
    const {
      classes,
      currentRemoteSiteConfig,
    } = this.props;

    const {
      type,
      name,
      description,
      address,
      country,
      cscode,
      csname,
      ftp_communication,
      comm_link_type,
      commConfigExpanded,
      fieldErrors,
    } = this.state;

    let buttonGroup = (
      <FlexContainer align="space-between center">
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.onSave}
        >
          {__('Save Changes')}
        </Button>
        {currentRemoteSiteConfig && (
          <Button
            color="secondary"
            variant="contained"
            className={classes.button}
            onClick={this.onDelete}
          >
            {__('Delete')}
          </Button>
        )}
      </FlexContainer>
    );

    if (!currentRemoteSiteConfig) {
      buttonGroup = (
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.onSave}
        >
          {__('Save Changes')}
        </Button>
      );
    }

    let comm_link_content;

    switch (comm_link_type) {
      case 'FTP':
        comm_link_content = (
          <FtpConfigEdit
            onChange={(key, value) => this.onChange('ftp_communication', value, key)}
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
            <InputLabel htmlFor="type">{__('Type')}</InputLabel>
            <Select
              value={type}
              onChange={event => { this.onChange('type', event.target.value) }}
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
        <TextField
          id="name"
          label={__('Name')}
          margin="dense"
          value={name}
          error={fieldErrors.name !== undefined}
          helperText={this.getHelperText('name')}
          inputRef={input => { this.formField.push(input); }}
          onChange={event => { this.onChange('name', event.target.value) }}
          onKeyPress={event => this.onKeyPress(event, 0)}
        />
        <TextField
          id="description"
          label={__('Description')}
          margin="dense"
          multiline
          value={description}
          error={fieldErrors.description !== undefined}
          helperText={this.getHelperText('description')}
          inputRef={input => { this.formField.push(input); }}
          onChange={event => { this.onChange('description', event.target.value) }}
          onKeyPress={event => this.onKeyPress(event, 1)}
        />
        <TextField
          id="address"
          label={__('Address')}
          margin="dense"
          value={address}
          error={fieldErrors.address !== undefined}
          helperText={this.getHelperText('address')}
          inputRef={input => { this.formField.push(input); }}
          onChange={event => { this.onChange('address', event.target.value) }}
          onKeyPress={event => this.onKeyPress(event, 2)}
        />
        <CountrySelector
          id="country"
          country={country}
          onChange={this.onCountryChange}
        />
        <TextField
          id="cscode"
          label={__('Cospas/Sarsat Code')}
          margin="dense"
          value={cscode}
          error={fieldErrors.cscode !== undefined}
          helperText={this.getHelperText('cscode')}
          inputRef={input => { this.formField.push(input); }}
          onChange={event => { this.onChange('cscode', event.target.value) }}
          onKeyPress={event => this.onKeyPress(event, 3)}
        />
        <TextField
          id="csname"
          label={__('Cospas/Sarsat Name')}
          margin="dense"
          value={csname}
          error={fieldErrors.csname !== undefined}
          helperText={this.getHelperText('csname')}
          inputRef={input => { this.formField.push(input); }}
          onChange={event => { this.onChange('csname', event.target.value) }}
        />

        {/* COMMS LINK CONFIG */}
        <Header
          onClick={this.toggleCommConfig}
          variant="h6"
          margin="normal"
          action={<IconButton>{this.toggleCommConfigIcon()}</IconButton>}
        >
          {__('Communication Config')}
        </Header>
        <Collapse in={commConfigExpanded}>
          <FlexContainer column align="start stretch">
            <FormControl margin="dense">
              <FlexContainer column align="center stretch">
                <InputLabel htmlFor="type">{__('Communication Type')}</InputLabel>
                <Select
                  value={comm_link_type}
                  onChange={event => this.onChange('comm_link_type', event.target.value)}
                  input={<Input id="type" fullWidth />}
                >
                  {this.commLinkTypeMenuOptions.map(option => (
                    <MenuItem value={option} key={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FlexContainer>
            </FormControl>

            {/* CONTENT */}
            {comm_link_content}

          </FlexContainer>
        </Collapse>

        <Divider className={classes.divider} />

        {buttonGroup}

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
  config: state.config,
  currentRemoteSiteConfig: state.remoteSiteConfig.currentRemoteSiteConfig,
});

export default withRouter(
  withTransaction(
    withStyles(style)(
      connect(
        mapStateToProps,
      )(RemoteSiteConfigEdit)
    )
  )
);