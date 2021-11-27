import { remote } from 'electron';
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '../../../lib/i18n';
import { connect } from 'react-redux';
import ol from 'openlayers';
import loglevel from 'loglevel';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
const macaddress = require('macaddress');
import moment from 'moment-timezone';

// Components
import { Dispatcher } from './Dispatcher';

import * as iconActions from 'icon/icon';
import TooltipPanel from 'components/tooltip/TooltipPanel';
import DrawTool from './DrawTool';
import ManualTrackTool from './ManualTrackTool';
import MarkerTool from './MarkerTool';
import AlertHighlighter from './AlertHighlighter';
import Coordinates from './Coordinates';
import FeatureCounts from './FeatureCounts';

import { showSnackBanner } from '../../../banner/banner';

// Helpers & Actions
import { ais, tv32, orbcomm, vtsais } from './layers/ais';
import { manual } from './layers/manual';
import { omnicomVMS, omnicomSolar } from './layers/omnicom';
import { radar, vtsradar } from './layers/radar';
import { sarsat } from './layers/sarsat';
import { sart } from './layers/sart';
import { site } from './layers/site';
import { unknown } from './layers/unknown';
import { zone } from './layers/zone';
import { spidertrack } from './layers/spidertrack';
import { adsb } from './layers/adsb';
import { marker } from './layers/marker';

import * as tooltipActions from 'tooltip/tooltip';
import * as mapActions from 'map/map';
import * as selectionActions from 'selection/selection';
import * as infoActions from 'info/info';
import * as filterTracksActions from "filter-tracks/filter-tracks";
import * as markerActinos from 'marker/marker';
import * as messageActions from 'message/message';
import { downloadFile } from 'file/download';
import { getLookup, getPositionLookup } from 'map/lookup';

const moveDelay = 500; // ms
const hoverDelay = 500; // ms
const log = loglevel.getLogger('map');
const logFeature = loglevel.getLogger('feature');
const geojson = new ol.format.GeoJSON();
const tooltipOffset = [15, 0]; // pixels
// https://openlayers.org/en/latest/apidoc/ol.Sphere.html
// WGS-84
const sphere = new ol.Sphere(6378137);

const styles = {
  map: {
    width: '100%',
    height: '100%',
  },
  tooltip: {
    position: 'absolute',
    zIndex: 100,
  },
};

