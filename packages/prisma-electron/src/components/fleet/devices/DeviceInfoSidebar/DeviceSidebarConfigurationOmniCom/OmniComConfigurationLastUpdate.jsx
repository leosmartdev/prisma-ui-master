/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *  Displays last update time for a device configuration in a list item.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import moment from 'moment';

// Components
import { withOmniComDevice } from 'device';

import ErrorBanner from 'components/error/ErrorBanner';

import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListSubheader,
  IconButton,
  CircularProgress,
} from "@material-ui/core";

// Icons
import RefreshIcon from '@material-ui/icons/Refresh';

OmniComConfigurationLastUpdate.propTypes = {
  /**
   * The Device object.
   * Required to have `configuration` on the device at this point.
   */
  device: PropTypes.shape({
    configuration: PropTypes.shape({
      configuration: PropTypes.shape({
        '@type': PropTypes.string,
      }),
    }),
  }),
  // withOmniComDevice
  refreshOmniComConfiguration: PropTypes.func,
  refreshOmniComConfigurationIsLoading: PropTypes.bool,
  refreshOmniComConfigurationErrorMessage: PropTypes.string,
};

OmniComConfigurationLastUpdate.defaultProps = {
  device: {
    configuration: {
      configuration: {
        '@type': '',
      },
    },
  },
  refreshOmniComConfiguration: null,
  refreshOmniComConfigurationIsLoading: false,
  refreshOmniComConfigurationErrorMessage: null,
};

function OmniComConfigurationLastUpdate({
  device,
  refreshOmniComConfiguration,
  refreshOmniComConfigurationIsLoading,
  refreshOmniComConfigurationErrorMessage,
}) {
  const { configuration } = device;
  if (!{}.hasOwnProperty.call(configuration, 'lastUpdate') || configuration.lastUpdate === '') {
    return null;
  }
  const lastUpdateTime = moment(configuration.lastUpdate).fromNow();
  return (
    <React.Fragment>
      <ListSubheader>
        <ErrorBanner message={refreshOmniComConfigurationErrorMessage} compact />
      </ListSubheader>
      <ListItem>
        <ListItemText primary={__('Configuration Last Received')} secondary={lastUpdateTime} />
        {refreshOmniComConfiguration && (
          <ListItemSecondaryAction>
            {refreshOmniComConfigurationIsLoading ? (
              <IconButton edge="end">
                <CircularProgress
                  variant="indeterminate"
                  size={32}
                  style={{ position: 'absolute' }}
                />
              </IconButton>
            ) : (
              <IconButton edge="end" onClick={refreshOmniComConfiguration}>
                <RefreshIcon />
              </IconButton>
            )}
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </React.Fragment>
  );
}

export default withOmniComDevice(OmniComConfigurationLastUpdate);
