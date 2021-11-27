import ol from 'openlayers';
import { scaleStyler, commonStylers, resolveStylers } from '../stylers';

const resources = `${__dirname}/../../../../resources`;

const styler = (feature, img) => resolution => {
  const params = {
    icon: {
      img: img,
      imgSize: [img.width, img.height],
      scale: 15 / img.width,
    },
  };

  scaleStyler(params, resolution);
  commonStylers(params, feature);
  return resolveStylers(params);
};

export const marker = () => ({
  type: 'Marker',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
});
