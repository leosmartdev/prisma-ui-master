/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */
import React from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import uuid from 'uuid/v4';

import DefaultMapStyle from '../dark-matter-style';
import DrawMode, { convertModeToTool, convertToolToMode } from './DrawMode';
import Hover from './Hover';
import Tooltip from './Tooltip';
import { Provider, Consumer } from './MapContext';
import { getFirstFeature } from './utils';

const MapboxDraw = require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw');

// eslint-disable-next-line
mapboxgl.accessToken =
  'pk.eyJ1IjoicGlsb3Rjb253YXkiLCJhIjoiY2poam1jbzl1MmQ1NTM4bnRpbXVlMTVrZyJ9.SusXqwEPEa_I5zad8YQbWw';

export default class Map extends React.PureComponent {
  static propTypes = {
    /**
     * ID of the map, if not provided one will be generated.
     */
    mapId: PropTypes.string,
    /**
     * When true, the map will take up all available space ignoring the width, height properties.
     * This uses window.innerWidth and window.innerHeight, so its not the browser full screen,
     * just full available space.
     */
    fullScreen: PropTypes.bool,
    /**
     * Sets width of map view in pixels.
     */
    width: PropTypes.number,
    /**
     * Sets height of map view in pixels.
     */
    height: PropTypes.number,
    /**
     * When fullScreen is true, this will allow the width to be adjusted using the provided offset
     * in pixels. This offset will be subtracted from the total width of the map after finding out
     * the fullScreen dimentions using window.innerWidth. This lets the user adjust the map size to
     * allow for navigation components.
     *
     * Accepts pixel values as a number or as a string eg 50 or "50px"
     */
    widthOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * When fullScreen is true, this will allow the height to be adjusted using the provided offset
     * in pixels. This offset will be subtracted from the total height of the map after finding out
     * the fullScreen dimentions using window.innerHeight. This lets the user adjust the map size to
     * allow for navigation components.
     *
     * Accepts pixel values as a number or as a string eg 50 or "50px"
     */
    heightOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * Sets latitude of map center point in decimals.
     * Min: -90
     * Max: 90
     * Resolution: 0.000001
     */
    latitude: PropTypes.number,
    /**
     * Sets longitude of map center point in decimals.
     * Min: -180
     * Max: 180
     * Resolution: 0.000001
     */
    longitude: PropTypes.number,
    /**
     * Sets zoom level of map. Integer value, 0 is furthest out zoom, 20 is closest.
     * Max: 0
     * Min: 20
     */
    zoom: PropTypes.number,
    /**
     * Pitch the map from top down to side view in degrees. 0˚ is top down, 60˚ is showing horizon.
     * Min: 0
     * Max: 60
     */
    pitch: PropTypes.number,
    /**
     * Compass heading of the top of the map. Defaults to point north (0˚) If changed the map will
     * rotate until the provided compass bearing is "up" to the top of the map window.
     * Min: 0
     * Max: 359
     */
    bearing: PropTypes.number,
    /**
     * When changed, flies the map to the provided location.
     *
     */
    flyTo: PropTypes.shape({
      longitude: PropTypes.number,
      latitude: PropTypes.number,
    }),
    /**
     * When true, map will not react to mouse or keyboard input and will stay "statically" placed
     * where the properties are set. Changing viewport properties will change the map location, this
     * just prevents user input directly.
     */
    static: PropTypes.bool,
    /**
     * Style is the controller for the entire map. It is a javascript or JSON immutable object
     * that continas all the styling information for every layer, as well as data sources, sprites,
     * and other basic map configuration options.
     *
     * The @prisma/map style is based on `mapbox-gl` style spec. Currently we are making no
     * modifications to this spec. https://www.mapbox.com/mapbox-gl-js/style-spec
     *
     * Layers and sources are entiely controlled by this style object at this time. There is an
     * intelligent diff happening to determine changes, so we shouldn't fear any perforamce issues
     * by updating this style spec often with new feature data.
     */
    style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // eslint-disable-line react/forbid-prop-types,max-len
    /**
     * Defines the current mode of the map. Mode determines what user interactions are available
     * as well as what map controls are shown.
     *
     * Possible values: 'draw', 'normal'
     */
    mode: PropTypes.string,
    /**
     * When `mode` is `draw` changing this property will change the current tool to the one
     * provided. When changing tools, all existing features that are drawn will be erased. Only
     * one feature can be drawn at a time.
     */
    drawTool: PropTypes.oneOf(['select', 'line', 'point', 'polygon']),
    /**
     * When mode is `draw` this property defines the incoming feature to start the draw mode with.
     * Changing this property will replace all features being drawn with the feature passed here.
     */
    drawFeature: PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.oneOf(['Feature']).isRequired,
      geometry: PropTypes.shape({
        type: PropTypes.oneOf(['Point', 'LineString', 'Polygon']),
      }).isRequired,
      properties: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    }),
    /**
     * Options object for configuring the different modes.
     *
     * for modeOptions.draw, see `https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md`
     * for more information about the structure of the options.
     */
    modeOptions: PropTypes.shape({
      draw: PropTypes.shape({
        displayControlsDefault: PropTypes.bool,
      }),
    }),
    /**
     * Child elements. Child elements should be controls and overlays that will be displayed over
     * the map. For layers/markers/etc... use the 'style' prop.
     */
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.element, PropTypes.func])),
    ]),
    /**
     * Called when map loads. Passes the map style object as well as a reference to the map.
     *
     * ## Signature
     * `onLoad(style: object, map: instance) => void`
     */
    onLoad: PropTypes.func,
    /**
     * Called when map is about to unload before the component unmounts.
     *
     * ## Signature
     * `onUnload() => void`
     */
    onUnload: PropTypes.func,
    /**
     * Callback called when the viewport has changed. Informational only, and will be called when
     * any value on the viewport is changed by any means, eg. mouse/keyboard interaction or prop
     * changes into this component. This is useful when external components (or redux) needs to
     * sync with changes to the internal mapbox state.
     *
     * Called on initial mount as well with intitial values.
     *
     * ## Signature
     * `onViewportChange(viewport: object) -> void`
     * @param {object} viewport
     * @param {float}  viewport.latitude -90 - 90
     * @param {float}  viewport.longitude -180 - 180
     * @param {float}  viewport.bearing 0 - 359.99
     * @param {float}  viewport.pitch 0 - 60
     * @param {float}  viewport.zoom 0 - 24
     * @param {object} viewport.bounds Min/Max lat/lng bounds of the viewport.
     * @param {float}  viewport.bounds.north north latitude boundary of the viewport -90 - 90
     * @param {float}  viewport.bounds.south  south latitude boundary of the viewport -90 - 90
     * @param {float}  viewport.bounds.east east longitude boundary of the viewport -180 - 180
     * @param {float}  viewport.bounds.west west longitude boundary of the viewport -180 - 180
     */
    onViewportChange: PropTypes.func,
    /**
     * onMove: called when the lat/lng map center location is changed. Called
     * continuously as the move is occuring.
     */
    onMove: PropTypes.func,
    /**
     * onMoveStart: called when the lat/lng map center location is starting to change
     */
    onMoveStart: PropTypes.func,
    /**
     * onMoveEnd: called when the lat/lng map center location is done changing.
     */
    onMoveEnd: PropTypes.func,
    /**
     * Called on every mouse move.
     */
    onMouseMove: PropTypes.func,
    /**
     * onZoom: called when zoom is changed.
     */
    onZoom: PropTypes.func,

    /**
     * Called when the user clicks on the map. Provides event that containes the point/latlng and
     * other basic event information.
     *
     * ## Signature
     * `onClick (event) => void`
     * @param {object} event
     * @param {object} event.lngLat
     * @param {float} event.lngLat.lat
     * @param {float} event.lngLat.lng
     * @param {object} event.point
     * @param {float} event.point.x
     * @param {float} event.point.y
     * @param {target} event.target
     * @param {event} event.originalEvent
     */
    onClick: PropTypes.func,

    /**
     * Callback when a specific layer is clicked. Provides a list of features under the cursor.
     * ## Signature
     * `onClick (event) => void`
     * @param {object} event
     * @param {object} event.lngLat
     * @param {float} event.lngLat.lat
     * @param {float} event.lngLat.lng
     * @param {object} event.point
     * @param {float} event.point.x
     * @param {float} event.point.y
     * @param {target} event.target
     * @param {event} event.originalEvent
     * @param {array} event.features // list of features under the cursor.
     */
    onLayerClick: PropTypes.func,

    /**
     * Array of all the layer ids that onLayerClick should listen for mouse clicks. When a layer id
     * is removed from this array, the component will stop listening to events on that layer, and
     * when a new layer id is added it will immeditately subscribe to events.
     * Unknown layer ids will be ignore and an empty array will unsubscribe from all click events.
     */
    clickLayers: PropTypes.arrayOf(PropTypes.string),

    /*
     * Draw Mode Events
     */

    /**
     * Called when in draw mode and the user is drawing. This is called often whenever the mouse is
     * being moved and a geojson object is being rendered to the screen.
     */
    onDrawRender: PropTypes.func,
    /**
     * Called when the user has finished drawing a feature.
     *
     * # Signature
     * `onDrawCreate(feature: GeoJSON object, event: object) -> void`
     */
    onDrawCreate: PropTypes.func,
    /**
     * Called when in draw mode and a drawn feature was updated.
     *
     * # Signature
     * `onDrawUpdate(feature: GeoJSON object, event: object) -> void`
     */
    onDrawUpdate: PropTypes.func,
    /**
     * Called when a drawn feature is deleted.
     * `onDrawDelete(feature: GeoJSON object, event: object) -> void`
     */
    onDrawDelete: PropTypes.func,
    /**
     * Called when the draw tool changes. Passes the event generated and the string tool name
     * Tool is one of 'select', 'point', 'line', 'polygon'
     *
     * # Signature
     * `onDrawToolChange(tool: string, event: object) -> void`
     */
    onDrawToolChange: PropTypes.func,
  };

  static defaultProps = {
    mapId: uuid(),
    fullScreen: false,
    width: 800,
    height: 500,
    widthOffset: 0,
    heightOffset: 0,
    latitude: 0,
    longitude: 0,
    zoom: 4,
    pitch: 0,
    bearing: 0,
    flyTo: {},
    static: false,
    style: { ...DefaultMapStyle },
    mode: 'normal',
    drawTool: 'select',
    drawFeature: null,
    modeOptions: {
      draw: {
        disaplayControlsDefault: false,
      },
    },
    children: null,
    onLoad: () => {},
    onUnload: () => {},
    onViewportChange: () => {},
    onMove: null,
    onMoveStart: null,
    onMoveEnd: null,
    onMouseMove: null,
    onZoom: null,
    onClick: null,
    clickLayers: [],
    onLayerClick: null,
    onDrawRender: null,
    onDrawCreate: null,
    onDrawUpdate: null,
    onDrawDelete: null,
    onDrawToolChange: null,
  };

  static Consumer = Consumer;

  static DrawMode = DrawMode;

  static Hover = Hover;

  static Tooltip = Tooltip;

  constructor(props) {
    super(props);

    // For enzyme testing. Spys dont work right when trying to spy before mounting a component
    // when using arrow functions, so you need to do old bind method to get that to work correctly.
    // https://github.com/airbnb/enzyme/issues/365
    this.onLoad = this.onLoad.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.startDrawMode = this.startDrawMode.bind(this);
  }

  state = {
    fullScreen: this.props.fullScreen, // eslint-disable-line
    width: this.props.width, // eslint-disable-line
    height: this.props.height, // eslint-disable-line
    // True when the map is loaded.
    loaded: false,
  };

  static getDerivedStateFromProps(newProps, prevState) {
    const newState = {};
    let stateChanged = false;

    if (!newProps.fullScreen) {
      if (newProps.width !== prevState.width && newProps.width) {
        newState.width = newProps.width;
        stateChanged = true;
      }

      if (newProps.height !== prevState.height && newProps.height) {
        newState.height = newProps.height;
        stateChanged = true;
      }
    }

    if (newProps.fullScreen !== prevState.fullScreen) {
      if (newProps.fullScreen) {
        newState.fullScreen = true;
      } else {
        newState.width = newProps.width;
        newState.height = newProps.height;
        newState.fullScreen = false;
      }
      stateChanged = true;
    }

    return stateChanged ? newState : null;
    // convert any new layers to the sources and style
  }

  componentDidMount() {
    this.createMapInstance();
    this.setupMapboxEventHandlers();
    this.checkForModeChanges({});

    if (global.window) {
      this.updateWindowDimensions();
      global.window.addEventListener('resize', this.updateWindowDimensions);
    }

    this.emitViewportChange();
  }

  componentDidUpdate(prevProps, prevState) {
    const { fullScreen, width, height } = this.state;

    // If the user has changed fullscreen mode, then we need to calculate the new window dimensions
    // The render following we will then tell mapbox to resize. This must be done in two parts
    // because the container needs to be resized first, the mapbox will conform to that new
    // container size..
    if (fullScreen && !prevState.fullScreen) {
      this.updateWindowDimensions();
    }

    // Did we update window dimensions last render? If so, we need to inform mapbox
    if (prevState.width !== width || prevState.height !== height) {
      this.map.resize();
    }

    this.checkForStyleChanges(prevProps);
    this.checkForViewportChanges(prevProps);
    this.checkForModeChanges(prevProps);
    this.checkForMapEventChanges(prevProps);
  }

  componentWillUnmount() {
    this.onUnload();
    if (global.window) {
      global.window.removeEventListener('resize', this.updateWindowDimensions);
    }

    this.map.off('load', this.onLoad);
  }

  /* **************************************************************************
   *
   * Event handlers
   *
   * Functions handling the events setup using `this.map.on(*)`
   *
   ************************************************************************* */

  /**
   * Called when the map initially loads. Here we call this.props.onLoad() to pass the actual style
   * the map will be using so users of map have the style object not just the url since if map was
   * created with URL, at this point the map has the full style object.
   *
   * Also, the props on load
   * is passed `this` as well, so they have a reference to the map component object. This avoids
   * the ref usage if needed. To the user though, they should only know that that object passed
   * as the second param to props.onLoad() is an object that has the function `on` and `flyTo`, the
   * two current external functions necessary to be called. `on` is used because
   * `on('event', 'layer', () => {})` can't have a callback prop like onClick because we are
   * selecting based on dynamic layer names.
   */
  onLoad(style) {
    const { onLoad } = this.props;
    this.setState({ loaded: true });
    onLoad(style || this.map.getStyle(), this);
  }

  /**
   * Called when the map is about to unload because the component is unmounting. This allows for any
   * cleanup to occur.
   *
   * Passes no parameters.
   */
  onUnload() {
    const { onUnload } = this.props;
    onUnload();
  }

  /**
   * Called when the mousemoves over the map. Mapbox provides an event structure that inclues
   * the x,y `point` on the map as well as the lat/lng `coordinates`
   *
   * This function currently handles checking if we are in draw mode and if so getting the list of
   * features under the mouse so we can fire `onDrawMouseMove` and do things like measure on the
   * fly while the user is moving the mouse. This will be replaced by our custom draw mode so we
   * wont need to hijack on mouse move, and we will only attach to mousemove when the user wants to
   * listen by sending oin the onMouseMove prop.
   */
  onMouseMove(event) {
    const { onMouseMove } = this.props;
    if (onMouseMove) {
      onMouseMove(event);
    }
  }

  /**
   * Called when map is clicked.
   */
  onClick = event => {
    const { onClick } = this.props;
    if (onClick) {
      onClick(event);
    }
  };

  /**
   * Called when a specific layer is clicked.
   */
  onLayerClick = event => {
    const { onLayerClick } = this.props;
    if (onLayerClick) {
      onLayerClick(event);
    }
  };

  setupMapboxEventHandlers = () => {
    const { onZoom, onMove, onMoveStart, onMoveEnd } = this.props;

    this.map.on('load', event => {
      this.onLoad(event.target.style.stylesheet);
    });

    if (onZoom !== null) {
      this.map.on('zoom', event => {
        onZoom(event);
      });
    }

    if (onMove !== null) {
      this.map.on('move', event => {
        onMove(event);
      });
    }

    if (onMoveStart !== null) {
      this.map.on('movestart', event => {
        onMoveStart(event);
      });
    }

    /**
     * Called whenever a map move has ended. Move can be user interaction, fly to, rotate, zoom,
     * prop change, etc... Since this is called on all interaction moves, we use move end to emit
     * the `onViewportChange`
     */
    this.map.on('moveend', event => {
      if (onMoveEnd !== null) {
        onMoveEnd(event);
      }
      this.emitViewportChange();
    });

    this.map.on('mousemove', event => {
      this.onMouseMove(event);
    });

    /**
     * Click Events
     */
    this.map.on('click', this.onClick);

    /**
     * Drawing events
     * TODO: we should be doing this when the mode changes, then, removing the handlers
     * when we leave draw mode so we dont have open handlers not being used.
     */
    this.setupDrawEventHandlers();
    this.setupLayerEventHandlers();
  };

  setupDrawEventHandlers = () => {
    const { onDrawCreate, onDrawUpdate, onDrawDelete, onDrawRender, onDrawToolChange } = this.props;
    this.map.on('draw.create', event => {
      if (onDrawCreate) {
        onDrawCreate(getFirstFeature(event.features), event);
      }
    });

    this.map.on('draw.update', event => {
      if (onDrawUpdate) {
        onDrawUpdate(getFirstFeature(event.features), event);
      }
    });

    this.map.on('draw.delete', event => {
      if (onDrawDelete) {
        onDrawDelete(event);
      }
    });

    this.map.on('draw.render', event => {
      if (onDrawRender) {
        const { features } = this.draw.getAll();
        const feature = getFirstFeature(features);
        if (feature) {
          onDrawRender(event, feature);
        }
      }
    });

    this.map.on('draw.modechange', event => {
      if (onDrawToolChange) {
        const tool = convertModeToTool(this.draw.getMode());
        onDrawToolChange(tool, event);
      }
    });
  };

  setupLayerEventHandlers = () => {
    const { clickLayers } = this.props;
    clickLayers.forEach(layer => {
      this.map.on('click', layer, this.onLayerClick);
    });
  };

  /**
   * Creates the mapbox-gl instance and places it on the dive with the id of `map`. Sets this.map
   * to the mapbox instance.
   */
  // eslint-disable-next-line react/sort-comp
  createMapInstance = () => {
    // static is a reserved word so can't destructure
    // eslint-disable-next-line
    const isStatic = this.props.static;

    const { mapId, style, latitude, longitude, zoom, pitch, bearing } = this.props;

    this.map = new mapboxgl.Map({
      container: mapId,
      style, // : 'mapbox://styles/mapbox/dark-v9',
      center: [longitude, latitude],
      zoom,
      bearing,
      pitch,
      interactive: !isStatic,
    });

    /**
     * Attach to functions we want to expose to the React context and ref attributes.
     * External users of Map shouldn't know there's a `this.map` that is the mapbox object.
     * If we have to support other map implementations, this is where we would decide to convert
     * these function calls into the calls for that map object
     */
    this.on = (...args) => this.map.on(...args);
    this.off = (...args) => this.map.off(...args);
    this.project = (...args) => this.map.project(...args);
    this.unproject = (...args) => this.map.unproject(...args);
  };

  on = () => {
    console.warn(
      'Called map.on() before map was loaded. Please wait until after onLoad() is called',
    );
  };

  off = () => {
    console.warn(
      'Called map.off() before map was loaded. Please wait until after onLoad() is called',
    );
  };

  /**
   * Checks if the style property has changed, and if it has, inform mapbox.
   */
  checkForStyleChanges = () => {
    const { style } = this.props;
    const { loaded } = this.state;
    if (this.map && loaded) {
      if (typeof style === 'string') {
        this.style = style;
      } else {
        this.style = { ...style };
      }

      this.map.setStyle(this.style);
    }
  };

  /**
   * Checks if the user made a change to one of the viewport props, if so, inform mapbox of the
   * change.
   *
   * Viewport values:
   * - latitude
   * - longitude
   * - zoom
   * - bearing
   * - pitch
   */
  checkForViewportChanges = prevProps => {
    const { latitude, longitude, zoom, bearing, pitch, flyTo } = this.props;
    let viewportDidChange = false;

    // Viewport changes.
    if (prevProps.latitude !== latitude || prevProps.longitude !== longitude) {
      this.map.setCenter([longitude, latitude]);
      viewportDidChange = true;
    }
    if (prevProps.zoom !== zoom) {
      this.map.setZoom(zoom);
      viewportDidChange = true;
    }
    if (prevProps.bearing !== bearing) {
      this.map.setBearing(bearing);
      viewportDidChange = true;
    }
    if (prevProps.pitch !== pitch) {
      this.map.setPitch(pitch);
      viewportDidChange = true;
    }

    if (
      prevProps.flyTo.latitude !== flyTo.latitude ||
      prevProps.flyTo.longitude !== flyTo.longitude
    ) {
      this.flyTo(flyTo.latitude, flyTo.longitude);
    }

    if (viewportDidChange) {
      this.emitViewportChange();
    }
  };

  /**
   * Checks if the user changed the mode prop, if so, stop current mode and start the new selected
   * mode. If we are in draw mode, also checks for drawTool changes.
   */
  checkForModeChanges = prevProps => {
    const { mode, drawTool, drawFeature } = this.props;
    // Did the draw mode change, if so, lets tell mapbox.
    if (mode !== prevProps.mode) {
      switch (mode) {
        case 'draw': {
          this.startDrawMode();
          break;
        }
        case 'normal':
        default: {
          if (prevProps.mode === 'draw') {
            this.stopDrawMode();
          }
          // Just treat as normal mode.
        }
      }
    }

    if (mode === 'draw') {
      if (drawTool !== prevProps.drawTool) {
        this.changeDrawTool();
      }

      if (drawFeature !== prevProps.drawFeature) {
        this.addFeatureToDraw();
      }
    }
  };

  /**
   * Checks if the user changed the clickLayers props. If so, we need to subscribe or
   * unsubscribe from click events on the changed layers.
   */
  checkForMapEventChanges = prevProps => {
    const { clickLayers } = this.props;
    if (prevProps.clickLayers !== clickLayers) {
      this.updateClickLayers(prevProps.clickLayers);
    }
  };

  emitViewportChange = () => {
    const { onViewportChange } = this.props;
    const { lng, lat } = this.map.getCenter();
    const bounds = this.map.getBounds();
    onViewportChange({
      latitude: lat,
      longitude: lng,
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch(),
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
    });
  };

  /* **************************************************************************
   *
   * External Public API Functions
   *
   * The following functions are for users of Map to interact with using
   * the ref={} on <Map>
   *
   ************************************************************************* */

  /**
   * Flies to the provided latitude and longitude.
   */
  flyTo = (latitude, longitude) => {
    this.map.flyTo({
      center: [longitude, latitude],
    });
  };

  /**
   * Get the current map mode
   * @return {string}
   */
  getMapMode = () => {
    const { mode } = this.props;
    return mode;
  };

  /**
   * Called when the mode of the map changes to draw mode. This will perform all operations
   * required to set the component up for drawing and inform the mapbox instance that we want the
   * draw tools.
   */
  startDrawMode() {
    const { modeOptions } = this.props;
    if (typeof this.draw === 'undefined') {
      this.draw = new MapboxDraw(modeOptions.draw || {});
    }

    if (this.map) {
      this.map.addControl(this.draw);
    }

    this.addFeatureToDraw();
  }

  /**
   * Stops draw mode and removes the draw controls from the map.
   *
   * This will not clear `this.draw` however, it just removes the controls. Next time we start
   * draw mode, the same controls will be reused for performance.
   */
  stopDrawMode = () => {
    if (this.draw && this.map) {
      this.map.removeControl(this.draw);
    }
  };

  /**
   * Changes the current draw mode to the drawTool currently in use. Removes all existing features
   * when changing the mode. Only 1 feature can be drawn at any time.
   */
  changeDrawTool = () => {
    const { drawTool } = this.props;
    if (typeof this.draw !== 'undefined' && this.draw !== null) {
      const tool = convertModeToTool(this.draw.getMode());
      if (drawTool !== tool) {
        const mode = convertToolToMode(drawTool);

        this.draw.deleteAll();
        this.draw.changeMode(mode);
      }
    }
  };

  /**
   * If a feature is on `this.props.drawFeature` this function will
   * add that feature to the draw tool. Removes all other features on the draw tool.
   */
  addFeatureToDraw = () => {
    const { drawFeature } = this.props;
    if (drawFeature && this.draw) {
      // If the current feature isn't the same, then remove all features before adding
      if (!drawFeature.id || !this.draw.get(drawFeature.id)) {
        this.draw.deleteAll();
      }
      this.draw.add(drawFeature);
    }
  };

  /**
   * Updates the width/height map dimensions when in full screen to match the window dimensions.
   * This wil adjust state.width and state.height to match window.innerHeight and window.innerWidth.
   *
   * If there is a widthOffset or heighOffset given, then this will also take those offsets into
   * account and reduce the width or heigh by that pixel amount.
   */
  updateWindowDimensions = () => {
    const { widthOffset, heightOffset } = this.props;
    const { fullScreen } = this.state;
    if (fullScreen) {
      let computedWidthOffset = widthOffset || 0;
      let computedHeightOffset = heightOffset || 0;

      if (widthOffset) {
        if (typeof widthOffset === 'string') {
          computedWidthOffset = parseInt(widthOffset, 10);
        }
      }

      if (heightOffset) {
        if (typeof heightOffset === 'string') {
          computedHeightOffset = parseInt(heightOffset, 10);
        }
      }

      this.setState({
        width: global.window.innerWidth - computedWidthOffset,
        height: global.window.innerHeight - computedHeightOffset,
      });
    }
  };

  /**
   * Updates the click event listeners with the changed clickLayers array of layer IDs.
   * @param {array(string)} prevLayers The list of previous layer ids to do the diff with to get
   *  the changes in clickLayers.
   */
  updateClickLayers = prevLayers => {
    const { clickLayers } = this.props;
    if (prevLayers.length > 0) {
      prevLayers.forEach(layer => {
        if (!clickLayers.includes(layer)) {
          this.map.off('click', layer, this.onLayerClick);
        }
      });
    }

    if (clickLayers.length > 0) {
      clickLayers.forEach(layer => {
        if (!prevLayers.includes(layer)) {
          this.map.on('click', layer, this.onLayerClick);
        }
      });
    }
  };

  render() {
    const { children, mapId } = this.props;

    const { width, height, loaded } = this.state;

    /* <FullscreenResizer fullScreen={} width={} height={} onResize={this.map.resize}>
     *   (computedWith, computedHeight, isFullScreen) => (
     *     <div id="map" style={{ width: computedWidth, height: computedHeight }} />
     *   )
     * </FullscreenResizer>
     */
    return (
      <div style={{ position: 'relative', width, height }}>
        <div id={mapId} key={mapId} className="prisma-map-div" style={{ width, height }} />
        <div
          id="map-controls-overlay"
          key="map-controls-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Since many children depend on the provider, only load the children and the provider
          once the map itself has loaded. This simplies the sub code and avoids having to worry
          about checking if the map loaded on the provider instance.
          */}
          {loaded && <Provider value={this}>{children}</Provider>}
        </div>
      </div>
    );
  }
}
