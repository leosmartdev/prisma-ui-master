/**
 * Panel containing the vessel form for editing basic details about the vessel.
 * This is built to go into the vessel expansion panel details section.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

// Components
import VesselForm from 'components/fleet/form/VesselForm';

import {
  Grid,
} from '@material-ui/core';

// Helpers
import { VesselShape } from './propTypes';

const propTypes = {
  /**
   * @private withStyles
   */
  classes: PropTypes.shape({
    content: PropTypes.string.isRequired,
  }).isRequired,
  /**
   * The vessel to edit.
   */
  vessel: PropTypes.shape(VesselShape).isRequired,
  /**
   * Callback when the vessel has been changed. Passes the new vessel object as param.
   * onChange(vessel: object);
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Any field errors returned from the validators to be displayed on the
   * form fields. If no errors then the object will be null.
   */
  fieldErrors: PropTypes.object,
};

const defaultProps = {
  fieldErrors: null,
};

const VesselEditPanel = ({ classes, vessel, fieldErrors, onChange }) => (
  <Grid
    container
    justify="flex-start"
    alignContent="center"
    spacing={8}
    className={classes.content}
  >
    <VesselForm
      vessel={vessel}
      fieldErrors={fieldErrors}
      onChange={onChange}
      fieldProps={{
        name: {
          sm: 3,
          lg: 3,
        },
        type: {
          sm: 3,
          lg: 3,
        },
      }}
    />
  </Grid>
);

VesselEditPanel.propTypes = propTypes;
VesselEditPanel.defaultProps = defaultProps;

export default withStyles(theme => ({
  content: {
    marginTop: 'auto',
    marginBottom: theme.spacing(3),
  },
}))(VesselEditPanel);
