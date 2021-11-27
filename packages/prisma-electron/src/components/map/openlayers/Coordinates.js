import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';

// Components
import {
  Paper,
  Typography,
} from '@material-ui/core';

// Helpers
import Formatter from '../../../format/Formatter';

const styles = {
  panel: {
    position: 'absolute',
    bottom: '20px',
    right: '75px',
    zIndex: 100,
    userSelect: 'none',
  },
  value: {
    margin: '10px',
    fontFamily: 'Inconsolata',
    fontWeight: 'bold',
    fontSize: '16px',
  },
};

class Coordinates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      decimalFormat: false,
    };
    this.decimalFormatter = new Formatter({ coordinateFormat: 'decimalDegrees' });
  }

  toggleLatLongFormat = () => {
    this.setState(prevState => ({
      decimalFormat: !prevState.decimalFormat,
    }));
  };

  render = () => {
    const { show, latitude, longitude } = this.props;
    const { decimalFormat } = this.state;

    if (!show) {
      return false;
    }
    // eslint-disable-next-line react/destructuring-assignment
    const format = decimalFormat ? this.decimalFormatter : new Formatter(this.props.format);
    return (
      <Paper elevation={2} style={styles.panel} onClick={this.toggleLatLongFormat}>
        <Typography variant="body1">
          <span style={styles.value}>{format.latitude(latitude)}</span>
          <span style={styles.value}>{format.longitude(longitude)}</span>
        </Typography>
      </Paper>
    );
  };
}

Coordinates.propTypes = {
  show: PropTypes.bool.isRequired,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  format: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  format: state.config,
});

export default connect(mapStateToProps)(withStyles(styles)(Coordinates));
