import { handleActions, createAction } from 'redux-actions';

import { upsert } from 'lib/list';

/** *************************************
 * Action Types
 ************************************* */
const UPDATE_VESSEL = 'Vessel/UPDATE';

/** *************************************
 * Thunks
 ************************************* */

const getVessel = id => async (dispatch, getState) => {
  const { server } = getState();
  const url = `/vessel/${id}`;
  try {
    const vessel = await server.get(url);
    return vessel;
  } catch (error) {
    throw error;
  }
};

/**
 * Gets all vessels from the server.
 * @param {object} opts - contains different options
 * @param {boolean} opts.withFleet - is used to return data with fleet information
 * @returns Promise resolves with the data from the server, rejects
 * with error from the server.
 */
const getVessels = (opts = { withFleet: true }) => async (dispatch, getState) => {
  const { server } = getState();
  const url = opts.withFleet ? '/vessel/fleet' : '/vessel/';
  try {
    const vessels = await server.get(url, opts.params, opts);
    return vessels;
  } catch (error) {
    throw error;
  }
};

/**
 * Gets a vessel by IMEI from the server.
 * @param imei to search for
 * @param {object} opts - contains different options
 * @param {boolean} opts.withFleet - is used to return data with fleet information
 * @returns Promise resolves with the data from the server, rejects
 * with error from the server.
 */
const getVesselByImei = (imei, opts = { withFleet: true }) => async (dispatch, getState) => {
  const { server } = getState();
  const url = opts.withFleet ? '/vessel/fleet' : '/vessel/';
  if (opts.params == null) {
    opts.params = {};
  }
  opts.params['devices.networks.subscriberId'] = imei;
  try {
    const vessel = await server.get(url, opts.params, opts);
    return vessel;
  } catch (error) {
    throw error;
  }
};

/**
 * Searchs vessels with the provided query GET param.
 *
 * @returns Promise resolves with the data from the server, rejects
 * with error from the server.
 */
const searchVessels = (query, opts) => (dispatch, getState) => {
  const { server } = getState();

  return new Promise((resolve, reject) => {
    const params = {};
    if (query) {
      params.query = query;
    }
    if (opts && opts.limit) {
      params.limit = opts.limit;
    }
    server.get('/search/vessel', params, opts).then(
      response => {
        resolve(response);
      },
      error => {
        reject(error);
      },
    );
  });
};

/**
 * Updates a vessel. Vessel object must contain ID.
 *
 * @returns Promise resolves with the updated vessel from the server, rejects
 * with error from the server.
 */
const updateVessel = (vessel, opts) => (dispatch, getState) => {
  const { server } = getState();

  return new Promise((resolve, reject) => {
    server.put(`/vessel/${vessel.id}`, vessel, {}, opts).then(
      response => {
        resolve(response);
      },
      error => {
        reject(error);
      },
    );
  });
};

/**
 * Creates a vessel.
 *
 * @returns Promise resolves with the created vessel from the server, rejects
 * with error from the server.
 */
const createVessel = (vessel = {}, opts) => (dispatch, getState) => {
  const { server } = getState();

  return new Promise((resolve, reject) => {
    server.post('/vessel', vessel, {}, opts).then(
      response => {
        resolve(response);
      },
      error => {
        reject(error);
      },
    );
  });
};

/* **************************************
 * Action Creators
 ************************************* */
export const actionUpdateVessel = createAction(UPDATE_VESSEL);

/** *************************************
 * Reducers
 ************************************* */
// Initial State
const defaultState = {
  vessels: [],
};

const reducer = handleActions(
  {
    [actionUpdateVessel]: (state, action) => ({
      ...state,
      vessels: upsert(state.vessels, action.payload),
    }),
  },
  defaultState,
);

/* **************************************
 * Initialization
 ************************************** */

const init = store => {
  store.addReducer('vessel', reducer);
  // TODO Here we should add callback registration to handle
  // actions dispatched from websockets.
};

export { getVessels, getVessel, getVesselByImei, updateVessel, createVessel, searchVessels, init };
export default reducer;
