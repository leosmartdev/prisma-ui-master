import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import * as IncidentHelpers from './helpers';
import { getHelperTextForField } from 'lib/form';

// Component Import
import { FlexContainer } from 'components/layout/Container';
import Autocomplete from 'components/Autocomplete';

import {
  MenuItem,
  Select,
  TextField,
  Input,
  InputLabel,
  FormHelperText,
  FormControl,
} from '@material-ui/core';

// Actions
import * as roleActions from 'auth/roles';

const styles = {
  phaseInputRoot: {
    minWidth: '90px',
  },
  typeInputRoot: {
    minWidth: '210px',
  },
};

const defaultIncident = {
  name: '',
  phase: '',
  type: '',
  assignee: '',
  commander: '',
};

/**
 * IncidentForm
 *
 */
class IncidentForm extends React.Component {
  constructor(props) {
    super(props);

    this.typeMenuOptions = [
      __('Unknown'),
      __('Unlawful Interference/Piracy'),
      __('Lost Person'),
      __('MEDICO/MEDIVAC'),
      __('Overdue Vessel'),
      __('Exercise'),
    ];

    this.phaseMenuOptions = [
      { value: 1, label: __('Uncertainty') },
      { value: 2, label: __('Alert') },
      { value: 3, label: __('Distress') },
    ];

    const incident = { ...defaultIncident, ...this.props.incident };
    this.state = {
      incident,
      disabled: IncidentHelpers.isClosed(props.incident),
      fieldErrors: {},
      users: [],

      // layout
      flex: {
        direction: this.props.column ? 'column' : 'row',
        align: this.props.align || 'start stretch',
        wrap: this.props.wrap || 'wrap',
      },
    };

    this.props.getIncidentUsers();
  }

  static getDerivedStateFromProps({ users, incident }) {
    // Setup and handle errors when updating
    let stateUsers = [];
    if (users !== undefined) {
      stateUsers = users.map(({ userId }) => ({ label: userId, value: userId }));
    }

    // always update incident state based on props
    return {
      disabled: IncidentHelpers.isClosed(incident),
      users: stateUsers,
    };
  }

  /**
   * TextField Blur.
   * Called when the user finishes editing a text field. This function
   * will then figure out which field was edited, and dispatch an action
   * to update the incident with the new data.
   */
  blurIncident = name => event => {
    event.persist();
    this.setState(prevState => {
      const incident = { ...prevState.incident };
      if ({}.hasOwnProperty.call(incident, name) && event.target.value) {
        incident[name] = event.target.value;
      }

      this.props.onChange(incident);
      return { incident };
    });
  };

  onChange = name => (event, values) => {
    let value = event.target.value;
    if (values !== undefined && values.newValue !== undefined) {
      value = values.newValue;
    }

    if (value !== undefined) {
      this.setState(prevState => ({
        incident: {
          ...prevState.incident,
          [name]: value,
        },
      }));
    }
  };

  onSelect = name => selection => {
    this.setState(prevState => {
      const incident = { ...prevState.incident };
      if ({}.hasOwnProperty.call(incident, name)) {
        incident[name] = selection;
      }
      this.props.onChange(incident);
      return { incident };
    });
  };

  /** ****************************************************
   *
   * Autosuggest
   *
   **************************************************** */
  render() {
    return (
      <FlexContainer
        direction={this.state.flex.direction}
        align={this.state.flex.align}
        wrap={this.state.flex.wrap}
      >
        <TextField
          id="name"
          label={__('Name')}
          margin="dense"
          value={this.state.incident.name}
          onChange={this.onChange('name')}
          onBlur={this.blurIncident('name')}
          error={this.props.fieldErrors.name !== undefined}
          helperText={getHelperTextForField('name', this.props.fieldErrors)}
          required
          disabled={this.state.disabled}
        />
        <Autocomplete
          label={__('Owner')}
          margin="dense"
          value={this.state.incident.assignee}
          onSelect={this.onSelect('assignee')}
          suggestions={this.state.users}
          autoselectFirstOption
          strictCompare
          inputProps={{
            error: this.props.fieldErrors.assignee !== undefined,
            helperText: getHelperTextForField('assignee', this.props.fieldErrors),
            disabled: this.state.disabled,
          }}
        />
        <Autocomplete
          label={__('SAR Mission Controller')}
          margin="dense"
          value={this.state.incident.commander}
          onSelect={this.onSelect('commander')}
          suggestions={this.state.users}
          autoselectFirstOption
          strictCompare
          inputProps={{
            error: this.props.fieldErrors.commander !== undefined,
            helperText: getHelperTextForField('commander', this.props.fieldErrors),
            disabled: this.state.disabled,
          }}
        />
        <FormControl
          margin="dense"
          classes={{ root: this.props.classes.phaseInputRoot }}
          disabled={this.state.disabled}
          onBlur={this.blurIncident('phase')}
          error={this.props.fieldErrors.phase !== undefined}
        >
          <FlexContainer column align="center stretch">
            <InputLabel htmlFor="phase">{__('Phase')}</InputLabel>
            <Select
              value={this.state.incident.phase}
              onChange={this.onChange('phase')}
              input={<Input id="phase" fullWidth />}
            >
              {this.phaseMenuOptions.map(option => (
                <MenuItem value={option.value} key={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {getHelperTextForField('phase', this.props.fieldErrors)}
            </FormHelperText>
          </FlexContainer>
        </FormControl>
        <FormControl
          margin="dense"
          classes={{ root: this.props.classes.typeInputRoot }}
          disabled={this.state.disabled}
          onBlur={this.blurIncident('type')}
          error={this.props.fieldErrors.type !== undefined}
        >
          <FlexContainer column align="center stretch">
            <InputLabel htmlFor="type">{__('Type')}</InputLabel>
            <Select
              value={this.state.incident.type}
              onChange={this.onChange('type')}
              input={<Input id="type" fullWidth />}
            >
              {this.typeMenuOptions.map(option => (
                <MenuItem value={option} key={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{getHelperTextForField('type', this.props.fieldErrors)}</FormHelperText>
          </FlexContainer>
        </FormControl>
      </FlexContainer>
    );
  }
}

IncidentForm.propTypes = {
  incident: PropTypes.object,
  fieldErrors: PropTypes.object.isRequired, // Required to at least be empty object {}
  /** Called when the incident is updated in the form */
  onChange: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  // The following allow for passing in configuration for flex align and wrap to
  // properly arrange the fields for the container the form is being placed in
  column: PropTypes.bool,
  align: PropTypes.string,
  wrap: PropTypes.string,

  // state to props
  users: PropTypes.array,

  // dispatch to props
  getIncidentUsers: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  users: state.roles.usersByRole.IncidentManager,
});

const mapDispatchToProps = dispatch => ({
  getIncidentUsers: () => {
    dispatch(roleActions.getIncidentManagers());
  },
});

export default (IncidentForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(IncidentForm)));
