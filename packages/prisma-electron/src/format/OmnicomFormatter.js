import { __ } from 'lib/i18n';
import TrackFormatter from './TrackFormatter';

export default class OmnicomFormatter extends TrackFormatter {
  label(track) {
    let label = null;
    if (track.custom && track.custom.label) {
      label = track.custom.label;
    }

    if (track.target && track.target.imei) {
      return label || __('IMEI:{{imei}}', { imei: this.imei(track) });
    }

    if (track.target && track.target.nodeid) {
      return label || __('NODEID:{{nodeid}}', { nodeid: this.nodeid(track) });
    }
    return label || __('UNKNOWN:{{status}}', { status: 'N/A' });
  }

  sublabel() {
    return __('OmniCom Transponder');
  }

  imei(track) {
    return track.target.imei;
  }

  nodeid(track) {
    return track.target.nodeid;
  }

  // Documentation says heading but it is actually the course
  course(track) {
    return super.heading(track);
  }
}

export class OmnicomAlertFormatter {
  constructor() {
    this.f = new OmnicomFormatter();
  }

  label = alert => this.f.label(alert);

  sublabel = alert => this.f.sublabel(alert);

  chip = () => __('OmniCom');

  chipStyle = () => ({
    backgroundColor: '#0000b3',
    color: '#fff',
    cursor: 'pointer',
  });
}
