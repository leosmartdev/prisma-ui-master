import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import PrimaryButton from 'components/PrimaryButton';

import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';

ConfirmationDialog.propTypes = {
  /**
   * Callback called when the modal closes. Passed boolean value as the only
   * parameter, true if the user confirmed, false if the user cancelled.
   */
  onClose: PropTypes.func,
  /**
   * String to be used for the OK button.
   */
  okButtonText: PropTypes.string,
  /**
   * String to be used for the Cancel button.
   */
  cancelButtonText: PropTypes.string,
  /**
   * String to be displayed as the the dialog content.
   */
  message: PropTypes.string,
  /**
   * Title for the dialog.
   */
  title: PropTypes.string,
};

ConfirmationDialog.defaultProps = {
  okButtonText: __('Ok'),
  cancelButtonText: __('Cancel'),
  message: __('Are you sure?'),
  title: __('Confirm'),
};

export default function ConfirmationDialog({
  onClose,
  okButtonText,
  cancelButtonText,
  message,
  title,
  ...other
}) {
  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-title"
      {...other}
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="default">
          {cancelButtonText}
        </Button>
        <PrimaryButton onClick={() => onClose(true)}>{okButtonText}</PrimaryButton>
      </DialogActions>
    </Dialog>
  );
}
