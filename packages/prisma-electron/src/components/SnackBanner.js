import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { makeStyles } from '@material-ui/styles';

// Components
import {
  Snackbar,
  Slide,
} from '@material-ui/core';

// Helpers & Actions
import * as bannerActions from 'banner/banner';

const useStyles = makeStyles(theme => ({
  snackBar: {
    marginLeft: props => {
      let width = theme.c2.navBar.width;
      if (props.navBarExpanded) {
        width = theme.c2.navBar.expandedWidth;
      }

      return `calc(${width}/2)`;
    },
  },
}));

const SnackBanner = ({ open, message, onClose, duration, navBarExpanded }) => {
  const classes = useStyles({ navBarExpanded });

  const Transition = React.forwardRef((props, ref) => (
    <Slide direction="up" ref={ref} {...props} />
  ));

  return (
    <Snackbar
      TransitionComponent={Transition}
      className={classes.snackBar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={duration || 5000}
      open={open}
      message={message}
      onClose={onClose}
    />
  );
};

SnackBanner.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
  navBarExpanded: PropTypes.bool,
};

const mapStateToProps = state => ({
  open: state.banner.open,
  message: state.banner.message,
  navBarExpanded: state.navigationBar.expanded,
});

const mapDispatchToProps = disp => ({
  onClose: bindActionCreators(bannerActions.hideSnackBanner, disp),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SnackBanner);