class OpenLayersMap extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      showCoords: false,
      mouseLatitude: 0,
      mouseLongitude: 0,
      totalFeatures: 0,
      visibleFeatures: 0,
    };
    this.map = null;
    this.moveTimer = null;
    this.selectionInteraction = null;
    this.hoverInteraction = null;
    this.hoverTimer = null;
    this.hoveringFeature = null;
    this.hoverAt = null;
    this.tooltipOverlay = null;
    this.animationEndTimer = null;
    this.crosshairsTimer;
    this.animationId = null;
    this.extraProperties = {};
    this.alertHighlighter;
    this.isLoadingIcons = false;
    this.customIconImages = [];

    /**
     * To show the manual tracks when a user filters the map
     * Current Map Filtering is handled in featureUpdate() func
     * This means that the tracks are filtered whenever the frontend receives a socket message from server
     * The messages of the other tracks are received frequently since the devices submits the signal
     * But manual track is created manually as its name suggests
     * So we need to handle this track manually
     */
    this.manualTrackList = [];
  }

  componentDidMount() {
    this._isMounted = true;
    const { setDefaultIcon, initCustomIcon, filterTracks, createTransaction } = this.props;

    const lat = this.props.config.lat || 0;
    const lon = this.props.config.lon || 0;
    const zoom = this.props.config.zoom || 0;

    this.map = new ol.Map({
      target: 'map',
      view: new ol.View({
        maxZoom: 18,
        center: ol.proj.fromLonLat([lon, lat]),
        zoom,
      }),
      interactions: ol.interaction.defaults({ doubleClickZoom: false }),
      controls: [],
    });

    let source;
    const config = this.props.config;
    if (config && config.service && config.service.map && config.service.map.base) {
      let suffix = '';
      if (!config.service.map.base.includes('{z}/{x}/{y}')) {
        suffix = '/{z}/{x}/{y}.png';
      }

      source = new ol.source.OSM({
        attributions: [ol.source.OSM.ATTRIBUTION],
        url: `${config.service.map.base}${suffix}`,
      });
      log.info('Creating map layer with options', source);
    } else {
      // Use defualt map
      source = new ol.source.TileJSON({
        url: 'https://api.maptiler.com/maps/positron/256/tiles.json?key=zbnPRwOrABWw5gM6d3qH',
        crossOrigin: 'anonymous',
      });
    }

    const osm = new ol.layer.Tile({ source });
    osm.setZIndex(10);
    this.map.addLayer(osm);

    this.isLoadingIcons = true;

    // Load custom icons
    macaddress.one(async (err, mac) => {
      await createTransaction(iconActions.getIcon(mac))
        .then(customIcons => {
          // At first, load custom icon images only one time
          Promise.all(customIcons.map(elem => {
            if (!elem.deleted) {
              return this.loadImage(elem);
            }
          })).then(
            () => {
              // store custom icon list into Redux
              initCustomIcon(this.customIconImages);

              this.dispatcher = new Dispatcher(this.map, setDefaultIcon, this.customIconImages, filterTracks);
              // layer def, zIndex
              this.dispatcher
                .register(zone(), 20)
                .register(site(), 49)
                .register(vtsradar(), 50)
                .register(radar(), 59)
                .register(orbcomm(), 60)
                .register(tv32(), 61)
                .register(vtsais(), 62)
                .register(ais(), 69)
                .register(omnicomVMS(), 70)
                .register(omnicomSolar(), 71)
                .register(sart(), 72)
                .register(sarsat(), 73)
                .register(manual(), 74)
                .register(spidertrack(), 76)
                .register(adsb(), 76)
                .register(unknown(), 79)
                .register(marker(), 80);

              this.isLoadingIcons = false;

              this.map.on('moveend', this.viewChanged);

              this.selectionInteraction = new ol.interaction.Select({
                condition: ol.events.condition.click,
              });
              this.selectionInteraction.on('select', this.select);
              this.map.addInteraction(this.selectionInteraction);

              this.hoverInteraction = new ol.interaction.Select({
                condition: ol.events.condition.pointerMove,
                filter: function (feature, layer) {
                  if (feature.getProperties().noSelect) {
                    return false;
                  }
                  return true;
                }
              });
              this.hoverInteraction.on('select', this.hover);
              this.map.addInteraction(this.hoverInteraction);

              const mapElement = this.map.getTargetElement();
              this.map.on('pointermove', this.mouseMove);
              mapElement.addEventListener('mouseover', this.mouseOver);
              mapElement.addEventListener('mouseleave', this.mouseLeave);

              const tooltipElement = document.getElementById('tooltip');
              this.tooltipOverlay = new ol.Overlay({
                element: tooltipElement,
                offset: tooltipOffset,
              });
              this.map.addOverlay(this.tooltipOverlay);

              this.extraProperties = {};
              this.alertHighlighter = new AlertHighlighter(this);

              // Get SIT messages
              let dateFormatString = 'MMM DD, YYYY hh:mm A';
              let startDateTime = new Date(moment(moment().subtract(1, 'day').format(dateFormatString)));
              let endDateTime = new Date(moment(moment().format(dateFormatString)));

              startDateTime = parseInt((startDateTime - startDateTime.getTimezoneOffset() * 60 * 1000) / 1000);
              endDateTime = parseInt((endDateTime - (endDateTime.getTimezoneOffset() - 1) * 60 * 1000) / 1000);

              createTransaction(messageActions.listMessages(0, 0, startDateTime, endDateTime));

              this.props.server
                .post('/view')
                .then(this.startStream)
                .catch(error => {
                  log.error('Unable to open view', error);
                });
            });
        });
    })
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (!this.map || this.isLoadingIcons == true) {
      return false;
    }

    this.props.closeSocket();
    const mapElement = this.map.getTargetElement();
    mapElement.removeEventListener('mousemove', this.mouseMove);
    mapElement.removeEventListener('mouseover', this.mouseOver);
    mapElement.removeEventListener('mouseleave', this.mouseLeave);
    this.map.setTarget(null);
    this.map.un('moveend', this.viewChanged);
    this.map = null;
  }

  componentDidUpdate = prev => {
    if (!this.map || this.isLoadingIcons == true) {
      return false;
    }

    if (this.props.center) {
      this.map.getView().setCenter(ol.proj.fromLonLat(this.props.center));
      this.props.centerSet();
    }
    if (this.props.zoom) {
      this.map.getView().setZoom(this.props.zoom);
      this.props.zoomSet();
    }
    if (prev.selection !== this.props.selection) {
      this.highlightSelection(prev.selection, this.props.selection);
    }
    if (this.props.hoveringId && prev.hoveringId !== this.props.hoveringId) {
      this.setTooltipPosition();
    }
    if (prev.interactionsEnabled !== this.props.interactionsEnabled) {
      this.enableInteractions(this.props.interactionsEnabled);
    }
    if (!prev.animationTarget && this.props.animationTarget) {
      this.flyTo();
    }
    if (this.props.latestNotice && prev.latestNotice !== this.props.latestNotice) {
      this.alertHighlighter.update(this.props.latestNotice);
    }
    if (this.props.newWindow) {
      this.newWindow();
      this.props.clearNewWindow();
    }
    if (this.props.curMarkerGeoJSON) {
      this.addMarker(this.props.curMarkerGeoJSON);
    }
    if (JSON.stringify(this.props.listMarkers) != JSON.stringify(prev.listMarkers) && !this.props.curMarkerGeoJSON) {
      this.filterMarkers();
    }
    if (JSON.stringify(this.props.filterTracks) != JSON.stringify(prev.filterTracks)) {
      this.filterTracks();
    }
    if (JSON.stringify(this.props.customIcons) != JSON.stringify(prev.customIcons)) {
      this.dispatcher.customIconImages = this.props.customIcons;
      this.redrawTracks();
    }
  };

  startStream = response => {
    this.props.setViewId(response.ID);
    const socket = this.props.server.socket('/view/stream', this.updateExtentRequest(response.ID));
    socket.onmessage = data => setTimeout(() => this.featureUpdate(data), 0);
    socket.onerror = this.socketError;
    this.props.openSocket(socket);
  };

  socketError = error => {
    log.error('feature socket error', error);
    this.props.socketError(error);
  };

  readFeature(feature) {
    const retFeat = geojson.readFeature(feature);
    if (feature.properties.shape === 'circle') {
      const coord = feature.geometry.coordinates[0][0];
      const radius = feature.geometry.coordinates[0][1][0];
      const geometry = new ol.geom.Circle(coord, radius);
      retFeat.setGeometry(geometry);
    }
    return retFeat;
  }

  featureUpdate = message => {
    const parsed = JSON.parse(message.data);
    if (parsed.status !== 'CountOnly') {
      let feature = null;
      try {
        feature = this.readFeature(parsed.feature);
      } catch (error) {
        log.error('unable to convert feature', message);
        return;
      }
      feature.setId(parsed.feature.id);
      const extras = this.extraProperties[feature.getId()];
      if (extras) {
        feature.setProperties(extras);
      }
      // when receiving a manual track signal then save it to state
      let props = feature.getProperties();
      let type = props.type;

      if (parsed.status === 'Current' && type === manual().type) {
        let manualTrackList = this.manualTrackList;
        let isExist = false;

        manualTrackList.forEach(elem => {
          if (elem.getId() === feature.getId()) {
            isExist = true;
          }
        });

        if (isExist === false) {
          manualTrackList.push(feature);
        }
      }

      // filter tracks      
      let show = false;
      const { filterTracks } = this.props;

      filterTracks.forEach(elem => {
        if (elem.children.includes(type) && elem.show === true) {
          show = true;
        }
      });

      if (parsed.status === 'Current' && show === false) {
        return;
      }

      this.dispatcher.dispatch(parsed.status, feature);
      if (this.hoveringFeature && feature.getId() === this.hoveringFeature.getId()) {
        const { id, type } = getLookup(feature.getProperties());
        const trackId = feature.getProperties().trackId;
        this.props.getTooltipInfo(id, type, trackId);
      }
      if (parsed.counts) {
        this.setState({
          totalFeatures: parsed.counts.total,
          visibleFeatures: parsed.counts.visible,
        });
      }
      const selectedCurrent =
        this.props.selection && this.props.selection.getId() === feature.getId();
      if (parsed.status === 'Timeout' && selectedCurrent) {
        this.props.unselect();
        this.props.history.push('/');
      } else if (selectedCurrent) {
        const { id, type } = getLookup(feature.getProperties());
        if (id) {
          this.props.getInfo(id, type);
        }
      }
    }
  };

  highlightSelection = (prev, next) => {
    if (prev) {
      prev.setProperties({ selected: false });
      this.selectionInteraction.getFeatures().clear();
    }
    if (next) {
      next.setProperties({ selected: true });
    }
  };

  select = event => {
    const selected = event.target.getFeatures();
    if (selected.getLength() > 0) {
      const props = selected.item(0).getProperties();
      this.props.select(selected.item(0));
      let { id, type } = getPositionLookup(props);
      let path = {
        pathname: `/info/${type}/${id}`,
      };

      this.props.history.push(path);
    } else {
      this.props.history.push('/');
      this.props.unselect();
    }
  };

  hover = event => {
    const selected = event.target.getFeatures();
    if (this.hoveringFeature) {
      this.hoveringFeature.setProperties({ hovering: false });
    }
    if (selected.getLength() > 0) {
      clearTimeout(this.hoverTimer);
      this.hoveringFeature = selected.item(0);
      this.hoveringFeature.setProperties({ hovering: true });
      this.hoverAt = event.mapBrowserEvent.coordinate;
      const props = this.hoveringFeature.getProperties();
      const { id, type } = getPositionLookup(props);
      this.hoverTimer = setTimeout(() => {
        this.props.getTooltipInfo(id, type, props.trackId);
      }, hoverDelay);
    } else {
      clearTimeout(this.hoverTimer);
      this.hoveringFeature = null;
      this.props.clearTooltipInfo();
    }
  };

  setTooltipPosition = () => {
    const geom = this.hoveringFeature.getGeometry();
    const pos = this.getTooltipPosition(geom);
    this.tooltipOverlay.setPosition(pos);
  };

  updateExtentRequest = viewId => {
    const extent = this.map.getView().calculateExtent(this.map.getSize());
    const ex1 = ol.proj.toLonLat([extent[0], extent[1]]);
    const ex2 = ol.proj.toLonLat([extent[2], extent[3]]);
    return {
      viewId,
      extent: {
        minLon: ex1[0],
        minLat: ex1[1],
        maxLon: ex2[0],
        maxLat: ex2[1],
      },
    };
  };

  viewChanged = () => {
    clearTimeout(this.moveTimer);
    this.moveTimer = setTimeout(this.viewSettled, moveDelay);
  };

  viewSettled = () => {
    if (this.props.socket) {
      if (this.props.socket.readyState === WebSocket.OPEN) {
        this.props.socket.send(JSON.stringify(this.updateExtentRequest(this.props.viewId)));
      }
    } else {
      this.socketError('socket not created');
    }
  };

  mouseMove = event => {
    if (!this.state.showCoords) {
      return;
    }
    let coords = event.coordinate;
    coords = ol.proj.toLonLat(coords);
    this.setState({
      mouseLatitude: coords[1],
      mouseLongitude: coords[0],
    });
  };

  mouseOver = event => {
    let coords = this.map.getCoordinateFromPixel([event.pageX, event.pageY]);
    if (coords) {
      coords = ol.proj.toLonLat(coords);
      this.setState({
        showCoords: true,
        latitude: coords[1],
        longitude: coords[0],
      });
    }
  };

  mouseLeave = () => {
    this.setState({ showCoords: false });
    clearTimeout(this.hoverTimer);
    this.hoveringFeature = null;
    this.props.clearTooltipInfo();
  };

  enableInteractions = value => {
    this.selectionInteraction.setActive(value);
    this.hoverInteraction.setActive(value);
  };

  flyTo = () => {
    clearTimeout(this.crosshairsTimer);
    clearTimeout(this.animationEndTimer);
    if (this.animationId) {
      this.removeProperty(this.animationId, 'crosshairs');
      this.crosshairsTimer = null;
    }
    this.animationId = this.props.animationTarget.lookupId;
    const time = 2000;
    if (!this.props.animationTarget.target && !this.props.animationTarget.position) {
      this.props.onShowError(__('No positions for this object'));
      return;
    }
    const pos = this.props.animationTarget.target.position;
    let coords;
    if (pos) {
      coords = ol.proj.fromLonLat([pos.longitude, pos.latitude]);
    } else if (this.props.animationTarget.target.positions) {
      const pos2 = this.props.animationTarget.target.positions;
      const lon = pos2[0].longitude + Math.abs(pos2[1].longitude - pos2[0].longitude) / 2.0;
      const lat = pos2[0].latitude + Math.abs(pos2[1].latitude - pos2[0].latitude) / 2.0;
      coords = ol.proj.fromLonLat([lon, lat]);
    } else {
      // We have no position, therefore, we cannot flyto.
      log.warn('No position associated with this feature, flyTo cannot be run');
    }
    this.map.getView().animate({
      center: coords,
      duration: time,
    });
    this.animationEndTimer = setTimeout(this.flyToEnd, time);
  };

  flyToEnd = () => {
    if (!this.animationId) {
      return;
    }
    this.addProperty(this.animationId, 'crosshairs', true);
    this.crosshairsTimer = setTimeout(() => {
      this.removeProperty(this.animationId, 'crosshairs');
      this.crosshairsTimer = null;
      this.animationId = null;
    }, 2000);
    this.props.clearAnimation();
  };

  addProperty = (id, name, value) => {
    const feature = this.findFeature(id);
    const props = { [name]: value };
    if (feature) {
      feature.setProperties(props);
    }
    let extras = this.extraProperties[id];
    if (!extras) {
      extras = props;
    } else {
      extras = Object.assign(extras, props);
    }
    this.extraProperties[id] = extras;
  };

  removeProperty(id, name) {
    const feature = this.findFeature(id);
    if (feature) {
      feature.setProperties({ [name]: null });
    }
    const extras = this.extraProperties[id];
    if (extras) {
      delete extras[name];
    }
  }

  newWindow = () => {
    const newWindow = remote.getGlobal('newWindow');
    const center = ol.proj.toLonLat(this.map.getView().getCenter());
    newWindow({
      lon: center[0],
      lat: center[1],
      zoom: this.map.getView().getZoom(),
    });
  };

  loadImage = (iconObj) => {
    const { createTransaction } = this.props;

    return createTransaction(downloadFile(iconObj.metadata.id))
      .then(async response => await response.blob())
      .then(blob => URL.createObjectURL(blob))
      .then(url => {
        this.customIconImages.push({
          ...iconObj,
          url,
        });
      });
  };

  redrawTracks = () => {
    const { currentTargetIcon } = this.props;

    this.dispatcher.dispatch('RedrawTracks', null, currentTargetIcon);
  }

  filterTracks = () => {
    const { filterTracks, showMarker, hideMarker, listMarkers } = this.props;

    if (this.props.initFilterFlag === true) {
      filterTracks.forEach(track => {
        if (track.type === 'marker') {
          listMarkers.forEach(marker => {
            if (track.show === true) {
              showMarker(marker.properties.id);
            } else {
              hideMarker(marker.properties.id);
            }
          });
        }
      });

      this.props.initFilter(false);
      this.dispatcher.dispatch('FilterTracks', null, filterTracks, this.manualTrackList);
    }
  };

  // Add new marker on the map
  addMarker = async (geoJSON) => {
    this.props.initMarker();

    let feature = this.readFeature(geoJSON);
    let props = feature.getProperties();

    feature.setId(props['id']);

    if (props['marker.type'] == 'Image') {
      let imageUrl = await this.loadMarkerImage(props["image.id"]);
      if (this._isMounted) {
        feature.setProperties({ 'image.url': imageUrl });
      }
    }

    this.dispatcher.dispatch('AddMarker', feature);
  }

  // Show / Hide markers
  filterMarkers = () => {
    const { listMarkers } = this.props;

    listMarkers.forEach(async elem => {
      let feature = this.readFeature(elem);
      let props = feature.getProperties();

      feature.setId(props['id']);

      if (props['marker.type'] == 'Image') {
        let imageUrl = await this.loadMarkerImage(props["image.id"]);
        if (this._isMounted) {
          feature.setProperties({ 'image.url': imageUrl });
        }
      }

      if (props.show) {
        this.dispatcher.dispatch('AddMarker', feature);
      } else {
        this.dispatcher.dispatch('HideFeature', feature);
      }
    });
  };

  // If marker is Type:image, load image
  loadMarkerImage = async fileId => {
    const { createTransaction } = this.props;

    let url = await createTransaction(downloadFile(fileId))
      .then(async response => await response.blob())
      .then(blob => URL.createObjectURL(blob));

    return url;
  };

  render() {
    return (
      <div id="map" style={{ width: '100%', height: '100%' }}>
        <div id="tooltip" style={styles.tooltip}>
          <TooltipPanel />
        </div>
        <DrawTool getOlMap={() => this} />
        <ManualTrackTool getOlMap={() => this} />
        <MarkerTool getOlMap={() => this} />
        <Coordinates
          show={this.state.showCoords}
          latitude={this.state.mouseLatitude}
          longitude={this.state.mouseLongitude}
        />
        <FeatureCounts total={this.state.totalFeatures} visible={this.state.visibleFeatures} />
      </div>
    );
  }

  findFeature = id => {
    if (!id) {
      return null;
    }
    if (this.map) {
      const layers = this.map.getLayers();
      for (let i = 0; i < layers.getLength(); i += 1) {
        const source = layers.item(i).getSource();
        if (source.getFeatureById) {
          const feature = source.getFeatureById(id);
          if (feature) {
            return feature;
          }
        }
      }
    }
    return null;
  };

  getTooltipPosition = geom => {
    if (geom instanceof ol.geom.Point) {
      return geom.getCoordinates();
    }
    if (geom instanceof ol.geom.Polygon) {
      return geom.getInteriorPoint().getCoordinates();
    }
    if (geom instanceof ol.geom.Circle) {
      return geom.getCenter();
    }
    if (geom instanceof ol.geom.MultiPolygon) {
      return geom
        .getPolygon(0)
        .getInteriorPoint()
        .getCoordinates();
    }
    if (geom instanceof ol.geom.MultiPoint) {
      const v = ol.proj.toLonLat(this.hoverAt);
      const c = geom.getCoordinates();
      const c0 = ol.proj.toLonLat(c[0]);
      const d0 = sphere.haversineDistance(v, c0);
      if (c.length > 1) {
        const c1 = ol.proj.toLonLat(c[1]);
        const d1 = sphere.haversineDistance(v, c1);
        if (d0 < d1) {
          return c[0];
        }
      } else {
        return c[0];
      }
      return c[1];
    }
    throw new Error('Unable to get position', geom);
  };
}

