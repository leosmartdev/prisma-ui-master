import { __ } from 'lib/i18n';
import { SARSATAlertFormatter } from './SARSATFormatter';
import { SARTAlertFormatter } from './SARTFormatter';
import { OmnicomAlertFormatter } from './OmnicomFormatter';

export const getAlertFormatter = type => {
  if (type === 'SARSAT') {
    return new SARSATAlertFormatter();
  }

  if (type === 'SART') {
    return new SARTAlertFormatter();
  }

  if (type === 'OmnicomVMS' || type === 'OmnicomSolar') {
    return new OmnicomAlertFormatter();
  }

  return new UnknownAlertFormatter();
};

class UnknownAlertFormatter {
  label = () => __('Unknown');

  sublabel = () => __('Unknown');

  chip = () => __('?');

  chipStyle = () => ({
    backgroundColor: '#aaa',
    color: '#000',
    cursor: 'pointer',
  });
}

export default getAlertFormatter;
