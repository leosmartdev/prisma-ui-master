import React from 'react';
import PropTypes from 'prop-types';
import { log } from 'loglevel';
import { __ } from 'lib/i18n';
import { connect } from 'react-redux';

// Components
import {
  Typography,
} from '@material-ui/core';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    log(error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.snackbar) {
        // snackbar error

        this.props.showSnackBar('Error happened');
      } else {
        // if snackbar is false, just return typography error.
        return <Typography variant="subtitle">{__('An error occurred.')}</Typography>;
      }
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.element.isRequired,
  snackbar: PropTypes.element,
  showSnackBar: PropTypes.bool,
};

const mapDispatchToProps = () => ({
  showSnackBar: () => {
    // dispatch(bannerActions.showSnackBanner(message));
  },
});

export default ErrorBoundary = connect(null, mapDispatchToProps)(ErrorBoundary);
