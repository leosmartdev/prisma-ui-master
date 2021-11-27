import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import Header from 'components/Header';
import ErrorBanner from 'components/error/ErrorBanner';
import OwnerForm from 'components/fleet/form/OwnerForm';

import {
  TextField,
  Button,
} from '@material-ui/core';

// Helpers
import { DefaultFleet } from 'fleet';
import getOwnerFromFleet from 'components/fleet/getOwnerFromFleet';
import { updateObjectPropertyWithValue, getHelperTextForField, hasErrorForField } from 'lib/form';

const propTypes = {
  /**
   * The string to display in the save button.
   */
  saveButtonText: PropTypes.string,
  /**
   * The fleet to populate the form if the form is in edit mode.
   */
  fleet: PropTypes.object,
  /**
   * Callback function when save is clicked. Will pass the fleet as the only param.
   */
  onSave: PropTypes.func.isRequired,
  /**
   * If not null then the errors will displayed on the fields as provided on the object.
   * The object is key/value pairs of field name : error message to be displayed under
   * the field. If a field property is found in this object, it will be marked in an
   * error state.
   */
  fieldErrors: PropTypes.object,
  /**
   * General error message to be displayed on the top of the form. Will only be displayed
   * if not null.
   */
  errorBannerMessage: PropTypes.string,
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
};

const defaultProps = {
  saveButtonText: __('Create Fleet'),
  fleet: DefaultFleet,
  fieldErrors: null,
  errorBannerMessage: null,
};

class FleetForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorBannerText: null,
      fleet: {
        ...DefaultFleet,
        ...props.fleet,
      },
    };
  }

  onChange = propName => event => {
    let value = event;
    if (event && event.target) {
      if (event.target.value !== null && typeof event.target.value !== 'undefined') {
        value = event.target.value;
      }
    }

    this.setState(prevState => updateObjectPropertyWithValue(prevState, propName, value));
  };

  onOwnerChange = ownerType => owner => {
    this.onChange(`fleet.${ownerType}`)(owner);
  };

  onOwnerTypeChange = (newType, oldType) => {
    const owner = this.state.fleet[oldType];
    const newState = {
      fleet: {
        ...this.state.fleet,
        [newType]: owner,
      },
    };
    delete newState.fleet[oldType];
    this.setState(newState);
  };

  onSave = () => {
    this.props.onSave(this.state.fleet);
  };

  render() {
    const { fieldErrors, errorBannerMessage, classes } = this.props;

    const { fleet } = this.state;
    const { owner, ownerType } = getOwnerFromFleet(fleet);

    return [
      <ErrorBanner message={errorBannerMessage} compact key="error_banner" />,
      <FlexContainer
        column
        className={classes.container}
        padding="dense"
        align="start stretch"
        key="fleet_details"
      >
        <TextField
          margin="dense"
          aria-label="name"
          label={__('Name')}
          name="fleet.name"
          value={fleet.name}
          onChange={this.onChange('fleet.name')}
          error={hasErrorForField('name', fieldErrors)}
          helperText={getHelperTextForField('name', fieldErrors)}
          required
        />
        <TextField
          margin="dense"
          name="fleet.description"
          aria-label="description"
          label={__('Description')}
          value={fleet.description}
          onChange={this.onChange('fleet.description')}
          multiline
          rows={2}
          rowsMax={10}
          placeholder={__('Enter a description of the fleet you are creating.')}
          error={hasErrorForField('description', fieldErrors)}
          helperText={getHelperTextForField('description', fieldErrors)}
        />
      </FlexContainer>,
      <Header className={classes.container} margin="normal" variant="h6" key="owner_details_header">
        {__('Owner Information')}
      </Header>,
      <FlexContainer
        column
        padding="dense"
        align="start stretch"
        key="owner_details"
        className={classes.container}
      >
        <OwnerForm
          owner={owner}
          ownerType={ownerType}
          onChange={this.onOwnerChange}
          onOwnerTypeChange={this.onOwnerTypeChange}
        />
      </FlexContainer>,
      <FlexContainer
        column
        padding="dense"
        align="start stretch"
        key="actions"
        className={classes.container}
      >
        <Button variant="contained" color="primary" onClick={() => this.onSave()}>
          {this.props.saveButtonText}
        </Button>
      </FlexContainer>,
    ];
  }
}

FleetForm.propTypes = propTypes;
FleetForm.defaultProps = defaultProps;

export default withStyles({
  container: {
    minHeight: 'min-content',
  },
})(FleetForm);
