/**
 * VesselExpansionPanel provides Vessel details an an ExpansionPanel
 * provided by MaterialUI
 *
 * The expansion card is made up of two parts, the summary part that is always displayed
 * and the details that is the expanded paper when the summary is clicked.
 * VesselExpansionPanel provides the summary and controls the collapse, and pulls in the
 * expansion panel details component for the content when the component is expanded.
 *
 * The expansion panel also handles the server communication for dealing with.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import PrimaryButton from 'components/PrimaryButton';
import VesselEditPanel from 'components/fleet/vessel/VesselEditPanel';
import VesselExpansionPanelDetails from 'components/fleet/vessel/VesselExpansionPanelDetails';
import VesselExpansionPanelSummary from 'components/fleet/vessel/VesselExpansionPanelSummary';

import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from "@material-ui/core";

// Actions and Helpers
import { updateObjectPropertyWithValue } from 'lib/form';
import { createVessel } from 'fleet/vessel';
import { DefaultVessel } from 'components/fleet/vessel/propTypes';

import loglevel from 'loglevel';

const log = loglevel.getLogger('fleet');

/* **********************************************
 *
 * VesselExpansionPanel
 * Display a single vessel expansion Panel
 *
 ********************************************* */

const propTypes = {
  /**
   * Callback when the vessel is succesfully save. Will provide a single param
   * that is the new vessel returned from the server.
   */
  onSave: PropTypes.func.isRequired,
  /**
   * Callback when the cancel button is clicked by the user.
   */
  onCancel: PropTypes.func.isRequired,
  /**
   * When provided, the vessel will be assigned to this fleet.
   */
  fleet: PropTypes.object,
  /**
   * @private Provided by withStyles
   */
  classes: PropTypes.object.isRequired,
  /**
   * @private withTransaction
   */
  createTransaction: PropTypes.func.isRequired,
};

const defaultProps = {
  fleet: null,
};

class CreateVesselExpansionPanel extends React.Component {
  _isMounted = false;

  state = {
    expanded: true,
    /**
     * The vessel being created.
     */
    vessel: { ...DefaultVessel },
    /**
     * If edit fails due to invalid form content, fieldErrors is parsed
     * from the response and passed to fields to display which fields and
     * validators failed so the user can fix the errors.
     */
    fieldErrors: null,
    /**
     * Banner message that will be displayed on the form view in the summary area.
     */
    errorBannerMessage: null,
    /**
     *  This is the exact error object returned from the server. This will be passed to all child
     * components so they can display their own errors if applicable.
     */
    error: null,
  };

  vessel = {
    ...this.state.vessel,
  };

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  vesselSaveSuccess = vessel => {
    // Form can now go away.
    if (this._isMounted) {
      this.setState({
        vessel,
        error: null,
        errorBannerMessage: null,
        fieldErrors: null,
      });
    }

    this.props.onSave(vessel);
  };

  vesselSaveFailed = error => {
    log.error('Vessel Save Failed', error);

    let errorBannerMessage = __(
      'An unknown error occurred creating the Vessel. Please try again or contact your system administrator.',
    );
    if (error.fieldErrors) {
      errorBannerMessage = __('Please fix form errors and try submitting again.');
    } else if (error && error.statusCode > 500) {
      errorBannerMessage = __(
        'An error occured on the server while creating this vessel. Please try again later or contact your system administrator.',
      );
    }

    if (this._isMounted) {
      this.setState({
        error,
        errorBannerMessage,
        fieldErrors: error.fieldErrors,
      });
    }
  };

  onSave = () => {
    // Clear existing errors
    this.setState({
      errorBannerMessage: null,
      error: null,
    });

    // Add the fleet if we have one
    if (this.props.fleet && this.props.fleet.id && this.props.fleet.name) {
      this.vessel.fleet = {
        id: this.props.fleet.id,
        name: this.props.fleet.name,
      };
    }

    const action = createVessel(this.vessel);
    this.props.createTransaction(action).then(this.vesselSaveSuccess, this.vesselSaveFailed);
  };

  onChange = propName => event => {
    let value = event;
    if (event && event.target) {
      if (event.target.value !== null && typeof event.target.value !== 'undefined') {
        value = event.target.value;
      }
    }

    this.vessel = updateObjectPropertyWithValue(this.vessel, propName, value);
  };

  onOwnerTypeChange = (newType, oldType) => {
    try {
      const owner = this.vessel[oldType];
      this.vessel = {
        ...this.vessel,
        [newType]: owner,
      };
      delete this.vessel[oldType];
    } catch (error) {
      log.info('Owner does not exist on the vessel, so ignoring type change.');
    }
  };

  render() {
    const { classes, onCancel } = this.props;

    const { errorBannerMessage, fieldErrors, vessel } = this.state;

    return (
      <Accordion expanded>
        <AccordionSummary>
          <VesselExpansionPanelSummary
            vessel={vessel}
            isExpanded
            isEditing
            errorBannerMessage={errorBannerMessage}
            editTitle={__('Create Vessel')}
          />
        </AccordionSummary>
        <AccordionDetails classes={{ root: classes.expansionPanelDetails }}>
          <FlexContainer column align="start stretch" className={classes.container}>
            <VesselEditPanel vessel={vessel} fieldErrors={fieldErrors} onChange={this.onChange} />
            <VesselExpansionPanelDetails
              vessel={vessel}
              isEditing
              fieldErrors={fieldErrors}
              onChange={this.onChange}
              onOwnerTypeChange={this.onOwnerTypeChange}
              errors={this.state.errors}
              hideDevices
            />
          </FlexContainer>
        </AccordionDetails>
        <AccordionActions>
          <Button onClick={onCancel}>{__('Cancel')}</Button>
          <PrimaryButton onClick={this.onSave}>{__('Save')}</PrimaryButton>
        </AccordionActions>
      </Accordion>
    );
  }
}

CreateVesselExpansionPanel.propTypes = propTypes;
CreateVesselExpansionPanel.defaultProps = defaultProps;

export default withStyles({
  container: {
    width: '100%',
  },
  formContainer: {
    width: '100%',
  },
  expansionPanelDetails: {
    paddingTop: '0px',
  },
})(withTransaction(CreateVesselExpansionPanel));
