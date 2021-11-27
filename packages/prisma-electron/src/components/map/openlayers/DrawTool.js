import React from 'react';
import PropTypes from 'prop-types';
import ol from 'openlayers';
import { connect } from 'react-redux';

// Components
import MeasureTooltip from './MeasureTooltip';

// Helpers & Actions
import * as Color from 'lib/color';
import * as Patterns from 'lib/patterns';
import Projection, { GeometryMath } from 'lib/geo';
import { toPolygon } from 'lib/protobuf';

import * as mapActions from 'map/map';
import * as draw from 'draw/draw';

class DrawTool extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mousePoint: [0, 0],
      showTooltip: false,
    };
    this.source = null;
    this.layer = null;
    this.sketchFeature = null;
    this.drawInteraction = null;
    this.modifyInteraction = null;
    this.snapInteraction = null;
    this.changeListener = null;
    this.optionalInteraction = null;

    this.geometry = null;
  }

  componentDidUpdate = prev => {
    if (!prev.enabled && this.props.enabled) {
      this.start();
    } else if (this.props.enabled && prev.type !== this.props.type) {
      this.start();
    } else if (prev.enabled && !this.props.enabled) {
      this.stop();
    } else if (this.props.area && !prev.area) {
      this.start();
    }
    if (this.layer && this.props.style && prev.style !== this.props.style) {
      this.updateStyle();
    }
    if (this.props.radius !== prev.radius && this.geometry && this.geometry.setRadius) {
      this.geometry.setRadius(this.props.radius);
    }
    if (!prev.reset && this.props.reset) {
      this.start();
      this.props.clearReset();
    }
  };

  setupChangeListener = feature => {
    this.changeListener = feature.getGeometry().on('change', cevent => {
      this.drawUpdate(cevent);
    });
    this.geometry = feature.getGeometry();
  };

  componentWillUnmount() {
    this.stop();
  }

  start = () => {
    this.stop();
    const map = this.props.getOlMap().map;
    if (!map) {
      return;
    }
    this.source = new ol.source.Vector();
    if (this.props.edit || this.props.area) {
      const editFeature = this.getEditFeature();
      this.source.addFeature(editFeature);
      this.props.setDrawnGeometry(editFeature.getGeometry());
    }
    this.layer = new ol.layer.Vector({ source: this.source });
    this.layer.setZIndex(99);
    this.layer.setStyle(this.getStyle());
    map.addLayer(this.layer);

    this.drawInteraction = new ol.interaction.Draw({
      source: this.source,
      type: this.props.type,
      style: () => this.getStyle(),
    });
    this.drawInteraction.on('drawstart', this.drawStart);
    this.drawInteraction.on('drawend', this.drawEnd);
    this.drawInteraction.setActive(this.props.activeDraw);
    if (this.props.edit) {
      this.drawInteraction.setActive(false);
      this.props.getOlMap().addProperty(this.props.edit.databaseId, 'editing', true);
    }
    map.addInteraction(this.drawInteraction);

    this.modifyInteraction = new ol.interaction.Modify({
      source: this.source,
    });
    if (!this.props.edit || !this.props.editable) {
      this.modifyInteraction.setActive(false);
    }
    this.modifyInteraction.on('modifyend', this.modifyEnd);
    map.addInteraction(this.modifyInteraction);

    this.snapInteraction = new ol.interaction.Snap({
      source: this.source,
    });

    if (this.props.interaction) {
      this.optionalInteraction = this.props.interaction;
      map.addInteraction(this.optionalInteraction);
    }

    map.addInteraction(this.snapInteraction);
    map.getTargetElement().addEventListener('mousemove', this.positionUpdate);
    this.props.enableInteractions(false);
  };

  stop = () => {
    const map = this.props.getOlMap().map;
    if (!map) {
      return;
    }
    if (!this.drawInteraction) {
      return;
    }
    if (this.changeListener) {
      ol.Observable.unByKey(this.changeListener);
      this.changeListener = null;
    }
    if (this.props.edit) {
      this.props.getOlMap().removeProperty(this.props.edit.databaseId, 'editing');
    }
    map.removeLayer(this.layer);
    map.removeInteraction(this.drawInteraction);
    map.removeInteraction(this.modifyInteraction);
    map.removeInteraction(this.snapInteraction);
    map.removeInteraction(this.optionalInteraction);
    map.getTargetElement().removeEventListener('mousemove', this.positionUpdate);
    this.drawInteraction = null;
    this.props.enableInteractions(true);
    this.setState({ showTooltip: false });
  };

  drawStart = event => {
    this.sketchFeature = event.feature;
    this.setupChangeListener(event.feature);
    this.setState({ showTooltip: true });
  };

  drawEnd = event => {
    this.sketchFeature = null;
    ol.Observable.unByKey(this.changeListener);
    this.setState({ showTooltip: false });
    this.props.clearMeasure();
    if (this.props.measure) {
      // Feature doesn't appear in the source until this event ends
      setTimeout(() => this.source.clear(), 0);
    } else {
      this.props.editable && this.modifyInteraction.setActive(true);
      this.props.setDrawnGeometry(event.feature.getGeometry());
      this.drawInteraction.setActive(false);
    }
  };

  drawUpdate = event => {
    const geom = event.target;
    let distance = 0;
    let bearing = 0;
    if (geom instanceof ol.geom.Circle) {
      distance = geom.getRadius();
      bearing = GeometryMath.azimuth(
        ol.proj.toLonLat(geom.getCenter()),
        ol.proj.toLonLat(this.state.mousePoint),
      );
    } else if (geom instanceof ol.geom.LineString) {
      distance = GeometryMath.lineDistance(Projection.geomToLonLat(geom));
      bearing = GeometryMath.azimuth(
        ol.proj.toLonLat(geom.getLastCoordinate()),
        ol.proj.toLonLat(geom.getCoordinates()[geom.getCoordinates().length - 2]),
      );
    }
    this.props.updateMeasure(distance, bearing);
  };

  modifyEnd = event => {
    ol.Observable.unByKey(this.changeListener);
    this.props.setDrawnGeometry(event.features.item(0).getGeometry());
    this.props.updateByClient();
  };

  updateStyle = () => {
    this.layer.setStyle(this.getStyle());
    const features = this.source.getFeatures();
    if (features.length !== 0) {
      features[0].setStyle(this.getStyle());
    }
    // This change causes a re-render for the new style
    if (this.sketchFeature) {
      this.sketchFeature.changed();
    }
  };

  positionUpdate = event => {
    if (!this.props.measure) {
      return;
    }
    const mousePoint = this.props.getOlMap().map.getCoordinateFromPixel([event.pageX, event.pageY]);
    this.setState({ mousePoint });
  };

  getStyle = () => {
    if (this.props.style.fillColor) {
      const { fillColor, fillPattern, strokeColor } = this.props.style;
      const renderer = Patterns.byId(fillPattern).renderer({
        fill: Color.toString(fillColor),
        stroke: Color.toString(strokeColor),
      });

      const style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: Color.toString(strokeColor),
          width: 2,
        }),
        fill: new ol.style.Fill({
          color: renderer,
        }),
      });
      return style;
    }
    const style = mapStyles[this.props.style];
    if (!style) {
      throw new Error(`unknown style: ${style}`);
    }
    return style;
  };

  getEditFeature = () => {
    const area = (this.props.edit && this.props.edit.area) || this.props.area;
    const poly = this.props.edit && this.props.edit.poly;
    if (area) {
      const coord = [area.center.longitude, area.center.latitude];
      const geom = Projection.geomFromLonLat(new ol.geom.Circle(coord, area.radius));
      // So incoming props editing is in another projection then incoming area
      if (this.props.area) {
        geom.setRadius(area.radius);
      }
      const feature = new ol.Feature(geom);
      feature.setId('editing');
      this.setupChangeListener(feature);
      return feature;
    }
    if (poly) {
      const coords = toPolygon(poly);
      const geom = Projection.geomFromLonLat(new ol.geom.Polygon(coords));
      const feature = new ol.Feature(geom);
      feature.setId('editing');
      return feature;
    }
    throw new Error(`unknown geometry: ${this.props.edit}`);
  };

  render() {
    return (
      <div>
        <MeasureTooltip
          editableR
          getOlMap={this.props.getOlMap}
          enabled={this.props.measure && this.state.showTooltip}
          mousePoint={this.state.mousePoint}
          distance={this.props.distance}
          bearing={this.props.bearing}
        />
      </div>
    );
  }
}

