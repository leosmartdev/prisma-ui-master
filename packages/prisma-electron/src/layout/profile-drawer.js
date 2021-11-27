import { createAction, handleActions } from 'redux-actions';

// Action Types
const OPEN_PROFILE_DRAWER = 'profileDrawer/open';
const CLOSE_PROFILE_DRAWER = 'profileDrawer/close';

/** *************************************
 * Action Creators
 ************************************* */
export const openProfileDrawer = createAction(OPEN_PROFILE_DRAWER, options => options);
export const closeProfileDrawer = createAction(CLOSE_PROFILE_DRAWER);

/** *************************************
 * Reducers
 ************************************* */
// Initial State
const defaultState = {
  open: false,
  routeOnClose: '/',
};

export const reducer = handleActions(
  {
    [openProfileDrawer]: (state, action) => {
      let routeOnClose = '/';
      if (action.payload.routeOnClose) {
        routeOnClose = action.payload.routeOnClose;
      }

      return {
        ...state,
        open: true,
        title: action.payload.title,
        routeOnClose,
        backButton: action.payload.backButton,
      };
    },
    [closeProfileDrawer]: state => ({
      ...state,
      open: false,
    }),
  },
  defaultState,
);

export const init = store => {
  store.addReducer('profileDrawer', reducer);
};
