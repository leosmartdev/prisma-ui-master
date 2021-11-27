/** *************************************
 * Thunks
 ************************************* */

const searchThunk = (collection, query, limit, additionalFields) => (dispatch, getState) => {
  const server = getState().server;
  const params = {};

  if (query) {
    params.query = query;
  }
  if (limit) {
    params.limit = limit;
  }
  if (!additionalFields) {
    return server.get(`/search/tables/${collection}`, params);
  }
  return server.post(`/search/tables/${collection}`, additionalFields, params);
};

const searchRegistryThunk = (query, limit) => (dispatch, getState) => {
  if (!query) return Promise.resolve([]);
  const server = getState().server;
  const params = {
    query,
  };

  if (limit) {
    params.limit = limit;
  }

  return server.get('/search/registry', params);
};


/** *************************************
 * Action Creators
 ************************************* */
export const search = searchThunk;
export const searchRegistry = searchRegistryThunk;
