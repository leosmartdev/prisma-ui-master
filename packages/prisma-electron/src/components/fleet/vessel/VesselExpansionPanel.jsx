/**
 * VesselExpansionPanel provides Vessel details an an ExpansionPanel
 * provided by MaterialUI
 *
 * The expansion card is made up of two parts, the summary part that is always displayed
 * and the details that is the expanded paper when the summary is clicked.
 * VesselExpansionPanel provides the summary and controls the collapse, and pulls in the
 * expansion panel details component for the content when the component is expanded.
 *
 * The expansion panel also handles the server communication for dealing with editing a vessel.
 * This allows the vessel to be edited independently of the vessel list.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';
import _ from 'lodash';

// Components
import FlexContainer from 'components/FlexContainer';
import PrimaryButton from 'components/PrimaryButton';
import VesselEditPanel from 'components/fleet/vessel/VesselEditPanel';
import VesselExpansionPanelDetails from 'components/fleet/vessel/VesselExpansionPanelDetails';
import VesselExpansionPanelSummary from 'components/fleet/vessel/VesselExpansionPanelSummary';
import LoadingDialog from 'components/LoadingDialog';
import ConfirmationDialog from 'components/ConfirmationDialog';
import ErrorDialog from 'components/error/ErrorDialog';

import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Collapse,
  CircularProgress,
  Menu,
  MenuItem,
} from "@material-ui/core";

// Actions and Helpers
import { VesselShape } from './propTypes';
import { updateObjectPropertyWithValue } from 'lib/form';
import { updateVessel } from 'fleet/vessel';
import FleetPickerDialog from 'components/fleet/FleetPickerDialog';

import loglevel from 'loglevel';

const log = loglevel.getLogger('fleet');

/* **********************************************
 *
 * VesselExpansionPanel
 * Display a single vessel expansion Panel
 *
 ********************************************* */

const vesselPropTypes = {
  /**
   * @private Provided by withStyles
   */
  classes: PropTypes.object.isRequired,
  /**
   * @private withTransaction
   */
  createTransaction: PropTypes.func.isRequired,
  /**
   * The vessel to display in the expansion panel
   */
  vessel: PropTypes.shape(VesselShape),
  /**
   * Callback to inform the parent of an action that should be performed.
   * Used to propogate actions that child components don't know how to handle,
   * but will propogate up the stack until a component can handle it.
   */
  onAction: PropTypes.func.isRequired,
};

