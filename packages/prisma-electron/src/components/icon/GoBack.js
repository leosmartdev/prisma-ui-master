import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// import {__} from "lib/i18n";

// Components
import {
  IconButton,
} from '@material-ui/core';

// Icons
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

const propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.element,
};

const defaultProps = {
  icon: <ChevronLeftIcon />,
};

function GoBack({ to, icon }) {
  return (
    <Link to={to}>
      <IconButton>
        {icon}
      </IconButton>
    </Link>
  );
}

GoBack.propTypes = propTypes;
GoBack.defaultProps = defaultProps;

export default GoBack;