OpenLayersMap.propTypes = {
  history: PropTypes.object.isRequired, // withRouter
  server: PropTypes.object.isRequired,

  config: PropTypes.object.isRequired,
  socket: PropTypes.object,
  viewId: PropTypes.string,
  request: PropTypes.object,
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  extent: PropTypes.arrayOf(PropTypes.number).isRequired,
  selection: PropTypes.object,
  hoveringId: PropTypes.string,
  hoveringInfo: PropTypes.object,
  interactionsEnabled: PropTypes.bool.isRequired,
  animationTarget: PropTypes.object,
  latestNotice: PropTypes.object,
  newWindow: PropTypes.bool.isRequired,
  historyRequest: PropTypes.object,
  filterTracks: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    displayName: PropTypes.string,
    show: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,
  initFilterFlag: PropTypes.bool.isRequired,
  curMarkerGeoJSON: PropTypes.any,
  listMarkers: PropTypes.array,
  customIcons: PropTypes.array,
  currentTargetIcon: PropTypes.any,

  openSocket: PropTypes.func.isRequired,
  closeSocket: PropTypes.func.isRequired,
  socketError: PropTypes.func.isRequired,
  setViewId: PropTypes.func.isRequired,
  getTooltipInfo: PropTypes.func.isRequired,
  getInfo: PropTypes.func.isRequired,
  clearTooltipInfo: PropTypes.func.isRequired,
  clearAnimation: PropTypes.func.isRequired,
  centerSet: PropTypes.func.isRequired,
  zoomSet: PropTypes.func.isRequired,
  clearNewWindow: PropTypes.func.isRequired,
  select: PropTypes.func.isRequired,
  unselect: PropTypes.func.isRequired,
  onShowError: PropTypes.func.isRequired,
  initFilter: PropTypes.func.isRequired,
  initMarker: PropTypes.func.isRequired,
  showMarker: PropTypes.func.isRequired,
  hideMarker: PropTypes.func.isRequired,
  setDefaultIcon: PropTypes.func.isRequired,
  initCustomIcon: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  config: state.config,
  socket: state.map.socket,
  viewId: state.map.viewId,
  server: state.server,
  request: state.map.request,
  center: state.map.center,
  zoom: state.map.zoom,
  extent: state.map.extent,
  selection: state.selection.selection,
  hoveringId: state.tooltip.id,
  hoveringInfo: state.tooltip.info,
  interactionsEnabled: state.map.interactionsEnabled,
  animationTarget: state.map.animationTarget,
  latestNotice: state.notifications.latest,
  newWindow: state.map.newWindow,
  historyRequest: state.map.historyRequest,
  initFilterFlag: state.filterTracks.initFilter,
  filterTracks: state.filterTracks.tracks,
  curMarkerGeoJSON: state.marker.curMarkerGeoJSON,
  listMarkers: state.marker.listMarkers,
  customIcons: state.icon.customIcons,
  currentTargetIcon: state.icon.currentTarget,
});

