/* **********************************************
 *
 * VesselExpansionPanelDetails
 *
 * Displays vessel information in the expanded
 * panel that shows when a user selects an epansion
 * panel row.
 *
 ********************************************* */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

// Components
import FlexContainer from 'components/FlexContainer';
import OwnerColumn from 'components/fleet/vessel/OwnerColumn';
import CrewColumn from 'components/fleet/vessel/CrewColumn';
import VesselDevices from 'components/fleet/vessel/VesselDevices';

import {
  Divider,
  Collapse,
} from '@material-ui/core';

// Actions and Helpers
import { VesselShape } from './propTypes';

const propTypes = {
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
  /**
   * The vessel being displayed.
   */
  vessel: PropTypes.shape(VesselShape).isRequired,
  /**
   * When true, the vessel expansion card is in edit mode and forms should be displayed.
   */
  isEditing: PropTypes.bool,
  /**
   * When true, devices section will never be show.
   */
  hideDevices: PropTypes.bool,
  /**
   * Callback when the items are changed. Will be passed two parameters,
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
  /**
   * Callback to inform the parent of an action that should be performed.
   * Used to propogate actions that child components don't know how to handle,
   * but will propogate up the stack until a component can handle it.
   */
  onAction: PropTypes.func,
};

const defaultProps = {
  fieldErrors: null,
  hideDevices: false,
  isEditing: false,
  onAction: null,
};

const doesVesselHaveOwner = vessel => vessel.person || vessel.organization;

let VesselExpansionPanelDetails = function VesselExpansionPanelDetails({
  classes,
  vessel,
  isEditing,
  hideDevices,
  fieldErrors,
  onChange,
  onOwnerTypeChange,
  onAction,
}) {
  return (
    <FlexContainer column align="start stretch" className={classes.container}>
      <Divider className={classes.firstSectionDivider} />
      {(vessel.crew || doesVesselHaveOwner(vessel)) && [
        <FlexContainer
          align="start stretch"
          className={`${classes.container} ${classes.personContainer}`}
          key="people_container"
        >
          <OwnerColumn
            vessel={vessel}
            isEditing={isEditing}
            onChange={onChange}
            fieldErrors={fieldErrors}
            onOwnerTypeChange={onOwnerTypeChange}
          />
          <CrewColumn
            crew={vessel.crew}
            noOwner={!doesVesselHaveOwner(vessel) && !isEditing}
            isEditing={isEditing}
            fieldErrors={fieldErrors}
            onChange={onChange}
          />
        </FlexContainer>,
        <Divider className={classes.sectionDivider} key="people_divider" />,
      ]}
      {hideDevices ? null : (
        <Collapse in={!isEditing}>
          <VesselDevices vessel={vessel} onAction={onAction} />
        </Collapse>
      )}
    </FlexContainer>
  );
};

VesselExpansionPanelDetails.propTypes = propTypes;
VesselExpansionPanelDetails.defaultProps = defaultProps;

export default (VesselExpansionPanelDetails = withStyles(theme => ({
  container: {
    width: '100%',
  },
  personContainer: {
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
    },
  },
  deviceColumn: {
    width: '100%',
  },
  firstSectionDivider: {
    // marginTop: -theme.spacing(1),
    marginLeft: -(theme.spacing(2)),
    marginRight: -(theme.spacing(2)),
    marginBottom: theme.spacing(2),
  },
  sectionDivider: {
    margin: `${theme.spacing(2)}px ${-theme.spacing(3)}px`,
  },
}))(VesselExpansionPanelDetails));
