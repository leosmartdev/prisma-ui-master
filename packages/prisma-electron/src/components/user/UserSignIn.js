import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';

import {
  Slide,
  Dialog,
  CircularProgress,
  Typography,
  TextField,
  Button,
} from '@material-ui/core';

// Icons
import LogoIcon from 'resources/svg/Logo';

// Helpers & Actions
import { createSession, deleteSession } from 'session/session';
import * as profileActions from 'session/profile';
import * as transaction from 'server/transaction';
import { getHelperTextForField, getFieldErrorsFromResponse } from 'lib/form';

// const resources = `${__dirname}/../../resources`;

const styles = theme => ({
  root: {
    zIndex: '9001 !important',
  },
  paper: {
    backgroundColor: theme.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 500,
  },
  container: {
    width: 500,
    height: '100vh',
  },
  button: {
    margin: 15,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 40,
    width: 500,
  },
  logo: {
    marginRight: 10,
    marginBottom: 6,
  },
  about: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 10,
    textAlign: 'center',
  },
  errMessage: {
    color: theme.palette.error[400],
  },
  progress: {
    margin: `0 ${theme.spacing(2)}px`,
    color: theme.palette.error[400],
  },
});

class UserSignIn extends React.Component {
  constructor(props) {
    super(props);
    this.transactionId = null;
    this.updatePasswordTransactionId = null;
    this.state = {
      open: true,
      username: '',
      password: '',
      verifyPassword: '',
      mode: 'initial',
      fieldErrors: {},
    };
  }

  handleEnter = event => {
    // Enter clicked
    if (event.keyCode === 13 && this.state.open) {
      this.handleSubmit();
    }
  };

  handleSubmit = () => {
    if (this.state.mode === 'update') {
      this.deleteTransaction();
      this.updatePasswordTransactionId = this.props.updatePassword(this.state.username, {
        password: this.state.password,
        verifyPassword: this.state.verifyPassword,
      });
    } else {
      this.transactionId = this.props.createSession({
        userName: this.state.username,
        token: this.state.password,
      });
    }
  };

  handleLogout = () => {
    this.props.deleteSession();
  };

  deleteTransaction = () => {
    if (this.transactionId) {
      this.props.deleteTransaction(this.transactionId);
      this.transactionId = null;
    }
  };

  componentWillReceiveProps(nextProps) {
    let fieldErrors = {};
    this.transactionId = this.transactionId || this.updatePasswordTransactionId;
    if (this.transactionId) {
      const transaction = nextProps.transactions[this.transactionId];
      if (transaction !== undefined) {
        if (transaction.response !== undefined) {
          this.deleteTransaction();
          if (this.updatePasswordTransactionId) {
            this.updatePasswordTransactionId = null;
            this.transactionId = this.props.createSession({
              userName: this.state.username,
              token: this.state.password,
            });
            return;
          }
        } else if (transaction.error !== undefined) {
          fieldErrors = getFieldErrorsFromResponse(transaction.error);
        }
      }
    }
    const { permissions, state, user } = nextProps.session;
    const modeUpdatePassword = permissions.length === 1 && permissions[0].classId === 'Profile';
    if (state !== 'initial') {
      if (modeUpdatePassword) {
        if (this.transactionId) {
          this.setState({
            open: true,
            verifyPassword: '',
            username: user.userId,
            mode: 'update',
            fieldErrors,
          });
        } else {
          this.setState({
            open: true,
            password: '',
            verifyPassword: '',
            username: user.userId,
            mode: 'update',
            fieldErrors,
          });
        }
      } else if (state === 'terminated') {
        this.setState({
          open: true,
          username: '',
          password: '',
          verifyPassword: '',
          mode: 'initial',
          fieldErrors,
        });
      } else {
        this.setState({
          open: false,
          username: '',
          password: '',
          verifyPassword: '',
          mode: 'initial',
          fieldErrors,
        });
      }
    }
    if (state === 'initial') {
      if (this.state.fieldErrors !== {}) {
        if (
          fieldErrors.token &&
          fieldErrors.token.rule === 'MinLength'
        ) {
          fieldErrors.token.message = __(
            'Password is too short',
          );
        }
        this.setState(prevState => ({
          open: true,
          username: prevState.username,
          password: prevState.password,
          verifyPassword: '',
          mode: 'initial',
          fieldErrors,
        }));
      } else {
        this.setState({
          open: true,
          username: '',
          password: '',
          verifyPassword: '',
          mode: 'initial',
          fieldErrors,
        });
      }
    }
    if (state === 'idled') {
      this.setState({
        open: true,
        username: user.userId,
        password: '',
        verifyPassword: '',
        mode: 'reauth',
        fieldErrors,
      });
    }
  }

  Transition = React.forwardRef((props, ref) => (
    <Slide direction="down" ref={ref} {...props} />
  ));

