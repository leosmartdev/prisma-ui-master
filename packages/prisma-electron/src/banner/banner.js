import { createAction, handleActions } from 'redux-actions';

const defaultState = {
  open: false,
  message: '',
};

export const showSnackBanner = createAction('banner/showSnackBanner');
export const hideSnackBanner = createAction('banner/hideSnackBanner');

const reducer = handleActions({
  [showSnackBanner]: (state, action) => ({
    ...state,
    open: true,
    message: action.payload,
  }),
  [hideSnackBanner]: state => ({
    ...state,
    open: false,
    message: '',
  }),
}, defaultState);

export function init(store) {
  store.addReducer('banner', reducer);
}
