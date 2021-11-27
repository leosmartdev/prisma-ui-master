import React from 'react';
import PropTypes from 'prop-types';

// Components
import Container from 'components/layout/Container';

import {
  Typography,
} from '@material-ui/core';

class ZoneInfoPanel extends React.Component {
  render = () => {
    const { zone } = this.props;
    return (
      <Container>
        <Typography variant="h6">{zone.name}</Typography>
      </Container>
    );
  }
}

ZoneInfoPanel.propTypes = {
  zone: PropTypes.object.isRequired,
};

export default ZoneInfoPanel;
