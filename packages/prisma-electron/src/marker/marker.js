import { createAction, handleActions } from 'redux-actions';

const initialState = {
  enabled: false,
  latitude: "0",
  longitude: "0",
  curMarkerGeoJSON: null,
  listMarkers: [],
};

export const handleMarkerMessage = marker => dispatch => {
  dispatch(add(marker));
}

const listMarkerImagesThunk = () => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    server.get('/marker/image').then(
      response => {
        resolve(response);
      },
      error => {
        reject(error);
      }
    );
  });
};

const createMarkerImageThunk = metadata => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    server.post('/marker/image', metadata).then(
      response => {
        resolve(response);
      },
      error => {
        reject(error);
      },
    );
  });
};

const createMarkerThunk = req => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    server.post('/marker', req).then(
      response => {
        resolve(response);
      },
      error => {
        reject(error);
      },
    );
  });
};

const getMarkerThunk = id => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    server.get(`/marker/${id}`).then(
      response => {
        resolve(response);
      },
      error => {
        reject(error);
      }
    );
  });
};

const updateMarkerThunk = (id, req) => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    server.put(`/marker/${id}`, req).then(
      response => {
        resolve(response);
      },
      error => {
        reject(error);
      }
    );
  });
};

const deleteMarkerThunk = id => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    server.delete(`/marker/${id}`).then(
      response => {
        dispatch(hide(id));
        dispatch(del(id));
        resolve(response);
      },
      error => {
        reject(error);
      }
    );
  });
};

export const listMarkerImages = listMarkerImagesThunk;
export const createMarkerImage = createMarkerImageThunk;
export const createMarker = createMarkerThunk;
export const getMarker = getMarkerThunk;
export const updateMarker = updateMarkerThunk;
export const deleteMarker = deleteMarkerThunk;

export const enable = createAction('marker/enable');
export const disable = createAction('marker/disable');
export const show = createAction('marker/show');
export const hide = createAction('marker/hide');
export const setLatitude = createAction('marker/setLatitude');
export const setLongitude = createAction('marker/setLongitude');
export const setCoordinate = createAction('marker/setCoordinate');
export const initMarker = createAction('marker/initMarker');
export const add = createAction('marker/add');
export const del = createAction('marker/delete');

export const reducer = handleActions(
  {
    [enable]: (state, action) => ({
      ...state,
      enabled: true
    }),
    [disable]: (state, action) => ({
      ...state,
      enabled: false
    }),
    [show]: (state, action) => {
      let id = action.payload;
      let curListMarkers = state.listMarkers;

      let newListMarkers = curListMarkers.map(elem => {
        if (elem.properties.id === id) {
          return {
            ...elem,
            properties: {
              ...elem.properties,
              show: true,
            }
          };
        }

        return elem;
      });

      return {
        ...state,
        listMarkers: newListMarkers,
      };
    },
    [hide]: (state, action) => {
      let id = action.payload;
      let curListMarkers = Object.assign(state.listMarkers);

      let newListMarkers = curListMarkers.map(elem => {
        if (elem.properties.id === id) {
          return {
            ...elem,
            properties: {
              ...elem.properties,
              show: false,
            }
          };
        }

        return elem;
      });

      return {
        ...state,
        listMarkers: newListMarkers,
      };
    },
    [setLatitude]: (state, action) => ({
      ...state,
      latitude: action.payload
    }),
    [setLongitude]: (state, action) => ({
      ...state,
      longitude: action.payload
    }),
    [setCoordinate]: (state, action) => ({
      ...state,
      latitude: action.payload.latitude,
      longitude: action.payload.longitude,
    }),
    [initMarker]: (state, action) => ({
      ...state,
      curMarkerGeoJSON: null,
    }),
    [add]: (state, action) => {
      let curListMarkers = state.listMarkers;
      let geoJSON = action.payload;
      let isExist = false;
      let offset;
      let newListMarkers = curListMarkers;

      curListMarkers.forEach((elem, idx) => {
        if (elem.properties.id === geoJSON.properties.id) {
          isExist = true;
          offset = idx;
        }
      });

      if (isExist === false) {
        geoJSON.properties.show = true;
        newListMarkers = [...curListMarkers, geoJSON];
      } else {
        newListMarkers = curListMarkers.slice(0, offset).concat(geoJSON).concat(...curListMarkers.slice(offset + 1,));
      }

      return {
        ...state,
        curMarkerGeoJSON: geoJSON,
        listMarkers: newListMarkers,
      };
    },
    [del]: (state, action) => {
      let id = action.payload;
      let curListMarkers = state.listMarkers;
      let isExist = false;
      let offset;
      let newListMarkers = curListMarkers;

      curListMarkers.forEach((elem, idx) => {
        if (elem.properties.id === id) {
          isExist = true;
          offset = idx;
        }
      });

      if (isExist === true) {
        newListMarkers = curListMarkers.slice(0, offset).concat(...curListMarkers.slice(offset + 1,));
      }

      return {
        ...state,
        listMarkers: newListMarkers,
      }
    },
  },
  initialState
);

export const init = store => {
  store.addReducer('marker', reducer);
};
