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
 * ManageCoordinateRow
 * Manage data for coordinate row
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import CoordinateRow from './CoordinateRow';

class ManageCoordinateRow extends React.Component {
  static propTypes = {
    /** change a coordinate */
    onChange: PropTypes.func,
    /** remove a coordinate */
    onRemove: PropTypes.func,
    /** longitude */
    longitude: PropTypes.number,
    /** latitude */
    latitude: PropTypes.number,
    /** specific id to pass it to actions */
    id: PropTypes.number,
    /** using for styling children */
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    longitude: 0,
    latitude: 0,
    id: 0,
    onChange: () => { },
    onRemove: () => { },
  };

  onChangeLongitude = e => {
    if (e.target.value.endsWith('.')) {
      return;
    }
    this.props.onChange({
      longitude: parseFloat(e.target.value),
      latitude: this.props.latitude,
      id: this.props.id,
    });
  };

  onChangeLatitude = e => {
    if (e.target.value.endsWith('.')) {
      return;
    }
    this.props.onChange({
      latitude: parseFloat(e.target.value),
      longitude: this.props.longitude,
      id: this.props.id,
    });
  };

  onRemove = () => {
    this.props.onRemove(this.props.id);
  };

  render() {
    const latitude = !Number.isNaN(this.props.latitude) ? String(this.props.latitude) : '';
    const longitude = !Number.isNaN(this.props.longitude) ? String(this.props.longitude) : '';
    return (
      <CoordinateRow
        latitude={latitude}
        longitude={longitude}
        onChangeLongitude={this.onChangeLongitude}
        onChangeLatitude={this.onChangeLatitude}
        onRemove={this.onRemove}
        classes={this.props.classes}
      />
    );
  }
}

export default ManageCoordinateRow;
