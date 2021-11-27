import { ipcRenderer } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';
import 'lib/logger'; // must import to log correctly to electron
import moment from 'moment-timezone';

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";

// Other App Imports
import Server from 'server/server';
import { center as mapCenter, zoom as mapZoom } from 'map/map';
import { i18n, changeLanguage } from './lib/i18n';
import initializeRedux from './reduxInit';

// App Components
import Root from './components/Root';

/**
 * Configures Application logging. Logging is configured to info normally, but in debug mode
 * it will automatically set to debug. You can individually set log levels to trave for named
 * loggers in the config as `config.trace` which is an array of string logger names. Any named
 * logger in  that array will be set to trace level.
 *
 * Logging is sent to browser console as well as electron for printing in the electron logs.
 *
 * @param {object} config The app configuration
 */
function configureLogging(config) {
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

  return loggers;
}

ipcRenderer.on('init', (event, contents) => {
  const config = contents;
  const loggers = configureLogging(config);
  const server = new Server(config);
  const store = initializeRedux(null, [], config, server, loggers);

  if (config.locale) {
    changeLanguage(config.locale);
  }

  window.moment = moment;
  if (config.timeZone) {
    moment.tz.setDefault(config.timeZone);
  }

  // Inject MUI theme
  const theme = createMuiTheme();

  // Create the Root component and apply it to the <div id="content"></div>
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <Root store={store} i18n={i18n} />
    </ThemeProvider>
    , document.getElementById('content'));

  // Must happen after initial render call of the <Root>
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
});
