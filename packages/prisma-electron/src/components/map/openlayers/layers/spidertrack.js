import ol from 'openlayers';
import { scaleStyler, targetStyler, commonStylers, resolveStylers } from '../stylers';

const resources = `${__dirname}/../../../../resources`;

const icon = `${resources}/map-spidertrack.png`;
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

export const spidertrack = () => {
  const spider = {
    type: 'track:Spidertracks',
    layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
    styler,
    initDefaultIcon,
    inHeatmap: true,
  };

  // TODO: this is a hack specifically for 1.7 release.
  // Ultimately the new map will remove this code and layer manipulation is done through redux and
  // new apis surrounding layers.
  window.spidertracks = spider;

  return spider;
};
