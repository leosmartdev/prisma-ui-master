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
 * PolygonCoordinateTable
 * Manage data for coordinate content
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import ol from 'openlayers';

// Components
import CoordinateContent from './CoordinateContent';

// Helpers & Actions
import { fromPolygon } from 'lib/protobuf';
import Projection from 'lib/geo';
import { withPolygonMode, withEmptyDraw } from './zone';

class PolygonCoordinateTable extends React.Component {
  static propTypes = {
    /** update drawn geometry */
    onSetDrawnGeometry: PropTypes.func.isRequired,
    /** start draw if a user click onAdd without drawn geom */
    onStartDraw: PropTypes.func.isRequired,
    /** current geometry */
    geometry: PropTypes.object,
    /** updated geometry from the map */
    updated: PropTypes.number,
  };

  static defaultProps = {
    geometry: {},
    updated: 0,
  };

  state = {
    poly: {},
  };

  static getDerivedStateFromProps({ geometry }) {
    if (!geometry || !geometry.getCoordinates) {
      return {
        poly: null,
      };
    }
    const poly = fromPolygon(Projection.geomToLonLat(geometry).getCoordinates());
    poly.lines[0].points = poly.lines[0].points.map((point, id) => ({
      id,
      ...point,
    }));
    return {
      poly,
    };
  }

  onChange = ({ latitude, longitude, id }) => {
    const { poly } = this.state;
    for (const i in poly.lines[0].points) {
      if (poly.lines[0].points[i].id === id) {
        poly.lines[0].points[i] = {
          latitude,
          longitude,
          id,
        };
        break;
      }
    }
    this.setState({
      poly,
    });
    const points = poly.lines[0].points.map(({ longitude, latitude }) => [longitude, latitude]);
    const { geometry, onSetDrawnGeometry } = this.props;
    geometry.setCoordinates(Projection.fromLonLatPolygon([points]));
    onSetDrawnGeometry(geometry);
  };

  onAdd = () => {
    let newPoly = null;
    const { poly } = this.state;
    if (!poly) {
      newPoly = {
        lines: [
          {
            points: [
              {
                longitude: 0,
                latitude: 0,
                id: 1,
              },
            ],
          },
        ],
      };
    } else {
      newPoly = {
        ...poly,
        lines: [
          {
            points: [
              ...poly.lines[0].points,
              {
                longitude: 0,
                latitude: 0,
                id: 1 + poly.lines[0].points.reduce((maxId, el) => Math.max(maxId, el.id), 0),
              },
            ],
          },
        ],
      };
    }
    this.setState({ poly: newPoly });
    const points = newPoly.lines[0].points.map(({ longitude, latitude }) => [longitude, latitude]);
    const { geometry, onStartDraw, onSetDrawnGeometry } = this.props;
    let newGeometry = geometry;
    if (!newGeometry) {
      newGeometry = Projection.geomFromLonLat(new ol.geom.Polygon([points]));
      onStartDraw(poly);
    } else {
      newGeometry.setCoordinates(Projection.fromLonLatPolygon([points]));
    }
    onSetDrawnGeometry(newGeometry);
  };

  onRemove = id => {
    const { poly } = this.state;
    const { onSetDrawnGeometry } = this.props;

    poly.lines[0].points = poly.lines[0].points.filter(point => point.id !== id);
    this.setState({
      poly,
    });
    const points = poly.lines[0].points.map(({ longitude, latitude }) => [longitude, latitude]);
    const { geometry } = this.props;
    geometry.setCoordinates(Projection.fromLonLatPolygon([points]));
    onSetDrawnGeometry(geometry);
  };

  render() {
    const { poly } = this.state;
    const points = poly ? poly.lines[0].points : undefined;
    return (
      <CoordinateContent
        onAdd={this.onAdd}
        onRemove={this.onRemove}
        onChange={this.onChange}
        coordinates={points}
      />
    );
  }
}

export default compose(
  withEmptyDraw,
  withPolygonMode,
)(PolygonCoordinateTable);
