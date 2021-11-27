import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getFieldErrorsFromResponse } from 'lib/form';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

/**
 * HOC that wraps a component and provides easy access to API calls and error handling.
 */
export function withTransaction(WrappedComponent) {
  class WithTransaction extends React.Component {
    // Because prettier.... https://github.com/prettier/prettier/issues/3465
    /* eslint-disable implicit-arrow-linebreak */
    /**
     * Creates a transaction using the provided action and returns a promise that will be
     * fufilled when that action is resolved.
     * The action must be a thunk that returns a promise.
     *
     * @param {function} action The thunk that returns a promise.
     * @param {object} opts Options
     * @param {bool} opts.parseFieldErrors If true, will parse fieldErrors if the promise fails and
     * return them as a property on the rejected error object. If false, will return the error
     * object as is from the thunk.
     * @return {Promise} Resolves when the thunk resolves. If rejected and `opts.parseFieldErrors`
     * is `true` then the rejected error will contain `fieldErrors` property to be passed to forms.
     */
    createTransaction = (action, opts = { parseFieldErrors: true }) =>
      new Promise((resolve, reject) => {
        const { dispatchAction } = this.props;
        dispatchAction(action).then(
          response => {
            resolve(response);
          },
          response => {
            if (response.status == 400 && opts.parseFieldErrors) {
              reject({
                ...response,
                fieldErrors: getFieldErrorsFromResponse(response),
              });
            } else {
              reject(response);
            }
          },
        );
      });
    /* eslint-disable implicit-arrow-linebreak */

    createTransactions = () =>
      // actions) => {
      // Provide a list of actions as a param and return a promise for all
      // Promise.all();
      // We can also provide an optional callback for updates when each promise succeeds
      // for progress indication.
      // We may also need to specify if we can pipline or not. So
      // the list of actions must either be sequencial or can be run
      // all at once aka Promise.all().
      new Promise(resolve => resolve());

    render() {
      return (
        <WrappedComponent
          createTransaction={this.createTransaction}
          createTransactions={this.createTransactions}
          {...this.props}
        />
      );
    }
  }

  WithTransaction.displayName = `withTransaction(${getDisplayName(WrappedComponent)})`;
  WithTransaction.propTypes = {
    dispatchAction: PropTypes.func,
  };
  return WithTransaction;
}

const mapDispatchToProps = dispatch => ({
  dispatchAction: action => dispatch(action),
});

export function withTransactionConnected(WrappedComponent) {
  return connect(
    null,
    mapDispatchToProps,
  )(withTransaction(WrappedComponent));
}

export default withTransactionConnected;
