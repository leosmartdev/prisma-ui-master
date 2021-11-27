import ol from 'openlayers';
import { scaleStyler, targetStyler, commonStylers, resolveStylers } from '../stylers';

const resources = `${__dirname}/../../../../resources`;

const iconNormal = `${resources}/map-omnicom.png`;
const iconStationary = `${resources}/map-omnicom-stationary.png`;

let color = '#00f';

export const omnicomNormal = `Normal`;
export const omnicomStationary = `Stationary`;

const styler = (feature, img) => resolution => {
  const props = feature.getProperties();
  let type = omnicomNormal;

  let params = {
    icon: {
      color,
      src: iconNormal,
    },
  };

  const speed = props.target.speed || 0;
  if (speed < 0.2) {
    params.icon.src = iconStationary;
    type = omnicomStationary;
  }

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
  let opacity = 0.6;

  setDefaultIcon({
    track_type: trackGroup,
    track_sub_type: omnicomNormal,
    url: iconNormal,
    color,
    opacity,
  });
  setDefaultIcon({
    track_type: trackGroup,
    track_sub_type: omnicomStationary,
    url: iconStationary,
    color,
    opacity,
  });
};

export const omnicomVMS = () => ({
  type: 'track:OmnicomVMS',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
  inHeatmap: true,
});

export const omnicomSolar = () => ({
  type: 'track:OmnicomSolar',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
  inHeatmap: true,
});
