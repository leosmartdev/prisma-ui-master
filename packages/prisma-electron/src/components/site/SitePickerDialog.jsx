/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import loglevel from 'loglevel';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';
import ErrorBanner from 'components/error/ErrorBanner';
import SiteList from 'components/site/SiteList';

import {
  Button,
  IconButton,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Tooltip,
} from '@material-ui/core';

// Icons
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

// Actions
import { getSites } from 'site/site';

const log = loglevel.getLogger('site');

const propTypes = {
  /**
   * Opens/Closes the modal. When true, modal is open. See `<Dialog />` in Material-UI
   */
  open: PropTypes.bool.isRequired,
  /**
   * Title for the dialog.
   */
  title: PropTypes.string,
  /**
   * Title for when a selection has been made and user is confirming their choice.
   */
  selectedTitle: PropTypes.string,
  /**
   * Message to display above the search box.
   */
  message: PropTypes.string,
  /**
   * Message to display above the selection when the user has clicked an item to select it.
   */
  selectedMessage: PropTypes.string,
  /**
   * Callback called when the modal closes. Passed a boolean parameter to inform if the
   * user clicked ok or cancel, and if OK was clicked then a second parameter containing
   * the fleet will be passed.
   *
   * It is expected that the callback will handle closing the modal.
   *
   * ### Signature
   * ```
   * onClose(okClicked: bool, site: object) => void
   * ```
   */
  onClose: PropTypes.func.isRequired,
  /**
   * String to be used for the OK button. Button is disabled during the selection phase.
   */
  okButtonText: PropTypes.string,
  /**
   * String to be used for the Cancel button.
   */
  cancelButtonText: PropTypes.string,
  /**
   * @private
   * withStyles
   */
  classes: PropTypes.object.isRequired,
  /**
   * @private withTransaction
   */
  createTransaction: PropTypes.func.isRequired,
};

const defaultProps = {
  title: __('Select'),
  selectedTitle: __('Confirm Selection'),
  message: __(
    'Pick an item from the list below or start typing to search. Click the item to select it then click Choose.',
  ),
  selectedMessage: __(
    'Click Choose to confirm the selection, or clear the selection and select another item.',
  ),
  okButtonText: __('Choose'),
  cancelButtonText: __('Cancel'),
};

class SitePickerDialog extends React.Component {
  _isMounted = false;

  state = {
    /**
     * Selection by the user. When null the search and list of items will be displayed.
     */
    selection: null,
    /**
     * Query string from the search box.
     */
    query: '',
    /**
     * When an error occurs getting data, this will be set as a string message to display
     * in an error banner.
     */
    errorBannerText: null,
    /**
     * When true, a load is in progress.
     */
    searching: false,
  };

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  /**
   * Get data on initial display of the modal.
   */
  onEnter = () => {
    this.getData();
  };

  /**
   * Called when search input changes will set query string and reload data.
   */
  onChange = event => {
    const query = event.target.value;
    this.setState({ query });

    this.onSearch(query);
  };

  /**
   * Callback when ok button is clicked. Will call onClose
   * passed into props with the selection object.
   */
  onOkClicked = () => {
    const { onClose } = this.props;
    const { selection } = this.state;

    onClose(true, selection);

    this.setState({
      data: [],
      selection: null,
      query: '',
    });
  };

  /**
   * Callback when cancel button is clicked. Will call onClose
   * with false.
   */
  onCancelClicked = () => {
    const { onClose } = this.props;
    onClose(false);

    this.setState({
      data: [],
      selection: null,
      query: '',
    });
  };

  /**
   * Clears the current selection.
   */
  clearSelection = () => {
    this.setState({ selection: null });
  };

  /**
   * Callback when an item is selected in the list.
   */
  onSelection = selection => {
    this.setState({ selection });
  };

