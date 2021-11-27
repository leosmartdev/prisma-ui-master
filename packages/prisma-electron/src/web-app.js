console.info('loading........');

import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { handleActions } from 'redux-actions';
import log from 'loglevel';
import moment from 'moment-timezone';

// App Components
import WebRoot from './components/WebRoot';

// Other App Imports
import { i18n, changeLanguage } from './lib/i18n';
import Store from 'lib/store';
import Server from 'server/server';

// Reducers
import { init as DrawInit } from 'draw/draw';
import { init as FeaturesInit } from 'map/features';
import { init as BannerInit } from 'banner/banner';
import { init as IncidentInit } from 'incident/incident';
import { init as InfoInit } from 'info/info';
import { init as LeftDrawerInit } from 'layout/left-drawer';
import { init as MapInit, center as mapCenter, zoom as mapZoom } from 'map/map';
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

/**
 * Adds the reducers to the redux store by calling the `init()` function
 * for each file containing a reducer.
 */
// NOTE: This function is probably no longer in use, see reduxInit.js
const addReducers = store => {
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
  InfoInit(store);
  MapInit(store);
  NavigationInit(store);
  NoticesInit(store);
  RolesInit(store);
  SelectionInit(store);
  TooltipInit(store);
  UserInit(store);
  VesselInit(store);
};

// Render application
const config = {
  lat: 38.95,
  lon: -76.83,
  client: {
    locale: 'en-US',
    distance: 'nauticalMiles',
    shortDistance: 'meters',
    speed: 'knots',
    coordinateFormat: 'degreesMinutes',
    timeZone: 'UTC',
    zoom: 10,
  },
  brand: {
    name: 'PRISMA Fleet',
    version: '1.5.0',
  },
  policy: {
    description:
      'Montes morbi quam ut lobortis rutrum curae porttitor nascetur mus cubilia vestibulum in semper nulla id sed ornare adipiscing eu nec etiam facilisis auctor nullam.',
    password: {
      lengthMinimum: '2',
      lengthMaximum: '128',
      pattern: '[a-zA-Z0-9_@.]',
      reuseMaximum: '3',
      durationMaximum: '2161h',
      durationMaximumConsequence: 'RestrictedUser',
      authenticateFailedCountMaximum: '5',
      authenticateFailedMaximumConsequence: 'LOCK',
    },
    session: {
      single: 'false',
      durationIdle: '20m',
      idleConsequence: 'StandardUser',
      durationRenewal: '30m',
      durationMaximum: '16h',
    },
    user: {
      inactiveDurationConsequenceLock: '2161h',
      inactiveDurationConsequenceDeactivate: '4320h',
    },
  },
  service: {
    map: {
      base: 'http://10.20.128.220:8089/wac',
    },
    ws: {
      map: 'wss://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/ws/v2/view/stream',
      tms: 'wss://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/ws/v2/',
    },
    tms: {
      headers: {
        'x-api-key': 'e79c6a3c575a4014b77d95baa78778d8',
      },
      base: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2',
      device: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/device',
      fleet: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/fleet',
      track: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/track',
      incident: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/incident',
      communication:
        'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/communication',
      notification:
        'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/notification',
      vessel: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/vessel',
      registry: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/registry',
      rule: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/rule',
      map: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/view',
      zone: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/zone',
      file: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/file',
      pagination: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io',
      swagger: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/apidocs.json',
    },
    aaa: {
      headers: {
        'x-api-key': 'e79c6a3c575a4014b77d95baa78778d8',
      },
      base: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2',
      session: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/auth/session',
      user: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/auth/user',
      role: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/auth/role',
      policy: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/auth/policy',
      profile: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/auth/profile',
      audit: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/auth/audit',
      pagination: 'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io',
      swagger:
        'https://2d4aa601-dc25-47f1-a3fc-f65deb57667b.mock.pstmn.io/api/v2/auth/apidocs.json',
    },
    sim: {
      alert: 'http://localhost:8089/v1/alert',
      target: 'http://localhost:8089/v1/target',
      route: 'http://localhost:8089/v1/route',
    },
  },
};

export default function renderApp() {
  // logging
  log.setLevel('info', false);

  if (config.debug) {
    log.setLevel('debug', false);
    log.info('Debug logging enabled');
  }
  let loggers = config.trace || [];
  loggers = Array.isArray(loggers) ? loggers : [loggers];
  loggers.forEach(logger => {
    log.getLogger(logger).setLevel('trace', false);
    log.info(`Trace logging enabled: ${logger}`);
  });

  // Create the server
  const server = new Server(config);
  // locale
  if (config.locale) {
    changeLanguage(config.locale);
  }
  window.moment = moment;
  if (config.timeZone) {
    moment.tz.setDefault(config.timeZone);
  }

  // Add redux-thunk to redux middlewares
  const reduxMiddlewares = [];
  reduxMiddlewares.push(thunk.withExtraArgument(server));
  if (process.env.NODE_ENV === 'development') {
    if (config.debug && loggers.includes('redux')) {
      // eslint-disable-next-line global-require
      const { logger } = require('redux-logger');
      reduxMiddlewares.push(logger);
    }
  }
  const store = Store(null, reduxMiddlewares);

  store.addReducer('server', handleActions({}, server));
  store.addReducer('config', handleActions({}, config));
  addReducers(store);

  // Create the Root component and apply it to the <div id="content"></div>
  ReactDOM.render(<WebRoot store={store} i18n={i18n} />, document.getElementById('content'));

  if (config.lat || config.lon) {
    store.dispatch(mapCenter([config.lon, config.lat]));
  }
  if (config.zoom) {
    store.dispatch(mapZoom(config.zoom));
  }

  // preventDefault for drag-n-drop support for files
  document.ondragend = ev => {
    ev.preventDefault();
  };
  document.ondragover = document.ondragend;
  document.ondrop = document.ondragend;
  document.ondragleave = document.ondragend;

  // note: was added to window for debugging purposes. It is nice to have
  // the store availableTheme in the console. It can be omitted in a
  // production setting.
  window.store = store;
  window.log = log;
}

window.renderApp = renderApp;
