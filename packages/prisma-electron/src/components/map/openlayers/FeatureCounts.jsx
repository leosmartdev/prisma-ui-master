import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  Paper,
  Typography,
} from '@material-ui/core';

const styles = {
  container: {
    bottom: '20px',
    position: 'fixed',
    left: '50%',
    transform: 'translate(-50, 0)',
    zIndex: '100',
    padding: '0 10px',
    fontFamily: 'Inconsolata',
    fontWeight: 'bold',
    fontSize: '16px',
    userSelect: 'none',
  },
};

const FeatureCounts = ({ total, visible }) => {
  if (total === 0) {
    return null;
  }

  return (
    <Paper elevation={2} style={styles.container}>
      <Typography variant="body1">{`${visible} / ${total}`}</Typography>
    </Paper>
  );
};

FeatureCounts.propTypes = {
  total: PropTypes.number,
  visible: PropTypes.number,
};

export default FeatureCounts;
