import { __ } from 'lib/i18n';
import TrackFormatter from './TrackFormatter';

export default class SARTFormatter extends TrackFormatter {
  /*
   * Safely dives to get mmsi from track. Returns undefined if no mmsi is found.
   */
  getMMSI = track => {
    const mmsi = (((((track || {}).target || {}).nmea || {}).vdm || {}).m1371 || {}).mmsi;

    if (typeof mmsi === 'undefined' || mmsi === null) {
      return __('Unknown MMSI');
    }

    return mmsi;
  };

  mmsi(track) {
    const mmsi = this.getMMSI(track);

    if (isManOverboard(mmsi)) {
      // L10N: Man Overboard
      return `${__('MOB')}:${mmsi}`;
    }

    if (isEPIRB(mmsi)) {
      // L10N: Emergency Position Indicating Radio Beacon
      return `${__('EPIRB')}:${mmsi}`;
    }

    // L10N: Search and Rescue Transponder
    return `${__('SART')}:${mmsi}`;
  }

  label(track) {
    return this.mmsi(track);
  }

  sublabel(track) {
    const mmsi = this.getMMSI(track);
    if (isManOverboard(mmsi)) {
      return __('Man Overboard');
    }

    if (isEPIRB(mmsi)) {
      return __('Emergency Position Indicating Radio Beacon');
    }

    return __('Search and Rescue Transponder');
  }
}

const prefix = mmsi => mmsi.toString().substring(0, 3);
const isManOverboard = mmsi => prefix(mmsi) === '972';
const isEPIRB = mmsi => prefix(mmsi) === '974';

export class SARTAlertFormatter {
  constructor() {
    this.f = new SARTFormatter();
  }

  /*
   * Safely dives to get mmsi from alert. Returns undefined if no mmsi is found
   */
  getMMSI = alert => {
    const mmsi = ((alert || {}).target || {}).mmsi;

    if (typeof mmsi === 'undefined' || mmsi === null) {
      return __('Unknown MMSI');
    }

    return mmsi;
  };

  label = alert => this.getMMSI(alert);

  sublabel = alert => {
    const mmsi = this.getMMSI(alert);
    if (isManOverboard(mmsi)) {
      return __('Man Overboard');
    }

    if (isEPIRB(mmsi)) {
      return __('EPIRB');
    }

    return __('Search and Rescue Transponder');
  };

  chip = () => __('SART');

  chipStyle = () => ({
    backgroundColor: '#e70',
    color: '#000',
    cursor: 'pointer',
  });
}
