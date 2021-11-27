import { createAction, handleActions } from 'redux-actions';

const defaultState = {
  selection: null,
};

export const select = createAction('selection/select');
export const unselect = createAction('selection/unselect');

export const reducer = handleActions(
  {
    [select]: (state, action) => ({
      ...state,
      selection: action.payload,
    }),
    [unselect]: state => ({
      ...state,
      selection: null,
    }),
  },
  defaultState,
);

export const init = store => {
  store.addReducer('selection', reducer);
};
