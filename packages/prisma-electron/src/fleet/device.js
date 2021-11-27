/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */

import { listMulticastSuccess } from 'multicast/multicast';

/**
 * Register a new Device with the system.
 *
 * @returns Promise resolves with the data from the server, rejects
 * with error from the server.
 */
const registerDevice = (vesselId, device, opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  return server.post(`/device/vessel/${vesselId}`, device, opts.params, opts);
};

/**
 * Gets a list of pending multicasts for the provided device.
 *
 * @param {string} deviceId ID of the device to get multicasts for.
 * @param {object} opts Object containing options.
 * @returns Promise resolves with the list of multicasts from the server, rejects with error from
 * the server.
 */
const getMulticastsForDevice = (deviceId, opts = {}) => async (dispatch, getState) => {
  const { server } = getState();

  try {
    const multicasts = await server.get(`/multicast/device/${deviceId}`, opts.params, opts);
    dispatch(listMulticastSuccess(multicasts));
    return multicasts;
  } catch (error) {
    throw error;
  }
};

export { registerDevice, getMulticastsForDevice };
