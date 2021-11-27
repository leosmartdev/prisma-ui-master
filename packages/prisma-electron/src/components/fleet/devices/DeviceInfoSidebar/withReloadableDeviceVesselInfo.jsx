/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * HOC provides information for a vessel and the device of the vessel by id's if information about
 * them was missed
 */
import React from 'react';
import PropTypes from 'prop-types';
import withCreateTransaction from 'server/withTransaction';

// Components
import ErrorBanner from 'components/error/ErrorBanner';

// Helper & Actions
import { getVessel } from 'fleet/vessel';

export default function withReloadableDeviceVesselInfo(Component) {
  class Wrapper extends React.Component {
    static propTypes = {
      /** vessel contains information about the required vessel */
      vessel: PropTypes.object,
      /** vessel contains information about the required device */
      device: PropTypes.object,
      /** vesselId contains id to get info about the vessel if it is needed */
      vesselId: PropTypes.string.isRequired,
      /** deviceId contains id to get info about the device if it is needed */
      deviceId: PropTypes.string.isRequired,
      /** withTransaction to make requests to the server to get info about vessels */
      createTransaction: PropTypes.func.isRequired,
    };

    static defaultProps = {
      vessel: null,
      device: null,
    };

    _isMounted = false;

    state = {
      vessel: this.props.vessel,
      device: this.props.device,
      error: '',
    };

    componentDidMount() {
      this._isMounted = true;
      this.getInfo();
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    async getInfo() {
      if (this.state.device && this.state.vessel) {
        return;
      }
      try {
        const vessel = await this.props.createTransaction(getVessel(this.props.vesselId));
        if (!vessel.devices) {
          return;
        }
        for (const device of vessel.devices) {
          if (device.id === this.props.deviceId) {
            if (this._isMounted) {
              this.setState({
                vessel,
                device,
              });
            }
            return;
          }
        }
      } catch (error) {
        if (this._isMounted) {
          this.setState({
            error: `An error occurred getting vessel results. ${error.statusText || ''}`,
          });
        }
      }
    }

    render() {
      if (this.state.device && this.state.vessel) {
        return <Component {...this.props} vessel={this.state.vessel} device={this.state.device} />;
      }
      if (this.state.error) {
        return <ErrorBanner message={this.state.error} />;
      }
      return null;
    }
  }

  return withCreateTransaction(Wrapper);
}
