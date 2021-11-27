import { __ } from 'lib/i18n';
import { walk } from 'lib/object';
import Formatter from './Formatter';
import { rgb2hex } from 'components/marker/helpers';

export default class MarkerFormatter {
  constructor(config) {
    this.f = new Formatter(config);
    this.noValue = '-';
  }

  label(track) {
    if (track.target.marker.shape) {
      return `Marker - Shape`;
    }

    if (track.target.marker.imageMetadata) {
      return `Marker - Image`;
    }
  }

  sublabel(track) {
    if (track.target.marker.shape) {
      return capitalizeFirstLetter(track.target.marker.shape);
    }

    if (track.target.marker.imageMetadata) {
      return capitalizeFirstLetter(track.target.marker.imageMetadata.name);
    }
  }

  latitude(track) {
    return track.target.position === undefined
      ? this.f.noValue
      : this.f.latitude(track.target.position.latitude);
  }

  longitude(track) {
    return track.target.position === undefined
      ? this.f.noValue
      : this.f.longitude(track.target.position.longitude);
  }

  coordinates(track) {
    return `${this.latitude(track)}, ${this.longitude(track)}`;
  }

  type(track) {
    const type = walk('target.marker.type', track);
    return type || this.noValue;
  }

  description(track) {
    const description = walk('target.marker.description', track);
    return description || this.noValue;
  }

  shape(track) {
    const description = walk('target.marker.shape', track);
    return description || this.noValue;
  }

  color(track) {
    const color = rgb2hex(track.target.marker.color);
    return color || this.noValue;
  }

  filename(track) {
    const filename = walk('target.marker.imageMetadata.name', track);
    return filename || this.noValue;
  }

  age() {
    return -1;
  }

  getConnectionStatus() {
    return true;
  }

  showHistory() {
    return false;
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}