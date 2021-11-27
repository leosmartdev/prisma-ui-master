import ol from 'openlayers';
import { scaleStyler, targetStyler, commonStylers, resolveStylers } from '../stylers';

const resources = `${__dirname}/../../../../resources`;

const iconNormal = `${resources}/map-sart.png`;
const iconMob = `${resources}/map-mob.png`;

let color = 'rgb(183, 48, 2)';

export const SARTNormal = 'Normal';
export const SARTMob = 'Mob';

const styler = (feature, img) => resolution => {
  const mmsi = feature.getProperties().target.mmsi;

  const icon = getIconSART(mmsi);

  // Test mode
  if (feature.getProperties().navigationalStatus === 15) {
    color = '#080';
  }

  let params = {
    icon: {
      src: icon,
      color,
    },
  };

  if (img) {
    params = {
      icon: {
        img: img,
        imgSize: [img.width, img.height],
        scale: 15 / img.width,
      },
    };
  }

  scaleStyler(params, resolution);
  targetStyler(params, feature);
  commonStylers(params, feature);
  return resolveStylers(params);
};

const initDefaultIcon = (trackGroup, setDefaultIcon) => {
  // To preview on beacon info panel
  let opacity = 1;

  setDefaultIcon({
    track_type: trackGroup,
    track_sub_type: SARTNormal,
    url: iconNormal,
    color,
    opacity,
  });
  setDefaultIcon({
    track_type: trackGroup,
    track_sub_type: SARTMob,
    url: iconMob,
    color,
    opacity,
  });
};

export const sart = () => ({
  type: 'track:SART',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
});

const prefix = mmsi => mmsi.toString().substring(0, 3);
const isManOverboard = mmsi => prefix(mmsi) === '972';

const getIconSART = mmsi => {
  let icon = iconNormal;
  if (mmsi && isManOverboard(mmsi)) {
    icon = iconMob;
  }
  return icon;
};

export const vesselType = mmsi => {
  let type = SARTNormal;
  if (mmsi && isManOverboard(mmsi)) {
    type = SARTMob;
  }
  return type;
};