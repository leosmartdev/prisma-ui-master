/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *
 * Functions for communicating specifically with OmniCom devices.
 *
 */
import { getMulticastSuccess } from 'multicast/multicast';

export function hasSpecificConfiguration(device) {
  let specific = false;
  if (device && device.configuration) {
    specific = !(
      device.configuration.configuration === null ||
      typeof device.configuration.configuration === 'undefined'
    );
  }
  return specific;
}

/**
 * Returns true if the multicast is an OmniCom positionReportingInterval update transmission.
 * @param {object} multicast Multicast object to inspect.
 * @return {bool} True if the multicast is setting positionReportingInterval. False otherwise.
 */
export function isMulticastPositionIntervalChange(multicast) {
  return (
    multicast.payload['@type'] === 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration' &&
    multicast.payload.configuration &&
    (`${multicast.payload.configuration.action}` === 'UnitIntervalChange' ||
      multicast.payload.configuration.action === 1)
  );
}

/**
 * Returns true if the multicast is an OmniCom RequestGlobalParameters transmission.
 * @param {object} multicast Multicast object to inspect.
 * @return {bool} True if the multicast is setting positionReportingInterval. False otherwise.
 */
export function isMulticastRequestGlobalParameters(multicast) {
  return (
    multicast.payload['@type'] === 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration' &&
    multicast.payload.configuration &&
    (`${multicast.payload.configuration.action}` === 'RequestGlobalParameters' ||
      multicast.payload.configuration.action === 2)
  );
}

/**
 * Returns true if the multicast is an OmniCom RequestGlobalParameters transmission.
 * @param {object} multicast Multicast object to inspect.
 * @return {bool} True if the multicast is setting positionReportingInterval. False otherwise.
 */
export function isLastPositionReport(multicast) {
  return (
    multicast.payload['@type'] === 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration' &&
    multicast.payload.configuration &&
    (`${multicast.payload.configuration.action}` === 'RequestNewPositionAquisition' ||
      multicast.payload.configuration.action === 6)
  );
}

/**
 * Returns a device from an array of devices that has an IMEI
 * @param devices an array of devices
 * @param imei network.subscriberId
 * @returns device if found, otherwise null
 */
export function getDeviceByImei(devices, imei) {
  if (!Array.isArray(devices) || devices.length === 0) {
    return null;
  }
  for (const device of devices) {
    for (const network of device.networks) {
      if (network.subscriberId === imei) {
        return device;
      }
    }
  }
  return null;
}

/**
 * Returns a device.id from an array of devices that has an IMEI
 * @param devices an array of devices
 * @param imei network.subscriberId
 * @returns device.id if found, otherwise null
 */
export function getDeviceIdByImei(devices, imei) {
  if (!Array.isArray(devices) || devices.length === 0) {
    return null;
  }
  for (const device of devices) {
    for (const network of device.networks) {
      if (network.subscriberId === imei) {
        return device.id;
      }
    }
  }
  return null;
}

/**
 * Sets the position reporting interval on the device by creating a multicast.
 *
 * @param {string} deviceId ID of the device to send the request to.
 * @param {int} interval The new positionReportingInterval value.
 * @returns Promise resolves with the multicast from the server, rejects
 * with error from the server.
 */
const setPositionReportingInterval = (deviceId, interval) => async (dispatch, getState) => {
  const { server } = getState();
  const request = {
    payload: {
      '@type': 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration',
      configuration: {
        '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
        positionReportingInterval: parseInt(interval, 10),
        action: 'UnitIntervalChange',
      },
    },
  };

  try {
    const multicast = await server.post(`/multicast/device/${deviceId}`, request);
    dispatch(getMulticastSuccess(multicast));
    return multicast;
  } catch (error) {
    throw error;
  }
};

const refreshOmniComConfiguration = deviceId => async (dispatch, getState) => {
  const { server } = getState();
  const request = {
    payload: {
      '@type': 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration',
      configuration: {
        '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
        action: 'RequestGlobalParameters',
      },
    },
  };

  try {
    const multicast = await server.post(`/multicast/device/${deviceId}`, request);
    dispatch(getMulticastSuccess(multicast));
    return multicast;
  } catch (error) {
    throw error;
  }
};

const requestLastPositionReport = deviceId => async (dispatch, getState) => {
  const { server } = getState();
  const request = {
    payload: {
      '@type': 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration',
      configuration: {
        '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
        action: 'RequestNewPositionAquisition',
      },
    },
  };

  try {
    const multicast = await server.post(`/multicast/device/${deviceId}`, request);
    dispatch(getMulticastSuccess(multicast));
    return multicast;
  } catch (error) {
    throw error;
  }
};

export { setPositionReportingInterval, requestLastPositionReport, refreshOmniComConfiguration };
