import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  Paper,
  Typography,
} from '@material-ui/core';

class ZoneTooltipPanel extends React.Component {
  render = () => {
    const { zone } = this.props;
    return (
      <Paper elevation={2}>
        <Typography variant="h6">{zone.name}</Typography>
      </Paper>
    );
  }
}

ZoneTooltipPanel.propTypes = {
  zone: PropTypes.object.isRequired,
};

export default ZoneTooltipPanel;
