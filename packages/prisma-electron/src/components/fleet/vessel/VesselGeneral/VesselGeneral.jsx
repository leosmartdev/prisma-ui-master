/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 *
 * Displays the general details section for a vessel that includes the free form details, call sign,
 * manufacturer, etc...
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

// Helpers
import { VesselShape } from 'components/fleet/vessel';
import { VesselGeneralEdit } from './index';

const vesselHasGeneralInformation = vessel => {
  if (vessel.manufacturer || vessel.callsign || vessel.details) {
    return true;
  }

  return false;
};

const propTypes = {
  /**
   * Vessel being displayed.
   */
  vessel: PropTypes.shape(VesselShape).isRequired,
  /**
   * Is the vessel in edit mode
   */
  isEditing: PropTypes.bool,
  /**
   * Callback for when the user edits.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Object with errors for the fields in this form.
   */
  fieldErrors: PropTypes.object,
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
  /**
   * Callback to inform the parent of an action that should be performed.
   * Used to propogate actions that child components don't know how to handle,
   * but will propogate up the stack until a component can handle it.
   */
  onAction: PropTypes.func.isRequired,
};

const defaultProps = {
  isEditing: false,
  fieldErrors: null,
};

const VesselGeneral = ({ classes, vessel, isEditing, fieldErrors, onChange }) => {
  if (isEditing) {
    return <VesselGeneralEdit vessel={vessel} onChange={onChange} fieldErrors={fieldErrors} />;
  }

  // If the vessel has no info, then skip this section
  if (!vesselHasGeneralInformation(vessel)) {
    return null;
  }

  /*
  const onDeviceAddClicked = (event) => {
    const { vessel } = this.props;
    this.props.onAction('device/REGISTER', { vessel, event });
  }

  onDeviceClicked = (device) => {
    const { vessel } = this.props;
    this.props.onAction('device/SELECTED', { vessel, device, onAction: this.props.onAction });
  }
  */

  return (
    <React.Fragment>
      <FlexContainer column align="start stretch" className={classes.container}>
        <FlexContainer align="space-between center">
          <Typography variant="h6">{__('Vessel Information')}</Typography>
        </FlexContainer>
        <FlexContainer align="space-between start">
          {(vessel.callsign || vessel.manufacturer) && (
            <List>
              {vessel.callsign && (
                <ListItem>
                  <ListItemText primary={__('Call Sign')} secondary={vessel.callsign} />
                </ListItem>
              )}
              {vessel.manufacturer && (
                <ListItem>
                  <ListItemText primary={__('Manufacturer')} secondary={vessel.manufacturer} />
                </ListItem>
              )}
            </List>
          )}
          {vessel.details && (
            <div className={classes.detailsSection}>
              <Typography variant="subtitle1">{__('Details')}</Typography>
              <Typography className={classes.details} variant="body1" color="textSecondary">
                {vessel.details}
              </Typography>
            </div>
          )}
        </FlexContainer>
      </FlexContainer>
      <Divider className={classes.sectionDivider} key="people_divider" />
    </React.Fragment>
  );
};

VesselGeneral.propTypes = propTypes;
VesselGeneral.defaultProps = defaultProps;

export default withStyles(theme => ({
  container: {
    width: '100%',
  },
  sectionDivider: {
    margin: `${theme.spacing(2)}px ${-theme.spacing(3)}px`,
  },
  detailsSection: {
    margin: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
  details: {
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
  },
}))(VesselGeneral);
