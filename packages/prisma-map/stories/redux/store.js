/**
 * Provides a store implementation for the storybook instances to use.
 */
import createStorybookListener from 'storybook-addon-redux-listener';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { mergeMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { createLogger } from 'redux-logger';
import init from '../../src/redux';

function initStore() {
  const middlewares = [];

  // Storybook
  const reduxListener = createStorybookListener();
  middlewares.push(reduxListener);

  // redux-observable
  const epicMiddleware = createEpicMiddleware();
  middlewares.push(epicMiddleware);
  const epic$ = new BehaviorSubject(combineEpics());
  const rootEpic = (action$, s) => epic$.pipe(mergeMap(epic => epic(action$, s)));

  // redux logger
  const logger = createLogger();
  middlewares.push(logger);

  const reducers = {};
  const store = createStore(state => state, applyMiddleware(...middlewares));
  store.addReducer = (key, reducer) => {
    reducers[key] = reducer;
    store.replaceReducer(combineReducers(reducers));
  };

  store.addEpic = (epic) => {
    epic$.next(epic);
  };

  epicMiddleware.run(rootEpic);
  init(store);

  return store;
}

export default initStore;
