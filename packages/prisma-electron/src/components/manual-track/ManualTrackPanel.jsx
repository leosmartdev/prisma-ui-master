/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { __ } from 'lib/i18n';
import moment from 'moment';
import md5 from 'blueimp-md5';

// Components
import { FlexContainer } from 'components/layout/Container';

import {
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';

// Helpers & Actions
import * as actions from 'manual-track/manual-track';
import Formatter from 'format/Formatter';

const dateFormat = "YYYY-MM-DD HH:mm";
const idPattern = /[0-9a-fA-F]{15}/;

const styles = {
  control: {
    paddingBottom: '20px'
  },
  dialogText: {
    paddingLeft: '20px',
    paddingRight: '20px',
  }
}

class CreateManualTrackPanel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      time: "",
      id: "",
      timeError: false,
      latError: false,
      lonError: false,
      idError: false,
      editingCoords: false,
      showConfirmation: false,
    };
    this.format = new Formatter(this.props.config);
  }

  componentDidMount = () => {
    this.props.enable();
    this.setState({
      time: moment().utc().format(dateFormat)
    })
    this.refresh({});
  }

  componentDidUpdate = (prev) => {
    this.refresh(props);
  }

  refresh = (prev) => {
    if (this.props.previousLatitude !== prev.previousLatitude) {
      this.props.setLatitude(this.props.previousLatitude)
    }
    if (this.props.previousLongitude !== prev.previousLongitude) {
      this.props.setLongitude(this.props.previousLongitude)
    }
  }

  componentWillUnmount = () => {
    this.props.disable();
  }

  componentDidUpdate = (prevProps) => {
    if (!this.state.editingCoords) {
      if (prevProps.latitude !== this.props.latitude ||
        prevProps.longitude !== this.props.longitude) {
        this.validateCoordinates();
      }
    }
  }

  latitudeChanged = (event) => {
    this.setState({ latError: false, editingCoords: true });
    this.props.setLatitude(event.target.value);
  }

  longitudeChanged = (event) => {
    this.setState({ lonError: false, editingCoords: true });
    this.props.setLongitude(event.target.value);
  }

  validateCoordinates = (doneEditing) => {
    let lon = +this.props.longitude;
    let lat = +this.props.latitude;
    let lonError = Number.isNaN(lon) || lon > 180 || lon < -180
    let latError = Number.isNaN(lat) || lat > 90 || lat < -90
    let editingCoords = this.state.editingCoords
    if (doneEditing) {
      editingCoords = false
    }
    this.setState({ lonError, latError, editingCoords })
  }

  timeChanged = (event) => {
    this.setState({
      time: event.target.value,
      timeError: false,
    });
  }

  validateTime = () => {
    let time = moment(this.state.time, dateFormat, true);
    this.setState({ timeError: !time.isValid() })
  }

  idChanged = (event) => {
    this.setState({ id: event.target.value, idError: false })
  }

  validateId = () => {
    let id = this.state.id.trim();
    let idError = false;
    if (id.length > 0) {
      idError = !idPattern.test(id) || id.length !== 15
    }
    this.setState({ idError })
  }

  isValid = () => {
    return !this.state.latError &&
      !this.state.lonError &&
      !this.state.timeError &&
      !this.state.idError;
  }

  accept = () => {
    this.setState({ showConfirmation: true });
  }

  cancel = (event) => {
    this.setState({ showConfirmation: false });
  }

  confirmed = (event) => {
    this.setState({ showConfirmation: false });
    let id = this.props.registryId;
    let label = this.props.previousLabel;
    if (!id) {
      let stateId = this.state.id.trim()
      if (stateId !== '') {
        id = md5(`(manualTrackId:${stateId})`);
        label = stateId;
      } else {
        id = md5(`(manualTrack:${Math.random()}:${Date.now()}`)
      }
    }
    label = label || __("Manual Track");
    let lat = Number.parseFloat(this.props.latitude);
    let lon = Number.parseFloat(this.props.longitude);
    let params = {
      registryId: id,
      name: label,
      latitude: lat,
      longitude: lon,
      speed: 0,
      course: 0,
      heading: 0,
      rateOfTurn: 0,
    };
    this.props.addTrack(params);
  }

  render = () => {
    return (
      <FlexContainer column align='start stretch' id='create-manual-track'>
        <TextField
          id='create-manual-track-latitude'
          style={styles.control}
          value={this.props.latitude}
          onChange={this.latitudeChanged}
          onBlur={() => this.validateCoordinates(true)}
          error={this.state.latError}
          helperText={this.state.latError && __('Invalid latitude')}
          label={__('Latitude')}
        />
        <TextField
          id='create-manual-track-longitude'
          style={styles.control}
          value={this.props.longitude}
          onChange={this.longitudeChanged}
          onBlur={() => this.validateCoordinates(true)}
          error={this.state.lonError}
          helperText={this.state.lonError && __('Invalid longitude')}
          label={__('Longitude')}
        />
        <TextField
          id='create-manual-track-reported-time'
          style={styles.control}
          value={this.state.time}
          label={__('Reported Time UTC')}
          onChange={this.timeChanged}
          onBlur={this.validateTime}
          error={this.state.timeError}
          helperText={this.state.timeError && __('Invalid date and time')}
        />
        {!this.props.registryId &&
          <TextField
            id='create-manual-track-id'
            style={styles.control}
            value={this.state.id}
            label={__('Hardware/Track ID')}
            onChange={this.idChanged}
            onBlur={this.validateId}
            error={this.state.idError}
            helperText={this.state.idError && __('Invalid identifier')}
          />
        }
        <Button variant="contained" color="primary" onClick={this.accept} disabled={!this.isValid()}>
          {this.props.registryId ? __('Update Track') : __('Create Track')}
        </Button>
        <Dialog open={this.state.showConfirmation} onClose={this.cancel}>
          <DialogTitle>Manual Track</DialogTitle>
          <DialogContentText style={styles.dialogText}>
            {__("Are you sure you want to")} {this.props.registryId ? __("update") : __("create")} {__("this track?")}
          </DialogContentText>
          <DialogActions>
            <Button id="manual-track-cancel" onClick={this.cancel} color="primary">
              {__("Cancel")}
            </Button>
            <Button id="manual-track-create" onClick={this.confirmed}>
              {this.props.registryId ? __("Update") : __("Create")}
            </Button>
          </DialogActions>
        </Dialog>
      </FlexContainer>
    )
  };
}

CreateManualTrackPanel.propTypes = {
  registryId: PropTypes.string,
  previousLabel: PropTypes.string,
  previousLatitude: PropTypes.string,
  previousLongitude: PropTypes.string,
  latitude: PropTypes.string.isRequired,
  longitude: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,

  enable: PropTypes.func.isRequired,
  disable: PropTypes.func.isRequired,
  setLatitude: PropTypes.func.isRequired,
  setLongitude: PropTypes.func.isRequired,
  addTrack: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  latitude: state.manualTrack.latitude,
  longitude: state.manualTrack.longitude,
  config: state.config,
});

const mapDispatchToProps = dispatch => ({
  enable: () => {
    dispatch(actions.enable());
  },
  disable: () => {
    dispatch(actions.disable());
  },
  setLatitude: (lat) => {
    dispatch(actions.setLatitude(lat));
  },
  setLongitude: (lon) => {
    dispatch(actions.setLongitude(lon));
  },
  addTrack: (params) => {
    dispatch(actions.add(params));
  }
});

export default (CreateManualTrackPanel = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CreateManualTrackPanel)
));