const fs = require('fs');
const { argv } = require('yargs');
const request = require('request');
const os = require('os');
const log = require('./logger');

/**
 * Shows the preferences window for configuring the application.
 */
function showPreferencesWindow() {
  log.debug('Showing preferences window');
}

/**
 * Gets the brand.json and defaults.json files and loads them into a configuration
 * object that is returned. Also sets the processes NODE_ENV on the object.
 */
function getDefaults() {
  log.debug('Retrieving brand.json...');
  const brand = JSON.parse(fs.readFileSync(`${__dirname}/../brand.json`));
  log.debug('Retrieving defaults.json...');
  const defaults = JSON.parse(fs.readFileSync(`${__dirname}/../defaults.json`));
  defaults.brand = brand;
  // Default the NODE_ENV to production if not found. On windows, we won't have a NODE_ENV set.
  defaults.env = process.env.NODE_ENV || 'production';
  defaults.serverEnv = process.env.NODE_ENV || 'production';
  defaults.configurationRemote = true;
  return defaults;
}

function getUserConfiguration(defaults) {
  let userConfig = {};
  try {
    if (argv.serverEnv) {
      defaults.serverEnv = argv.serverEnv;
    }
    userConfig = JSON.parse(fs.readFileSync(`${os.homedir()}/.c2/${defaults.serverEnv}.json`));
  } catch (err) {
    // We dont log error here, since this error is only for debugging purposes.
    log.debug(err.toString());
  }
  log.debug('Local configuration read.');
  return userConfig;
}

/**
 * Finds the configuration marked default in the list of configurations. If multiple are marked
 * (which is an invalid configuration) then we will just return the first one found.
 *
 * @param {array} configurations The list of configurations saved in the configuration file.
 * @return {object} the configuration object with default=true
 */
function findDefaultConfiguration(configurations) {
  const configuration = configurations.find(config => config.default);

  if (configuration) {
    log.debug('Found default configuration.');
    return configuration;
  }

  log.warn("Failed to parse `configurations` in the configuration file. No default configuration found (missing 'default: true'?). Defaulting to localhost");
}

/**
 * Gets the client configuration from the server. If the configuration cannot be retrieved,
 * the promise is rejected, otherwise, its resolved with the configuration object.
 *
 * @param defaults [object] The default configuration that contains the host/port.
 * @return Promise<any> resolves with object or rejects with an error object.
 */
function getConfiguration(defaults) {
  // Setup configuration
  const userConfig = getUserConfiguration(defaults);
  const config = Object.assign({}, defaults, userConfig);

  // Check if we are a remote config, if so, setup the url and any options as needed.
  if (config.configurationRemote) {
    // Default, localhost
    let options = {
      url: 'http://localhost:8081/api/v2/config.json',
    };

    if (argv.config) {
      // C2.exe -- --config=http://url/to/config.json
      options.url = argv.config;
    } else if (config.configuration) {
      // configuration: 'http://url/to/config.json'
      if (typeof config.configuration === 'string') {
        options.url = config.configuration;
      } else {
      // configuration: { "url": 'http://url/to/config.json', "headers": {} }
        options = config.configuration;
      }
    } else if (config.configurations) {
      // configurations: [ { ...config1 }, {...config2, default: true }} ]
      options = findDefaultConfiguration(config.configurations) || options;
    }

    // Get the configuration from the server
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        let serverConfig = {};
        if (error || response.statusCode !== 200) {
          log.error(`Failed to retrieve configuration from server: ${options.url}. Response: ${body}`);
          reject(error);
          return;
        }
        try {
          serverConfig = JSON.parse(body);
        } catch (error) {
          log.error(`Failed to parse configuration from server: ${body}`);
          log.error(options.url, response, body, error);
          reject(error);
          return;
        }
        log.info(`Remote configuration received from ${options.url}.`);
        resolve(Object.assign({}, defaults, serverConfig, userConfig));
      });
    });
  }

  // else use the configuration from disk
  return Promise.resolve(config);
}

module.exports = {
  showPreferencesWindow,
  getDefaults,
  getConfiguration,
};
