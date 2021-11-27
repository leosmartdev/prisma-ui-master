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
 * Displays a single list item entry for an note.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import {
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';

// Helpers
import { getNoteStateIcon } from 'components/notes/helpers';

import { types } from 'incident/log-entries';

NoteListItem.propTypes = {
  /**
   * The provided note to display.
   */
  note: PropTypes.object.isRequired,
  /**
   * Callback when the item is clicked. Passes the note as the only param to the callback.
   *
   * ## Signature
   * `onSelect(note: object) => void`
   */
  onSelect: PropTypes.func,
};

NoteListItem.defaultProps = {
  onSelect: () => { },
};

// css style for the secondary text
var secondaryStyle = {
  whiteSpace: "nowrap",
  overflow: "hidden",
};

export default function NoteListItem({ onSelect, note }) {
  /* Previous list item secondary....secondary={this.times.compact.lastModified} */
  let title, secondary;

  switch (note.type) {
    case types.NOTE:
      title = __('Note');
      secondary = note.note;
      break;
    case types.FILE:
      title = __('File');
      secondary = note.attachment.name;
      break;
  }

  return (
    <ListItem button onClick={() => onSelect(note)}>
      <ListItemIcon>{getNoteStateIcon(note)}</ListItemIcon>
      <ListItemText style={secondaryStyle} title={secondary} primary={title} secondary={secondary} />
    </ListItem>
  );
}
