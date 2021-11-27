/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * Displays the EditIncidentForm in a sidebar.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import EditIncidentPanel from './EditIncidentPanel';
import Header from '../Header';

import {
  IconButton,
} from '@material-ui/core';

// Icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

EditIncidentSidebar.propTypes = {
  /**
   * The incident to edit.
   */
  incident: PropTypes.object.isRequired,
  /**
   * Callback when cancel or close is clicked.
   *
   * ## Signature
   * `onClose() => null`
   */
  onClose: PropTypes.func,
  /**
   * Callback when save is clicked. Passed the new value of incident that
   * should be saved. The function must handle passing in the errors
   * on the props if the save fails (see props.errorBannerMessage and props.fieldErrors).
   *
   * ## Signature
   * `onSave(incident: object) => null`
   */
  onSave: PropTypes.func.isRequired,
  /**
   * String to display in an error banner. If null, no banner will be displayed.
   */
  errorBannerMessage: PropTypes.string,
  /**
   * Field errors when the save fails. This is expected to be null OR a valid
   * form.FieldErrors object.
   */
  fieldErrors: PropTypes.object,
};

EditIncidentSidebar.defaultProps = {
  onClose: () => { },
  errorBannerMessage: null,
  fieldErrors: null,
};

export default function EditIncidentSidebar({ incident, onSave, onClose }) {
  const actionButton = (
    <IconButton onClick={onClose}>
      <ChevronRightIcon />
    </IconButton>
  );
  return (
    <FlexContainer column>
      <Header variant="h4" margin="normal" action={actionButton}>
        {__('Edit Incident')}
      </Header>
      <FlexContainer column padding="dense">
        <EditIncidentPanel incident={incident} onSave={onSave} onClose={onClose} />
      </FlexContainer>
    </FlexContainer>
  );
}