class VesselExpansionPanel extends React.Component {
  state = {
    /**
     * Currently expansion panel status. Can be set to force a certain state
     * (true: open, false: closed)
     */
    expanded: false,
    /**
     * True if the mouse is currently hovering over the expansion panel.
     */
    hover: false,
    /**
     * When true, panel is in edit mode and forms should be displayed.
     */
    showEdit: false,
    /**
     * Usually equal to prop vessel, but if the vessel is updated, this
     * will allow the expansion card to show the latest vessel. Will only be
     * set by prop.vessel when not in edit mode. If in edit mode, this is
     * changed through the onChange() callbacks from child components editing
     * the vessel.
     */
    vessel: null,
    /**
     * If edit fails due to invalid form content, fieldErrors is parsed
     * from the response and passed to fields to display which fields and
     * validators failed so the user can fix the errors.
     */
    fieldErrors: null,
    /**
     * Banner message that will be displayed on the form view in the summary area.
     */
    errorBannerMessage: null,
    /**
     * When true, the vessel is currently being saved.
     */
    savingVessel: false,
    /**
     * Shows or hides the unassign device from vessel confirmation dialog.
     */
    showUnassignDeviceConfirm: false,
    /**
     * Options for the unassign device confirm dialog.
     *
     * {function} onClose Callback when the dialog closes. Passes a single parameter that is the
     * confirmation result.
     */
    unassignDeviceConfirmOptions: { title: '', message: null, complete: false },
    /**
     * Shows or hides the error dialog.
     */
    showErrorDialog: false,
    /**
     * Options for error dialog.
     *
     * {function} onClose Callback when the dialog closes.
     */
    errorDialogOptions: { title: '', message: null, complete: false },
    /**
     * Shows or hides the loading dialog.
     */
    showLoadingDialog: false,
    /**
     * Options for the loading dialog.
     *
     * {string} message Message to display in the content area of the loading dialog.
     * {string} title Title to display in the loading dialog.
     * {bool | int} complete Progress of the loading indicator in the loading dialog. See
     *                       complete prop on LinearProgress in Material UI.
     */
    loadingDialogOptions: { title: '', message: null, complete: false },
    /**
     * Shows or hides the fleet picker dialog.
     */
    showFleetPickerDialog: false,
    /**
     * Options for the loading dialog.
     *
     * {string} message Message to display in the content area of the loading dialog.
     * {string} title Title to display in the loading dialog.
     * {func} onClose Callback when the dialog is closed. See `<FleetPickerDialog />`
     */
    fleetPickerDialogOptions: { title: '', message: null, onClose: () => { } },
    /**
     * When true, the more options menu will be displayed.
     */
    showMoreOptionsMenu: false,
    /**
     * Anchor element for the more options menu. Should be set to event.currentTarget when a
     * button click occurs to open the menu.
     */
    moreOptionsMenuTarget: null,
  };

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state.vessel = { ...props.vessel };
  }

  /*
  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.hover !== nextState.hover)
      || (this.state.expanded !== nextState.expanded)
      || (this.state.showEdit !== nextState.showEdit)
      || (this.state.vessel !== nextState.vessel);
  }
  */

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  componentWillReceiveProps(newProps) {
    if (newProps.vessel !== this.props.vessel) {
      if (!this.state.isEditing) {
        this.setState({
          vessel: _.cloneDeep(newProps.vessel),
        });
      }
    }
  }

  expansionPanelChanged = (event, expanded) => {
    // If the expansion panel is collapsing, then ensure edit is also hidden.
    let { showEdit, errorBannerMessage, vessel } = this.state;

    // Prevent collapsing while in edit mode.
    if (showEdit) {
      this.setState({ expanded: true });
      event.stopPropagation();
      return;
    }

    if (!expanded) {
      showEdit = false;
      errorBannerMessage = null;
      vessel = _.cloneDeep(this.props.vessel);
    }

    this.setState({
      vessel,
      expanded,
      showEdit,
      errorBannerMessage,
    });
  };

  expansionPanelMouseOver = () => {
    this.setState({
      hover: true,
    });
  };

  expansionPanelMouseOut = () => {
    this.setState({
      hover: false,
    });
  };

  editButtonClicked = show => () => {
    const vessel = _.cloneDeep(this.props.vessel);

    if (this._isMounted) {
      this.setState(prevState => ({
        vessel,
        showEdit: show,
        fieldErrors: show ? prevState.fieldErrors : null,
        errorBannerMessage: show ? prevState.errorBannerMessage : null,
      }));
    }
  };

  vesselSaveSuccess = vessel => {
    // Form can now go away.
    if (this._isMounted) {
      this.setState({
        vessel,
        showEdit: false,
        errorBannerMessage: null,
        fieldErrors: null,
        savingVessel: false,
      });
    }

    this.onAction('vessel/UPDATED', vessel);
  };

  vesselSaveFailed = error => {
    let errorBannerMessage = __(
      'An unknown error occurred saving the Vessel. Please try again or contact your system administrator.',
    );
    if (error.fieldErrors) {
      errorBannerMessage = __('Please fix form errors and try submitting again.');
    } else if (error && error.statusCode > 500) {
      errorBannerMessage = __(
        'An error occured on the server while saving this vessel. Please try again later or contact your system administrator.',
      );
    }

    if (this._isMounted) {
      this.setState({
        errorBannerMessage,
        fieldErrors: error.fieldErrors,
        savingVessel: false,
      });
    }
  };

  /**
   * Callback when the save button is clicked. This will dispatch the vessel update.
   */
  onSaveClicked = () => {
    // Clear existing errors
    this.setState({
      errorBannerMessage: null,
      savingVessel: true,
    });

    const action = updateVessel(this.state.vessel);
    this.props.createTransaction(action).then(this.vesselSaveSuccess, this.vesselSaveFailed);
  };

  onChange = propName => event => {
    let value = event;
    if (event && event.target) {
      if (event.target.value !== null && typeof event.target.value !== 'undefined') {
        value = event.target.value;
      }
    }

    this.setState(prevState => ({
      vessel: updateObjectPropertyWithValue(prevState.vessel, propName, value),
    }));
  };

  onOwnerTypeChange = (newType, oldType) => {
    this.setState(prevState => {
      const owner = prevState.vessel[oldType];
      const vessel = { ...prevState.vessel };
      vessel[newType] = owner;
      delete vessel[oldType];

      return { vessel };
    });
  };

  /**
   * Called when a device is registered. This allows the vessel to be updated
   * appropriately.
   * @param {object} newDevice the device that was just added.
   */
  onDeviceRegistered = newDevice => {
    this.setState(prevState => {
      const vessel = {
        ...prevState.vessel,
        devices: [...prevState.vessel.devices, newDevice],
      };

      this.onAction('vessel/UPDATED', vessel);
      return { vessel };
    });
  };

  /**
   * Called when child component induces an action. Any params should be passed on the second
   * parmeter as properties on an object.
   * @param {string} action The action being performed. Must be one of:
   *                        ['edit', 'more', 'device/REGISTER']
   * @param {object} params Params to pass to the action handler.
   */
  onAction = (action, params) => {
    switch (action) {
      case 'edit': {
        this.editButtonClicked(!this.state.showEdit)(params);
        break;
      }
      case 'more': {
        if (this._isMounted) {
          this.setState({
            showMoreOptionsMenu: true,
            moreOptionsMenuTarget: params.currentTarget,
          });
        }
        break;
      }
      case 'device/REGISTER': {
        const newParams = {
          ...params,
          onRegistered: this.onDeviceRegistered,
        };
        this.props.onAction(action, newParams);
        break;
      }
      case 'device/UNASSIGN': {
        this.showUnassignDeviceConfirmationDialog(params.vessel, params.device);
        break;
      }
      default: {
        // propogate up the chain.
        this.props.onAction(action, params);
      }
    }
  };

  /**
   * Closes the more options menu.
   */
  closeMoreOptionsMenu = () => {
    this.setState({
      showMoreOptionsMenu: false,
      moreOptionsMenuTarget: null,
    });
  };

  /**
   * Shows the loading dialog with the provided options.
   * You can send partial options and it will append them
   * to existing state options. Can be used to update the dialog
   * options when the dialog is already open.
   *
   * @param {object} loadingDialogOptions Options to pass to this.state.loadingDialogOptions.
   * @param {string} loadingDialogOptions.title Title of the dialog.
   * @param {string} loadingDialogOptions.message Dialog mesasge.
   * @param {bool|int} loadingDialogOptions.complete % complete or if the load is finished.
   */
  showLoadingDialog = loadingDialogOptions => {
    if (this._isMounted) {
      this.setState(prevState => ({
        showLoadingDialog: true,
        loadingDialogOptions: {
          ...prevState.loadingDialogOptions,
          ...loadingDialogOptions,
        },
      }));
    }
  };

  /**
   *  Called when dialog requests to close. Closes the dialog.
   */
  onLoadingDialogClose = () => {
    if (this._isMounted) {
      this.setState(prevState => ({
        showLoadingDialog: false,
        loadingDialogOptions: {
          ...prevState.loadingDialogOptions,
          title: null,
          message: null,
          complete: false,
        },
      }));
    }
  };

  /**
   *  Called when fleet picker dialog requests to close. Closes the dialog.
   */
  onFleetPickerDialogClose = () => {
    this.setState(prevState => ({
      showFleetPickerDialog: false,
      fleetPickerDialogOptions: {
        ...prevState.fleetPickerDialogOptions,
        title: '',
        message: null,
        onClose: () => { },
      },
    }));
  };

  assignToFleetClicked = isReassign => () => {
    this.closeMoreOptionsMenu();
    // show a modal, isReassign will tell you the action being taken.
    // Event is so the modal opens from the click.
    this.setState(prevState => ({
      showFleetPickerDialog: true,
      fleetPickerDialogOptions: {
        title: __('Choose Fleet'),
        message: __(
          'To assign this vessel, please choose or search for a fleet below then click the fleet to select it.',
        ),
        onClose: async (okClicked, fleet) => {
          // If cancel was clicked then just close the dialog and return.
          if (!okClicked) {
            this.onFleetPickerDialogClose();
            return;
          }

          let title = `${isReassign ? 'Re-' : ''}Assigning to Fleet...`;

          // Close picker dialog and show loading dialog.
          this.onFleetPickerDialogClose();
          this.showLoadingDialog({ title });

          try {
            await this.assignToFleet(fleet);
            this.onLoadingDialogClose();
            this.props.onAction('vessel/RELOAD', prevState.vessel.id);
          } catch (error) {
            title = `${isReassign ? 'Re-' : ''}Assign Failed`;
            const message = __(
              `We were unable to ${isReassign ? 're-' : ''
              }assign the vessel. Try again later or talk to your system administrator.`,
            );
            this.showLoadingDialog({ title, message, complete: true });
          }
        },
      },
    }));
  };

  assignToFleet = fleet => {
    // Remove the fleet form the vessel and send to the server.
    const action = updateVessel({
      ...this.state.vessel,
      fleet: {
        id: fleet.id,
        name: fleet.name,
      },
    });

    return this.props.createTransaction(action);
  };

  unassignFromFleetClicked = async () => {
    this.closeMoreOptionsMenu();
    this.showLoadingDialog({ title: 'Unassigning Vessel' });

    try {
      // Remove the fleet form the vessel and send to the server.
      const action = updateVessel({
        ...this.state.vessel,
        fleet: null,
      });

      const vessel = await this.props.createTransaction(action);
      if (this._isMounted) {
        this.setState(prevState => ({
          vessel,
          loadingDialogOptions: {
            ...prevState.loadingDialogOptions,
            complete: true,
          },
          showLoadingDialog: false,
        }));
      }
      this.props.onAction('vessel/RELOAD', this.state.vessel.id);
    } catch (error) {
      const loadingDialogMessage = __(
        'We were unable to unassign the vessel. Try again later or talk to your system administrator.',
      );
      if (this._isMounted) {
        this.setState(prevState => ({
          loadingDialogOptions: {
            ...prevState.loadingDialogOptions,
            title: __('Unassign Failed'),
            message: loadingDialogMessage,
            complete: true,
          },
        }));
      }
    }
  };

  showUnassignDeviceConfirmationDialog = (vessel, device) => {
    if (this._isMounted) {
      this.setState({
        showUnassignDeviceConfirm: true,
        unassignDeviceConfirmOptions: {
          onClose: isConfirmed => {
            this.setState({
              showUnassignDeviceConfirm: false,
              unassignDeviceConfirmOptions: {},
            });

            if (isConfirmed) {
              this.unassignDevice(vessel, device);
            }
          },
        },
      });
    }
  };

  unassignDevice = (vessel, device) => {
    // loop through the devices and remove that item from the list.
    const devices = vessel.devices.filter(d => d.id !== device.id);
    const updatedVessel = {
      ...vessel,
      devices: [...devices],
    };

    // show loaders
    this.showLoadingDialog({
      title: __('Unassigning Device'),
      message: __(`Unassigning the device from the vessel ${vessel.name || ''}`),
      complete: false,
    });

    const action = updateVessel(updatedVessel);
    this.props
      .createTransaction(action)
      .then(this.unassignDeviceSuccess, this.unassignDeviceFailed);
  };

  unassignDeviceSuccess = vessel => {
    this.onLoadingDialogClose();
    if (this._isMounted) {
      this.setState({ vessel });
    }
    this.onAction('vessel/UPDATED', vessel);
    this.onAction('device/UNASSIGN:success', { vessel });
  };

  unassignDeviceFailed = error => {
    log.error('failed to unassign device', error);

    this.onLoadingDialogClose();
    if (this._isMounted) {
      this.setState({
        showErrorDialog: true,
        errorDialogOptions: {
          title: __('Error Unassigning Device'),
          message: __(
            'An error occured unassigning the device. Try again later or contact your system administrator.',
          ),
          onClose: () => {
            this.setState({
              showErrorDialog: false,
              errorDialogOptions: { title: '', message: '' },
            });
          },
        },
      });
    }
  };

  render() {
    const { classes } = this.props;
    const {
      expanded,
      showEdit,
      hover,
      errorBannerMessage,
      fieldErrors,
      vessel,
      savingVessel,
      showUnassignDeviceConfirm,
      unassignDeviceConfirmOptions,
      showMoreOptionsMenu,
      moreOptionsMenuTarget,
      showLoadingDialog,
      loadingDialogOptions,
      showErrorDialog,
      errorDialogOptions,

      showFleetPickerDialog,
      fleetPickerDialogOptions,
    } = this.state;
    if (!vessel) {
      return null;
    }
    return (
      <React.Fragment>
        <Accordion
          onChange={this.expansionPanelChanged}
          onMouseOver={this.expansionPanelMouseOver}
          onFocus={this.expansionPanelMouseOver}
          onBlur={this.expansionPanelMouseOut}
          onMouseLeave={this.expansionPanelMouseOut}
          expanded={this.state.expanded}
        >
          <AccordionSummary>
            <VesselExpansionPanelSummary
              vessel={vessel}
              isExpanded={expanded}
              isEditing={showEdit}
              isHovering={hover}
              onAction={this.onAction}
              errorBannerMessage={errorBannerMessage}
            />
          </AccordionSummary>
          {this.state.expanded && (
            <AccordionDetails classes={{ root: classes.expansionPanelDetails }}>
              <FlexContainer column align="start stretch" className={classes.container}>
                <Collapse in={showEdit}>
                  <VesselEditPanel
                    vessel={vessel}
                    fieldErrors={fieldErrors}
                    onChange={this.onChange}
                  />
                </Collapse>
                <VesselExpansionPanelDetails
                  vessel={vessel}
                  isEditing={showEdit}
                  fieldErrors={fieldErrors}
                  onChange={this.onChange}
                  onOwnerTypeChange={this.onOwnerTypeChange}
                  errors={this.state.errors}
                  onAction={this.onAction}
                />
              </FlexContainer>
            </AccordionDetails>
          )}
          <Collapse in={showEdit}>
            <AccordionActions>
              <Button onClick={this.editButtonClicked(false)}>{__('Cancel')}</Button>
              <PrimaryButton onClick={this.onSaveClicked}>
                {savingVessel ? <CircularProgress variant="indeterminate" size={24} /> : __('Save')}
              </PrimaryButton>
            </AccordionActions>
          </Collapse>
        </Accordion>
        <Menu
          open={showMoreOptionsMenu}
          anchorEl={moreOptionsMenuTarget}
          onClose={this.closeMoreOptionsMenu}
        >
          {vessel.fleet ? (
            [
              <MenuItem onClick={this.assignToFleetClicked(true)} key="reassign">
                {__('Re-Assign to a Different Fleet')}
              </MenuItem>,
              <MenuItem onClick={this.unassignFromFleetClicked} key="unassign">
                {`${__('Unassign from')} ${vessel.fleet.name}`}
              </MenuItem>,
            ]
          ) : (
            <MenuItem onClick={this.assignToFleetClicked(false)}>{__('Assign to Fleet')}</MenuItem>
          )}
        </Menu>
        <LoadingDialog
          disableBackdropClick
          disableEscapeKeyDown
          open={showLoadingDialog}
          {...loadingDialogOptions}
          onClose={this.onLoadingDialogClose}
        />
        <FleetPickerDialog open={showFleetPickerDialog} {...fleetPickerDialogOptions} />
        <ConfirmationDialog
          open={showUnassignDeviceConfirm}
          message={__(
            'This will unassign this device from the vessel. Are you sure you want to unassign the device?',
          )}
          title={__('Unassign Device from Vessel')}
          okButtonText={__('Unassign')}
          {...unassignDeviceConfirmOptions}
        />
        <ErrorDialog open={showErrorDialog} {...errorDialogOptions} />
      </React.Fragment>
    );
  }
}

VesselExpansionPanel.propTypes = vesselPropTypes;

export default withStyles({
  container: {
    width: '100%',
  },
  formContainer: {
    width: '100%',
  },
  expansionPanelDetails: {
    paddingTop: '0px',
  },
})(withTransaction(VesselExpansionPanel));
