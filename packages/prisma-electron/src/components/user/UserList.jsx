/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * Displays the list of privided users in a <List> view.
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

// Helpers
import { friendlyName } from 'lib/user_helpers';

UserList.propTypes = {
  /**
   * List of users to display.
   */
  users: PropTypes.array,
  /**
   * Callback when a site is clicked.
   */
  onClick: PropTypes.func,
  /**
   * @private used to pass className down to the underlying list so any provided styles actually
   * render.
   */
  className: PropTypes.string,
};

UserList.defaultProps = {
  users: [],
  onClick: () => { },
  className: null,
};

export default function UserList({ users, onClick, className }) {
  // ensure if users isn't passed in we return null. This will prevent extra padding and space being
  // taken up by the empty <List /> component.
  if (users === null || typeof users === 'undefined' || users.length === 0) {
    return null;
  }

  return (
    <List className={className}>
      {users.map(user => (
        <ListItem key={user.userId}>
          <ListItemText
            primary={friendlyName(user)}
            secondary={user.userId}
            onClick={() => onClick(user)}
          />
        </ListItem>
      ))}
    </List>
  );
}
