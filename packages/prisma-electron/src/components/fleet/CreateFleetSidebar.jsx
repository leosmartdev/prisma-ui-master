import React from 'react';
import PropTypes from 'prop-types';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import FleetForm from 'components/fleet/form/FleetForm';
import Header from 'components/Header';
import FlexContainer from 'components/FlexContainer';

import {
  IconButton,
} from '@material-ui/core';

// Icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// Helpers and Actions
import { createFleet } from 'fleet/fleet';

const propTypes = {
  /**
   * Function to call when the user has requested the form to close. The
   * function is responsible for removing the form component as needed. If the close
   * is due for the form successfully saving, then onClose will be called with a single
   * parameter that is the server response of the created fleet.
   */
  onClose: PropTypes.func.isRequired,
  /**
   * @private
   * @see {@link server.withTransaction.withTransaction.createTransaction}
   */
  createTransaction: PropTypes.func.isRequired,
};

class CreateFleetSidebar extends React.Component {
  _isMounted = false;

  state = {
    errorBannerMessage: null,
    fieldErrors: null,
  };

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  onSave = fleet => {
    const createAction = createFleet(fleet);
    this.props.createTransaction(createAction).then(
      newFleet => {
        if (this._isMounted) {
          this.setState({
            errorBannerMessage: null,
            fieldErrors: null,
          });
        }
        this.props.onClose(newFleet);
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
          newState.errorBannerMessage = `${__('An error occured creating the fleet.')} ${message}`;
        }

        if (this._isMounted) {
          this.setState(newState);
        }
      },
    );
  };

  render() {
    const { onClose } = this.props;
    const { errorBannerMessage, fieldErrors } = this.state;

    const iconAction = (
      <IconButton onClick={() => onClose()}>
        <ChevronRightIcon />
      </IconButton>
    );

    return (
      <FlexContainer column align="start stretch">
        <Header variant="h4" margin="normal" action={iconAction}>
          {__('Create Fleet')}
        </Header>
        <FleetForm
          saveButtonText={__('Create Fleet')}
          onSave={this.onSave}
          errorBannerMessage={errorBannerMessage}
          fieldErrors={fieldErrors}
        />
      </FlexContainer>
    );
  }
}

CreateFleetSidebar.propTypes = propTypes;

export default withTransaction(CreateFleetSidebar);
