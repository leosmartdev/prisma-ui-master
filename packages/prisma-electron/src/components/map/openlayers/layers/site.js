import ol from 'openlayers';
import { scaleStyler, commonStylers, resolveStylers } from '../stylers';
import { grey } from 'settings/colors';

const resources = `${__dirname}/../../../../resources`;

const styler = feature => resolution => {
  const params = {
    icon: {
      color: grey[200],
      src: `${resources}/map-site.png`,
    },
  };

  scaleStyler(params, resolution);
  commonStylers(params, feature);
  return resolveStylers(params);
};

export const site = () => ({
  type: 'site',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  inHeatmap: true,
});
