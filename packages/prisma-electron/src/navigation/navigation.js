import { createAction, handleActions } from 'redux-actions';

// Action Types
const toggleNav = 'navigationBar/toggleExpanded';

/** *************************************
 * Action Creators
 ************************************* */
export const toggleNavigationBarExpanded = createAction(toggleNav, expanded => expanded);

/** *************************************
 * Reducers
 ************************************* */
// Initial State
const defaultState = {
  expanded: false,
};

// Map of Action Types to the reducer functions that will handle that type.
const reducerMap = {
  [toggleNav]: (state, action) => {
    let expanded = !state.expanded;
    if (action.payload !== undefined) {
      expanded = action.payload;
    }

    return {
      ...state,
      expanded,
    };
  },
};

export const reducer = handleActions(reducerMap, defaultState);

export const init = store => {
  store.addReducer('navigationBar', reducer);
};
