/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *
 * Displays a single list item entry for an incident.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import {
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';

// Helpers
import { getIncidentStateIcon } from 'components/incidents/helpers';

IncidentListItem.propTypes = {
  /**
   * The provided incident to display.
   */
  incident: PropTypes.object.isRequired,
  /**
   * Callback when the item is clicked. Passes the incident as the only param to the callback.
   *
   * ## Signature
   * `onSelect(incident: object) => void`
   */
  onSelect: PropTypes.func,
};

IncidentListItem.defaultProps = {
  onSelect: () => { },
};

export default function IncidentListItem({ onSelect, incident }) {
  /* Previous list item secondary....secondary={this.times.compact.lastModified} */
  let title = incident.incidentId;
  if (!incident.assignee) {
    title = `${__('Received')}: ${title}`;
  }

  return (
    <ListItem button onClick={() => onSelect(incident)}>
      <ListItemIcon>{getIncidentStateIcon(incident)}</ListItemIcon>
      <ListItemText primary={title} secondary={incident.name} />
    </ListItem>
  );
}
