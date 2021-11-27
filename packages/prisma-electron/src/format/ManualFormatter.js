import TrackFormatter from './TrackFormatter';
import { __ } from 'lib/i18n';

export default class SARTFormatter extends TrackFormatter {
  label(track) {
    if (!track.metadata || !track.metadata.name) {
      return __('Unknown');
    }
    return track.metadata.name;
  }

  sublabel() {
    return __('Placemark');
  }
}
