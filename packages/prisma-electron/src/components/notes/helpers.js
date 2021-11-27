import React from 'react';
import moment from 'moment-timezone';
import { __ } from 'lib/i18n';

// Icons
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import HelpIcon from '@material-ui/icons/Help';

export const STATE = {
  ASSIGNED: true,
};

/**
 * Inspects the note and returns the icon based on the current state of
 * the note.
 * Current icons:
 *      - Link: Note is assigned
 *      - Link Off: Note is unassigned
 */
 export function getNoteStateIcon(note) {
  if (!note) return <HelpIcon />;

  /**
   * In Protobuf if a boolean value is set as false, the response will miss it
   */
  if (!note.assigned) return <LinkOffIcon />;

  switch (note.assigned) {
    case STATE.ASSIGNED:
      return <LinkIcon />;
  }
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
 * Returns true if the note is assigned.
 */
 export function isAssigned(note) {
  if (note && note.assigned && note.assigned === true) {
    return true;
  }

  return false;
}

// Functions for filtering notes. Used by filterNotes function below.
const filterFunctions = {
  assigned: note => {
    if (isAssigned(note)) {
      return note;
    }
  },
  unassigned: note => {
    if (!isAssigned(note)) {
      return note;
    }
  },
};
/**
 * Returns the filtered list of notes as requested by the provided filter.
 * Filters:
 *  - none: returns original array.
 *  - assigned: Returns only assigned notes.
 *  - unassigned: Returns only unassigned notes.
 * @param <array> notes:  List of notes to filter.
 * @param <string> filter: One of "none", "assigned", "unassigned"
 */
export function filterNotes(notes, filter) {
  if (!filter) return notes;
  if (typeof filter === 'string') {
    switch (filter) {
      case 'assigned':
        return notes.filter(filterFunctions.assigned);
      case 'unassigned':
        return notes.filter(filterFunctions.unassigned);
      default:
        return notes;
    }
  } else {
    return notes.filter(filter);
  }
}

/**
 * Calculate display size
 */
export function scaleImage(width, height, imgWidth, imgHeight) {
  let displayWidth;
  let displayHeight;

  if (imgWidth == imgHeight) {
    if (width > height) {
      displayWidth = height;
    } else {
      displayWidth = width;
    }
    displayHeight = displayWidth;
  } else if (imgHeight > imgWidth) {
    displayHeight = height;
    displayWidth = imgWidth * (height / imgHeight);
  } else if (imgHeight < imgWidth) {
    displayWidth = width;
    displayHeight = imgHeight * (width / imgWidth);
  }

  return {
    displayWidth,
    displayHeight,
  };
}