DrawTool.propTypes = {
  getOlMap: PropTypes.func.isRequired,

  enabled: PropTypes.bool.isRequired,
  activeDraw: PropTypes.bool,
  editable: PropTypes.bool,
  type: PropTypes.string,
  // either a string naming a specific style, or an object with fillColor, fillPattern, strokeColor
  style: PropTypes.any,
  measure: PropTypes.bool.isRequired,
  distance: PropTypes.number,
  bearing: PropTypes.number,
  radius: PropTypes.number,
  edit: PropTypes.object,
  area: PropTypes.object,
  reset: PropTypes.bool.isRequired,
  interaction: PropTypes.object,

  updateMeasure: PropTypes.func.isRequired,
  clearMeasure: PropTypes.func.isRequired,
  enableInteractions: PropTypes.func.isRequired,
  setDrawnGeometry: PropTypes.func.isRequired,
  updateByClient: PropTypes.func.isRequired,
  clearReset: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enabled: state.draw.enabled,
  editable: state.draw.editable,
  type: state.draw.type,
  style: state.draw.style,
  measure: state.draw.measure,
  distance: state.draw.distance,
  bearing: state.draw.bearing,
  radius: state.draw.radius,
  activeDraw: state.draw.activeDraw,
  edit: state.draw.edit,
  area: state.draw.area,
  reset: state.draw.reset,
  interaction: state.draw.interaction,
});

const mapDispatchToProps = dispatch => ({
  enableInteractions: value => {
    dispatch(mapActions.enableInteractions(value));
  },
  setMeasure: value => {
    dispatch(draw.setMeasure(value));
  },
  updateMeasure: (distance, bearing) => {
    dispatch(draw.updateMeasure({ distance, bearing }));
  },
  clearMeasure: () => {
    dispatch(draw.clearMeasure());
  },
  setDrawnGeometry: geom => {
    dispatch(draw.setDrawnGeometry(geom));
  },
  updateByClient: () => {
    dispatch(draw.updateByClient());
  },
  clearReset: () => {
    dispatch(draw.clearReset());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawTool);

const mapStyles = {
  checkered: [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(255, 255, 255, 0.65)',
        width: 6,
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
      }),
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 1.0)',
        lineDash: [1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 10, 5],
        width: 3,
      }),
    }),
  ],
};
