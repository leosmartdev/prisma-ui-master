import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { __ } from 'lib/i18n';

// Component Imports
import ErrorBanner from 'components/error/ErrorBanner';
import { FlexContainer } from 'components/layout/Container';

import {
  Avatar,
  Button,
  TextField,
} from '@material-ui/core';

import { avatarInitials } from 'lib/user_helpers';

// Helpers & Actions
import * as profileActions from 'session/profile';
import * as transaction from 'server/transaction';
import { getFieldErrorsFromResponse, getHelperTextForField } from 'lib/form';

const styles = {
  avatar: {
    alignSelf: 'center',
    width: '128px',
    height: '128px',
    marginBottom: '20px',
  },
  innerContent: {
    flexGrow: '1',
  },
};

/**
 * UserProfile
 */
class EditProfile extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.transactionId = null;

    this.state = {
      loading: false,
      fieldErrors: {},
      profile: {
        profile: props.user.profile,
        password: '',
        verifyPassword: '',
      },
    };
  }

  componentWillReceiveProps(props) {
    if (this.transactionId) {
      const transaction = props.transactions[this.transactionId];
      if (transaction !== undefined) {
        this.setState({
          ...transaction,
        });
        if (transaction.response !== undefined) {
          // route back to profile
          this.props.history.push('/profile');
        } else if (transaction.error !== undefined) {
          this.setState({
            fieldErrors: getFieldErrorsFromResponse(transaction.error),
            error: transaction.error,
          });
        }
      }
    }

    if (props.user !== this.props.user) {
      this.setState(prevState => ({
        profile: {
          ...prevState.profile,
          profile: {
            firstName: props.user.profile.firstName || '',
            lastName: props.user.profile.lastName || '',
          },
        },
      }));
    }
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.deleteTransaction();
  }

  deleteTransaction() {
    if (this.transactionId) {
      this.props.deleteTransaction(this.transactionId);
      this.transactionId = null;
    }
  }

  onSave = () => {
    this.deleteTransaction();
    this.transactionId = this.props.saveProfile(this.props.user.userId, this.state.profile);
    if (this._isMounted) {
      this.setState(prevState => ({
        loading: true,
        profile: {
          ...prevState.profile,
          verifyPassword: '',
        },
      }));
    }
  };

  onChange = event => {
    let { id, value } = event.target
    if (id === 'firstName' || id === 'lastName') {
      this.setState(prevState => ({
        profile: {
          ...prevState.profile,
          profile: {
            ...prevState.profile.profile,
            [id]: value,
          },
        },
      }));
    } else {
      this.setState(prevState => ({
        profile: {
          ...prevState.profile,
          [id]: value,
        },
      }));
    }
  };

  render() {
    let errorBanner = null;
    if (this.state.error !== undefined && this.state.fieldErrors === {}) {
      errorBanner = <ErrorBanner message="Failed to save profile" />;
    }
    return (
      <FlexContainer column align="start stretch">
        <Avatar className={this.props.classes.avatar}>{avatarInitials(this.props.user)}</Avatar>
        {errorBanner}
        <FlexContainer column align="start stretch">
          <TextField
            id="firstName"
            label={__('First Name')}
            margin="normal"
            value={this.state.profile.profile.firstName || ''}
            onChange={this.onChange}
          />
          <TextField
            id="lastName"
            label={__('Last Name')}
            margin="normal"
            value={this.state.profile.profile.lastName || ''}
            onChange={this.onChange}
          />
          <TextField
            id="password"
            label={__('Password')}
            margin="normal"
            type="password"
            value={this.state.profile.password || ''}
            onChange={this.onChange}
            error={this.state.fieldErrors && this.state.fieldErrors.password !== undefined}
            helperText={getHelperTextForField('password', this.state.fieldErrors)}
          />
          <TextField
            id="verifyPassword"
            label={__('Verify Password')}
            margin="normal"
            type="password"
            value={this.state.profile.verifyPassword || ''}
            onChange={this.onChange}
            error={this.state.fieldErrors && this.state.fieldErrors.verifyPassword !== undefined}
            helperText={getHelperTextForField('verifyPassword', this.state.fieldErrors)}
          />
          <Button variant="contained" color="primary" onClick={this.onSave}>
            {__('Save')}
          </Button>
        </FlexContainer>
      </FlexContainer>
    );
  }
}

EditProfile.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  // state to props
  user: PropTypes.object,
  transactions: PropTypes.object.isRequired,
  // dispatch to props
  saveProfile: PropTypes.func.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  user: state.session.user || { userId: '', profile: {} },
  transactions: state.transactions,
});

const mapDispatchToProps = dispatch => ({
  saveProfile: (userId, profile) => {
    const transactionId = transaction.generateTransactionId();
    dispatch(transaction.createTransaction(transactionId));
    dispatch(profileActions.saveProfile(transactionId, userId, profile));
    return transactionId;
  },
  deleteTransaction: transactionId => {
    dispatch(transaction.deleteTransaction(transactionId));
  },
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withStyles(styles)(EditProfile)),
);
