/**
 * Form for editing basic details of a Vessel.
 *
 * Currently:
 *   * Name
 *   * Type
 *
 * Component returns an array of form fields.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import {
  TextField,
  Grid,
} from '@material-ui/core';

// Helpers
import { VesselShape, DefaultVessel } from 'components/fleet/vessel/propTypes';

const propTypes = {
  /**
   * Vessel object being edited. Fields that this form will edit are name and type.
   */
  vessel: PropTypes.shape(VesselShape),
  /**
   * Props to be passed to each field. The property name in the object must match
   * the intended field name.
   */
  fieldProps: PropTypes.shape({
    name: PropTypes.object,
    type: PropTypes.object,
  }),
  /**
   * Object with errors for the fields in this form.
   */
  fieldErrors: PropTypes.object,
  /**
   * Callback for when the values on the form change.
   */
  onChange: PropTypes.func.isRequired,
};

const defaultProps = {
  vessel: { ...DefaultVessel },
  fieldProps: {},
  fieldErrors: null,
};

class VesselForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: props.vessel.name || '',
      type: props.vessel.type || '',
    };
  }

  onChange = fieldName => event => {
    this.setState({
      [fieldName]: event.target.value,
    });

    this.props.onChange(fieldName)(event.target.value);
  };

  render() {
    const { name, type } = this.state;

    const { fieldProps, fieldErrors } = this.props;

    return [
      <Grid key="name_field" item {...fieldProps.name}>
        <TextField
          name="name"
          label={__('Name')}
          value={name}
          onChange={this.onChange('name')}
          error={fieldErrors && fieldErrors.hasErrorForField('name')}
          helperText={fieldErrors && fieldErrors.getHelperTextForField('name')}
        />
      </Grid>,
      <Grid key="type_field" item {...fieldProps.type}>
        <TextField
          name="type"
          label={__('Vessel Type')}
          value={type}
          onChange={this.onChange('type')}
          error={fieldErrors && fieldErrors.hasErrorForField('type')}
          helperText={fieldErrors && fieldErrors.getHelperTextForField('type')}
        />
      </Grid>,
    ];
  }
}

VesselForm.propTypes = propTypes;
VesselForm.defaultProps = defaultProps;

export default VesselForm;
