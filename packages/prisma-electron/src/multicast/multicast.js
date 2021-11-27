/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */
import { createAction, handleActions } from 'redux-actions';

import { upsert } from 'lib/list';

/*
 * Functions
 */

/**
 * Filters a  multicast map returning only the multicasts that have the same destination ID as the
 * input id param.
 *
 * Any destinations that do not contain an ID property will be ignored.
 *
 * @param {object} multicastMap The map of multicasts (same as the map stored in the redux state as
 *                              state.multicasts)
 * @param {string} id ID to match destination.id to.
 * @return {array{Multicast}} The list of multicasts that match.
 */
export function filterMulticastsByDestinationId(multicastMap, id) {
  return Object.values(multicastMap).filter(multicast => {
    if (multicast.destinations) {
      const destinations = multicast.destinations.filter(destination => destination.id === id);
      return destinations.length > 0;
    }
    return false;
  });
}

/**
 * Returns true if the transmission is still pending and is not in the Success or Failed states.
 * @param {object} transmission Transmission object to check status
 */
export function isTransmissionPending(transmission) {
  switch (`${transmission.state}`) {
    case 'Success':
    case 'Failure':
      return false;
    default:
      return true;
  }
}

/**
 * Returns true if any transmissions on the multicast are still pending. Pending is not success or
 * not failed states on a transmission.
 * @param {object} multicast The multicast to check
 */
export function isMulticastPending(multicast) {
  const pendingTransmissions = multicast.transmissions.filter(isTransmissionPending);
  return pendingTransmissions.length > 0;
}

/**
 * Returns true if ANY transmissions on the multicast have failed. Retry and Partial are not
 * marked as failure.
 * @param {object} multicast The multicast to check
 * @return {boolean}
 */
export function didMulticastFail(multicast) {
  const failedTransmissions = multicast.transmissions.filter(t => `${t.state}` === 'Failure');
  return failedTransmissions.length > 0;
}

/*
 * Thunks
 */
export const listMulticastSuccess = multicasts => dispatch => {
  for (const multicast of multicasts) {
    dispatch(getMulticastSuccess(multicast));
  }
};

/*
 * Actions
 */
export const GET_MULTICAST_SUCCESS = 'Multicast/GET:success';
export const getMulticastSuccess = createAction(GET_MULTICAST_SUCCESS, multicast => multicast);
export const updateMulticast = createAction('Multicast/UPDATE', multicast => multicast);
export const updateMulticastDestination = createAction(
  'Multicast/Destination/UPDATE',
  (multicast, destination, index) => ({ multicast, destination, index }),
);
export const transmissionUpdate = createAction('Transmission/UPDATE', transmission => transmission);

/**
 * Initial state for `multicasts` property on the Redux state.
 * ```
 * reduxState = {
 *   ...state,
 *   multicasts: {},
 * }
 * ```
 *
 */
const initialState = {};

/**
 * Reducers for multicasts.
 */
const reducer = handleActions(
  {
    /**
     * UPDATE and GET SUCCESS are the same reducer, but the two are needed because in some cases
     * like incident forwarding, the epic will intercept the getMulticastSuccess and re-calling that
     * action would result in an infinite loop.
     */
    [getMulticastSuccess]: (state, action) => ({
      ...state,
      [action.payload.id]: { ...action.payload },
    }),
    [updateMulticast]: (state, action) => ({
      ...state,
      [action.payload.id]: { ...action.payload },
    }),
    [updateMulticastDestination]: (state, action) => {
      const mapDestination = (destination, index) => {
        if (index === action.payload.index) {
          return action.payload.destination;
        }
        return destination;
      };

      return {
        ...state,
        [action.payload.multicast.id]: {
          ...state[action.payload.multicast.id],
          destinations: state[action.payload.multicast.id].destinations.map(mapDestination),
        },
      };
    },
    [transmissionUpdate]: (state, action) => {
      const multicastId = action.payload.parentId;
      let multicast = { transmissions: [] };
      if (Object.prototype.hasOwnProperty.call(state, multicastId)) {
        multicast = state[multicastId];
      }

      return {
        ...state,
        [multicastId]: {
          ...multicast,
          transmissions: upsert(multicast.transmissions, action.payload),
        },
      };
    },
  },
  initialState,
);

/**
 * Adds the multicast reducers to the store under `multicasts` property.
 * @param {object} store Redux store object containing addReducers function.
 */
export function init(store) {
  store.addReducer('multicasts', reducer);
}

export default reducer;
