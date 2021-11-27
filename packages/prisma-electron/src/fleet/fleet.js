import { handleActions } from 'redux-actions';
// createAction

// Action Types

/** *************************************
 * Thunks
 ************************************* */

/**
 * Gets all fleets from the server.
 *
 * @returns Promise resolves with the data from the server, rejects
 * with error from the server.
 */
const getFleets = (opts = {}) => (dispatch, getState) => {
  const { server } = getState();

  return new Promise((resolve, reject) => {
    server.get('/fleet', opts.params, opts).then(
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
 * Gets paginated fleets from the server.
 *
 * @returns Promise resolves with the data from the server, rejects
 * with error from the server.
 */
const getPaged = (path, opts = {}) => (dispatch, getState) => {
  const { server } = getState();
  return new Promise((resolve, reject) => {
    let url;
    if (opts.requestNext || opts.requestPrevious) {
      url = server.buildPaginationUrl(path, opts.requestNext || opts.requestPrevious);
    } else {
      url = server.buildHttpUrl(path, opts);
    }
    server.paginate(url).then(
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
 * Gets a single fleet from the server.
 *
 * @returns Promise resolves with the fleet from the server, rejects
 * with error from the server.
 */
const getFleet = (fleetId, opts) => (dispatch, getState) => {
  const { server } = getState();

  return new Promise((resolve, reject) => {
    server.get(`/fleet/${fleetId}`, {}, opts).then(
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
 * Creates a fleet on the server with the provided fleet information.
 *
 * @param {object} newFleet The fleet object to create.
 * @param {object} opts Options to be passed to the server. See server.post for details.
 * @returns Promise resolves with the new fleet from the server, rejects
 * with error from the server.
 */
const createFleet = (newFleet, opts) => (dispatch, getState) => {
  const { server } = getState();

  return new Promise((resolve, reject) => {
    server.post('/fleet', newFleet, {}, opts).then(
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
 * Updates the fleet on the server. Fleet request must contain an ID. If no id is provided, a 404
 * will be returned for id of `undefined` not found.
 *
 * @param {object} fleet The fleet object to update. Must have `id` property to build the correct
 *  URL.
 * @param {object} opts Options to be passed to the server. See server.put for details.
 * @returns Promise resolves with the updated fleet from the server, rejects
 * with error from the server.
 */
const updateFleet = (fleet, opts) => (dispatch, getState) => {
  const { server } = getState();

  return new Promise((resolve, reject) => {
    server.put(`/fleet/${fleet.id}`, fleet, {}, opts).then(
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
 * Deletes the fleet.
 *
 * @param {string} fleetId  The ID of the fleet to delete.
 * @param {object} opts Options to be passed to the server. See server.put for details.
 * @returns Promise resolves with the removed fleet object from the server, rejects
 * with error from the server.
 */
const deleteFleet = (fleetId, opts) => (dispatch, getState) => {
  const { server } = getState();

  return new Promise((resolve, reject) => {
    server.delete(`/fleet/${fleetId}`, {}, opts).then(
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
 * Searchs fleets with the provided query GET param.
 *
 * @returns Promise resolves with the data from the server, rejects
 * with error from the server.
 */
const searchFleets = (query, opts) => (dispatch, getState) => {
  const { server } = getState();

  return new Promise((resolve, reject) => {
    const params = {};
    if (query) {
      params.query = query;
    }
    if (opts && opts.limit) {
      params.limit = opts.limit;
    }
    server.get('/search/fleet', params, opts).then(
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

/** *************************************
 * Reducers
 ************************************* */
// Initial State
const defaultState = {};

const reducer = handleActions({}, defaultState);

/* **************************************
 * Initialization
 ************************************** */

const init = store => {
  store.addReducer('fleet', reducer);
  // TODO Here we should add callback registration to handle
  // actions dispatched from websockets.
};

export default reducer;

export { getFleet, getFleets, getPaged, createFleet, updateFleet, deleteFleet, searchFleets, init };
