import {__} from 'lib/i18n';
import TrackFormatter from './TrackFormatter';
import {walk} from 'lib/object';

export default class AISFormatter extends TrackFormatter {

  label(track) {
    if (!track.target.adsb) {
      return __('Invalid')
    }
    if (!track.target.adsb.callsign) {
      return __('Unknown aircraft')
    }
    return track.target.adsb.callsign
  }

  sublabel = () => __('ADS-B')

  datetime = (track) => {
    let dt = walk('target.adsb.datetime', track)
    if (!dt) {
      return '-'
    }
    if (dt.length !== 14) {
      return __('Invalid')
    }
    // 20070622141943
    return dt.slice(0, 4) + '-' +
           dt.slice(4, 6) + '-' +
           dt.slice(6, 8) + ' ' +
           dt.slice(8, 10) + ':' +
           dt.slice(10, 12) + ':' +
           dt.slice(12, 14)
  }

  modes = (track) => {
    let modes = walk('target.adsb.modes', track)
    return modes || '-'
  }

  altitude = (track) => {
    let alt = walk('target.adsb.altitude', track)
    return alt || '-'
  }

  airSpeed = (track) => {
    let speed = walk('target.adsb.airSpeed', track)
    return speed || '-'
  }

  verticalRate = (track) => {
    let rate = walk('target.adsb.verticalRate', track)
    return rate || '-'
  }
}

