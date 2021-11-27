/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * Displays the list of privided incidents in a <List> view.
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

IncidentList.propTypes = {
  /**
   * List of incidents to display.
   */
  incidents: PropTypes.array,
  /**
   * Callback when a site is clicked.
   */
  onClick: PropTypes.func,
  /**
   * @private used to pass className down to the underlying list so any provided styles actually
   * render.
   */
  className: PropTypes.string,
};

IncidentList.defaultProps = {
  incidents: [],
  onClick: () => { },
  className: null,
};

export default function IncidentList({ incidents, onClick, className }) {
  // ensure if incidents isn't passed in we return null. This will prevent extra padding and space being
  // taken up by the empty <List /> component.
  if (incidents === null || typeof incidents === 'undefined' || incidents.length === 0) {
    return null;
  }

  return (
    <List className={className}>
      {incidents.map(incident => (
        <ListItem key={incident.incidentId}>
          <ListItemText
            primary={incident.incidentId}
            secondary={incident.name}
            onClick={() => onClick(incident)}
          />
        </ListItem>
      ))}
    </List>
  );
}
