import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

// Component Imports
import { FlexContainer } from 'components/layout/Container';

import {
  Avatar,
  Typography,
  IconButton,
} from '@material-ui/core';

// Icons
import EditIcon from '@material-ui/icons/Edit';

import { avatarInitials, friendlyName } from 'lib/user_helpers';

const styles = theme => ({
  avatar: {
    alignSelf: 'center',
    width: '128px',
    height: '128px',
    marginBottom: '20px',
    backgroundColor: theme.palette.grey[theme.palette.type === 'dark' ? 100 : 900],
  },
  innerContent: {
    flexGrow: '1',
  },
});

/**
 * UserProfile
 */
class UserProfile extends React.Component {
  render() {
    const { user, classes } = this.props;
    console.log(user);
    return (
      <FlexContainer column align="start center">
        <Avatar className={classes.avatar}>{avatarInitials(user)}</Avatar>
        <FlexContainer align="center center">
          <Typography variant="h6">{friendlyName(user)}</Typography>
          <Link to="/profile/edit">
            <IconButton>
              <EditIcon />
            </IconButton>
          </Link>
        </FlexContainer>
      </FlexContainer>
    );
  }
}

UserProfile.propTypes = {
  classes: PropTypes.object.isRequired,
  // state to props
  user: PropTypes.object,
};

const mapStateToProps = state => ({
  user: state.session.user || { userId: '', profile: {} },
});

export default connect(mapStateToProps)(withStyles(styles)(UserProfile));
