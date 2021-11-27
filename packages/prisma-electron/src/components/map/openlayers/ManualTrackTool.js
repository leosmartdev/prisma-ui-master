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
import ol from 'openlayers';

// Components
import {
  Icon,
} from '@material-ui/core';

// Helpers & Actions
import * as actions from 'manual-track/manual-track';

const resources = `${__dirname}/../../../resources`;

class ManualTrackTool extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listening: false
    }
    this.layer = null;
    this.marker = null;
    if (this.props.enabled) {
      this.start();
    }
  }

  componentDidUpdate = prev => {
    if (this.props.enabled && !this.state.listening) {
      this.start();
    } else if (!prev.enabled && this.props.enabled) {
      this.start();
    } else if (prev.enabled && !this.props.enabled) {
      this.stop();
    }

    if (prev.latitude !== this.props.latitude ||
      prev.longitude !== this.props.longitude) {
      this.updateMarker();
    }
  }

  start = () => {
    const map = this.props.getOlMap().map;
    if (!map) {
      return;
    }
    map.getTargetElement().addEventListener('click', this.clicked);
    this.setState({ listening: true });

    this.marker = new ol.Feature(new ol.geom.Point([104, 1]));
    this.marker.setProperties({ noSelect: true });
    let source = new ol.source.Vector({ features: [this.marker] });
    let style = new ol.style.Style({
      image: new ol.style.Icon({
        src: `${resources}/map-crosshairs.png`,
        color: '#000',
      })
    });
    this.layer = new ol.layer.Vector({ source, style });
    this.layer.setZIndex(99);
    map.addLayer(this.layer);
    this.updateMarker();
  }

  stop = () => {
    const map = this.props.getOlMap().map;
    if (!map) {
      return;
    }
    map.getTargetElement().removeEventListener('click', this.clicked);
    this.setState({ listening: false });
    map.removeLayer(this.layer);
    this.layer = null;
    this.marker = null;
  }

  updateMarker = () => {
    const map = this.props.getOlMap().map;
    if (!map) {
      return;
    }
    let lat = +this.props.latitude;
    let lon = +this.props.longitude;
    let lonError = Number.isNaN(lon) || lon > 180 || lon < -180
    let latError = Number.isNaN(lat) || lat > 90 || lat < -90
    if (lonError || latError) {
      return;
    }
    let p = ol.proj.fromLonLat([lon, lat]);
    this.marker.getGeometry().setCoordinates(p);
  }

  clicked = (event) => {
    const map = this.props.getOlMap().map;
    let coords = map.getCoordinateFromPixel([event.offsetX, event.offsetY]);
    coords = ol.proj.toLonLat(coords);
    this.props.setCoordinate({
      latitude: coords[1].toString(),
      longitude: coords[0].toString(),
    });
  }

  render = () => {
    return <div />
  }
}

ManualTrackTool.propTypes = {
  getOlMap: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired,

  setCoordinate: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  enabled: state.manualTrack.enabled,
  latitude: state.manualTrack.latitude,
  longitude: state.manualTrack.longitude,
})

const mapDispatchToProps = dispatch => ({
  setCoordinate: (lat, lon) => {
    dispatch(actions.setCoordinate(lat, lon));
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ManualTrackTool);

