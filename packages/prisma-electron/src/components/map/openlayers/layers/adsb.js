import ol from 'openlayers';
import { scaleStyler, targetStyler, commonStylers, resolveStylers } from '../stylers';

const resources = `${__dirname}/../../../../resources`;

const icon = `${resources}/map-spidertrack.png`;
let color = 'rgb(128, 0, 128)';

const styler = (feature, img) => resolution => {
  const mmsi = feature.getProperties().target.mmsi;

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
  setDefaultIcon({
    track_type: trackGroup,
    url: icon,
    color,
    opacity: 1,
  });
};

export const adsb = () => ({
  type: 'track:ADSB',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,  
});
