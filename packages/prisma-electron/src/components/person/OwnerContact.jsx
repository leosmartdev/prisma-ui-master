import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

// Components
import FlexContainer from 'components/FlexContainer';
import Device from 'components/person/Device';

import {
  Typography,
} from '@material-ui/core';

// Icons
import PlaceIcon from '@material-ui/icons/Place';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';

// Helpers
import { hashObject } from 'lib/object';
import { PersonShape } from 'components/person/propTypes';

const OwnerShape = PersonShape;

export { OwnerShape };

const propTypes = {
  owner: PropTypes.shape(OwnerShape).isRequired,
  type: PropTypes.oneOf(['person', 'organization']),
  classes: PropTypes.object.isRequired,
};

const defaultProps = {
  type: 'person',
};

const OwnerContact = ({ owner, type, classes }) => (
  <FlexContainer column align="start stretch">
    <FlexContainer align="start center">
      <Typography variant="caption">
        {type === 'person' && <PersonIcon className={classes.icon} />}
        {type === 'organization' && <BusinessIcon className={classes.icon} />}
      </Typography>
      <Typography variant="body2" className={classes.name}>
        {owner.name}
      </Typography>
    </FlexContainer>
    {owner.address && (
      <FlexContainer align="start start">
        <Typography variant="caption">
          <PlaceIcon className={classes.icon} />
        </Typography>
        <Typography variant="body1" className={classes.address}>
          {owner.address}
        </Typography>
      </FlexContainer>
    )}
    {owner.devices &&
      owner.devices.map(device => <Device key={device.id || hashObject(device)} device={device} />)}
  </FlexContainer>
);

OwnerContact.propTypes = propTypes;
OwnerContact.defaultProps = defaultProps;

export default withStyles(theme => ({
  address: {
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    marginBottom: '5px',
  },
  icon: {
    marginRight: '8px',
    width: '24px',
  },
  phone: {
    textDecoration: 'none',
    color: theme.palette.primary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
}))(OwnerContact);
