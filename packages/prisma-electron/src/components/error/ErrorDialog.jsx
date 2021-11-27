import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@material-ui/core";

const propTypes = {
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
   * String to be displayed as the the dialog content.
   */
  message: PropTypes.string,
  /**
   * Title for the dialog.
   */
  title: PropTypes.string,
  /**
   * @private
   * withStyles
   */
  classes: PropTypes.object.isRequired,
};

const defaultProps = {
  okButtonText: __('Ok'),
  message: __('An Error Occured.'),
  title: __('Error'),
};

const ErrorDialog = ({ onClose, okButtonText, message, title, classes, ...other }) => (
  <Dialog
    disableBackdropClick
    disableEscapeKeyDown
    maxWidth="xs"
    aria-labelledby="error-dialog-title"
    {...other}
  >
    <DialogTitle id="error-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <Typography variant="body1">{message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => onClose(true)} color="primary" className={classes.okButton}>
        {okButtonText}
      </Button>
    </DialogActions>
  </Dialog>
);

ErrorDialog.propTypes = propTypes;
ErrorDialog.defaultProps = defaultProps;

export default withStyles(theme => ({
  okButton: {
    color: theme.palette.primary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
}))(ErrorDialog);
