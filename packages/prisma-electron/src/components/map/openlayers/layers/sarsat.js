import ol from 'openlayers';
import { scaleStyler, commonStylers, resolveStylers } from '../stylers';

const resources = `${__dirname}/../../../../resources`;

const icon = `${resources}/map-sarsat.png`;

let color = '#00f';

const styler = (feature, img) => resolution => {
  let params = {
    icon: {
      color,
      src: icon,
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
  commonStylers(params, feature);
  return resolveStylers(params);
};

const initDefaultIcon = (trackGroup, setDefaultIcon) => {
  // To preview on beacon info panel
  setDefaultIcon({
    track_type: trackGroup,
    url: icon,
    color,
    opacity: 1,
  });
};

export const sarsat = () => ({
  type: 'track:SARSAT',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
  inHeatmap: false,
});
