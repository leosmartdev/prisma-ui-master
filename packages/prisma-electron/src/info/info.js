import { createAction, handleActions } from 'redux-actions';

const defaultState = {
  id: null,
  type: null,
  info: null,
  loading: false,
  error: null,
};

const getInfoThunk = (id, type) => (dispatch, getState) => {
  dispatch(loading({ id, type }));
  const server = getState().server;
  return new Promise((resolve, reject) => {
    // HACK: The history endpoint was changed and no longer works as before. 
    // Redirect to another endpoint that has the old behavior. 
    if (type === 'history') {
      type = 'history-database';
    }
    server.get(`/${type}/${id}`).then(
      response => {
        if (id === response.id) {
          dispatch(success(response));
          resolve(response);
          // uncomment only to log the response for debugging
          // console.log(response);
        }
        reject(response);
      },
      error => {
        dispatch(failure(error));
        reject(error);
      },
    );
  });
};

export const get = getInfoThunk;
export const loading = createAction('info/loading');
export const success = createAction('info/success');
export const failure = createAction('info/failure');
export const clear = createAction('info/clear');

export const reducer = handleActions(
  {
    [loading]: (state, action) => ({
      ...state,
      id: action.payload.id,
      type: action.payload.type,
      loading: true,
    }),
    [success]: (state, action) => ({
      ...state,
      info: action.payload,
      loading: false,
      error: null,
    }),
    [failure]: (state, action) => ({
      ...state,
      info: null,
      loading: false,
      error: action.payload,
    }),
    [clear]: state => ({
      ...state,
      id: null,
      info: null,
      loading: false,
      error: null,
    }),
  },
  defaultState,
);

export const init = store => {
  store.addReducer('info', reducer);
};
