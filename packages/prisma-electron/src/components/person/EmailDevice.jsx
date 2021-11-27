/**
 * Displays Phone Device in a row container with phone icon then a phone number displayed as a
 * `tel:` link.
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
import EmailIcon from '@material-ui/icons/Email';

const phonePropTypes = {
  /**
   * The device object containing the email.
   * MUST have 1 network with a subscriberId being the email, and a device type equal to `email`
   */
  device: PropTypes.object.isRequired,

  /**
   * withStyles
   */
  classes: PropTypes.object.isRequired,
};

const EmailDevice = ({ device, classes }) => {
  const email = device.networks[0].subscriberId;
  return (
    <FlexContainer align="start center" key={email}>
      <Typography variant="caption">
        <EmailIcon className={classes.icon} />
      </Typography>
      <Typography variant="body1">
        <a href={`mailto:${email}`} className={classes.link}>
          {email}
        </a>
      </Typography>
    </FlexContainer>
  );
};

EmailDevice.propTypes = phonePropTypes;

export default withStyles(theme => ({
  icon: {
    marginRight: '8px',
    width: '24px',
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
}))(EmailDevice);
