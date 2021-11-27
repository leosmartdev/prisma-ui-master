/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Displays a list of notes. Has a callback for handling when a single note is selected.
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import NoteListItem from 'components/notes/NoteListItem';

import {
  List,
} from '@material-ui/core';

NoteList.propTypes = {
  /**
   * The lists of notes to display
   */
  notes: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  /**
   * Callback function to handle when an note is selected
   */
  onSelect: PropTypes.func,
};

NoteList.defaultProps = {
  onSelect: () => { },
};

export default function NoteList({ notes, onSelect }) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <List>
      {notes.map(note => (
        <NoteListItem note={note} key={note.id} onSelect={onSelect} />
      ))}
    </List>
  );
}
