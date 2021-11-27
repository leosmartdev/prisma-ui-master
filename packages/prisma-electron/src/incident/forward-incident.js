/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 *  WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *
 * Thunks for forwarding incidents.
 */
// TODO move these imports to redux so we only declare operators once (per redux obsv docs)
import { switchMap, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  GET_MULTICAST_SUCCESS,
  getMulticastSuccess,
  listMulticastSuccess,
  updateMulticast,
  updateMulticastDestination,
} from 'multicast/multicast';
import { getSite } from 'site/site';

/*
 * Redux Observable Epics
 */

/**
 * This epic gets a multicast being inserted and if its an incident multicast (currently only
 * forward incident to site) gets the site information for that destination and injects it into the
 * multicast.
 *
 * TODO: Figure out how to unit test epics.
 */
export function getMulticastForIncidentEpic(action$, store) {
  return action$.ofType(GET_MULTICAST_SUCCESS).pipe(
    // Filters out all multicasts that are incident forward multicasts
    filter(action => {
      if (action.payload.destinations.length === 1) {
        if (action.payload.destinations[0].type === 'prisma.tms.moc.Site') {
          return true;
        }
      }
      return false;
    }),
    switchMap(action => {
      const multicast = action.payload;
      const siteId = multicast.destinations[0].id;
      /* eslint-disable implicit-arrow-linebreak, function-paren-newline */
      store.dispatch(getSite(siteId)).then(site =>
        store.dispatch(
          updateMulticastDestination(
            multicast,
            {
              ...multicast.destination,
              ...site,
            },
            0,
          ),
        ),
      );
      /* eslint-enable implicit-arrow-linebreak, function-paren-newline */

      // Add the multicast to the store while we wait for the site to come back.
      // When we get the site, it will update again and dispatch.
      return Observable.of(updateMulticast(multicast));
    }),
  );
}

/**
 * Will start a multicast to send the incident to the provided destination site.
 *
 * The function will build out the multicast object for you, and return a promise that when resolved
 * will contain the multicast object. On failure, the error from the server will be returned with
 * the reason.
 *
 * If successful, the multicast will be sent to the redux store
 * `state = { multicasts: { multicastId: multicast }}` so you can access the multicast updates
 * by grabbing the multicast from the store. As transmissions come over the websocket with updates,
 * they will be placed on that multicast so it will always be up to date.
 *
 * @param {string} incidentId ID of the incident to forward.
 * @param {string} siteId ID of the destination site
 * @param {object} opts Any options to send to the server call.
 */
export const forwardIncidentToSite = (incidentId, siteId, opts = {}) => async (
  dispatch,
  getState,
) => {
  const { server } = getState();
  const multicastRequest = {
    payload: {
      '@type': 'prisma.tms.moc.Incident',
      id: incidentId,
    },
  };

  try {
    const multicast = await server.post(
      `/multicast/site/${siteId}`,
      multicastRequest,
      opts.params,
      opts,
    );

    dispatch(getMulticastSuccess(multicast));

    return multicast;
  } catch (error) {
    throw error;
  }
};

export const getMulticastsForIncident = (incidentId, opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  try {
    const multicasts = await server.get(`/multicast/incident/${incidentId}`, opts.params, opts);
    dispatch(listMulticastSuccess(multicasts));
    return multicasts;
  } catch (error) {
    throw error;
  }
};

/**
 * Added epics and reducers to store.
 * @param {object} store The custom prisma redux store object.
 */
export function init(store) {
  store.addEpic(getMulticastForIncidentEpic);
}

export default getMulticastForIncidentEpic;
