import { createAction, handleActions } from 'redux-actions';

// Action Types
const OPEN_LEFT_DRAWER = 'leftDrawer/open';
const CLOSE_LEFT_DRAWER = 'leftDrawer/close';

/** *************************************
 * Action Creators
 ************************************* */
export const openLeftDrawer = createAction(OPEN_LEFT_DRAWER, opts => opts);
export const closeLeftDrawer = createAction(CLOSE_LEFT_DRAWER);

/** *************************************
 * Reducers
 ************************************* */
// Initial State
const defaultState = {
  open: false,
  routeOnClose: null,
  goBackOnClose: false,
};

export const reducer = handleActions(
  {
    [openLeftDrawer]: (state, action) => ({
      ...state,
      open: true,
      ...action.payload,
    }),
    [closeLeftDrawer]: state => ({
      ...state,
      open: false,
    }),
  },
  defaultState,
);

// Map of Action Types to the reducer functions that will handle that type.
/*
const reducerMap = {
    OPEN_LEFT_DRAWER: (state, action) => {
        console.info("Opening Drawer", state);
        return {
            ...state,
            open: true,
        };
    },
    CLOSE_LEFT_DRAWER: (state, action) => ({
        ...state,
        open: false,
    })
};
*/

// export const reducer = handleActions(reducerMap, defaultState);

export const init = store => {
  store.addReducer('leftDrawer', reducer);
};
