/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Displays a list of incidents. Has a callback for handling when a single incident is selected.
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import IncidentListItem from 'components/incidents/IncidentListItem';

import {
  List,
} from '@material-ui/core';

IncidentList.propTypes = {
  /**
   * The lists of incidents to display
   */
  incidents: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  /**
   * Callback function to handle when an incident is selected
   */
  onSelect: PropTypes.func,
};

IncidentList.defaultProps = {
  onSelect: () => { },
};

export default function IncidentList({ incidents, onSelect }) {
  if (incidents.length === 0) {
    return null;
  }

  return (
    <List>
      {incidents.map(incident => (
        <IncidentListItem incident={incident} key={incident.id} onSelect={onSelect} />
      ))}
    </List>
  );
}
