import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import ContentViewGroup from 'components/layout/ContentViewGroup';

import {
  Paper,
  Button,
  Typography,
} from '@material-ui/core';

// icons
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';

const propTypes = {
  /**
   * Callback when the add new vessel button is clicked.
   */
  onAddClicked: PropTypes.func.isRequired,
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
};

const NoVesselsCard = ({ classes, onAddClicked }) => (
  <FlexContainer column align="start center">
    <ContentViewGroup
      component={Paper}
      componentProps={{ elevation: 2 }}
    >
      <FlexContainer column align="start center" padding="normal">
        <Typography variant="body1">
          <DirectionsBoatIcon style={{ width: 64, height: 64 }} />
        </Typography>
        <Button
          color="primary"
          variant="contained"
          className={classes.button}
          onClick={onAddClicked}
        >
          {__('Create a Vessel')}
        </Button>
      </FlexContainer>
    </ContentViewGroup>
  </FlexContainer>
);

NoVesselsCard.propTypes = propTypes;

export default withStyles(theme => ({
  button: {
    marginTop: theme.spacing(2),
  },
}))(NoVesselsCard);
