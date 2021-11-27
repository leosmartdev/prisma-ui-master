/* eslint-disable import/no-unresolved, import/extensions */
import { format as general } from '../track';
import clone from 'clone';
import { __ } from '../../i18n';
/* eslint-enable import/no-unresolved, import/extensions */

export const format = clone(general);

format.label = track => {
  let label = null;
  if (track.custom && track.custom.label) {
    label = track.custom.label;
  }

  if (track.targets.imei) {
    return label || __('IMEI:{{imei}}', { imei: format.imei(track) });
  }
  if (track.targets.nodeid) {
    return label || __('NODEID:{{nodeid}}', { nodeid: format.nodeid(track) });
  }
  return label || __('UNKNOWN:{{status}}', { status: 'N/A' });
};

format.sublabel = () => __('OmniCom Transponder');

format.imei = track => track.targets.imei.value;

format.nodeid = track => track.targets.nodeid.value;

// Documentation says heading but it is actually the course
format.course = track => format.heading(track);
