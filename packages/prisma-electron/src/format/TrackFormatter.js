import { __ } from 'lib/i18n';
import Formatter from './Formatter';

export default class TrackFormatter {
  constructor(config) {
    this.f = new Formatter(config);
    this.noValue = '-';
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

  coordinates2() {
    return null;
  }

  course(track) {
    return track.target.course === undefined ? this.f.noValue : this.f.angle(track.target.course);
  }

  heading(track) {
    return track.target.heading === undefined ? this.f.noValue : this.f.angle(track.target.heading);
  }

  speed(track) {
    return track.target.speed === undefined ? this.f.noValue : this.f.knots(track.target.speed);
  }

  rateOfTurn(track) {
    const rot = track.target.rateOfTurn;
    if (rot === undefined) {
      return this.f.noValue;
    }

    const left = __('left');
    // L10N: direction (right/left)
    const right = __('right');
    // L10N: abbreviation for minutes
    const min = __('min');

    if (rot < 0) {
      return `${this.f.angle(Math.abs(rot))}/${min} ${left}`;
    }

    if (rot > 0) {
      return `${this.f.angle(rot)}/${min} ${right}`;
    }

    return `0°/${min}`;
  }

  timeReceived(track) {
    return track.target.time === undefined ? this.f.noValue : this.f.timeSince(track.target.time);
  }

  updateTime(track) {
    return track.target.updateTime === undefined
      ? this.f.noValue
      : this.f.timeSince(track.target.updateTime);
  }

  timeReceivedUtc(track) {
    return track.target.time === undefined ? this.f.noValue : this.f.timeUtc(track.target.time);
  }

  updateTimeUtc(track) {
    return track.target.updateTime === undefined
      ? this.f.noValue
      : this.f.timeUtc(track.target.updateTime);
  }

  getConnectionStatus(track) {
    return track.connectionStatus;
  }

  /** Returns the age of the time in seconds from now. -1 is
   * unknown, bad input
   */
  age(track) {
    return track.target.time === undefined ? -1 : this.f.age(track.target.time);
  }

  /**
   * Returns true because all Tracks can have history displayed on the map.
   */
  showHistory() {
    return true;
  }
}
