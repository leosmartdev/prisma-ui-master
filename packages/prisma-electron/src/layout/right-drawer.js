import { createAction, handleActions } from 'redux-actions';

// Action Types
const OPEN_RIGHT_DRAWER = 'rightDrawer/open';
const CLOSE_RIGHT_DRAWER = 'rightDrawer/close';
const OPEN_RIGHT_DETAILS_DRAWER = 'rightDrawer/details/open';
const CLOSE_RIGHT_DETAILS_DRAWER = 'rightDrawer/details/close';

/** *************************************
 * Action Creators
 ************************************* */
export const openRightDrawer = createAction(OPEN_RIGHT_DRAWER, opts => opts);
export const closeRightDrawer = createAction(CLOSE_RIGHT_DRAWER);
export const openRightDetailsDrawer = createAction(OPEN_RIGHT_DETAILS_DRAWER, opts => opts);
export const closeRightDetailsDrawer = createAction(CLOSE_RIGHT_DETAILS_DRAWER);

/** *************************************
 * Reducers
 ************************************* */
// Initial State
const defaultState = {
  open: false,
  routeOnClose: null,
  details: {
    open: false,
    routeOnClose: null,
  },
};

export const reducer = handleActions(
  {
    [openRightDrawer]: (state, action) => ({
      ...state,
      open: true,
      ...action.payload,
    }),
    [closeRightDrawer]: state => ({
      ...state,
      open: false,
      details: {
        ...defaultState.details,
        open: false,
      },
    }),
    [openRightDetailsDrawer]: (state, action) => ({
      ...state,
      details: {
        open: true,
        ...action.payload,
      },
    }),
    [closeRightDetailsDrawer]: state => ({
      ...state,
      details: {
        ...defaultState.details,
        open: false,
      },
    }),
  },
  defaultState,
);

export const init = store => {
  store.addReducer('rightDrawer', reducer);
};
