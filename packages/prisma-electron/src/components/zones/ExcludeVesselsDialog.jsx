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
 * ExcludeVesselsDialog
 * Show a dialog to choose vessels which should be ignored when will be generating alerts
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';

// Components
import ErrorBanner from 'components/error/ErrorBanner';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

// Icons
import Add from '@material-ui/icons/Add';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';

// Helpers & Actions
import { __ } from 'lib/i18n';
import { getVessels } from 'fleet/vessel';

class ExcludeVesselsDialog extends React.Component {
  static propTypes = {
    /**
     * isOpen is used to control dialog open state
     */
    isOpen: PropTypes.bool.isRequired,
    /**
     * onClose is used to control close event
     */
    onClose: PropTypes.func.isRequired,
    /**
     * selectedVessels is used to show selected vessels in the list
     */
    selectedVessels: PropTypes.array,
    /**
     * getVessels is used to get an actual list of vessels from the server
     */
    getVessels: PropTypes.func,
    /**
     * onExcludeVessel is used to handle an action for excluding a vessel - turn off alerting for a
     * vessel
     */
    onExcludeVessel: PropTypes.func.isRequired,
    /**
     * onIncludeVessel is used to turn on alerting for a vessel
     */
    onIncludeVessel: PropTypes.func.isRequired,
    /**
     * classes is used to decorate dialog
     */
    classes: PropTypes.object.isRequired,
    /**
     * createTransaction is used to make requests to a server
     */
    createTransaction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    selectedVessels: [],
  };

  _isMounted = false;

  state = {
    vessels: [],
    errorBannerMessage: null,
  };

  componentDidMount() {
    this._isMounted = true;
    this.getVessels();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getVessels = async () => {
    const { createTransaction } = this.props;
    try {
      const vessels = await createTransaction(getVessels({ withFleet: false }));
      if (this._isMounted) {
        this.setState({ vessels, errorBannerMessage: null });
      }
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          errorBannerMessage: `${'An error occurred getting vessel results.'} ${error.statusText ||
            ''}`,
        });
      }
    }
  };

  render() {
    const {
      isOpen,
      onClose,
      onExcludeVessel,
      selectedVessels,
      onIncludeVessel,
      classes,
    } = this.props;

    const { errorBannerMessage, vessels } = this.state;

    // is used to exclude the same records from selected vessels and all vessels
    const selectedId = {};
    return (
      <Dialog open={isOpen} maxWidth="sm" onClose={onClose}>
        <DialogTitle>{__('Exclude vessels')}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <ErrorBanner message={__(errorBannerMessage)} />
          <List className={classes.list} disablePadding>
            {selectedVessels.map(vessel => {
              selectedId[vessel.id] = true;
              return (
                <ListItem button divider key={vessel.id}>
                  <ListItemText primary={vessel.name} />
                  <IconButton edge="end" onClick={() => onIncludeVessel(vessel)}>
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </ListItem>
              );
            })}
            {vessels.map(vessel => {
              if (selectedId[vessel.id]) {
                return null;
              }
              return (
                <ListItem button divider key={vessel.id}>
                  <IconButton edge="end" onClick={() => onExcludeVessel(vessel)}>
                    <Add />
                  </IconButton>
                  <ListItemText primary={vessel.name} />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onClose} color="primary">
            {__('OK')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withTransaction(
  withStyles({
    dialogContent: {
      width: '50vw',
      height: '450px',
    },
    list: {
      overflowY: 'auto',
    },
  })(ExcludeVesselsDialog),
);
