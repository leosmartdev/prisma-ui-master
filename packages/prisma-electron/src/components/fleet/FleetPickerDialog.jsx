import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import loglevel from 'loglevel';
import { __ } from 'lib/i18n';

// Components
import PrimaryButton from 'components/PrimaryButton';
import ErrorBanner from 'components/error/ErrorBanner';
import FleetList from 'components/fleet/FleetList';
import { FlexContainer } from 'components/layout/Container';

import {
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Divider,
  CircularProgress,
} from '@material-ui/core';

// Actions
import { getFleets, searchFleets } from 'fleet/fleet';

const log = loglevel.getLogger('fleet');

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
   * Title for when a fleet is selected and user is confirming their fleet choice.
   */
  fleetSelectedTitle: PropTypes.string,
  /**
   * Message to display above the search box.
   */
  message: PropTypes.string,
  /**
   * Message to display above the selected fleet when the user
   * has clicked a fleet to select it.
   */
  fleetSelectedMessage: PropTypes.string,
  /**
   * Callback called when the modal closes. Passed a boolean parameter to inform if the
   * user clicked ok or cancel, and if OK was clicked then a second parameter containing
   * the fleet will be passed.
   *
   * It is expected that the callback will handle closing the modal.
   *
   * ### Signature
   * ```
   * onClose(okClicked: bool, fleet: object) => void
   * ```
   */
  onClose: PropTypes.func.isRequired,
  /**
   * String to be used for the OK button.
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
  title: __('Pick a Fleet'),
  fleetSelectedTitle: __('Confirm Selection'),
  message: __(
    'Pick a fleet from the list below or start typing to search for fleets by Fleet name or Fleet owner information. Click the fleet to select it then click Choose.',
  ),
  fleetSelectedMessage: __(
    'Click Choose to confirm the fleet selection, or clear the selection and select another fleet.',
  ),
  okButtonText: __('Choose'),
  cancelButtonText: __('Cancel'),
};

class FleetPickerDialog extends React.Component {
  _isMounted = false;

  state = {
    /**
     * Fleet selected by the user. When null the search and fleets list will be displayed.
     */
    selectedFleet: null,
    /**
     * Query string from the search box.
     */
    query: '',
    /**
     * When an error occurs getting fleets, this will be set as a string message to display
     * in an error banner.
     */
    errorBannerText: null,
    /**
     * When true, a fleets load is in progress.
     */
    searching: false,
  };

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  /**
   * Get fleets on initial display of the modal.
   */
  onEnter = () => {
    this.getFleets();
  };

  /**
   * Called when search input changes will set query string and reload fleets.
   */
  onChange = event => {
    const query = event.target.value;
    this.setState({ query });

    this.getFleets(query);
  };

  /**
   * Callback when ok button is clicked. Will call onClose
   * passed into props with the fleet that was selected.
   */
  onOkClicked = () => {
    this.props.onClose(true, this.state.selectedFleet);

    this.setState({
      fleets: [],
      selectedFleet: null,
      query: '',
    });
  };

  /**
   * Callback when cancel button is clicked. Will call onClose
   * with false.
   */
  onCancelClicked = () => {
    this.props.onClose(false);

    this.setState({
      fleets: [],
      selectedFleet: null,
      query: '',
    });
  };

  /**
   * Clears the current fleet selection.
   */
  clearSelection = () => {
    this.setState({ selectedFleet: null });
  };

  /**
   * Callback when the fleet is selected in the list.
   */
  fleetSelected = selectedFleet => {
    this.setState({ selectedFleet });
  };

  /**
   * Creates a transaction to retrieve the fleets from fleets search..
   * When the promise resolves, the state is updated to
   * display the fleets.
   *
   * @param {string} query When provided `/search/fleets?query=` will be called
   * instead of the `/fleets` endpoint.
   */
  getFleets = async query => {
    const { createTransaction } = this.props;

    // set loading indicator
    this.setState({ searching: true });

    let action = getFleets();
    if (query && query !== '') {
      action = searchFleets(query);
    }

    try {
      const fleets = await createTransaction(action);
      if (this._isMounted) {
        this.setState({
          fleets,
          errorBannerText: null,
          searching: false,
        });
      }
    } catch (error) {
      this.fleetsLoadFailed(error);
    }
  };

  /**
   * Callback used when getFleets transaction fails. Error object is provided as the only object.
   * @param {object} error - The error returned from the server or the internal error dictating
   *                         the failure.
   */
  fleetsLoadFailed(error) {
    log.error('Failed to get fleets', error);
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
          'Sorry, we encountered a problem getting Fleets from the server. Please try again later.',
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
      fleetSelectedTitle,
      message,
      fleetSelectedMessage,
      cancelButtonText,
      okButtonText,
      classes,
      open,
    } = this.props;

    const { query, selectedFleet, errorBannerText, fleets, searching } = this.state;

    return (
      <Dialog
        maxWidth="sm"
        aria-labelledby="fleet-picker-dialog-title"
        onEnter={this.onEnter}
        open={open}
      >
        <DialogTitle id="fleet-picker-dialog-title">
          {selectedFleet ? fleetSelectedTitle : title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {selectedFleet ? fleetSelectedMessage : message}
          </Typography>
          {selectedFleet === null ? (
            <React.Fragment>
              <TextField
                placeholder={__('Search Fleets')}
                fullWidth
                value={query}
                onChange={this.onChange}
              />
              <ErrorBanner message={errorBannerText} key="error_banner" />
              {searching ? (
                <FlexContainer className={classes.fleetList} column align="center center">
                  <CircularProgress
                    color="primary"
                    className={classes.progress}
                    variant="indeterminate"
                  />
                </FlexContainer>
              ) : (
                <FleetList
                  fleets={fleets || []}
                  onClick={this.fleetSelected}
                  className={classes.fleetList}
                />
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Divider />
              <FlexContainer align="space-between center" className={classes.selectionContainer}>
                <Typography variant="subtitle1">
                  {selectedFleet.name || selectedFleet.id}
                </Typography>
                <Button onClick={this.clearSelection}>{__('Clear Selection')}</Button>
              </FlexContainer>
              <Divider />
            </React.Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.onCancelClicked()} color="default">
            {cancelButtonText}
          </Button>
          <PrimaryButton onClick={this.onOkClicked} disabled={selectedFleet === null}>
            {okButtonText}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    );
  }
}

FleetPickerDialog.propTypes = propTypes;
FleetPickerDialog.defaultProps = defaultProps;

export default withStyles(theme => ({
  fleetList: {
    minHeight: '250px',
    maxHeight: '250px',
    overflow: 'auto',
  },
  progress: {
    color: theme.palette.primary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
  selectionContainer: {
    width: '100%',
  },
}))(withTransaction(FleetPickerDialog));
