import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withStyles } from '@material-ui/styles';

// Components
import {
  Snackbar,
  Slide,
  Button,
} from '@material-ui/core';

// Helpers & Actions
import { deleteSession } from 'session/session';

const styles = theme => ({
  snackBar: {
    marginLeft: props => {
      let width = theme.c2.navBar.width;
      if (props.navBarExpanded) {
        width = theme.c2.navBar.expandedWidth;
      }

      return `calc(${width}/2)`;
    },
  },
});

/**
 * StatusBanner
 * Displays a snackbar banner
 */
class StatusBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      severe: false,
      message: '',
    };
  }

  componentWillReceiveProps(props) {
    const { map, session } = props;
    let visible;
    let severe = false;
    let message = '';
    if (map && map.socketError) {
      message = __('Map connection error');
      visible = true;
      severe = true;
    }
    if (session && session.socketError) {
      message = __('Connection error');
      visible = true;
      severe = true;
    }
    this.setState({
      message,
      visible,
      severe,
    });
  }

  Transition = React.forwardRef((props, ref) => (
    <Slide direction="up" ref={ref} {...props} />
  ));

  render() {
    const { classes, deleteSession } = this.props;
    const { severe, visible, message } = this.state;
    return (
      <Snackbar
        className={classes.snackBar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={visible}
        TransitionComponent={this.Transition}
        action={
          severe && (
            <Button color="secondary" onClick={deleteSession}>
              {__('logout')}
            </Button>
          )
        }
        message={message}
      />
    );
  }
}

StatusBanner.propTypes = {
  // mapStateToProps
  map: PropTypes.object,
  session: PropTypes.object.isRequired,
  navBarExpanded: PropTypes.bool.isRequired,
  deleteSession: PropTypes.func.isRequired, // mapDispatchToProps
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  map: state.map,
  session: state.session,
  navBarExpanded: state.navigationBar.expanded,
});

const mapDispatchToProps = dispatch => ({
  deleteSession: () => {
    dispatch(deleteSession());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(StatusBanner));
