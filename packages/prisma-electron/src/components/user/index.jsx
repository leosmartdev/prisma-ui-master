import React from 'react';
import { __ } from 'lib/i18n';

// Components
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';
import UserListPage from 'components/user/UserListPage';
import UserEditPage from 'components/user/UserEditPage';

class User extends React.Component {
  render() {
    return [
      <LeftDrawerRoute
        key="user-list"
        path="/users"
        component={() => (<UserListPage />)}
        title={__('Users')}
        routeOnClose="/"
      />,
      <LeftDrawerRoute
        key="user-create"
        path="/new-user"
        component={UserEditPage}
        title={__('Add User')}
        routeOnClose="/users"
      />,
      <LeftDrawerRoute
        key="user-edit"
        path="/user/:id"
        component={props => (<UserEditPage id={props.match.params.id} />)}
        routeOnClose="/users"
        title={__('Edit User')}
      />,
    ];
  }
}

export default User;
