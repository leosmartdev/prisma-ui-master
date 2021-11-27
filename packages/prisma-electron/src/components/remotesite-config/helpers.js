import React from 'react';
import { __ } from 'lib/i18n';

// Icons
import MccIcon from '@material-ui/icons/Apartment';
import RccIcon from '@material-ui/icons/Computer';

/**
 * Inspects the remote site type and returns the icon based on the current state of
 * the type.
 */
export function getRemoteSiteIcon(remoteSite) {
  switch (remoteSite.type) {
    case 'MCC':
      return <MccIcon />;
    case 'RCC':
      return <RccIcon />;
  }
}

/**
 * Returns true if the remote site is a MCC.
 */
export function isMcc(remoteSite) {
  if (remoteSite.type === 'MCC') {
    return true;
  }

  return false;
}

// Functions for filtering remote sites.
const filterFunctions = {
  Mcc: remoteSite => {
    if (isMcc(remoteSite)) {
      return remoteSite;
    }
  },
  Rcc: remoteSite => {
    if (!isMcc(remoteSite)) {
      return remoteSite;
    }
  },
};
/**
 * Returns the filtered list of remote sites as requested by the provided filter.
 * Filters:
 *  - None: returns original array.
 *  - Mcc: Returns only MCCs.
 *  - Rcc: Returns only RCCs.
 * @param <array> remoteSites:  List of remote sites to filter.
 * @param <string> filter: One of "None", "Mcc", "Rcc"
 */
export function filterRemoteSites(remoteSites, filter) {
  if (!filter) {
    return remoteSites;
  }

  if (typeof filter === 'string') {
    switch (filter) {
      case 'MCC':
        return remoteSites.filter(filterFunctions.Mcc);
      case 'RCC':
        return remoteSites.filter(filterFunctions.Rcc);
      default:
        return remoteSites;
    }
  } else {
    return remoteSites.filter(filter);
  }
}

/**
 * Function to get cursor position
 */
export function getRange(el) {
  var ret = {};

  ret.begin = el.selectionStart;
  ret.end = el.selectionEnd;
  ret.result = el.value.substring(ret.begin, ret.end);

  el.focus();

  return ret;
}

export function isValidIPItemValue(val) {
  val = parseInt(val);

  return !isNaN(val) && val >= 0 && val <= 255;
}