import ol from 'openlayers';
import loglevel from 'loglevel';
import { getLookup } from 'map/lookup';

import { manual } from './layers/manual';
import { rgb2hex } from 'components/marker/helpers';

// Helpers
import * as AISHelper from 'components/map/openlayers/layers/ais';
import * as OmnicomHelper from 'components/map/openlayers/layers/omnicom';
import * as SARTHelper from 'components/map/openlayers/layers/sart';

const log = loglevel.getLogger('feature');
const startingZIndex = 30;

export class Dispatcher {
  handlers = new Map();

  constructor(map, setDefaultIcon, customIconImages, filterTracks) {
    this.map = map;
    this.histories = new Map();
    this.nextZIndex = startingZIndex;
    this.setDefaultIcon = setDefaultIcon;
    this.customIconImages = customIconImages;
    this.tracks = filterTracks;
  }

  register = (handler, zIndex) => {
    handler.layer.setZIndex(zIndex);
    // store all default icons for each tracks
    if (handler.initDefaultIcon) {
      let trackGroup = getTrackGroup(this.tracks, handler.type);
      handler.initDefaultIcon(trackGroup, this.setDefaultIcon);
    }
    this.map.addLayer(handler.layer);
    this.handlers.set(handler.type, handler);
    return this;
  };

  dispatch = (status, feature, param1 = null, param2 = null) => {
    if (status !== "FilterTracks" && status !== "RedrawTracks" && !feature.getProperties) {
      log.error('no properties', feature);
      return;
    }
    switch (status) {
      case 'Timeout':
      case 'LeftGeoRange':
        this.remove(feature);
        break;
      case 'Current':
        this.add(feature);
        break;
      case 'History':
        this.history(feature);
        break;
      case 'HeatmapStart':
        this.heatmapStart();
        break;
      case 'CountOnly':
        break;
      case 'HistoryStart':
        this.historyStart(feature);
        break;
      case 'HistoryStop':
        this.historyStop(feature);
        break;
      case 'HistoryClearAll':
        this.historyClearAll(feature);
        break;
      case 'FilterTracks':
        this.filterTracks(param1, param2);
        break;
      case 'AddMarker':
        this.addMarker(feature);
        break;
      case 'HideFeature':
        this.hide(feature);
        break;
      case 'RedrawTracks':
        this.redraw(param1);
        break;
      default:
        log.error(`Unknown status: ${status}`);
    }
  };

  remove = feature => {
    const handler = this.getHandler(feature);
    if (!handler.layer) {
      log.error(`Nothing to remove for ${feature.getId()}`);
      return;
    }
    const source = handler.layer.getSource();
    const existing = source.getFeatureById(feature.getId());
    if (existing) {
      source.removeFeature(existing);
    }
  };

  add = feature => {
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    let props = feature.getProperties();
    const type = props.type;
    const handler = this.getHandler(feature);
    if (!handler.layer) {
      log.error(`No layer for ${type}`);
      return;
    }
    if (handler.styler) {
      this.setStyle(handler, feature);
    }
    const prev = handler.layer.getSource().getFeatureById(feature.getId());
    if (prev != null) {
      props = feature.getProperties();
      let prevProps = prev.getProperties();
      if (props.trackSubType != prevProps.trackSubType ||
        props.customIcon != prevProps.customIcon) {
        prev.setProperties(props);
        this.setStyle(handler, prev);
      }

      prev.setGeometry(feature.getGeometry());
      prev.setProperties(feature.getProperties());
    } else {
      feature.layer = handler.layer;
      handler.layer.getSource().addFeature(feature);
    }
  };

  show = feature => {
    const handler = this.getHandler(feature);
    if (!handler.layer) {
      log.error(`No layer for ${type}`);
      return;
    }

    if (handler.styler) {
      this.setStyle(handler, feature);
    }
  }

  hide = feature => {
    const handler = this.getHandler(feature);
    if (!handler.layer) {
      log.error(`No layer for ${type}`);
      return;
    }

    const prev = handler.layer.getSource().getFeatureById(feature.getId());
    if (prev != null) {
      prev.setStyle(new ol.style.Style());
    }
  }

  redraw = iconObj => {
    let trackGroup = iconObj.track_type;

    getTrackList(this.tracks, trackGroup).forEach(trackType => {
      let handler = this.handlers.get(trackType);
      if (!handler) {
        handler = this.handlers.get('unknown');
        if (!handler) {
          log.error(`No handler for ${trackType}: ${feature.getId()}`);
          return;
        }
        log.warn('using unknown handler for', trackType, props);
      }

      const features = handler.layer.getSource().getFeatures();
      features.forEach(elem => {
        this.setStyle(handler, elem);
      });
    });
  };

  heatmapStart = () => {
    this.handlers.forEach(handler => {
      if (handler.inHeatmap) {
        handler.layer.getSource().clear();
      }
    });
  };

  filterTracks = (filterTracks, manualTrackList) => {
    // console.log(filterTracks, manualTrackList);
    this.handlers.forEach(handler => {
      let show = true;
      let isExist = false;
      filterTracks.forEach(track => {
        track.children.forEach(elem => {
          if (handler.type === elem) {
            show = track.show;
            isExist = true;
          }
        });
      });

      if (handler.type === manual().type && isExist === true) {
        manualTrackList.forEach(feature => {
          if (show === true) {
            this.show(feature);
          } else if (show === false) {
            this.hide(feature);
          }
        });

        return;
      }

      if (isExist === true && show === false) {
        handler.layer.getSource().clear();
      }
    });
  }

