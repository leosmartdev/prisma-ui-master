/**
 * Loading dialog to block actions and inform the user
 * that an action is taking place. When the load is complete
 * the progress indicator is changed to a complete icon then
 * the dialog is dismissed.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import PrimaryButton from 'components/PrimaryButton';

import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@material-ui/core';

LoadingDialog.propTypes = {
  /**
   * Callback called when the modal closes.
   */
  onClose: PropTypes.func,
  /**
   * String to be displayed as the the dialog content.
   * This will be displayed above the loading indicator.
   */
  message: PropTypes.string,
  /**
   * String to be used for the OK button. Only shown when progress is marked complete.
   */
  okButtonText: PropTypes.string,
  /**
   * Title for the dialog.
   */
  title: PropTypes.string,
  /**
   * If the progress is indeterminate this is a boolean, that when set to
   * true signals the load is complete. If value is an integer between 0 and 100,
   * then the progress will be changed to determinate and the value will denote
   * the percentage of progress. When the value reaches 100 the load is considered
   * complete.  When the load is complete, the success indicator is displayed for a
   * period of time and then the modal is closed and onClose will be called.
   */
  complete: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]).isRequired,
};

LoadingDialog.defaultProps = {
  message: null,
  title: __('Loading'),
  okButtonText: __('Close'),
};

export default function LoadingDialog({
  onClose,
  message,
  title,
  complete,
  okButtonText,
  ...other
}) {
  const progressType = typeof complete === 'number' ? 'determinate' : 'query';
  const dialogTitle = title || __('Loading');

  let isComplete = false;
  if (progressType === 'determinate' && complete === 100) {
    isComplete = true;
  } else {
    isComplete = complete;
  }

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="loading-dialog-title"
      {...other}
    >
      <DialogTitle id="loading-dialog-title">{dialogTitle}</DialogTitle>
      <DialogContent>
        {message && <Typography variant="body1">{message}</Typography>}
        {!isComplete && (
          <LinearProgress
            type={progressType}
            complete={progressType === 'deteminate' ? complete : undefined}
            color="primary"
          />
        )}
      </DialogContent>
      {isComplete && (
        <DialogActions>
          <PrimaryButton onClick={() => onClose(true)}>{okButtonText}</PrimaryButton>
        </DialogActions>
      )}
    </Dialog>
  );
}
