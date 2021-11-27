import ol from 'openlayers';
import { scaleStyler, targetStyler, commonStylers, resolveStylers } from '../stylers';

const resources = `${__dirname}/../../../../resources`;


const icon = `${resources}/map-radar.png`;
let color = '#0f0';

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
    opacity: 0.5,
  });
};

export const radar = () => ({
  type: 'track:Radar',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
  inHeatmap: true,
});

export const vtsradar = () => ({
  type: 'track:VTSRadar',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
  inHeatmap: true,
})