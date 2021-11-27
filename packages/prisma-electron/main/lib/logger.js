const pino = require('pino');


const opts = {
  name: 'Electron Console',
};

let stream;
if (process.env.NODE_ENV === 'production') {
  try {
    stream = pino.destination('c2-client.log', { flags: 'a' });
  } catch (e) {
    // This console we allow, since the logger didn't intialize.
    // eslint-disable-next-line no-console
    console.error('Failed to create log file stream. Logs will not be written.', e);
  }
}

if (process.env.NODE_ENV === 'development') {
  opts.prettyPrint = true;
}

const log = pino(opts, stream);

module.exports = log;
