/**
 * Displays Phone Device in a row container with phone icon then a phone number displayed as a
 *  `tel:` link.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  Typography,
} from '@material-ui/core';

// Icons
import PhoneIcon from '@material-ui/icons/Phone';

const phonePropTypes = {
  /**
   * The device object containing the phone number.
   * MUST have 1 network with a subscriberId being the phone number, and a device type beginning
   * with `phone-`
   */
  device: PropTypes.object.isRequired,

  /**
   * withStyles
   */
  classes: PropTypes.object.isRequired,
};

const PhoneDevice = ({ device, classes }) => {
  const number = device.networks[0].subscriberId;
  return (
    <FlexContainer align="start center" key={number}>
      <Typography variant="caption">
        <PhoneIcon className={classes.icon} />
      </Typography>
      <Typography variant="body1">
        <a href={`tel:${number}`} className={classes.link}>
          {number}
        </a>
      </Typography>
    </FlexContainer>
  );
};

PhoneDevice.propTypes = phonePropTypes;

export default withStyles(theme => ({
  icon: {
    marginRight: '8px',
    width: '24px',
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
}))(PhoneDevice);
