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
 * Timeline expansion panel for file type log entries.
 */
import React from 'react';
import PropTypes from 'prop-types';

// Component Imports
import LogEntryExpansionPanel from './LogEntryExpansionPanel';
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

class FileExpansionPanel extends React.Component {
  static propTypes = {
    locked: PropTypes.bool.isRequired,
    logEntry: PropTypes.object.isRequired,
    /**
     * Callback to save the logEntry when updates to the note have been saved.
     */
    onNoteSave: PropTypes.func.isRequired,
    /**
     * Callback to remove the logEntry.
     */
    onRemove: PropTypes.func.isRequired,
    /**
     * The incident containing this log entry
     */
    incident: PropTypes.object.isRequired,
  };

  getIcon = () => {
    const { logEntry } = this.props;
    const fileType = logEntry.attachment.type;

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
    const { logEntry } = this.props;

    return (
      <React.Fragment>
        <DownloadLink
          uri={`/file/${logEntry.attachment.id}`}
          filename={logEntry.attachment.name}
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
    const { logEntry, locked, onRemove, onNoteSave, incident } = this.props;

    // let secondaryText = null;
    // let hasDetails = false;
    // if (!logEntry.note) {
    //   expansionPanelProps.expanded = false;
    // } else {
    //   hasDetails = true;
    //   secondaryText = logEntry.note;
    // }

    /*
    const markdownRenderers = {
      heading: ({ children, level }) => {
        let variant = 'body2';
        switch (level) {
          case 1: variant = 'h5'; break;
          case 2: variant = 'title'; break;
          case 3: variant = 'title'; break;
          case 4: variant = 'subtitle1'; break;
          case 5: variant = 'subtitle1'; break;
          case 6: variant = 'body1'; break;
        }
        return <Typography variant={variant} gutterBottom>{children}</Typography>;
      },
      paragraph: ({ children }) => (<Typography variant="body1" paragraph>{children}</Typography>),
    };
    */

    return (
      <LogEntryExpansionPanel
        logEntry={logEntry}
        locked={locked}
        icon={this.getIcon()}
        primary={logEntry.attachment.name}
        summaryActions={this.renderActions()}
        onRemove={onRemove}
        onNoteSave={onNoteSave}
        enableNoteDetaching={true}
        incident={incident}
      />
    );
    /*
        {hasDetails ? (
          <ReactMarkdown source={logEntry.note} renderers={markdownRenderers} />
        ) : null
        }
      </LogEntryExpansionPanel>
      );
    */
  }
}

export default FileExpansionPanel;
