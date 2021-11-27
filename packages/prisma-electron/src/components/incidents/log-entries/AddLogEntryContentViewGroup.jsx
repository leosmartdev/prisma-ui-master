/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Shows a content view group that will render a log entry depending on the type of entry provided.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import ContentViewGroup from 'components/layout/ContentViewGroup';
import NoteEdit from 'components/incidents/log-entries/NoteEdit';
import FileUpload from 'components/file/FileUpload';

import {
  Button,
  Paper,
} from '@material-ui/core';

AddLogEntryContentViewGroup.propTypes = {
  /**
   * When true the component will be shown.
   */
  show: PropTypes.bool,
  /** The entry to add */
  entryType: PropTypes.oneOf(['note', 'file', 'searchObject']),
  /**
   * Callback when a note is created.
   *
   * isTarget is true when adding searchObject.
   *
   * ## Signature
   * `onNoteSave(note: string, isTarget: boolean) -> void`
   */
  onNoteSave: PropTypes.func,
  /**
   * Callback when a file is uploaded.
   * ## Signature
   * `onUploadFinished(files: array(filename: string), failedFiles: array(filename: string)) ->
   *  void`
   */
  onUploadFinished: PropTypes.func,
  /**
   * Callback when the content group is requested to close.
   *
   * ## Signature
   * `onClose() -> void`
   */
  onClose: PropTypes.func,
};

AddLogEntryContentViewGroup.defaultProps = {
  show: false,
  onNoteSave: () => { },
  onUploadFinished: () => { },
  onClose: () => { },
};

export default function AddLogEntryContentViewGroup({
  show,
  entryType,
  onNoteSave,
  onUploadFinished,
  onClose,
}) {
  if (!entryType || !show) {
    return null;
  }

  let title = '';
  let content = null;
  switch (entryType) {
    case 'note': {
      title = __('New Note');
      content = <NoteEdit onSave={onNoteSave} onCancel={onClose} />;
      break;
    }
    case 'searchObject': {
      title = __('New Search Object');
      content = <NoteEdit onSave={onNoteSave} onCancel={onClose} searchObject />;
      break;
    }
    case 'file': {
      title = __('Upload File');
      content = <FileUpload onUploadFinished={onUploadFinished} />;
      break;
    }
  }

  return (
    <ContentViewGroup component={Paper} title={title} componentProps={{ elevation: 0 }}>
      <FlexContainer padding="dense" column align="start stretch">
        {content}
        {entryType === 'file' && (
          <FlexContainer align="end" padding="dense">
            <Button onClick={onClose}>{__('Cancel')}</Button>
          </FlexContainer>
        )}
      </FlexContainer>
    </ContentViewGroup>
  );
}
