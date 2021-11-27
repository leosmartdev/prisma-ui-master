/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 *
 * Component that provides the bindings between the `<Map>` component
 * and the redux store.
 *
 * Usage:
 * ```
 * <ConnectedMap mapConfig={config}>
 * </ConnectedMap>
 * ```
 *
 * NOTE:
 * EXPECTED to already be in redux store,
 *  - layers - the dynamic layers this map will reference.
 *  - features - the features to be placed on the dynamic layers.
 *
 * If a layer is referenced and no layers are found in the store matching that layer id
 * then the map style that is generated will be invalid. You can also provide overrides or full
 * layer definitions using config.layers[layerId] = {layer object};
 *
 * config is the map config object that contains the following:
 * {
 *   // ID of the map. Required.
 *   id: string,
 *   // Style URL or object in mapbox-gl spec format. Sets initial style for the map.
 *   style: object | string,
 *   layers: {
 *     // List of all layer ids that can be toggled by user interaction.
 *     toggleableLayers: array(string),
 *     // list of layers that are to be dynamically generated when style updates are requested.
 *     dynmaicLayers: array(string),
 *     // key/value pairs of layerId to layer that provides map specific definitions for a layer
 *     // or overrides if the layer is already defined globally.
 *     [layerId]: Object(Layer),
 *   }
 * }
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import loglevel from 'loglevel';

import Map from '../../Map';

import {
  getGeneratedStyleForMap,
  getFlyToPositionForMap,
  getModeForMap,
} from '../map/selectors';
import {
  getDrawToolForMap,
  getInputDrawFeatureForMap,
} from '../map/draw/selectors';
import { mapLoaded, createMap } from '../map/actions';
import { setOutputFeatureFromDraw } from '../map/draw/actions';

const log = loglevel.getLogger('@prisma/map');

class ConnectedMap extends React.Component {
  static propTypes = {
    /**
     * Called when map is loaded. Passes the map style and the map instance.
     * See `<Map>.onLoad()` property for more information.
     */
    onLoad: PropTypes.func,
    /**
     * Configuration for this specific map. All objects provided here will override the defaults
     * when generating a style for this map.
     */
    mapConfiguration: PropTypes.shape({
      id: PropTypes.string,
      style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      layers: PropTypes.shape({
        toggleableLayers: PropTypes.arrayOf(PropTypes.string),
        dynamicLayers: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
    /**
     * When configuration is null, can set the map ID using this prop.
     */
    mapId: PropTypes.string,

    /** @private connect() */
    generatedStyle: PropTypes.object,
    /** @private connect() */
    mapLoaded: PropTypes.func.isRequired,
    /** @private connect() */
    setOutputFeatureFromDraw: PropTypes.func.isRequired,
    /** @private connect() */
    createMap: PropTypes.func.isRequired,
    /** @private connect() */
    flyTo: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    /** @private connect() */
    mode: PropTypes.string,
    /** @private connect() */
    drawTool: PropTypes.string,
    /** @private connect() */
    drawFeature: PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.oneOf(['Feature']).isRequired,
      geometry: PropTypes.shape({
        type: PropTypes.oneOf(['Point', 'LineString', 'Polygon']),
      }).isRequired,
      properties: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    }),
  }

  static defaultProps = {
    onLoad: () => {},
    mapConfiguration: { },
    generatedStyle: undefined,
    flyTo: {},
    mode: 'normal',
    drawTool: 'select',
    drawFeature: null,
    mapId: undefined,
  }

  static mapStateToProps = (state, ownProps) => ({
    generatedStyle: getGeneratedStyleForMap(
      state,
      ownProps.mapId || (ownProps.mapConfiguration && ownProps.mapConfiguration.id),
    ),
    flyTo: getFlyToPositionForMap(
      state,
      ownProps.mapId || (ownProps.mapConfiguration && ownProps.mapConfiguration.id),
    ),
    mode: getModeForMap(
      state,
      ownProps.mapId || (ownProps.mapConfiguration && ownProps.mapConfiguration.id),
    ),
    drawTool: getDrawToolForMap(
      state,
      ownProps.mapId || (ownProps.mapConfiguration && ownProps.mapConfiguration.id),
    ),
    drawFeature: getInputDrawFeatureForMap(
      state,
      ownProps.mapId || (ownProps.mapConfiguration && ownProps.mapConfiguration.id),
    ),
  })

  static mapDispatchToProps = dispatch => ({
    mapLoaded: (mapId, style) => {
      dispatch(mapLoaded(mapId, style));
    },
    createMap: (mapConfiguration) => {
      dispatch(createMap(mapConfiguration));
    },
    setOutputFeatureFromDraw: (mapId, feature) => {
      dispatch(setOutputFeatureFromDraw(mapId, feature));
    },
  });

  componentDidMount() {
    const config = { ...this.props.mapConfiguration };
    if (!config.id) {
      config.id = this.props.mapId;
    }
    this.mapId = config.id;

    if (!this.mapId) {
      log.error('<ConnectedMap> Requires mapId prop or id property on mapConfiguration. No mapId was provided, so map will not load.');
      return;
    }

    this.props.createMap(config);
  }

  onLoad = (style, map) => {
    this.props.mapLoaded(this.mapId, style);
    this.props.onLoad(style, map);
  }

  onDrawFeatureUpsert = (feature) => {
    this.props.setOutputFeatureFromDraw(this.mapId, feature);
  }

  render() {
    const {
      mapConfiguration,
      generatedStyle,
      onLoad,
      flyTo,
      mode,
      ...props
    } = this.props;

    return (
      <Map
        style={generatedStyle || mapConfiguration.defaultStyle}
        flyTo={flyTo}
        mode={mode}

        onLoad={this.onLoad}
        onDrawCreate={this.onDrawFeatureUpsert}
        onDrawUpdate={this.onDrawFeatureUpsert}

        {...props}
      />
    );
  }
}

export default connect(ConnectedMap.mapStateToProps, ConnectedMap.mapDispatchToProps)(ConnectedMap);
