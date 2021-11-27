/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * HOC for handling device specific API calls for OmniCom Beacons.
 *
 * For now, this handles multicasts to the beacon for setting things like position reporting
 * interval and geofences.
 */
import React from 'react';
import PropTypes from 'prop-types';
import loglevel from 'loglevel';
import { connect } from 'react-redux';

import { __ } from 'lib/i18n';
import { withTransaction } from 'server/transaction';
import {
  setPositionReportingInterval,
  isMulticastPositionIntervalChange,
  requestLastPositionReport,
  refreshOmniComConfiguration,
  isMulticastRequestGlobalParameters,
  isLastPositionReport,
} from 'device/omnicom';
import { getMulticastsForDevice } from 'fleet/device';
import {
  filterMulticastsByDestinationId,
  isMulticastPending,
  didMulticastFail,
} from 'multicast/multicast';
import RequestError from 'server/RequestError';

const log = loglevel.getLogger('device');

/**
 * Computes and returns new state values when the device being handled changes.
 * @param {object} device The new device to be rendered
 * @return {object} The new `state` properties computed from the device or reset to default
 * values.
 */
function computeStateForNewDevice(device) {
  return {
    device,
    lastPositionReportIsLoading: false,
    lastPositionReportErrorMessage: null,
    positionReportingIntervalErrorMessage: null,
    positionReportingIntervalIsLoading: false,
    refreshOmniComConfigurationIsLoading: false,
    refreshOmniComConfigurationErrorMessage: null,
  };
}

/**
 * Computes new state properties when the multicasts change. This will filter the list of multicasts
 * to find the relevant device multicasts and updated loaders and error messages as needed.
 * @param {object} device The current device.
 * @param {object} multicastMap The map of multicasts from redux store.
 * @return {object} The new `state` properties computed
 */
function computeStateForNewMulticasts(prevState, device, multicastMap) {
  // Get all multicasts associated with this destination.
  const multicasts = filterMulticastsByDestinationId(multicastMap, device.id);
  if (multicasts.length === 0) {
    // If we have no multicasts, moved on.
    return {};
  }

  // Get all the ids that were pending before. If any of the multicasts that were pending are
  // now complete, we need to check the status to see if we need to display an error.
  const prevPending = prevState.pendingMulticasts.map(pending => pending.id);
  const reduced = multicasts.reduce(
    (obj, multicast) => {
      if (isMulticastPending(multicast)) {
        obj.pendingMulticasts.push(multicast);
        if (isMulticastPositionIntervalChange(multicast)) {
          obj.positionReportingIntervalIsLoading = true;
        }
        if (isMulticastRequestGlobalParameters(multicast)) {
          obj.refreshOmniComConfigurationIsLoading = true;
        }
        if (isLastPositionReport(multicast)) {
          obj.lastPositionReportIsLoading = true;
        }
        obj.positionReportingIntervalErrorMessage = '';
        obj.refreshOmniComConfigurationErrorMessage = '';
        obj.lastPositionReportErrorMessage = '';
      } else {
        if (prevPending.includes(multicast.id)) {
          if (didMulticastFail(multicast)) {
            log.error('Received Failed multicast', multicast);
            if (isMulticastPositionIntervalChange(multicast)) {
              obj.positionReportingIntervalErrorMessage = __(
                'An error occurred setting Position Reporting Interval. Please try again later.',
              );
            }
            if (isMulticastRequestGlobalParameters(multicast)) {
              obj.refreshOmniComConfigurationErrorMessage = __(
                'An error occurred retrieving device configuration. Please try again later.',
              );
            }
            if (isLastPositionReport(multicast)) {
              obj.lastPositionReportErrorMessage = __(
                'An error occurred requesting a new position. Please try again later.',
              );
            }
          }
        }
        obj.positionReportingIntervalIsLoading = false;
        obj.refreshOmniComConfigurationIsLoading = false;
        obj.lastPositionReportIsLoading = false;
        obj.completedMulticasts.push(multicast);
      }

      return obj;
    },
    { pendingMulticasts: [], completedMulticasts: [] },
  );

  return {
    ...prevState,
    multicastMap,
    ...reduced,
    positionReportingIntervalIsLoading: reduced.positionReportingIntervalIsLoading,
    refreshOmniComConfigurationIsLoading: reduced.refreshOmniComConfigurationIsLoading,
  };
}

