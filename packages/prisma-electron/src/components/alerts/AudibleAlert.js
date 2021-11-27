import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import log from 'loglevel';

const resources = `${__dirname}/../../resources`;
const interval = 5000;

class AudibleAlert extends React.Component {
  constructor(props) {
    super(props);
    this.ctx = new AudioContext();
    this.buffer = null;
    this.timer = null;
  }

  componentDidMount = () => {
    const { active } = this.props;
    if (active) {
      this.start();
    }
  };

  componentWillUnmount = () => {
    this.stop();
  };

  componentDidUpdate = prev => {
    const { active } = this.props;
    if (!prev.active && active) {
      this.start();
    }
    if (prev.active && !active) {
      this.stop();
    }
  };

  componentWillMount = () => {
    const request = new XMLHttpRequest();
    request.open('GET', `${resources}/sounds/alert.ogg`, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
      this.ctx.decodeAudioData(
        request.response,
        buffer => {
          this.buffer = buffer;
        },
        this.error,
      );
    };
    request.send();
  };

  start = () => {
    this.play();
    this.timer = setInterval(this.play, interval);
  };

  stop = () => {
    clearInterval(this.timer);
  };

  error = err => {
    log.error('error loading sound', err);
  };

  play = () => {
    if (process.env.SILENT) {
      return
    }
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.ctx.destination);
    source.start(0);
  };

  render = () => <div />;
}

AudibleAlert.propTypes = {
  active: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  active:
    state.session.state === 'activated' &&
    (state.notifications.highPriorityNotices.length > 0 || state.message.failedCount > 0) &&
    state.config.mainWindow &&
    !state.notifications.soundOff,
});

export default connect(mapStateToProps)(AudibleAlert);
