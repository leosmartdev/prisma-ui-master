/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * # Initializes the redux store and all required middleware.
 *
 * ## Middleware
 *
 * Currently we are using 3 middlewares:
 *  - redux-thunk: Primarily for REST calls.
 *  - redux-observable: New middleware, expected to be used for multicast and websockets initially.
 *    may take over some or all of the REST calls depending.
 *  - logger: debug mode and with redux logger initialized, this will print out redux before/after
 *    log messages on every store update.
 *
 * ## Adding reducers and epics
 *
 * Every redux file throughout the app has an init() function if they need to add a reducer or an
 * epic to the store. The init functions are imported and called below. If you need to add a new
 * init function, import it and call it in the addReducers function below.
 *
 * Every init function takes a single parameter that is the store. The store has two custom
 * functions we have added, addEpic and addReducer. This will add an epic or a reducer to the redux
 * store.
 */
import * as redux from 'redux';
import thunk from 'redux-thunk';
import { mergeMap } from 'rxjs/operators';
import { handleActions } from 'redux-actions';
import { BehaviorSubject } from 'rxjs';
import { createEpicMiddleware, combineEpics } from 'redux-observable';

// Application Reducers/Epic Imports.
import { init as BannerInit } from 'banner/banner';
import { actionMap as configActionMap } from 'configuration';
import { configurationUpdated } from 'configuration';
import { init as DrawInit } from 'draw/draw';
import { init as FeaturesInit } from 'map/features';
import { init as IncidentInit } from 'incident/incident';
import { init as NoteInit } from 'note/note';
import { init as InfoInit } from 'info/info';
import { init as LeftDrawerInit } from 'layout/left-drawer';
import { init as ManualTrackInit } from 'manual-track/manual-track';
import { init as MapInit } from 'map/map';
import { init as MulticastInit } from 'multicast/multicast';
import { init as NavigationInit } from 'navigation/navigation';
import { init as NoticesInit } from 'notices/notices';
import { init as ProfileInit } from 'session/profile';
import { init as ProfileDrawerInit } from 'layout/profile-drawer';
import { init as RightDrawerInit } from 'layout/right-drawer';
import { init as RolesInit } from 'auth/roles';
import { init as SelectionInit } from 'selection/selection';
import { init as SessionInit } from 'session/session';
import { init as ThemeInit } from 'settings/theme';
import { init as TransactionsInit } from 'server/transaction';
import { init as TooltipInit } from 'tooltip/tooltip';
import { init as UserInit } from 'auth/user';
import { init as VesselInit } from 'fleet/vessel';
import { init as ZonesInit } from 'zones/zones';
import { init as FilterTracksInit } from "filter-tracks/filter-tracks";
import { init as MarkerInit } from "marker/marker";
import { init as IconInit } from "icon/icon";
import { init as RemoteSiteConfigInit } from "remotesite-config/remotesite-config";
import { init as MessageInit } from "message/message";
import { init as MapConfigInit } from "map/mapconfig";
// Add your custom init function above (they are in alphabetical order by reducer/epic name)

// create the epic middleware. Do this here so we can call run when needed after store init
const epicMiddleware = createEpicMiddleware();

// used in unit tests, used as rootReducer
const bootstrap = state => {
  if (!state) {
    return {};
  }
  return state;
};

function initializeMiddleware(middleware, config, server, loggers) {
  const middlewares = middleware || [];

  // redux-thunk - Must go before epics in array if we want them to play nice
  middlewares.push(thunk.withExtraArgument(server));
  // redux-observable
  middlewares.push(epicMiddleware);

  // Logger if we are in development mode, debug is on, and 'redux' is passed a logger
  if (process.env.NODE_ENV === 'development') {
    if (config.debug && loggers.includes('redux')) {
      // eslint-disable-next-line global-require
      const { logger } = require('redux-logger');
      middlewares.push(logger);
    }
  }

  return middlewares;
}

/**
 * Initializes the redux store and returns it. This function will set the intial state,
 * middleware, as well as call init() for all reducers and epics to be added.
 *
 * @param {object} initialState initial state for the store.
 * @param {array} middleware List of extra middleware to add to the redux store.
 * @param {object} config Application configuration. Will be added to the store as `config`
 * @param {object} server server/server.js instance. Will be added to the store as `server`
 * @param {array} loggers List of all loggers so we can determine if we need to init the redux
 *                        logger
 */
export default function initializeRedux(initialState, middleware, config, server, loggers) {
  // create Root epic
  const epic$ = new BehaviorSubject(combineEpics());
  const rootEpic = (action$, store) => epic$.pipe(mergeMap(epic => epic(action$, store)));

  const middlewares = initializeMiddleware(middleware, config, server, loggers);
  const reducers = { bootstrap };

  // Initialize the store
  const store = redux.createStore(
    bootstrap,
    initialState,
    redux.compose(redux.applyMiddleware(...middlewares)),
  );

  epicMiddleware.run(rootEpic);

  // Add the custom helper methods to the store for adding reducers and epics
  store.addReducer = (key, reducer) => {
    reducers[key] = reducer;
    store.replaceReducer(redux.combineReducers(reducers));
  };

  store.addEpic = epic => {
    epic$.next(epic);
  };

  // Add initial reducers for server and config so they are available on the store.
  store.addReducer('server', handleActions({}, server));
  store.addReducer('config', handleActions(configActionMap, config));

  // Call init which holds the manifest for every redux enabled file that has an init() function.
  // Add your custom init inside that function below.
  addReducers(store);

  // lastly, dispatch the config now that the reducers are added.
  store.dispatch(configurationUpdated(config));

  return store;
}

/**
 * Every redux file throughout the app has an init() function if they need to add a reducer or an
 * epic to the store. The init functions are imported and called below. If you need to add a new
 * init function, import it and call it in the addReducers function below.
 *
 * Every init function takes a single parameter that is the store. The store has two custom
 * functions we have added, addEpic and addReducer. This will add an epic or a reducer to the redux
 * store.
 *
 * Add your custom init functions below to add your own reducers and epics.
 *
 * ### Init Signature
 * ```
 * init(store: object) => void
 * ```
 *
 * ### Usage
 *
 * ```
 * export const init = (store) => {
 *  store.addReducer('<reducerNamespace>', reducer);
 *  store.addEpic(stream$);
 * };
 * ```
 *
 * @param {object} store The redux store. Normal redux store with the two custom added functions.
 */
function addReducers(store) {
  // Layout
  LeftDrawerInit(store);
  ProfileDrawerInit(store);
  RightDrawerInit(store);

  // Core Application Reducers
  ProfileInit(store);
  SessionInit(store);
  ThemeInit(store);
  TransactionsInit(store);

  // Feature Reducers
  DrawInit(store);
  ManualTrackInit(store);
  FeaturesInit(store);
  BannerInit(store);
  IncidentInit(store);
  NoteInit(store);
  InfoInit(store);
  MapInit(store);
  MulticastInit(store);
  NavigationInit(store);
  NoticesInit(store);
  RolesInit(store);
  SelectionInit(store);
  TooltipInit(store);
  UserInit(store);
  VesselInit(store);
  ZonesInit(store);
  FilterTracksInit(store);
  MarkerInit(store);
  IconInit(store);
  RemoteSiteConfigInit(store);
  MessageInit(store);
  MapConfigInit(store);
}
