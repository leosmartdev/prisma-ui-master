import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import PersonForm from 'components/person/PersonForm';

import {
  TextField,
  MenuItem,
} from '@material-ui/core';

// Helpers
import { DefaultPerson } from 'components/person';

const propTypes = {
  owner: PropTypes.object,
  ownerType: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onOwnerTypeChange: PropTypes.func.isRequired,
  /**
   * Object with errors for the fields in this form.
   */
  fieldErrors: PropTypes.object,
};

const defaultProps = {
  owner: { ...DefaultPerson },
  ownerType: 'person',
};

class OwnerForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * The owner object being edited.
       */
      owner: { ...props.owner },
      /**
       * The current type of owner.
       */
      type: props.ownerType || 'person',
    };
  }

  /**
   * Called when a value on the owner changes. Calls `props.onChange` with the type and
   * owner information. onChange(type: string)(owner: obj)
   *
   * @param {propName} string The property on the owner being changed.
   * @param {any} value The value of the property being changed.
   */
  onChange = propName => value => {
    this.setState(prevState => {
      const owner = {
        ...prevState.owner,
        [propName]: value,
      };

      this.props.onChange(prevState.type)(owner);
      return { owner };
    });
  };

  /**
   * Called when the type changes. Calls `props.onOwnerTypeChange`
   */
  onTypeChange = event => {
    const oldType = this.state.type;
    const newType = event.target.value;
    this.setState({
      type: newType,
    });
    // Inform the owner of this component the owner has changed.
    this.props.onOwnerTypeChange(newType, oldType);
  };

  render() {
    const { fieldErrors } = this.props;
    return [
      <TextField
        name="owner_type"
        key="owner_type"
        select
        label={__('Owner')}
        value={this.state.type}
        onChange={this.onTypeChange}
        helperText={__('Select whether the owner is a single person or an organization')}
        margin="normal"
        fullWidth
      >
        <MenuItem value="person">{__('Person')}</MenuItem>
        <MenuItem value="organization">{__('Organization or Company')}</MenuItem>
      </TextField>,
      <PersonForm
        key="person_form"
        person={this.state.owner}
        onChange={this.onChange}
        fieldErrors={fieldErrors && fieldErrors.getErrorsForChild(this.state.type)}
      />,
    ];
  }
}

OwnerForm.propTypes = propTypes;
OwnerForm.defaultProps = defaultProps;

export default OwnerForm;
