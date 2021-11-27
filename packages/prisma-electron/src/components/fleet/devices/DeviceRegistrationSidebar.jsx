/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * Sidebar for registering a device.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import ErrorBanner from 'components/error/ErrorBanner';
import RegisterDeviceForm from 'components/fleet/devices/RegisterDeviceForm';
import Header from 'components/Header';
import FlexContainer from 'components/FlexContainer';

import {
  IconButton,
} from '@material-ui/core';

// Icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// Helpers and Actions
import { registerDevice } from 'fleet/device';

const propTypes = {
  /**
   * Vessel the device is being added to.
   */
  vessel: PropTypes.object.isRequired,
  /**
   * Function to call when the user has requested the form to close. The
   * function is responsible for removing the form component as needed. If the close
   * is due for the form successfully saving, then onClose will be called with a single
   * parameter that is the server response of the created device.
   */
  onClose: PropTypes.func.isRequired,
  /**
   * @private
   * @see {@link server.withTransaction.withTransaction.createTransaction}
   */
  createTransaction: PropTypes.func.isRequired,
};

class DeviceRegistrationSidebar extends React.Component {
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

  onSave = async device => {
    try {
      const createAction = registerDevice(this.props.vessel.id, device);
      const newDevice = await this.props.createTransaction(createAction);
      if (this._isMounted) {
        this.setState({
          errorBannerMessage: null,
          fieldErrors: null,
        });
      }
      return newDevice;
    } catch (error) {
      const newState = {
        fieldErrors: null,
        errorBannerMessage: null,
      };

      if (error.fieldErrors) {
        newState.fieldErrors = error.fieldErrors;
      } else {
        let message = '';

        switch (error.status) {
          case 404: {
            message = __(
              'Could not register device with the selected Vessel. The vessel could not be found.',
            );
            break;
          }
          case 500: {
            message = __(
              'Unable to register device. An error occured on the server, please try again later or contact your system administrator.',
            );
            break;
          }
          default: {
            if (error.statusText) {
              message = __(
                'Unable to register device. An unknown error occured, please try again later or contact your system administrator.',
              );
            }
          }
        }

        newState.errorBannerMessage = message;
      }

      if (this._isMounted) {
        this.setState(newState);
      }
      throw newState;
    }
  };

  render() {
    const { onClose } = this.props;
    const { errorBannerMessage, fieldErrors } = this.state;
    const actionButton = (
      <IconButton onClick={() => onClose()}>
        <ChevronRightIcon />
      </IconButton>
    );

    return (
      <FlexContainer column align="start stretch">
        <Header variant="h4" margin="normal" action={actionButton}>
          {__('Register Device')}
        </Header>
        <ErrorBanner message={errorBannerMessage} />
        <RegisterDeviceForm
          saveButtonText={__('Register Device')}
          onSave={this.onSave}
          onClose={this.props.onClose}
          fieldErrors={fieldErrors}
        />
      </FlexContainer>
    );
  }
}

DeviceRegistrationSidebar.propTypes = propTypes;

export default withTransaction(DeviceRegistrationSidebar);