  render() {
    const classes = this.props.classes;
    const dialogClasses = { paper: classes.paper, root: classes.root };
    const limit = this.props.session.attempts > 4;
    const terminated = this.props.session.state === 'terminated';
    const ready = this.state.password !== '' && this.state.username !== '';
    const policy = this.props.policy;
    const modeReauth = this.state.mode === 'reauth';
    const modeChangePassword = this.state.mode === 'update';
    const connectionError = this.props.session.connectionError;
    return (
      <Dialog
        fullScreen
        open={this.state.open}
        classes={dialogClasses}
        TransitionComponent={this.Transition}
      >
        <FlexContainer column align="center center" className={classes.container}>
          <FlexContainer align="center center">
            <LogoIcon width="96" height="96" />
            <Typography variant="h3" align="center" style={{ marginTop: '16px' }}>
              {` ${this.props.brand.name || __('PRISMA')} `}
            </Typography>
          </FlexContainer>
          <TextField
            id="username"
            label={__('user name')}
            className={classes.textField}
            margin="normal"
            onKeyDown={this.handleEnter}
            onChange={event => this.setState({ username: event.target.value })}
            value={this.state.username}
            disabled={modeChangePassword || modeReauth}
            error={this.state.fieldErrors.userName !== undefined}
            helperText={getHelperTextForField('userName', this.state.fieldErrors)}
          />
          <TextField
            id="password"
            label={__('password')}
            className={classes.textField}
            type="password"
            autoComplete="current-password"
            margin="normal"
            onKeyDown={this.handleEnter}
            value={this.state.password}
            onChange={event => this.setState({ password: event.target.value })}
            error={this.state.fieldErrors.token !== undefined}
            helperText={getHelperTextForField('token', this.state.fieldErrors)}
          />
          {modeChangePassword && (
            <TextField
              id="confirm"
              label={__('confirm')}
              className={classes.textField}
              type="password"
              autoComplete="current-password"
              margin="normal"
              onKeyDown={this.handleEnter}
              value={this.state.verifyPassword}
              onChange={event => this.setState({ verifyPassword: event.target.value })}
              error={this.state.fieldErrors.token !== undefined}
              helperText={getHelperTextForField('token', this.state.fieldErrors)}
            />
          )}
          <div className={classes.button}>
            {limit && (
              <Button variant="contained" color="primary" onClick={this.handleSubmit}>
                {__('reset')}
              </Button>
            )}
            {!limit && ready && (
              <Button variant="contained" color="primary" onClick={this.handleSubmit}>
                {__('login')}
              </Button>
            )}
            {modeReauth && !ready && (
              <Button variant="contained" onClick={this.handleLogout}>
                {__('logout')}
              </Button>
            )}
          </div>
          {connectionError && (
            <FlexContainer column align="start center">
              <Typography variant="h5" gutterBottom classes={{ root: classes.errMessage }}>
                {__('Server unreachable.  Contact administrator.')}
              </Typography>
              <FlexContainer align="center center">
                <CircularProgress size={36} />
                <Typography variant="subtitle1">{__('Retrying connection.')}</Typography>
              </FlexContainer>
            </FlexContainer>
          )}
          {modeReauth && (
            <Typography variant="h5" gutterBottom classes={{ root: classes.errMessage }}>
              {__('Enter password.  Session idled.')}
            </Typography>
          )}
          {terminated && (
            <Typography variant="h5" gutterBottom classes={{ root: classes.errMessage }}>
              {__('Session terminated.')}
            </Typography>
          )}
        </FlexContainer>
        {!modeReauth && policy && (
          <div className={classes.footer}>
            <Typography variant="h5">{__('Security Policy')}</Typography>
            <Typography variant="caption">{policy}</Typography>
          </div>
        )}
        {!modeReauth && (
          <div className={classes.about}>
            <Typography variant="caption">
              {__('Version {{version}}', { version: this.props.brand.version })}
              {this.props.brand.releaseDate && ` / ${this.props.brand.releaseDate}`}
              {this.props.brand.commitDisplay && ` / git${this.props.brand.commitDisplay}`}
              {this.props.brand.git && ` / ${this.props.brand.git}`}
            </Typography>
          </div>
        )}
      </Dialog>
    );
  }
}

UserSignIn.propTypes = {
  policy: PropTypes.string,
  classes: PropTypes.object.isRequired, // withStyles provided
  createSession: PropTypes.func.isRequired, // connect provided
  deleteSession: PropTypes.func.isRequired, // connect provided
  updatePassword: PropTypes.func.isRequired, // connect provided
  session: PropTypes.object.isRequired, // connect provided
  transactions: PropTypes.object.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
  brand: PropTypes.object.isRequired, // connect provided
};

const mapStateToProps = state => ({
  session: state.session,
  transactions: state.transactions,
  brand: state.config.brand,
  policy: state.config.policy ? state.config.policy.description : null,
});

const mapDispatchToProps = dispatch => ({
  createSession: payload => {
    const transactionId = transaction.generateTransactionId();
    dispatch(transaction.createTransaction(transactionId));
    dispatch(createSession(transactionId, payload));
    return transactionId;
  },
  deleteSession: () => {
    dispatch(deleteSession());
  },
  updatePassword: (userId, profile) => {
    const transactionId = transaction.generateTransactionId();
    dispatch(transaction.createTransaction(transactionId));
    dispatch(profileActions.saveProfile(transactionId, userId, profile));
    return transactionId;
  },
  deleteTransaction: transactionId => {
    dispatch(transaction.deleteTransaction(transactionId));
  },
});

export default (UserSignIn = withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(UserSignIn),
));
