/* eslint-disable implicit-arrow-linebreak */
import moment from 'moment';

import { units } from './units';
import { getCoordinateFormatter } from './CoordinateFormatter';

export default class Formatter {
  constructor(config) {
    this.setConfig(config);
    this.noValue = '-';
  }

  setConfig = config => {
    this.config = {
      distance: 'nauticalMiles',
      shortDistance: 'meters',
      speed: 'knots',
      coordinateFormat: 'degreesMinutes',
      timeZone: 'UTC',
      ...config,
    };
    this.distance = units[this.config.distance];
    this.shortDistance = units[this.config.shortDistance];
    this.speed = units[this.config.speed] || null;
    this.coordinateFormat = getCoordinateFormatter(this.config.coordinateFormat);
    this.timeZone = this.config.timeZone;
  };

  knotsValue = v => {
    if (typeof v === 'undefined' || v === null) {
      return this.noValue;
    }

    return units.knots.to(v, this.speed).toFixed(1);
  };

  knots = v => (v === undefined ? this.noValue : `${this.knotsValue(v)} ${this.speed.symbol}`);

  metersPerSecondValue = v => {
    if (typeof v === 'undefined' || v === null) {
      return this.noValue;
    }

    return units.metersPerSecond.to(v, this.speed).toFixed(1);
  };

  metersPerSecond = v => {
    if (typeof v === 'undefined') {
      return this.noValue;
    }
    return `${this.metersPerSecondValue(v)} ${this.speed.symbol}`;
  };

  angleValue = v => (typeof v === 'undefined' || v === null ? this.noValue : v.toFixed(1));

  angle = v => (v === undefined ? this.noValue : `${this.angleValue(v)}°`);

  latitude = value => {
    if (typeof value === 'undefined' || value === null) {
      return this.noValue;
    }
    return this.coordinateFormat.latitude(value);
  };

  longitude = value => {
    if (typeof value === 'undefined' || value === null) {
      return this.noValue;
    }
    return this.coordinateFormat.longitude(value);
  };

  // TODO is this even a valid function? It's sending the same value to lat/lng and not splitting
  // ever
  coordinates = value => {
    if (typeof value === 'undefined' || value === null) {
      return this.noValue;
    }
    return `${this.latitude(value)}, ${this.longitude(value)}`;
  };

  coordinates2 = () => null;

  timestamp = v => (v === undefined ? this.noValue : v.tz(this.timeZone).format('LLLL z'));

  timeSince = time => {
    if (typeof time === 'undefined' || time === null) {
      return this.noValue;
    }
    return moment(time)
      .tz(this.timeZone)
      .fromNow();
  };

  timeUtc = time => (time === undefined ? this.noValue : moment(time)).format('LLLL z');

  /** Returns the age of the time in seconds from now. -1 is
   * unknown, bad input
   */
  age = time => {
    if (typeof time === 'undefined' || time === null) {
      return -1;
    }
    return moment()
      .tz(this.timeZone)
      .diff(moment(time), 'seconds');
  };

  getConnectionStatus = () => '';

  metersValue = v => {
    if (typeof v === 'undefined' || v === null) {
      return this.noValue;
    }

    return units.meters.to(v, this.distance).toFixed(1);
  };

  meters = v => (v === undefined ? this.noValue : `${this.metersValue(v)} ${this.distance.symbol}`);

  metersShortValue = (v, digits = 0) => {
    if (typeof v === 'undefined' || v === null) {
      return this.noValue;
    }
    return units.meters.to(v, this.shortDistance).toFixed(digits);
  };

  metersShort = (v, digits = 0) => {
    if (typeof v === 'undefined') {
      return this.noValue;
    }
    return `${this.metersShortValue(v, digits)} ${this.shortDistance.symbol}`;
  };
}