/**
 * loading multicasts for device
 */
let loading = false;

/**
 * Provides OmniCom specific request callbacks and data to the component being wrapped.
 *
 * This includes the following functions and props:
 *  * For positionReportingInterval
 *    - `positionReportingIntervalIsLoading` {bool} When true, there is an outstanding request to
 *      set positionReportingInterval
 *    - `positionReportingIntervalErrorMessage` {string} Message to display in an <ErrorBanner />
 *      when a request to save the positionReportingInterval has failed. Can be manual cleared by
 *      calling clearPositionReportingIntervalErrorMessage()
 *    - `clearPositionReportingIntervalErrorMessage()` {function} Clears the error message and sets
 *       to null
 *    - `setPositionReportingInterval(interval: int)` {function} Sets the positionReportingInterval
 *       on the beacon to the new value. interval is in minutes only.
 *
 * The inner component MUST have a required device property. The device is required to make the
 * requests to the server to change values and to find outstanding requests on this device.
 *
 * @param {Component} WrappedComponent
 */
export default function withOmniComDevice(WrappedComponent) {
  class WithOmniComDevice extends React.Component {
    static propTypes = {
      /**
       * The full device object.
       * Any Component using this HOC must provide the device as an incoming prop and marked
       * as required.
       */
      device: PropTypes.object.isRequired,
      /** @private withTransaction */
      createTransaction: PropTypes.func.isRequired,
      /** @private mapStateToProps */
      multicastMap: PropTypes.object.isRequired,
    };

    state = {
      /**
       * The device being displayed.
       */
      device: this.props.device, // eslint-disable-line react/destructuring-assignment
      /**
       * List of all pending multicasts for this device.
       */
      pendingMulticasts: [],
      /**
       * List of all completed multicasts for this device.
       */
      completedMulticasts: [],
      /*
       * Position Reporting Interval
       */
      /** True when the device has an outstanding positionReportingInterval multicast request */
      positionReportingIntervalIsLoading: false,
      lastPositionReportIsLoading: false,
      /** Error banner message specifically for position reporting interval */
      positionReportingIntervalErrorMessage: null,
      refreshOmniComConfigurationIsLoading: false,
      refreshOmniComConfigurationErrorMessage: null,
    };

    static getDerivedStateFromProps(nextProps, prevState) {
      let nextState = {};
      let stateUpdated = false;

      // Log an error for invalid device required usage.
      if (!nextProps.device) {
        log.error(
          'ERROR: Any component using withOmniComDevice must required the device object as a property.',
        );
      }

      // The device has changed. We must re-render and clear errors and loaders.
      if (prevState.device !== nextProps.device) {
        stateUpdated = true;
        nextState = {
          ...nextState,
          ...computeStateForNewDevice(nextProps.device),
        };
      }

      // Did the multicast Map change?
      if (nextProps.multicastMap !== prevState.multicastMap) {
        stateUpdated = true;
        nextState = {
          ...nextState,
          ...computeStateForNewMulticasts(prevState, nextProps.device, nextProps.multicastMap),
        };
      }

      // Return state if it was updated, otherwise, return null so its not re-rendered
      return stateUpdated ? nextState : null;
    }

    componentDidMount() {
      this.getMulticastsForDevice();
    }

    componentDidUpdate(prevProps) {
      const { device } = this.props;
      // Get multicasts for device if we have a new device.
      if (prevProps.device !== device) {
        this.getMulticastsForDevice();
      }
    }

    /**
     * Calls the server to get all multicasts not-completed for the current device. The multicasts
     * are put into the redux store and injected into this component as `props.multicastMap`
     */
    getMulticastsForDevice = async () => {
      const { device } = this.state;
      const { createTransaction } = this.props;

      if (loading) {
        return;
      }
      loading = true;
      try {
        const action = getMulticastsForDevice(device.id);
        await createTransaction(action);
        loading = false;
      } catch (error) {
        loading = false;
      }
    };

    refreshOmniComConfiguration = async () => {
      const { device } = this.state;
      const { createTransaction } = this.props;

      this.setState({
        refreshOmniComConfigurationIsLoading: true,
        refreshOmniComConfigurationErrorMessage: null,
      });

      try {
        const action = refreshOmniComConfiguration(device.id);
        const multicast = await createTransaction(action);
        this.setState({
          // TODO: we shouldn't stop loading until the transmission is done
          refreshOmniComConfigurationIsLoading: false,
        });
        return multicast;
      } catch (error) {
        const messagePrefix = __('Failed to send request for configuration.');
        const requestError = RequestError.parseRequestErrorFromResponse(error, '', messagePrefix);
        this.setState({
          refreshOmniComConfigurationIsLoading: false,
          refreshOmniComConfigurationErrorMessage: requestError.message,
        });
        throw requestError;
      }
    };

    lastPositionReport = async () => {
      const { device } = this.state;
      const { createTransaction } = this.props;

      this.setState({
        lastPositionReportIsLoading: true,
        lastPositionReportErrorMessage: null,
      });

      try {
        const action = requestLastPositionReport(device.id);
        const multicast = await createTransaction(action);

        this.setState({
          // TODO: we shouldn't stop loading until the transmission is done
          lastPositionReportIsLoading: false,
        });

        return multicast;
      } catch (error) {
        const messagePrefix = __('Failed to send request for positional report.');
        const requestError = RequestError.parseRequestErrorFromResponse(error, '', messagePrefix);

        this.setState({
          lastPositionReportIsLoading: false,
          lastPositionReportErrorMessage: requestError.message,
        });

        throw requestError;
      }
    };

    /**
     * Sets the positionReportingInterval on the device by dispatching a new multicast request.
     * @param {int} newInterval Interval in minutes
     */
    setOmniComPositionReportingInterval = async newInterval => {
      const { device } = this.state;
      const { createTransaction } = this.props;

      this.setState({
        positionReportingIntervalIsLoading: true,
        positionReportingIntervalErrorMessage: null,
      });

      try {
        const action = setPositionReportingInterval(device.id, newInterval);
        const multicast = await createTransaction(action);

        this.setState({
          // TODO: we shouldn't stop loading until the transmission is done
          positionReportingIntervalIsLoading: false,
        });

        return multicast;
      } catch (error) {
        const messagePrefix = __('Failed to set reporting interval.');
        const requestError = RequestError.parseRequestErrorFromResponse(error, '', messagePrefix);

        this.setState({
          positionReportingIntervalIsLoading: false,
          positionReportingIntervalErrorMessage: requestError.message,
        });

        throw requestError;
      }
    };

    /**
     * Clears the reporting interval error banner on the sate.
     */
    clearReportingIntervalErrorBanner = () => {
      this.setState({ positionReportingIntervalErrorMessage: null });
    };

    render() {
      const { ...rest } = this.props;

      const {
        positionReportingIntervalIsLoading,
        lastPositionReportIsLoading,
        positionReportingIntervalErrorMessage,
        refreshOmniComConfigurationIsLoading,
        refreshOmniComConfigurationErrorMessage,
      } = this.state;

      return (
        <WrappedComponent
          lastPositionReportIsLoading={lastPositionReportIsLoading}
          positionReportingIntervalIsLoading={positionReportingIntervalIsLoading}
          positionReportingIntervalErrorMessage={positionReportingIntervalErrorMessage}
          setOmniComPositionReportingInterval={this.setOmniComPositionReportingInterval}
          clearOmniComPositionReportingIntervalErrorBanner={this.clearReportingIntervalErrorBanner}
          refreshOmniComConfigurationIsLoading={refreshOmniComConfigurationIsLoading}
          refreshOmniComConfigurationErrorMessage={refreshOmniComConfigurationErrorMessage}
          refreshOmniComConfiguration={this.refreshOmniComConfiguration}
          {...rest}
        />
      );
    }
  }

  const mapStateToProps = state => ({
    multicastMap: state.multicasts || {},
  });

  return withTransaction(connect(mapStateToProps)(WithOmniComDevice));
}
