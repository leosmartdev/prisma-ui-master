/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */
import { __ } from 'lib/i18n';

/**
 * Changes the device type string into a more human readable string for display.
 * TODO This function should be removed and replaced with a call to get device metadata.
 * Device meta data should include image URLs, display text, and properties on the device.
 *
 * @param {string} type The device.type string
 * @return {string} A more human readable version of that string. Eg. omnicom-vms => Omnicom VMS
 */
export function getDeviceTypeDisplayString(type) {
  switch (type) {
    case 'OmnicomSolar':
      return __('OmniCom Solar');
    case 'OmnicomVMS':
      return __('OmniCom VMS');
    default:
      return type.toUpperCase();
  }
}

/**
 * getDeviceImagePathByType is used to get image path for a type of a device
 * It is like an abstraction to avoid raw strings
 * @param type - the type of a device
 * @param suffix - a constant to add specific name before an extension
 */
export function getDeviceImagePathByType(type, suffix = '') {
  const resources = 'resources/productImages/';
  switch (type) {
    case 'OmnicomSolar':
      return `${resources}/omnicom-solar${suffix}.jpg`;
    case 'OmnicomVMS':
      return `${resources}/omnicom-solar${suffix}.jpg`;
    default:
      return `${resources}/${type}${suffix}.jpg`;
  }
}

/**
 * Changes the network type or providerId string into a more human readable string for display.
 * TODO This function should be removed and replaced with a call to get device metadata.
 * Device meta data should include image URLs, display text, and properties on the device.
 *
 * Depending on the type of network, the provider ID may be returned. EG. for some devices,
 * cellphones and satellites, the type is less useful than the provider ID (eg cellular-voice
 * versus Verizon),
 * so the provider is returned.
 *
 * @param {object} network The network object
 * @return {string} A more human readable version of the network. Will return a processed
 * network.type or network.providerId.
 */
export function getNetworkTypeDisplayString(network) {
  let networkType = network.providerId ? network.providerId : network.type;
  switch (network.type) {
    case 'radio': {
      networkType = __('IMEI');
      break;
    }
  }

  return networkType;
}
