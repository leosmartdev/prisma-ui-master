import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';
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
} from '@material-ui/core';

// Actions & Helpers
import * as actions from 'configuration';

const style = theme => ({
  button: {
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
});

class ConfigEdit extends React.Component {
  static propTypes = {
    /** @private withRouter */
    history: PropTypes.object.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private connect(mapStateToProps) */
    config: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // Group of input fields
    this.formField = [];

    const config = props.config.site;

    this.state = {
      name: config.name ? config.name : '',
      description: config.description ? config.description : '',
      address: config.address ? config.address : '',
      country: config.country ? config.country : '',
      incidentIdPrefix: config.incidentIdPrefix ? config.incidentIdPrefix : '',
      cscode: config.cscode ? config.cscode : '',
      csname: config.csname ? config.csname : '',

      fieldErrors: {},
    };
  }

  validate = () => {
    const {
      cscode,
      csname,
    } = this.state;

    // Initialize
    this.setState({
      fieldErrors: {},
    });

    if (cscode.length > 0) {
      if (cscode.length !== 4) {
        this.setError('cscode', 'Must be 4 characters');
        return false;
      } else if (!/^[A-Z0-9]{4}$/.test(cscode)) {
        this.setError('cscode', 'Can only contain digits and capital letters');
        return false;
      }
    }

    if (csname.length > 0) {
      if (csname.length > 8) {
        this.setError('csname', 'Max length is 8 characters');
        return false;
      } else if (!/^[A-Z0-9]{0,8}$/.test(csname)) {
        this.setError('csname', 'Can only contain digits and capital letters');
        return false;
      }
    }

    return true;
  };

  setError = (fieldName, errorMsg) => {
    this.setState(prevState => ({
      fieldErrors: {
        ...prevState.fieldErrors,
        [fieldName]: errorMsg,
      },
    }));
  };

  getHelperText = fieldName => {
    const { fieldErrors } = this.state;

    return fieldErrors[fieldName] ? fieldErrors[fieldName] : '';
  };

  onChange = fieldName => event => {
    this.setState({
      [fieldName]: event.target.value,
    });
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
    const { config, createTransaction, history } = this.props;

    const {
      name,
      description,
      address,
      country,
      incidentIdPrefix,
      cscode,
      csname,
    } = this.state;

    const newConfig = {
      ...config,
      site: {
        ...config.site,
        name,
        description,
        address,
        country,
        incidentIdPrefix,
        cscode,
        csname,
      },
    };

    // Validate form data
    let validated = this.validate();

    if (!validated) {
      return;
    }

    await createTransaction(actions.updateConfig(newConfig));

    history.push('/config/list');
  };

  onCancel = () => {
    const { history } = this.props;

    history.push('/config/list');
  };

  render() {
    const { classes } = this.props;

    const {
      name,
      description,
      address,
      country,
      incidentIdPrefix,
      cscode,
      csname,
      fieldErrors,
    } = this.state;

    return (
      <FlexContainer column align="start stretch">
        <TextField
          id="name"
          label={__('Name')}
          margin="dense"
          value={name}
          error={fieldErrors.name !== undefined}
          helperText={this.getHelperText('name')}
          inputRef={input => { this.formField.push(input); }}
          onChange={this.onChange('name')}
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
          onChange={this.onChange('description')}
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
          onChange={this.onChange('address')}
          onKeyPress={event => this.onKeyPress(event, 2)}
        />
        <CountrySelector
          id="country"
          country={country}
          onChange={this.onCountryChange}
        />
        <TextField
          id="incidentIdPrefix"
          label={__('Incident ID Prefix')}
          margin="dense"
          value={incidentIdPrefix}
          error={fieldErrors.incidentIdPrefix !== undefined}
          helperText={this.getHelperText('incidentIdPrefix')}
          inputRef={input => { this.formField.push(input); }}
          onChange={this.onChange('incidentIdPrefix')}
          onKeyPress={event => this.onKeyPress(event, 3)}
        />
        <TextField
          id="cscode"
          label={__('Cospas/Sarsat Code')}
          margin="dense"
          value={cscode}
          error={fieldErrors.cscode !== undefined}
          helperText={this.getHelperText('cscode')}
          inputRef={input => { this.formField.push(input); }}
          onChange={this.onChange('cscode')}
          onKeyPress={event => this.onKeyPress(event, 4)}
        />
        <TextField
          id="csname"
          label={__('Cospas/Sarsat Name')}
          margin="dense"
          value={csname}
          error={fieldErrors.csname !== undefined}
          helperText={this.getHelperText('csname')}
          inputRef={input => { this.formField.push(input); }}
          onChange={this.onChange('csname')}
        />

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
  config: state.config,
});

export default withRouter(
  withTransaction(
    withStyles(style)(
      connect(
        mapStateToProps,
      )(ConfigEdit)
    )
  )
);