const mapDispatchToProps = dispatch => ({
  openSocket: socket => {
    dispatch(mapActions.openSocket(socket));
  },
  closeSocket: () => {
    dispatch(mapActions.closeSocket());
  },
  socketError: error => {
    dispatch(mapActions.socketError(error));
  },
  setViewId: id => {
    dispatch(mapActions.setViewId(id));
  },
  getTooltipInfo: (id, type, trackId) => {
    dispatch(tooltipActions.get(id, type, trackId));
  },
  getInfo: (id, type) => {
    dispatch(infoActions.get(id, type));
  },
  clearTooltipInfo: () => {
    dispatch(tooltipActions.clear());
  },
  clearAnimation: () => {
    dispatch(mapActions.clearAnimation());
  },
  centerSet: () => {
    dispatch(mapActions.centerSet());
  },
  zoomSet: () => {
    dispatch(mapActions.zoomSet());
  },
  clearNewWindow: () => {
    dispatch(mapActions.clearNewWindow());
  },
  select: feature => {
    dispatch(selectionActions.select(feature));
  },
  unselect: () => {
    dispatch(selectionActions.unselect());
  },
  onShowError: text => {
    dispatch(showSnackBanner(text));
  },
  initFilter: init => {
    dispatch(filterTracksActions.initFilter(init));
  },
  initMarker: () => {
    dispatch(markerActinos.initMarker());
  },
  showMarker: id => {
    dispatch(markerActinos.show(id));
  },
  hideMarker: id => {
    dispatch(markerActinos.hide(id));
  },
  setDefaultIcon: payload => {
    dispatch(iconActions.setDefaultIcon(payload));
  },
  initCustomIcon: payload => {
    dispatch(iconActions.initCustomIcon(payload));
  },
});

export default withTransaction(withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(OpenLayersMap),
));