  getHandler = feature => {
    const props = feature.getProperties();
    const type = props.type;
    let handler = this.handlers.get(type);
    if (!handler) {
      handler = this.handlers.get('unknown');
      if (!handler) {
        log.error(`No handler for ${type}: ${feature.getId()}`);
        return;
      }
      log.warn('using unknown handler for', type, props);
    }
    return handler;
  };

  historyStart = feature => {
    const layer = new ol.layer.Vector({ source: new ol.source.Vector() });
    this.nextZIndex += 1;
    layer.setZIndex(this.nextZIndex);
    this.histories.set(feature.getId(), layer);
    this.map.addLayer(layer);
  };

  historyStop = feature => {
    const layer = this.histories.get(feature.getId());
    this.map.removeLayer(layer);
    this.nextZIndex -= 1;
    this.histories.delete(feature.getId());
  };

  historyClearAll = () => {
    this.histories.forEach(layer => {
      this.map.removeLayer(layer);
    });
    this.nextZIndex = startingZIndex;
    this.histories = new Map();
  };

  history = feature => {
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    feature.setProperties({ historical: true });
    const handler = this.getHandler(feature);
    if (handler.styler) {
      this.setStyle(handler, feature);
    }
    const { id } = getLookup(feature.getProperties());
    const layer = this.histories.get(id);
    if (!layer) {
      log.error(`layer for ${id} is not found`);
      return;
    }
    layer.getSource().addFeature(feature);
  };

  setStyle = (handler, feature) => {
    const props = feature.getProperties();

    let trackType = handler.type;
    let trackGroup = getTrackGroup(this.tracks, trackType);
    let trackSubType;
    switch (trackGroup) {
      case 'ais':
        if (props.metadata) {
          trackSubType = AISHelper.vesselType(props.metadata.shipAndCargoType);

          const speed = props.target.speed || 0;
          if (speed < 0.2) {
            trackSubType = AISHelper.aisStationary;
          }
        }

        break;
      case 'omnicom':
        trackSubType = OmnicomHelper.omnicomNormal;

        const speed = props.target.speed || 0;
        if (speed < 0.2) {
          trackSubType = OmnicomHelper.omnicomStationary
        }
        break;
      case 'sart':
        let mmsi = props.target.mmsi;
        trackSubType = SARTHelper.vesselType(mmsi);
        break;
    }

    let isCustom = false;
    let imgSrc;

    this.customIconImages.forEach(elem => {
      if (!elem.deleted && elem.track_type == trackGroup && (
        !trackSubType ||
        (trackSubType && elem.track_sub_type == trackSubType)
      )) {
        isCustom = true;
        imgSrc = elem.url;
      }
    });

    feature.setProperties({
      'trackSubType': trackSubType,
    });

    // Check if the track should be drawn with custom icon
    if (isCustom) {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        feature.setProperties({ 'customIcon': true });
        feature.setStyle(handler.styler(feature, img));
      }
    } else {
      feature.setProperties({ 'customIcon': false });

      feature.setStyle(handler.styler(feature));
    }
  }

  addMarker = (feature) => {
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    const props = feature.getProperties();
    const type = props.type;
    const handler = this.getHandler(feature);
    let img = new Image();

    if (!handler.layer) {
      log.error(`No layer for ${type}`);
      return;
    }

    if (handler.styler) {
      let url;
      if (props['marker.type'] == 'Image') {
        // If marker type is Image, load icon from server
        url = props['image.url'];
      } else if (props['marker.type'] == 'Shape') {
        // If marker type is Shape, load icon from local dir
        let dir = `${__dirname}/../../../resources/markers/${props['shape']}.svg`;
        let opacity = props['color.a'];
        let hexColor = rgb2hex({
          r: props['color.r'],
          g: props['color.g'],
          b: props['color.b'],
        });

        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", dir, false);
        rawFile.onreadystatechange = () => {
          if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
              let allText = rawFile.responseText;
              let doc = new DOMParser().parseFromString(allText, "text/xml");
              let elem = doc.firstChild;
              elem.setAttribute('fill', hexColor);
              elem.setAttribute('width', 32);
              elem.setAttribute('height', 32);
              elem.setAttribute('opacity', opacity);

              let xmlStr = new XMLSerializer().serializeToString(elem);
              url = `data:image/svg+xml;base64, ${btoa(xmlStr)}`;
            }
          }
        };
        rawFile.send(null);
      }

      img.src = url;

      img.onload = () => {
        feature.setStyle(handler.styler(feature, img));
      };
    }

    const prev = handler.layer.getSource().getFeatureById(feature.getId());
    if (prev != null) {
      for (let prop in prev.getProperties()) {
        prev.unset(prop);
      }

      if (handler.styler) {
        img.onload = () => {
          prev.setStyle(handler.styler(feature, img));
        }
      }

      prev.setGeometry(feature.getGeometry());
      prev.setProperties(feature.getProperties());
    } else {
      feature.layer = handler.layer;
      handler.layer.getSource().addFeature(feature);
    }
  };
}

// Get track group name using type
export const getTrackGroup = (tracks, trackType) => {
  let trackGroup;

  tracks.forEach(track => {
    if (track.children) {
      track.children.forEach(elem => {
        if (elem == trackType) {
          trackGroup = track.type;
        }
      });
    }
  });

  return trackGroup;
}

// Get tracks being contained to the specific group
export const getTrackList = (tracks, trackGroup) => {
  let trackList;

  tracks.forEach(track => {
    if (track.type == trackGroup) {
      trackList = track['children']
    }
  });

  return trackList;
}