// handle setupevents as quickly as possible. Windows squirrel events needs this to function
// properly.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  process.exit(0);
}

const setupEvents = require('./installers/setupEvents');

if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  process.exit(0);
}
// Done handling events. Continue with normal app launch.

const electron = require('electron');
const { app, BrowserWindow, Menu } = require('electron');
const log = require('./lib/logger');
const windowManager = require('./lib/windowManager');
const configuration = require('./lib/configuration');
const path = require('path');
const { argv } = require('yargs');

const REACT_DEVTOOLS_PATH = 'fmkadmapgofadopljbjfkapdkoienihi/2.0.12_0';
let config = {};

/**
 * main: Called when electron app is ready using the app.on('ready') callback.
 */
function main() {
  windowManager.showLoadingWindow();

  if (process.env.NODE_ENV === 'development') {
    require('electron-debug')(); // eslint-disable-line global-require
  }

  const defaults = configuration.getDefaults();
  configureLogging(defaults);
  configuration.getConfiguration(defaults).then(
    serverConfig => {
      config = Object.assign({}, defaults, serverConfig, argv);

      windowManager.hideLoadingWindow();

      // Create the browser window
      const win = newWindow({ mainWindow: true });
      win.maximize();
    },
    error => {
      windowManager.hideLoadingWindow();
      configError(error);
    },
  );
}

/**
 * Configures the logger by setting the appropriate log level for the
 * node environment currently being run. If --loglevel is passed to the application
 * that level supersedes the env level and will be used.
 *
 * Environments:
 * - `production`: warn
 * - `development`: debug
 * - All others: info
 */
function configureLogging(defaults) {
  if (argv.loglevel) {
    defaults.loglevel = argv.loglevel;
  } else if (process.env.NODE_ENV === 'development') {
    defaults.loglevel = 'debug';
  } else if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
    defaults.loglevel = 'warn';
  } else {
    defaults.loglevel = 'info';
  }

  log.level = defaults.loglevel;
}

function configError(error) {
  log.error('unable to load config', error);
  electron.dialog.showMessageBox(
    {
      type: 'error',
      buttons: ['Retry', 'Quit'],
      title: 'Cannot Connect to Service',
      message:
        'The Application was unable to connect to the PRISMA Service. Please try again or contact your system administrator.',
    },
    action => {
      if (action === 0) {
        main();
      } else {
        app.quit();
      }
    },
  );
}

function newWindow(initialState) {
  const current = BrowserWindow.getFocusedWindow();
  const win = new BrowserWindow({
    title: config.brand.name,
    icon: path.join(__dirname, '../brands/generic/app_icon.png'),
    backgroundColor: '#424242',
  });
  // If opening a new window, put it on the same display
  // and "almost" maximize it
  if (current) {
    const bounds = current.getBounds();
    const display = electron.screen.getDisplayMatching(bounds);
    const inset = 100;
    const newBounds = {
      x: display.bounds.x + inset,
      y: display.bounds.y + inset,
      width: display.bounds.width - inset * 2,
      height: display.bounds.height - inset * 2,
    };
    win.setBounds(newBounds);
  }
  if (argv.devtools) {
    win.webContents.openDevTools();
  }
  if (process.env.NODE_ENV === 'development') {
    // Add browser extensions
    try {
      /* eslint-disable global-require,import/no-extraneous-dependencies */
      const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS,
      } = require('electron-devtools-installer');
      /* eslint-enable global-require,import/no-extraneous-dependencies */
      installExtension(REACT_DEVELOPER_TOOLS)
        .then(name => log.info(`Added Extension:  ${name}`))
        .catch(err => log.error('An error occurred: ', err));
    } catch (error) {
      log.debug(
        'Could not add electron devtools installer. No extra development tools will be provided.',
        error,
      );
    }

    // applicationMenu.createApplicationMenu();
    win.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click() {
            win.inspectElement(x, y);
          },
        },
      ]).popup(win);
    });

    if (argv.regtools) {
      if (process.platform === 'linux') {
        log.info('Registering React Devtools');
        BrowserWindow.addDevToolsExtension(
          `${process.env.HOME}/.config/google-chrome/Default/Extensions/${REACT_DEVTOOLS_PATH}`,
        );
      } else {
        log.warn('Do not know how to add React DevTools extension');
      }
    }
  }

  win.loadURL(`file://${__dirname}/../src/app.html`);
  win.once('ready-to-show', () => {
    win.show();
  });
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('init', Object.assign({}, config, initialState));
  });
  return win;
}

/** ********************************************************
 *
 * Electron App event callback handlers
 *
 ******************************************************** */

/**
 * Used by the application to open a new secondary window.
 * You can access this function in the renderer process using:
 * ```
 *    import {remote} from "electron"
 *    const newWindow = remote.getGlobal("newWindow")
 * ```
 */
global.newWindow = initialState => {
  newWindow(Object.assign({}, initialState, { mainWindow: false }));
};

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // Verification logic for accepting the server-provided certificate.
  // Not needed if the certificate is added as a trusted cert on the client.

  if (/https:\/\/localhost/g.test(url) || /wss:\/\/localhost/g.test(url)) {
    event.preventDefault();
    callback(true);
  } else {
    // Log a warning that the cert is invalid, so we can know that's why the client doesnt work
    // instead of guessing.
    if (error === 'net::ERR_CERT_AUTHORITY_INVALID') {
      log.error(
        'Client certificate is invalid. Please make sure you get the correct certificate from `https://<host>:8080/api/v2/certificate.pem',
      );
    }
    callback(false);
  }
});

/**
 * When all windows are closed, quit the applications
 */
app.on('window-all-closed', () => {
  app.quit();
});

/**
 * Call the main function.
 */
app.on('ready', main);