  /**
   * Creates a transaction to retrieve the data..
   * When the promise resolves, the state is updated to
   * display the list.
   */
  getData = async () => {
    const { createTransaction } = this.props;

    // set loading indicator
    this.setState({ searching: true });

    try {
      const action = getSites();
      const data = await createTransaction(action);
      if (this._isMounted) {
        this.setState({
          data,
          filteredData: data,
          errorBannerText: null,
          searching: false,
        });
      }
    } catch (error) {
      this.loadFailed(error);
    }
  };

  /**
   * Called when the user has typed in a search query. This function will
   * filter the results based on that query.
   *
   * For Sites, the list will be filtered using a string lookup on the following
   * properties of a site:
   *  - type
   *  - name
   *
   * @param {string} query The query string as entered by the user in the search box.
   */
  onSearch = query => {
    const { data } = this.state;
    const regex = RegExp(query);
    let filteredData = data;

    if (query !== '') {
      filteredData = data.filter(item => regex.test(item.type) || regex.test(item.name));
    }

    this.setState({
      filteredData,
    });
  };

  /**
   * Callback used when getData transaction fails. Error object is provided as the only object.
   * @param {object} error - The error returned from the server or the internal error dictating
   *                         the failure.
   */
  loadFailed(error) {
    log.error('Failed to get sites for modal list', error);
    let errorBannerText = null;

    switch (error.status) {
      case 401:
      case 403: {
        errorBannerText = __(
          'Your account does not have the correct permissions to access this page. Contact your administrator.',
        );
        break;
      }
      default: {
        errorBannerText = __(
          'Sorry, we encountered a problem getting the list of Sites from the server. Please try again later.',
        );
      }
    }

    if (this._isMounted) {
      this.setState({
        errorBannerText,
        searching: false,
      });
    }
  }

  render() {
    const {
      title,
      selectedTitle,
      message,
      selectedMessage,
      cancelButtonText,
      okButtonText,
      classes,
      open,
    } = this.props;

    const { query, selection, errorBannerText, filteredData, searching } = this.state;

    return (
      <Dialog
        maxWidth="sm"
        aria-labelledby="site-picker-dialog-title"
        onEnter={this.onEnter}
        open={open}
      >
        <DialogTitle id="site-picker-dialog-title">{selection ? selectedTitle : title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom className={classes.message}>
            {selection ? selectedMessage : message}
          </Typography>
          {selection === null ? (
            <React.Fragment>
              <TextField
                placeholder={__('Search')}
                fullWidth
                value={query}
                onChange={this.onChange}
              />
              <ErrorBanner message={errorBannerText} />
              {searching ? (
                <FlexContainer className={classes.list} column align="center center">
                  <CircularProgress
                    color="primary"
                    className={classes.progress}
                    type="indeterminate"
                  />
                </FlexContainer>
              ) : (
                open && (
                  <SiteList
                    sites={filteredData}
                    onClick={this.onSelection}
                    className={classes.list}
                  />
                )
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Divider />
              <FlexContainer align="space-between center" className={classes.selectionContainer}>
                <SiteList sites={[selection]} />
                <Tooltip title={__('Clear Selection')}>
                  <IconButton onClick={this.clearSelection}>
                    <RemoveCircleIcon />
                  </IconButton>
                </Tooltip>
              </FlexContainer>
              <Divider />
            </React.Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.onCancelClicked()} color="default">
            {cancelButtonText}
          </Button>
          <Button
            onClick={this.onOkClicked}
            color="primary"
            classes={{
              textPrimary: classes.okButton,
              disabled: classes.okButtonDisabled,
            }}
            disabled={selection === null}
          >
            {okButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

SitePickerDialog.propTypes = propTypes;
SitePickerDialog.defaultProps = defaultProps;

export default withStyles(theme => ({
  list: {
    minHeight: '250px',
    maxHeight: '250px',
    height: '250px',
    overflow: 'auto',
  },
  okButton: {
    color: theme.palette.primary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
  okButtonDisabled: {
    color: theme.palette.text.disabled,
  },
  progress: {
    color: theme.palette.primary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
  selectionContainer: {
    width: '100%',
  },
  message: {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
}))(withTransaction(SitePickerDialog));
