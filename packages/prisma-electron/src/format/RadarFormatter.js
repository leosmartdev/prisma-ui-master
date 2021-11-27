import log from 'loglevel';

import { __ } from 'lib/i18n';
import { walk } from 'lib/object';
import { units } from './units';
import TrackFormatter from './TrackFormatter';

export default class RadarFormatter extends TrackFormatter {
  label(track) {
    if (track.target.vtsRadar && track.target.vtsRadar.TrackName) {
      return track.target.vtsRadar.TrackName;
    }
    const number = field(track, 'number');
    return __('Target #{{number}}', { number });
  }

  sublabel(track) {
    if (track.target.type === 'VTSRadar') {
      return __('Radar - VTS');
    }
    return __('Reported by HQ');
  }

  number(track) {
    return field(track, 'number');
  }

  distance(track) {
    const distance = field(track, 'distance');
    const unitsChar = field(track, 'speedDistanceUnits');
    const units = distances.get(unitsChar);
    if (!units) {
      log.error(`Unknown radar units: ${unitsChar}`);
      return this.noValue;
    }
    return distance === undefined
      ? this.noValue
      : `${units.to(distance, this.f.distance).toFixed(2)} ${this.f.distance.symbol}`;
  }

  cpaDistance(track) {
    const cpa = field(track, 'cpaDistance');
    const unitsChar = field(track, 'speedDistanceUnits');
    const units = distances.get(unitsChar);
    if (!units) {
      log.error(`Unknown radar units: ${unitsChar}`, track);
      return this.noValue;
    }
    return cpa === undefined
      ? this.noValue
      : `${units.to(cpa, this.f.distance).toFixed(1)} ${this.f.distance.symbol}`;
  }

  cpaTime(track) {
    let time = field(track, 'cpaTime');
    let increasing = '';
    if (time < 0) {
      // L10n: Closest point of approach time is increasing
      increasing = ` ${__('(increasing)')}`;
      time = Math.abs(time);
    }

    if (typeof time === 'undefined') {
      return this.noValue;
    }

    // L10n: Abbreviation for minutes
    return `${time.toFixed(1)} ${__('min')}${increasing}`;
  }

  speed(track) {
    const speed = field(track, 'speed');
    const unitsChar = field(track, 'speedDistanceUnits');
    const units = speeds.get(unitsChar);

    if (!units) {
      log.error(`Unknown radar units: ${unitsChar}`, track);
      return this.noValue;
    }
    return speed === undefined
      ? this.noValue
      : `${units.to(speed, this.f.speed).toFixed(1)} ${this.f.speed.symbol}`;
  }

  acquisitionType = track => {
    switch (field(track, 'acquisitionType')) {
      case 'A':
        return __('Automatic');
      case 'M':
        // L10n: Opposite of Automatic
        return __('Manual');
      case 'R':
        return __('Reported');
    }
    return this.noValue;
  };
}

const field = (track, name) => walk(`target.nmea.ttm.${name}`, track);

const speeds = new Map([
  ['N', units.knots],
  ['K', units.kilometersPerHour],
  ['S', units.milesPerHour],
]);

const distances = new Map([
  ['N', units.nauticalMiles],
  ['K', units.kilometers],
  ['S', units.miles],
]);
