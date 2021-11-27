/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * Provides the SplitView Header for NoteDetails.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';

// Components
import GoBack from 'components/icon/GoBack';
import FlexContainer from 'components/FlexContainer';
import ErrorDialog from 'components/error/ErrorDialog';

import {
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';

// Icons
import RemoveIcon from '@material-ui/icons/Delete';

// Helpers
import { types } from 'incident/log-entries';
import { isAssigned } from "./helpers";
import { deleteNote } from "note/note";

const styles = {
  dialogText: {
    paddingLeft: '20px',
    paddingRight: '20px',
  }
}

NoteDetailsAppBar.propTypes = {
  /**
   * The note being displayed.
   */
  note: PropTypes.object,
  /**
   * True if the note is currently loading. Will show
   * a loading indicator.
   */
  isLoading: PropTypes.bool,
  /**
   * True if a user is creating a note
   */
  isCreating: PropTypes.bool.isRequired,

  /** @private withRouter */
  history: PropTypes.object.isRequired,
  /** @private withTransaction */
  createTransaction: PropTypes.func.isRequired,
};

NoteDetailsAppBar.defaultProps = {
  isLoading: false,
  isCreating: false,
};

export function NoteDetailsAppBar({
  note,
  isLoading,
  isCreating,
  history,
  createTransaction,
}) {
  let _isMounted = false;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogOptions, setErrorDialogOptions] = useState({ title: '', message: null, complete: false });

  useEffect(() => {
    _isMounted = true;
    return function cleanup() {
      _isMounted = false;
    };
  });

  let noteHeaderText;
  let noteInfo;
  let incidentInfo;

  if (note) {
    if (note.note) noteInfo = note.note;
    if (note.incident) incidentInfo = note.incident;
  }

  let assigned = isAssigned(noteInfo)

  // Functions to handle Dialog
  const accept = () => {
    setShowConfirmation(true);
  };

  const cancel = () => {
    setShowConfirmation(false);
  };

  const confirmed = async () => {
    setShowConfirmation(false);

    let incidentId;
    if (incidentInfo && incidentInfo.id) {
      incidentId = incidentInfo.id;
    }

    try {
      await createTransaction(deleteNote(assigned, noteInfo.id, incidentId));
      history.push('/notes');
    } catch (error) {
      let errorMsg;
      switch (error.status) {
        case 401:
        case 403: {
          errorMsg = __(
            'Your account does not have the correct permissions to access this page. Contact your administrator.',
          );
          break;
        }
        default: {
          errorMsg = __(
            'Sorry, we encountered a problem removing the note from the server. Please try again later.',
          );
        }
      }

      if (_isMounted) {
        setShowErrorDialog(true);
        setErrorDialogOptions({
          title: __('Remove Error'),
          message: __(
            errorMsg,
          ),
          onClose: () => {
            this.setState({
              showErrorDialog: false,
              errorDialogOptions: { title: '', message: '' },
            });
          },
        });
      }
    }
  };

  // Header title
  if (!isCreating) {
    if (assigned === true) {
      noteHeaderText = "Assigned ";
    } else {
      noteHeaderText = "Unassigned ";
    }

    switch (noteInfo.type) {
      case types.NOTE:
        noteHeaderText += "Note";
        break;
      case types.FILE:
        noteHeaderText += "File";
        break;
    }
  } else {
    noteHeaderText = "Create a note";
  }

  return (
    <FlexContainer align="space-between center">
      <FlexContainer>
        <GoBack to="/notes" />
        <FlexContainer column align="center start">
          <Typography variant="h6" align="left">
            {noteHeaderText}
          </Typography>
        </FlexContainer>
        {isLoading && <CircularProgress variant="indeterminate" color="primary" size={24} />}
      </FlexContainer>
      {!isCreating && (<FlexContainer>
        <Tooltip title={__('Remove')}>
          <IconButton onClick={accept}>
            <RemoveIcon />
          </IconButton>
        </Tooltip>
      </FlexContainer>)}
      {/* ERROR DIALOG */}
      <ErrorDialog open={showErrorDialog} {...errorDialogOptions} />
      {/* CONFIRMATION DIALOG */}
      <Dialog open={showConfirmation} onClose={cancel}>
        <DialogTitle>Remove Note</DialogTitle>
        <DialogContentText style={styles.dialogText}>
          {__("Are you sure you want to remove this note?")}
        </DialogContentText>
        <DialogActions>
          <Button id="note-remove-cancel" onClick={cancel} color="primary">
            {__("Cancel")}
          </Button>
          <Button id="note-remove-confirm" onClick={confirmed}>
            {__("Remove")}
          </Button>
        </DialogActions>
      </Dialog>
    </FlexContainer>
  );
}

export default withTransaction(withRouter(NoteDetailsAppBar));
