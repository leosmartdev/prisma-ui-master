/* **********************************************
 *
 * OwnerColumn
 *
 * Displays the owner information in the expansion card.
 *
 ********************************************* */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import OwnerContact from 'components/person/OwnerContact';
import OwnerForm from 'components/fleet/form/OwnerForm';

import {
  Typography,
} from '@material-ui/core';

// Actions and Helpers
import { VesselShape } from './propTypes';
import getOwnerFromFleet from 'components/fleet/getOwnerFromFleet';

const propTypes = {
  classes: PropTypes.object.isRequired, // withStyles
  vessel: PropTypes.shape(VesselShape).isRequired,
  /**
   * When true, editing mode is active
   */
  isEditing: PropTypes.bool,
  /**
   * Callback when the owner object is changed during editing mode.
   * Two params, type of owner and owner object: onChange(type: string, person: obj)
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Callback when the owner type is changed. Will be passed old and new types,
   * onOwnerTypeChange(oldType: string, newType: string)
   */
  onOwnerTypeChange: PropTypes.func.isRequired,
  /**
   * Object with errors for the fields in this form.
   */
  fieldErrors: PropTypes.object,
};

const defaultProps = {
  isEditing: false,
};

let OwnerColumn = ({ classes, vessel, isEditing, onChange, onOwnerTypeChange, fieldErrors }) => {
  if (!vessel.person && !vessel.organization && !isEditing) {
    return null;
  }

  const { owner, ownerType } = getOwnerFromFleet(vessel);

  return (
    <FlexContainer column className={classes.root}>
      <Typography variant="h6">{__('Vessel Owner')}</Typography>
      <span className={classes.ownerContact}>
        {isEditing ? (
          <OwnerForm
            owner={owner}
            ownerType={ownerType}
            onChange={onChange}
            onOwnerTypeChange={onOwnerTypeChange}
            fieldErrors={fieldErrors}
          />
        ) : (
          <OwnerContact owner={owner} type={ownerType} />
        )}
      </span>
    </FlexContainer>
  );
};

OwnerColumn.propTypes = propTypes;
OwnerColumn.defaultProps = defaultProps;

export default (OwnerColumn = withStyles(theme => ({
  root: {
    [theme.breakpoints.up('md')]: {
      flexBasis: '50%',
      flexGrow: '1',
    },
    [theme.breakpoints.down('md')]: {
      flexBasis: '100%',
    },
  },
  ownerContact: {
    marginTop: '8px',
  },
}))(OwnerColumn));
