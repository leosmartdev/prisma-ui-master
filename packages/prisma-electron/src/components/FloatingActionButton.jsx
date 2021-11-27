import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import {
  Fab,
} from '@material-ui/core';

// Icons
import AddIcon from '@material-ui/icons/Add';

FloatingActionButton.propTypes = {
  icon: PropTypes.element,
  ariaLabel: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'secondary', 'warning', 'default']),
};

FloatingActionButton.defaultProps = {
  icon: <AddIcon />,
  ariaLabel: 'add',
  color: 'default',
};

export default function FloatingActionButton({ color, ariaLabel }) {
  const [showExtendedFab, setFab] = React.useState(false);
  return (
    <Fab
      color={color}
      aria-label={ariaLabel}
      onMouseOver={() => setFab(true)}
      onFocus={() => setFab(true)}
      onClick={() => setFab(true)}
    />
  );
}
