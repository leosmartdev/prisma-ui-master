/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *
 * Dialog for assigning a Note.
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import ErrorBanner from 'components/error/ErrorBanner';
import IncidentList from 'components/notes/IncidentList';

import {
  Button,
  IconButton,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Divider,
  CircularProgress,
  Tooltip,
} from '@material-ui/core';

// Icons
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

// Actions  & Helpers
import { listIncidents } from 'incident/incident';

const propTypes = {
  /** @private connect(mapStateToProps) */
  currentNote: PropTypes.object,

  /**
   * Opens/Closes the modal. When true, modal is open. See `<Dialog />` in Material-UI
   */
  open: PropTypes.bool.isRequired,
  /**
   * Title for the dialog.
   */
  title: PropTypes.string,
  /**
   * Message to display above the search box.
   */
  message: PropTypes.string,
  /**
   * Title for the dialog when confirming the selection.
   */
  selectedTitle: PropTypes.string,
  /**
   * Message to display above the selected item when confirming the selection.
   */
  selectedMessage: PropTypes.string,
  /**
   * Callback called when the modal closes. Passed a boolean parameter to inform if the
   * user clicked ok or cancel, and if OK was clicked.
   *
   * It is expected that the callback will handle closing the modal.
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
   * Error banner to display on the dialog when the assign fails. This is for controlling component
   * to set errors, for data load errors, see state.dataLoadErrorBannerText
   */
  errorBannerText: PropTypes.string,
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
  title: __('Assign Note'),
  message: __(
    'Pick an incident from the list below or start typing to search. Click the incident to select it then click Assign.',
  ),
  selectedTitle: __('Confirm Assignment'),
  selectedMessage: __(
    'The note will be assigned to the incident listed below. Click Assign to finish assigning the Note, or you can remove this incident to go back and select another from the list.',
  ),
  okButtonText: __('Assign'),
  cancelButtonText: __('Cancel'),
  errorBannerText: null,
};

class AssignNoteDialog extends React.Component {
  _isMounted = false;

  state = {
    /**
     * Data loaded from the server.
     */
    data: [],
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
    dataLoadErrorBannerText: null,
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
    this.setState({ isLoading: true });
    this.props.onClose(true, this.props.currentNote.note.id, this.state.selection.id);
    this.setState({ isLoading: false });
  };

  /**
   * Callback when cancel button is clicked. Will call onClose
   * with false.
   */
  onCancelClicked = () => {
    this.props.onClose(false);

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
      const action = listIncidents();
      const data = await createTransaction(action);
      if (this._isMounted) {
        this.setState({
          data,
          filteredData: data,
          dataLoadErrorBannerText: null,
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
   * For Users, the list will be filtered using a string lookup on the following
   * properties of an incident:
   *  - incidentId
   *  - name
   *
   * @param {string} query The query string as entered by the user in the search box.
   */
  onSearch = query => {
    const { data } = this.state;
    const regex = RegExp(query);
    let filteredData = data;

    if (query !== '') {
      filteredData = data.filter(item => regex.test(item.incidentId) || regex.test(item.name));
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
    log.error('Failed to get incidents for modal list', error);
    let dataLoadErrorBannerText = null;

    switch (error.status) {
      case 401:
      case 403: {
        dataLoadErrorBannerText = __(
          'Your account does not have the correct permissions to access this page. Contact your administrator.',
        );
        break;
      }
      default: {
        dataLoadErrorBannerText = __(
          'Sorry, we encountered a problem getting the list of incidents from the server. Please try again later.',
        );
      }
    }

    if (this._isMounted) {
      this.setState({
        dataLoadErrorBannerText,
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
      errorBannerText,
    } = this.props;

    const {
      query,
      selection,
      filteredData,
      searching,
      dataLoadErrorBannerText,
      isLoading,
    } = this.state;

    return (
      <Dialog
        maxWidth="sm"
        aria-labelledby="assign-note-dialog-title"
        onEnter={this.onEnter}
        open={open}
      >
        <DialogTitle id="assign-note-dialog-title">
          {selection ? selectedTitle : title}
        </DialogTitle>
        <DialogContent>
          <ErrorBanner message={errorBannerText} key="error_banner" />
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
              <ErrorBanner message={dataLoadErrorBannerText} />
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
                  <IncidentList
                    incidents={filteredData}
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
                <IncidentList incidents={[selection]} />
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
          <Button onClick={this.onCancelClicked} color="default">
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
            {isLoading ? 'Loading' : okButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AssignNoteDialog.propTypes = propTypes;
AssignNoteDialog.defaultProps = defaultProps;

const mapStateToProps = state => ({
  currentNote: state.notes.currentNote,
});

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
}))(
  withTransaction(
    connect(
      mapStateToProps
    )(AssignNoteDialog)
  )
);
