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
 * Edit panel for file type note.
 */
import React from 'react';
import PropTypes from 'prop-types';

// Component Imports
import EditNotePanel from 'components/notes/EditNotePanel';
import DownloadLink from 'components/DownloadLink';

import {
  IconButton,
} from '@material-ui/core';

// Icons
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import FileDownloadIcon from '@material-ui/icons/CloudDownload';
import PhotoIcon from '@material-ui/icons/Photo';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import VideocamIcon from '@material-ui/icons/Videocam';

class EditFilePanel extends React.Component {
  static propTypes = {
    currentNote: PropTypes.object.isRequired,
    /**
     * Callback to save the note when updates to the note have been saved.
     */
    onNoteSave: PropTypes.func.isRequired,
  };

  getIcon = () => {
    const { currentNote } = this.props;
    const fileType = currentNote.attachment.type;

    if (fileType.startsWith('image')) {
      return <PhotoIcon />;
    }
    if (fileType.startsWith('audio')) {
      return <MusicNoteIcon />;
    }
    if (fileType.startsWith('video')) {
      return <VideocamIcon />;
    }
    return <InsertDriveFileIcon />;
  };

  /** Used to prevent the Expansion Panel from toggling.  */
  onDownloadClick = event => {
    event.stopPropagation();
  };

  /**
   * Renders the actions on a expansion panel summary row. These are the icon buttons like
   * download and delete that show up on hover.
   */
  renderActions = () => {
    const { currentNote } = this.props;

    return (
      <React.Fragment>
        <DownloadLink
          uri={`/file/${currentNote.attachment.id}`}
          filename={currentNote.attachment.name}
          onClick={this.onDownloadClick}
        >
          <IconButton>
            <FileDownloadIcon />
          </IconButton>
        </DownloadLink>
      </React.Fragment>
    );
  };

  render() {
    const { currentNote, onNoteSave } = this.props;

    return (
      <EditNotePanel
        currentNote={currentNote}
        icon={this.getIcon()}
        primary={currentNote.attachment.name}
        summaryActions={this.renderActions()}
        onNoteSave={onNoteSave}
      />
    );
  }
}

export default EditFilePanel;
