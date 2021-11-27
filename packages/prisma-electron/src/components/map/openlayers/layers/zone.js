import ol from 'openlayers';
import { patternById } from 'zones/patterns';
import toStyleRGBA from 'zones/colors';
import { commonStylers } from '../stylers';

const styler = feature => () => {
  const fill = toStyleRGBA(feature.getProperties().fillColor);
  const stroke = toStyleRGBA(feature.getProperties().strokeColor);
  const patternId = feature.getProperties().fillPattern;
  const pattern = patternById(patternId);
  const renderer = pattern.renderer({ fill, stroke });
  const image = feature.getProperties().area && new ol.style.Circle();

  const params = {
    stroke: {
      color: stroke,
      width: 2,
    },
    fill: {
      color: renderer,
    },
    image,
  };
  commonStylers(params, feature);

  return [
    new ol.style.Style({
      stroke: new ol.style.Stroke(params.stroke),
      fill: new ol.style.Fill(params.fill),
    }),
  ];
};

export const zone = () => ({
  type: 'zone',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
});
