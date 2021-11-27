/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 *
 * UserEditPage
 * Shows the list of all users, and the options like create and edit user.
 *
 * This is the main entry point to get into the list of user and to perform all user account
 * activities.
 */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/styles';
import { connect } from 'react-redux';

// components
import ErrorBanner from 'components/error/ErrorBanner';
import { FlexContainer } from 'components/layout/Container';
import Authorization, { hasPermission } from 'components/security/Authorization';
import ConfirmationDialog from 'components/ConfirmationDialog';

import {
  CircularProgress,
  Button,
  FormControlLabel,
  FormGroup,
  FormLabel,
  TextField,
  Checkbox,
} from '@material-ui/core';

// Helpers and Actions
import * as roleActions from 'auth/roles';
import * as userActions from 'auth/user';
import { FieldErrors, updateObjectPropertyWithValue } from 'lib/form';

class UserEditPage extends React.Component {
  static propTypes = {
    /**
     * ID of the user. If filled in, we are editing that user, otherwise, we are creating a new one.
     */
    id: PropTypes.string,

    /** @private withRouter() */
    history: PropTypes.object.isRequired,

    /** @private withStyles() */
    classes: PropTypes.object.isRequired,

    /** @private connect() */
    session: PropTypes.object.isRequired,

    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    id: '',
  };

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      editing: null,
      userId: '',
      lastName: '',
      firstName: '',
      password: '',
      verifyPassword: '',
      roles: [],
      confirm: false,
      systemRoles: [],
      locked: false,
      errorBannerMessage: null,
      savingUser: false,
      loadingUser: false,
      progress: false,
      loadingUserRoles: false,
      touched: {
        password: false,
        verifyPassword: false,
      },
      showConfirmDelete: false,
    };
  }

  componentDidMount = () => {
    this._isMounted = true;

    const newState = {
      roles: ['StandardUser'],
    };

    if (this.props.id) {
      newState.loadingUser = true;
      this.props.createTransaction(userActions.load(this.props.id)).then(
        user => {
          const locked = user.state === 10;
          if (this._isMounted) {
            this.setState({
              editing: user,
              userId: user.userId || '',
              lastName: user.profile.lastName || '',
              firstName: user.profile.firstName || '',
              roles: user.roles || '',
              locked,
              loadingUser: false,
            });
          }
        },
        error => {
          if (this._isMounted) {
            this.setState({
              errorBannerMessage: __(
                'An error occurred retrieving the user information. Please try again later.',
              ),
              loadingUser: false,
            });
          }
        },
      );
    }
    if (hasPermission(this.props.session, 'Role')) {
      newState.loadingUserRoles = true;
      this.props.createTransaction(roleActions.getAllRoles()).then(
        response => {
          if (this._isMounted) {
            this.setState({
              systemRoles: response,
              loadingUserRoles: false,
            });
          }
        },
        error => {
          if (this._isMounted) {
            this.setState({
              errorBannerMessage: __(
                'An error occurred retrieving the user roles. Please try again later.',
              ),
              loadingUserRoles: false,
            });
          }
        },
      );
    }
    if (this._isMounted) {
      this.setState(newState);
    }
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  /**
   * Called to confirm the update or create. If this is true then it goes to update user otherwise
   * create a new user.
   */
  isEditing = () => this.props.id;

  /**
   * Called to confirm the delete.
   */
  confirmDelete = () => {
    this.props.createTransaction(userActions.remove(this.state.userId)).then(
      response => {
        if (this._isMounted) {
          this.setState({
            removeUser: false,
          });
        }
        this.close();
      },
      error => {
        if (this._isMounted) {
          this.setState({
            errorBannerMessage: __(
              'An error occurred deleting the user information. Please try again later.',
            ),
            removeUser: false,
          });
        }
      },
    );
  };

  canDelete = () => {
    if (this.props.session.user) {
      const isSelf = this.props.session.user.userId === this.props.id;
      return !isSelf;
    }
  };

  close = () => {
    this.props.history.push('/users');
  };

  onChange = propName => event => {
    let value = event;

    if (event && event.target) {
      if (event.target.value !== null && typeof event.target.value !== 'undefined') {
        value = event.target.value;
      }
    }
    this.setState(prevState => ({
      ...updateObjectPropertyWithValue(prevState, propName, value),
      confirm: false,
    }));
  };

  /*
   * Called to verify that both the passwords match and throws an error if both doesn't match and
   * both are not empty
   */
  onBlur = propName => event => {
    const value = event.target.value;
    let fieldErrors = null;
    if (value !== '') {
      if (propName === 'verifyPassword') {
        if (value !== this.state.password) {
          if (!fieldErrors) {
            fieldErrors = new FieldErrors();
          }
          fieldErrors.verifyPassword = {
            property: 'verifyPassword',
            rule: 'no match',
            message: __('Passwords must match'),
          };
          fieldErrors.password = {
            property: 'password',
            rule: 'no match',
            message: __('Passwords must match'),
          };
        }
      }
    } else {
      fieldErrors = null;
    }
    this.setState(prevState => ({
      fieldErrors,
      touched: { ...prevState.touched, [propName]: true },
    }));
  };

  rolesChanged = (newRole, checked) => {
    // Dont modify standard user at all
    if (newRole === 'StandardUser') {
      return;
    }

    if (checked) {
      if (this.state.roles.indexOf(newRole) === -1) {
        this.setState(prevState => ({
          roles: prevState.roles.concat(newRole),
        }));
      }
    } else {
      this.setState(prevState => {
        const roles = [...prevState.roles];
        const index = roles.indexOf(newRole);
        if (index > -1) {
          roles.splice(index, 1);
        }

        return { roles };
      });
    }
  };

  isValid = () => {
    const passwordEmpty = !this.state.password && !this.state.verifyPassword;
    const passwordMatch = this.state.password === this.state.verifyPassword;
    let passwordValid = false;
    if (this.isEditing()) {
      passwordValid = passwordEmpty || passwordMatch;
    } else {
      passwordValid = !passwordEmpty && passwordMatch;
    }
    return this.state.userId && passwordValid;
  };

  /**
   * When save button is clicked in the form, this callback recieves the user to be
   * saved and sends it to the server. If successful save is called. If failed,
   * fieldErrors are passed to the form as needed and a banner message can also be displayed
   * if errors beyond field errors exist.
   * If save fails, shows banner message.
   *
   * @param {object} user The user object to be sent to the server.
   */
  onSaveClicked = () => {
    // Clear existing errors
    this.setState({
      errorBannerMessage: null,
      savingUser: true,
    });
    this.save();
  };

  startProgressIndicator = () => {
    this.timer = setTimeout(
      () =>
        this.setState({
          progress: true,
        }),
      1000,
    );
  };

  stopProgressIndicator = () => {
    clearTimeout(this.timer);
    if (this._isMounted) {
      this.setState({
        progress: false,
      });
    }
  };

  /**
   * saving a user.
   */
  save = async () => {
    this.setState({
      savingUser: true,
    });
    this.startProgressIndicator();
    const user = {
      userId: this.state.userId,
      profile: {
        lastName: this.state.lastName,
        firstName: this.state.firstName,
      },
      password: this.state.password,
      roles: this.state.roles,
    };
    let action;
    if (this.isEditing()) {
      action = userActions.update(user);
    } else {
      action = userActions.create(user);
    }
    this.props.createTransaction(action).then(
      updatedUser => {
        if (this._isMounted) {
          this.setState({
            errorBannerMessage: null,
            fieldErrors: null,
            savingUser: false,
          });
        }
        this.stopProgressIndicator();
        this.close();
      },
      error => {
        const newState = {
          fieldErrors: null,
          errorBannerMessage: null,
          savingUser: false,
        };
        /**
         * displaying duplicate userID error message
         * handles the error response from backend for duplicate userID.
         * checks two conditions: whether the errorField is userID and the rule in response userID
         * object has rule duplicate.
         */
        if (error.fieldErrors) {
          newState.fieldErrors = error.fieldErrors;
          if (
            newState.fieldErrors.hasErrorForField('userId') &&
            newState.fieldErrors.userId.rule === 'Duplicate'
          ) {
            newState.fieldErrors.userId.message = __(
              'User name already exists.Please choose another one.',
            );
          }
          if (
            newState.fieldErrors.hasErrorForField('password') &&
            newState.fieldErrors.password.rule === 'MinLength'
          ) {
            newState.fieldErrors.password.message = __(
              'Password is too short',
            );
          }
        } else {
          let message = '';
          if (error.statusText) {
            message = `${__('Response from server: ')} '${error.statusText}'`;
          }
          newState.errorBannerMessage = `${__('An error occured saving the user.')} ${message}`;
        }
        if (this._isMounted) {
          this.setState(newState);
        }
        this.stopProgressIndicator();
      },
    );
  };

  unlock = () => {
    const user = {
      userId: this.state.userId,
      state: 100,
    };
    this.props.createTransaction(userActions.updateState(user)).then(
      response => {
        this.close();
      },
      error => {
        if (this._isMounted) {
          this.setState({
            errorBannerMessage: __(
              'An error occurred unlocking the user account. Please try again later.',
            ),
          });
        }
      },
    );
  };

  /**
   * setting showConfirmDelete to true to show the modal.
   */
  requestDelete = () => {
    this.setState({
      showConfirmDelete: true,
    });
  };

  /**
   * Called to confirm the close. If the user confirms then `confirmDelete` is called.
   */
  onConfirmClose = isConfirmed => {
    this.setState({
      showConfirmDelete: false,
    });

    if (isConfirmed) {
      this.confirmDelete();
    }
  };

  renderRoleCheckbox = (systemRole, roles) => (
    <Checkbox
      disabled={systemRole.RoleId === 'StandardUser'}
      value={systemRole.RoleId}
      checked={roles.includes(systemRole.RoleId)}
      onChange={(event, checked) => this.rolesChanged(systemRole.RoleId, checked)}
    />
  );

  render = () => {
    const {
      fieldErrors,
      errorBannerMessage,
      loadingUser,
      savingUser,
      loadingUserRoles,
      showConfirmDelete,
      progress,
    } = this.state;

    const requesting = !!(savingUser || loadingUser || loadingUserRoles);
    const disableSave = !this.isValid() || requesting;
    const showRemove = this.isEditing() && this.canDelete();
    const disableRemove = requesting;

    return (
      <FlexContainer column align="start stretch">
        <FlexContainer column>
          <ErrorBanner message={errorBannerMessage} />
          <TextField
            margin="dense"
            label={__('User Name')}
            id="userId"
            name="userId"
            value={this.state.userId}
            disabled={!!this.props.id}
            onChange={this.onChange('userId')}
            error={fieldErrors && fieldErrors.hasErrorForField('userId')}
            helperText={fieldErrors && fieldErrors.getHelperTextForField('userId')}
            required
          />
          <TextField
            margin="dense"
            label={__('First Name')}
            id="firstName"
            onChange={this.onChange('firstName')}
            value={this.state.firstName}
          />
          <TextField
            margin="dense"
            label={__('Last Name')}
            id="lastName"
            onChange={this.onChange('lastName')}
            value={this.state.lastName}
          />
          <TextField
            margin="dense"
            type="password"
            label={__('Password')}
            id="password"
            onChange={this.onChange('password')}
            onBlur={this.onBlur('password')}
            value={this.state.password}
            error={fieldErrors && fieldErrors.hasErrorForField('password')}
            helperText={fieldErrors && fieldErrors.getHelperTextForField('password')}
            required
          />
          <TextField
            margin="dense"
            type="password"
            label={__('Verify Password')}
            id="verifyPassword"
            onChange={this.onChange('verifyPassword')}
            onBlur={this.onBlur('verifyPassword')}
            value={this.state.verifyPassword}
            error={fieldErrors && fieldErrors.hasErrorForField('verifyPassword')}
            helperText={fieldErrors && fieldErrors.getHelperTextForField('verifyPassword')}
            required
          />
          <Authorization classId="Role" action="READ">
            {this.state.systemRoles.length > 0 && (
              <FormGroup className={this.props.classes.roles}>
                <FormLabel>{__('Roles')}</FormLabel>
                {this.state.systemRoles.map(systemRole => (
                  <FormControlLabel
                    key={systemRole.RoleId}
                    label={systemRole.RoleName}
                    control={this.renderRoleCheckbox(systemRole, this.state.roles)}
                  />
                ))}
              </FormGroup>
            )}
          </Authorization>
          <FlexContainer
            column
            align="space-between stretch"
            classes={{ root: this.props.classes.buttonGroup }}
          >
            {this.state.locked == true && (
              <Authorization classId="User" action="UPDATE">
                <Button variant="contained" onClick={this.unlock} disabled={disableSave}>
                  {__('Unlock')}
                </Button>
              </Authorization>
            )}
            <Authorization classId="User" action="UPDATE">
              <Button
                variant="contained"
                color="primary"
                onClick={this.onSaveClicked}
                disabled={disableSave}
              >
                {savingUser && progress ? (
                  <CircularProgress variant="indeterminate" size={20} />
                ) : (
                  __('Save')
                )}
              </Button>
            </Authorization>
          </FlexContainer>
          <FlexContainer
            column
            align="center stretch"
            classes={{ root: this.props.classes.buttonGroup }}
          >
            {showRemove && (
              <Authorization classId="User" action="DELETE">
                <Button onClick={this.requestDelete} disabled={disableRemove}>
                  {__('Remove User')}
                </Button>
              </Authorization>
            )}
            <ConfirmationDialog
              open={showConfirmDelete}
              onClose={this.onConfirmClose}
              message={__('Are you sure you want to remove the user?')}
              title={__('Confirm User Removal')}
              okButtonText={__('Remove User')}
            />
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    );
  };
}

const mapPropsToState = state => ({
  session: state.session,
});

export default withStyles({
  roles: {
    marginTop: '25px',
  },
  buttonGroup: {
    paddingTop: '25px',
    '& > button': {
      marginTop: '10px',
    },
  },
})(connect(mapPropsToState)(withTransaction(withRouter(UserEditPage))));
