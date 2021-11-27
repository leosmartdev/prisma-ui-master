import loglevel from 'loglevel';

// Grab the remote logger from the electron remote instance. This passed the logs to the
// electron node process.
const remotelogger = require('electron').remote.require('./lib/logger').child({ name: 'BrowserConsole' });

function getRemoteLogFunction(level) {
  return remotelogger[level];
}

const originalFactory = loglevel.methodFactory;
loglevel.methodFactory = function methodFactory(methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  const remoteMethod = getRemoteLogFunction(methodName);

  return function log(...args) {
    // Call the loglevel log function
    rawMethod(...args);
    // Call the remote electron function to log to main process
    remoteMethod(...args);
  };
};
loglevel.setLevel(loglevel.getLevel()); // Be sure to call setLevel method in order to apply plugin
loglevel.setLevel('info', false);

export default loglevel;
