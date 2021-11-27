import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import Infinite from 'react-infinite';
import { AutoSizer } from 'react-virtualized';

import Authorization from 'components/security/Authorization';
import { FlexContainer } from 'components/layout/Container';

import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';

// Icons
import LockIcon from '@material-ui/icons/Lock';

// Helpers & Actions
import { flname } from 'auth/name';

const styles = {
  root: {
    height: '100%',
  },
  infiniteScroll: {
    'overflowY': 'auto !important',
  },
};

class UserListPage extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      loading: false,
      users: [],
      requestNext: null,
    };
  }

  componentDidMount = () => {
    this._isMounted = true;
    this.fetchUsers('/auth/user', { params: { limit: 20 } });
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  fetchUsers = (path, opts) => {
    if (path && opts) {
      this.setState({
        loading: true,
      });
      let url;
      if (opts.requestNext) {
        url = this.props.server.buildPaginationUrl(path, opts.requestNext);
      } else {
        url = this.props.server.buildHttpUrl(path, opts);
      }
      this.props.server.paginate(url).then(response => {
        if (this._isMounted) {
          this.setState(prevState => ({
            users: prevState.users.concat(response.json),
            requestNext: response.next,
            loading: false,
          }));
        }
      });
    }
  };

  onUserClick = userId => {
    this.props.history.push({
      pathname: `/user/${userId}`,
      state: {
        id: userId,
      },
    });
  };

  createUser = () => {
    this.props.history.push('/new-user');
  };

  viewAudit = () => {
    this.props.history.push('/audit');
  };

  render() {
    const { classes } = this.props;
    const { users, requestNext } = this.state;
    let opts;
    if (requestNext != null) {
      opts = { requestNext };
    }
    return (
      <div className={classes.root}>
        <FlexContainer align="space-between stretch">
          <Authorization classId="Audit" action="READ">
            <Button variant="contained" onClick={this.viewAudit}>
              {__('Activity')}
            </Button>
          </Authorization>
          <Authorization classId="User" action="CREATE">
            <Button variant="contained" onClick={this.createUser}>
              {__('Add User')}
            </Button>
          </Authorization>
        </FlexContainer>
        <List className={classes.root}>
          <AutoSizer disableWidth>
            {// eslint-disable-next-line no-unused-vars
              ({ width, height }) =>
                height > 0 && (
                  <Infinite
                    containerHeight={height}
                    elementHeight={68}
                    infiniteLoadBeginEdgeOffset={100}
                    onInfiniteLoad={() => this.fetchUsers('/auth/pagination', opts)}
                    isInfiniteLoading={this.state.loading}
                    className={classes.infiniteScroll}
                  >
                    {users &&
                      users.map(user => (
                        <ListItem
                          button
                          key={user.userId}
                          onClick={() => this.onUserClick(user.userId)}
                          divider
                        >
                          <ListItemText primary={user.userId} secondary={flname(user)} />
                          {user.state === 10 && (
                            <ListItemIcon>
                              <LockIcon />
                            </ListItemIcon>
                          )}
                        </ListItem>
                      ))}
                  </Infinite>
                )}
          </AutoSizer>
        </List>
      </div>
    );
  }
}

UserListPage.propTypes = {
  server: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired, // withStyles provided
};

const mapStateToProps = state => ({
  server: state.server,
});

const mapDispatchToProps = () => ({});

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withRouter(UserListPage)),
);
