import { createAction, handleActions } from 'redux-actions';

const defaultState = {
  socket: null,
  socketError: null,
  viewId: null,
  extent: [0, 0, 0, 0],
  center: null,
  zoom: null,
  interactionsEnabled: true,
  animationLoading: false,
  animationTarget: null,
  animationError: null,
  newWindow: false,
  histories: new Map(),
};

const animationThunk = (id, type) => (dispatch, getState) => {
  dispatch(animationLoading());
  const server = getState().server;
  server.get(`/${type}/${id}`).then(
    response => {
      if (id === response.id) {
        dispatch(doAnimation(response));
      }
    },
    error => {
      dispatch(animationFailure(error));
    },
  );
};

const historyRequestThunk = history => (dispatch, getState) => {
  const socket = getState().map.socket;
  const viewId = getState().map.viewId;
  const request = { viewId, history };
  socket.send(JSON.stringify(request));
  dispatch(updateHistories(history));
};

const clearAllHistoriesThunk = () => (dispatch, getState) => {
  const socket = getState().map.socket;
  const viewId = getState().map.viewId;
  const request = { viewId, history: { clearAll: true } };
  socket.send(JSON.stringify(request));
  dispatch(removeHistories());
};

export const openSocket = createAction('map/setSocket');
export const socketError = createAction('map/socketError');
export const closeSocket = createAction('map/clearSocket');
export const setViewId = createAction('map/setViewId');

export const setView = createAction('map/setView');
export const center = createAction('map/center');
export const centerSet = createAction('map/centerSet');
export const zoom = createAction('map/zoom');
export const zoomSet = createAction('map/zoomSet');
export const enableInteractions = createAction('map/enableInteractions');
export const animate = animationThunk;
export const clearAnimation = createAction('map/clearAnimation');
export const newWindow = createAction('map/newWindow');
export const clearNewWindow = createAction('map/clearNewWindow');
export const historyRequest = historyRequestThunk;
export const clearAllHistories = clearAllHistoriesThunk;

const updateHistories = createAction('map/updateHistories');
const removeHistories = createAction('map/removeHistories');
const animationLoading = createAction('map/animationLoading');
const doAnimation = createAction('map/animate');
const animationFailure = createAction('map/animationFailure');

export const reducer = handleActions(
  {
    [openSocket]: (state, action) => ({
      ...state,
      socket: action.payload,
      socketError: null,
    }),
    [closeSocket]: state => {
      if (state.socket) {
        state.socket.close();
      }
      return {
        ...state,
        socket: null,
        socketError: null,
      };
    },
    [socketError]: (state, action) => ({
      ...state,
      socketError: action.payload,
    }),
    [setViewId]: (state, action) => ({
      ...state,
      viewId: action.payload,
    }),
    [setView]: (state, action) => ({
      ...state,
      extent: action.payload.extent,
      center: action.payload.center,
      zoom: action.payload.zoom,
    }),
    [center]: (state, action) => ({
      ...state,
      center: action.payload,
    }),
    [centerSet]: state => ({
      ...state,
      center: null,
    }),
    [zoom]: (state, action) => ({
      ...state,
      zoom: action.payload,
    }),
    [zoomSet]: state => ({
      ...state,
      zoom: null,
    }),
    [enableInteractions]: (state, action) => ({
      ...state,
      interactionsEnabled: action.payload,
    }),
    [animationLoading]: state => ({
      ...state,
      animationLoading: true,
      animationTarget: null,
      animationError: null,
    }),
    [doAnimation]: (state, action) => ({
      ...state,
      animationLoading: false,
      animationTarget: action.payload,
      animationError: null,
    }),
    [animationFailure]: (state, action) => ({
      ...state,
      animationLoading: false,
      animationTarget: null,
      animationError: action.payload,
    }),
    [clearAnimation]: state => ({
      ...state,
      animationLoading: false,
      animationTarget: null,
      animationError: null,
    }),
    [newWindow]: state => ({
      ...state,
      newWindow: true,
    }),
    [clearNewWindow]: state => ({
      ...state,
      newWindow: false,
    }),
    [updateHistories]: (state, action) => {
      const newHistories = new Map(state.histories);
      if (action.payload.duration === 0) {
        newHistories.delete(action.payload.id);
      } else {
        newHistories.set(action.payload.id, action.payload.duration);
      }
      return {
        ...state,
        histories: newHistories,
      };
    },
    [removeHistories]: state => ({
      ...state,
      histories: new Map(),
    }),
  },
  defaultState,
);

export const init = store => {
  store.addReducer('map', reducer);
};
