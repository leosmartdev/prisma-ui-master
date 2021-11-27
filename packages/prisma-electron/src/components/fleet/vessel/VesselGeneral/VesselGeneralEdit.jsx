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
  TextField,
} from '@material-ui/core';

// Helpers
import { VesselShape } from 'components/fleet/vessel';

const propTypes = {
  /**
   * Vessel being displayed.
   */
  vessel: PropTypes.shape(VesselShape).isRequired,
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
};

const defaultProps = {
  fieldErrors: null,
};

const VesselGeneralEdit = ({
  classes,
  vessel,
  onChange,
  fieldErrors,
}) => {
  const internalOnChange = fieldName => (event) => {
    onChange(fieldName)(event.target.value);
  };

  return (
    <React.Fragment>
      <FlexContainer column align="start stretch" className={classes.container}>
        <FlexContainer align="space-between center">
          <Typography variant="h6" gutterBottom>{__('Vessel Information')}</Typography>
        </FlexContainer>
        <FlexContainer align="space-between start">
          <FlexContainer column align="start start">
            <TextField
              value={vessel.callsign}
              onChange={internalOnChange('callsign')}
              label={__('Call Sign')}
              margin="dense"
              error={fieldErrors && fieldErrors.hasErrorForField('callsign')}
              helperText={fieldErrors && fieldErrors.getHelperTextForField('callsign')}
            />
            <TextField
              value={vessel.manufacturer}
              onChange={internalOnChange('manufacturer')}
              label={__('Manufacturer')}
              margin="dense"
              error={fieldErrors && fieldErrors.hasErrorForField('manufacturer')}
              helperText={fieldErrors && fieldErrors.getHelperTextForField('manufacturer')}
            />
          </FlexContainer>
          <div className={classes.detailsSection}>
            <TextField
              value={vessel.details}
              onChange={internalOnChange('details')}
              label={__('Details')}
              error={fieldErrors && fieldErrors.hasErrorForField('details')}
              helperText={fieldErrors && fieldErrors.getHelperTextForField('details')}
              multiline
              rows={5}
              fullWidth
            />
          </div>
        </FlexContainer>
      </FlexContainer>
      <Divider className={classes.sectionDivider} key="people_divider" />
    </React.Fragment>
  );
};

VesselGeneralEdit.propTypes = propTypes;
VesselGeneralEdit.defaultProps = defaultProps;

export default withStyles(theme => ({
  container: {
    width: '100%',
  },
  sectionDivider: {
    margin: `${theme.spacing(2)}px ${-theme.spacing(3)}px`,
  },
  detailsSection: {
    width: '50%',
    margin: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
  details: {
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
  },
}))(VesselGeneralEdit);
