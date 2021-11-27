import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';

// Components
import FleetForm from 'components/fleet/form/FleetForm';
import Header from 'components/Header';
import FlexContainer from 'components/FlexContainer';
import PrimaryButton from 'components/PrimaryButton';
import ConfirmationDialog from 'components/ConfirmationDialog';

import {
  IconButton,
} from '@material-ui/core';

// Icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// Helpers and Actions
import { updateFleet, deleteFleet } from 'fleet/fleet';
import { hasErrorForField } from 'lib/form';

const propTypes = {
  /**
   * The fleet to render in the form.
   */
  fleet: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  /**
   * Function to call when the user has requested the form to close. The
   * function is responsible for removing the form component as needed. If the close
   * is due for the form successfully saving, then onClose will be called with a single
   * parameter that is the server response of the updated or created fleet.
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Optional callback function to call when the user has requested the fleet to be deleted.
   * The callback function must handle removing the form if needed, onClose will not be called.
   */
  onDelete: PropTypes.func,
  /**
   * @private
   * @see {@link server.withTransaction.withTransaction.createTransaction}
   */
  createTransaction: PropTypes.func.isRequired,
  /**
   * @private
   * withStyles
   */
  classes: PropTypes.object.isRequired,
};

const defaultProps = {
  onDelete: null,
};

class EditFleetSidebar extends React.Component {
  _isMounted = false;

  state = {
    errorBannerMessage: null,
    fieldErrors: null,
    showConfirmDelete: false,
  };

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  /**
   * Called to confirm the delete. If the user confirms then `onDelete` is called.
   */
  confirmDelete = () => {
    this.setState({
      showConfirmDelete: true,
    });
  };

  onConfirmClose = isConfirmed => {
    this.setState({
      showConfirmDelete: false,
    });

    if (isConfirmed) {
      this.onDelete();
    }
  };

  /**
   * Remove Fleet button onClick handler. Removes the fleet from the server
   * and calls props.onDelete.
   * If delete fails, shows banner message.
   */
  onDelete = () => {
    const deleteAction = deleteFleet(this.props.fleet.id);
    this.props.createTransaction(deleteAction).then(
      () => {
        if (this._isMounted) {
          this.setState({
            errorBannerMessage: null,
          });
        }

        if (this.props.onDelete) {
          this.props.onDelete();
        }
      },
      error => {
        let message = '';
        if (error.fieldErrors && hasErrorForField('fleet', error.fieldErrors)) {
          message = __('Fleet not found.');
        }
        if (error.statusText) {
          message = `${__('Response from server: ')} '${error.statusText}'`;
        }
        const errorBannerMessage = `${__('An error occured removing the fleet.')} ${message}`;

        if (this._isMounted) {
          this.setState({ errorBannerMessage });
        }
      },
    );
  };

  /**
   * When save button is clicked in the form, this callback recieves the fleet to be
   * saved and sends it to the server. If successful props.onSave is called. If failed,
   * fieldErrors are passed to the form as needed and a banner message can also be displayed
   * if errors beyond field errors exist.
   * If delete fails, shows banner message.
   *
   * @param {object} fleet The fleet object to be sent to the server.
   */
  onSave = fleet => {
    const saveAction = updateFleet(fleet);
    this.props.createTransaction(saveAction).then(
      updatedFleet => {
        if (this._isMounted) {
          this.setState({
            errorBannerMessage: null,
            fieldErrors: null,
          });
        }
        this.props.onClose(updatedFleet);
      },
      error => {
        const newState = {
          fieldErrors: null,
          errorBannerMessage: null,
        };

        if (error.fieldErrors) {
          newState.fieldErrors = error.fieldErrors;
        } else {
          let message = '';
          if (error.statusText) {
            message = `${__('Response from server: ')} '${error.statusText}'`;
          }
          newState.errorBannerMessage = `${__('An error occured saving the fleet.')} ${message}`;
        }

        if (this._isMounted) {
          this.setState(newState);
        }
      },
    );
  };

  render() {
    const { fleet, onClose, classes } = this.props;
    const { errorBannerMessage, fieldErrors, showConfirmDelete } = this.state;

    const actionButton = (
      <IconButton onClick={() => onClose()}>
        <ChevronRightIcon />
      </IconButton>
    );

    return (
      <FlexContainer column align="start stretch" className={classes.container}>
        <Header variant="h4" margin="normal" action={actionButton}>
          {`${__('Edit')}`}
        </Header>
        <FleetForm
          fleet={fleet}
          saveButtonText={__('Save Changes')}
          onSave={this.onSave}
          errorBannerMessage={errorBannerMessage}
          fieldErrors={fieldErrors}
        />
        <PrimaryButton className={classes.removeFleetButton} onClick={() => this.confirmDelete()}>
          {__('Remove Fleet')}
        </PrimaryButton>
        <ConfirmationDialog
          open={showConfirmDelete}
          onClose={this.onConfirmClose}
          message={__(
            'All vessels assigned to this fleet will be marked as unassigned and the fleet will be removed. Are you sure you want to remove the fleet?.',
          )}
          title={__('Confirm Fleet Removal')}
          okButtonText={__('Remove Fleet')}
        />
      </FlexContainer>
    );
  }
}

EditFleetSidebar.propTypes = propTypes;
EditFleetSidebar.defaultProps = defaultProps;

export default withStyles(theme => ({
  container: {
    height: '100%',
  },
  content: {
    minHeight: 'min-content',
  },
  removeFleetButton: {
    marginTop: 'auto',
    marginBottom: theme.spacing(1),
    minHeight: theme.spacing(4),
  },
}))(withTransaction(EditFleetSidebar));
