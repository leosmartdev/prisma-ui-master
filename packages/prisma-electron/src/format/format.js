import AISFormatter from './AISFormatter';
import ManualFormatter from './ManualFormatter';
import OmnicomFormatter from './OmnicomFormatter';
import RadarFormatter from './RadarFormatter';
import SARSATFormatter from './SARSATFormatter';
import SARTFormatter from './SARTFormatter';
import SiteFormatter from './SiteFormatter';
import SpidertrackFormatter from './SpidertrackFormatter';
import ADSBFormatter from './ADSBFormatter';
import MarkerFormatter from './MarkerFormatter';

export default function getFormatterForTrack(track, config) {
  let formatter = null;
  let type = '';

  if (track.target && track.target.type) {
    type = track.target.type;
  }

  switch (type) {
    case 'AIS':
    case 'VTSAIS': {
      formatter = new AISFormatter(config);
      break;
    }
    case 'Manual': {
      formatter = new ManualFormatter(config);
      break;
    }
    case 'OmnicomVMS':
    case 'OmnicomSolar': {
      formatter = new OmnicomFormatter(config);
      break;
    }
    case 'Radar':
    case 'VTSRadar': {
      formatter = new RadarFormatter(config);
      break;
    }
    case 'SARSAT': {
      formatter = new SARSATFormatter(config);
      break;
    }
    case 'SART': {
      formatter = new SARTFormatter(config);
      break;
    }
    case 'MRCC':
    case 'Site': {
      formatter = new SiteFormatter(config);
      break;
    }
    case 'Spidertracks': {
      formatter = new SpidertrackFormatter(config);
      break;
    }
    case 'ADSB': {
      formatter = new ADSBFormatter(config);
      break;
    }
    case 'Marker': {
      formatter = new MarkerFormatter(config);
      break;
    }
  }

  return formatter;
}
