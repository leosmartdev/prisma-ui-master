import React from 'react';
import { __ } from 'lib/i18n';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';

// Components
import {
  Menu,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  navExpandLessPaper: {
    left: 48,
  },
  navExpandMorePaper: {
    left: '150px !important',
  }
}));

NavigationSubMenu.propTypes = {
  navExpanded: PropTypes.bool.isRequired,
};

function NavigationSubMenu({
  navExpanded,
  dispatch,
  ...props
}) {
  const classes = useStyles();

  let paperClass = navExpanded ? classes.navExpandMorePaper : classes.navExpandLessPaper;

  return (
    <Menu
      elevation={0}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: "center",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
      classes={{ paper: paperClass }}
      {...props}
    />
  );
};

const mapStateToProps = state => ({
  navExpanded: state.navigationBar.expanded,
});

export default connect(mapStateToProps)(NavigationSubMenu);