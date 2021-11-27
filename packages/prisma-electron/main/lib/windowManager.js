const {
  // app,
  BrowserWindow,
  // Menu,
} = require('electron');

const openWindows = {
  loadingWindow: null,
  appWindows: [],
};

/**
 * Displays a loading window while the application launches.
 */
function showLoadingWindow() {
  if (!openWindows.loadingWindow) {
    openWindows.loadingWindow = new BrowserWindow({
      width: 600,
      height: 400,
      frame: false,
      backgroundColor: '#424242',
    });
  }

  openWindows.loadingWindow.loadURL(`file://${__dirname}/../../src/resources/C2-Loading-Splash.png`);
  openWindows.loadingWindow.once('ready-to-show', () => {
    // It might already be closed if the app loads fast enough.
    if (openWindows.loadingWindow) {
      openWindows.loadingWindow.show();
    }
  });
}

/**
 * Hides the loading window
 */
function hideLoadingWindow() {
  if (openWindows.loadingWindow) {
    openWindows.loadingWindow.hide();
    openWindows.loadingWindow = null;
  }
}

module.exports = {
  showLoadingWindow,
  hideLoadingWindow,
  // newApplicationWindow,
};
