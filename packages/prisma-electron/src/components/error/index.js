export * from './actions';

import reducer from './reducers';

export const init = app => {
  app.store.addReducer('error', reducer);
};
