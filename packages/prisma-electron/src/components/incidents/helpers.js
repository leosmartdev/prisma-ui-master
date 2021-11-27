import React from 'react';
import moment from 'moment-timezone';
import { __ } from 'lib/i18n';

// Icons
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import ArchiveIcon from '@material-ui/icons/Archive';
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import HelpIcon from '@material-ui/icons/Help';

export const STATE = {
  OPEN: 1,
  CLOSED: 2,
  ARCHIVED: 3,
  TRANSERRING: 4,
  TRANSERRED: 5,
};

export const PHASE = {
  UNCERTAINTY: 1,
  ALERT: 2,
  DISTRESS: 3,
};

/**
 * Returns the options list for incident outcome. Formatted for DropDownButton
 */
export function getIncidentOutcomes() {
  return [
    { value: __('Non-Distress'), label: __('Non-Distress') },
    { value: __('Hand Off'), label: __('Hand Off') },
    { value: __('Rescue/MEDEVAC Provided'), label: __('Rescue/MEDEVAC Provided') },
    { value: __('Fatality'), label: __('Fatality') },
    { value: __('Training'), label: __('Training') },
    { value: __('Unresolved'), label: __('Unresolved') },
  ];
}

/**
 * Inspects the incident and returns the icon based on the current state of
 * the incident.
 * Current icons:
 *      - Opened Lock: Incident is open
 *      - Lock: Incident is closed
 *      - Archive: Incident is archived
 *      - Received: Incident has no assignee and was forwarded from another site.
 */
export function getIncidentStateIcon(incident) {
  if (!incident) return <HelpIcon />;

  switch (incident.state) {
    case STATE.OPEN:
      return <LockOpenIcon />;
    case STATE.CLOSED:
      return <LockIcon />;
    case STATE.ARCHIVED:
      return <ArchiveIcon />;
    case STATE.TRANSERRING:
      return <CallReceivedIcon />;
    case STATE.TRANSERRED:
      return <CallReceivedIcon />;
    default:
      return <HelpIcon />;
  }
}

/**
 * Returns the string version of the phase.
 */
export function getPhase(incident) {
  if (!incident) return '';
  switch (incident.phase) {
    case 1:
      return __('Uncertainty');
    case 2:
      return __('Alert');
    case 3:
      return __('Distress');
    default:
      return '';
  }
}

/**
 * Returns true if the incident is closed.
 */
export function isClosed(incident) {
  if (incident && incident.state === 2) {
    return true;
  }

  return false;
}

/**
 * Returns true if the incident is transferring and has not been accepted by a user and marked
 * as opened
 */
export function isTransferred(incident) {
  return !!(incident && incident.state === 5);
}

/**
 * Reformats a time with the provided format, or defaults to
 * MM/DD/YYY hh:mm:ss A z in the current time zone.
 * @return string Reformatted Time
 */
export function formatTime(time, format) {
  const timeFormat = format || 'l LTS z';
  if (time) {
    const momentTime = moment(time).tz(moment().tz() || moment.tz.guess());
    return momentTime.format(timeFormat);
  }
  return null;
}

/**
 * Takes a list of audit records for an incident and returns an object
 * with the following formatted times (see formatTime() above) or null
 * if the time was not provided in the list:
 * {
 *      created: Time the incident was created
 *      updated: Most recent time the incident was updated
 *      closed: Time the incident was closed
 *      lastModified: Time the incident was last modified by any action.
 * }
 */
export function getUpdateTimesFromRecords(auditRecords) {
  const times = {
    // formatted times for display
    created: null,
    updated: null,
    closed: null,
    lastModified: null,
    // For input of type datetime-local
    inputField: {
      created: null,
      updated: null,
      closed: null,
      lastModified: null,
    },
    // Compact Versions
    compact: {
      created: null,
      updated: null,
      closed: null,
      lastModified: null,
    },
  };

  if (!auditRecords) {
    return times;
  }

  return auditRecords.reduce((obj, record) => {
    const momentTime = moment(record.created);
    const recordTime = moment(record.created).tz(moment().tz());
    const inputFieldTime = formatTime(record.created, 'YYYY-MM-DDTHH:mm:ss');
    let compactTime = formatTime(record.created, 'L LTS');
    if (momentTime.isSame(moment(), 'day')) {
      compactTime = formatTime(record.created, `[${__('Today')}] LTS z`);
    }

    // Update last modified if this record is newer than any previous records
    // TODO this is causing the moment warning.
    if (!obj.lastModified || moment(obj.lastModified).isBefore(momentTime)) {
      obj.lastModified = recordTime;
      obj.inputField.lastModified = inputFieldTime;
      obj.compact.lastModified = compactTime;
    }

    if (record.action === 'CREATE') {
      if (!obj.createTime) {
        obj.created = recordTime;
        obj.inputField.created = inputFieldTime;
        obj.compact.created = compactTime;
      }
    } else if (record.action === 'UPDATE') {
      // Update only shows the last update, so check if this update record
      // is newer than previous
      if (!obj.updated || moment(obj.updated).isBefore(momentTime)) {
        obj.updated = recordTime;
        obj.inputField.updated = inputFieldTime;
        obj.compact.updated = compactTime;
      }
    } else if (record.action === 'CLOSE') {
      // Update only shows the last update, so check if this update record
      // is newer than previous
      if (!obj.closed || moment(obj.closed).isBefore(momentTime)) {
        obj.closed = recordTime;
        obj.inputField.closed = inputFieldTime;
        obj.compact.closed = compactTime;
      }
    }
    return obj;
  }, times);
}

// Functions for filtering incidents. Used by filterIncidents function below.
const filterFunctions = {
  opened: incident => {
    if (!isClosed(incident)) {
      return incident;
    }
  },
  closed: incident => {
    if (isClosed(incident)) {
      return incident;
    }
  },
  received: incident => {
    if (isTransferred(incident)) {
      return incident;
    }
  },
};
/**
 * Returns the filtered list of incidents as requested by the provided filter.
 * Filters:
 *  - none: returns original array.
 *  - open: Returns only opened incidents.
 *  - closed: Returns only closed incidents.
 * @param <array> incidents:  List of incidents to filter.
 * @param <string> filter: One of "none", "open", "closed"
 */
export function filterIncidents(incidents, filter) {
  if (!filter) return incidents;
  if (typeof filter === 'string') {
    switch (filter) {
      case 'opened':
        return incidents.filter(filterFunctions.opened);
      case 'closed':
        return incidents.filter(filterFunctions.closed);
      case 'received':
        return incidents.filter(filterFunctions.received);
      default:
        return incidents;
    }
  } else {
    return incidents.filter(filter);
  }
}

/**
 * Checks if two incidents are equal by comparing ID, name, phase, type, assignee, and commander.
 */
export function areIncidentsEqual(a, b) {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.phase === b.phase &&
    a.type === b.type &&
    a.assignee === b.assignee &&
    a.commander === b.commander
  );
}
