import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';

// Component Imports
import ContentViewGroup from 'components/layout/ContentViewGroup';

import {
  SnackbarContent,
  Paper,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  snackbar: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.error[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
  snackbarCompact: {
    minWidth: '200px',
  },
  contentGroup: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.error[theme.palette.type === 'dark' ? 'light' : 'dark'],
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
}));

ErrorBanner.propTypes = {
  message: PropTypes.string,
  compact: PropTypes.bool,
  contentGroup: PropTypes.bool,
};

ErrorBanner.defaultProps = {
  message: null,
  compact: false,
  contentGroup: false,
};

/**
 * ErrorBanner
 * Displays a snackbar error banner, that is styled. If no message
 * is given, will render null. This allows you to insert the
 * error banner without checking if the message exists first.
 */
export default function ErrorBanner({ message, contentGroup, compact }) {
  const classes = useStyles();

  if (message === '' || message === null || message === undefined) {
    return null;
  }

  let className = classes.snackbar;
  if (compact) {
    className = `${className} ${classes.snackbarCompact}`;
  }

  if (contentGroup) {
    return (
      <ContentViewGroup
        classes={{ component: classes.contentGroup }}
        component={Paper}
        componentProps={{ elevation: 2 }}
      >
        <Typography variant="body2" color="inherit">
          {message}
        </Typography>
      </ContentViewGroup>
    );
  }

  return <SnackbarContent className={className} message={message} />;
}
