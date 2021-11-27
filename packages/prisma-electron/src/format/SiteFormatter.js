import Formatter from './Formatter';

export default class SiteFormatter {
  constructor(config) {
    this.f = new Formatter(config);
    this.noValue = '-';
  }

  label(site) {
    return `${site.name} (${site.siteId})`;
  }

  sublabel(site) {
    return site.description || '';
  }

  latitude(site) {
    return site.point === undefined
      ? this.f.noValue
      : this.f.latitude(site.point.latitude);
  }

  longitude(site) {
    return site.point === undefined
      ? this.f.noValue
      : this.f.longitude(site.point.longitude);
  }

  coordinates = value => (value === undefined
    ? this.noValue
    : `${this.latitude(value)}, ${this.longitude(value)}`)

  age() {
    return null;
  }

  getConnectionStatus(site) {
    return String(site.connectionStatus).toLowerCase();
  }

  /**
   * False because all sites are static and have no positional history.
   */
  showHistory() {
    return false;
  }
}
