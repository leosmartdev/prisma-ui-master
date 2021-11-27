import ol from 'openlayers';
import { scaleStyler, targetStyler, commonStylers, resolveStylers } from '../stylers';

const resources = `${__dirname}/../../../../resources`;

const iconOther = `${resources}/map-ais-other.png`;
const iconOfficial = `${resources}/map-ais-official.png`;
const iconPassenger = `${resources}/map-ais-passenger.png`;
const iconCommercial = `${resources}/map-ais-commercial.png`;
const iconStationary = `${resources}/map-ais-stationary.png`;

let color = '#ff0';

export const aisOther = `Other`;
export const aisOfficial = `Official`;
export const aisPassenger = `Passenger`;
export const aisCommercial = `Commercial`;
export const aisStationary = `Stationary`;

export const vesselType = vt => {
  switch (vt) {
    case 50:
      return aisOther; // "pilot";
    case 51:
      return aisOfficial; // "sar";
    case 52:
      return aisOther; // tug
    case 53:
      return aisPassenger; // "port_tender";
    case 54:
      return aisOther; // "anti_pollution";
    case 55:
      return aisOfficial; // "law_enforcement";
    case 58:
      return aisOfficial; // "medical_transport";
    case 59:
      return aisOfficial; // "resolution 18";
  }
  const digit1 = Math.trunc(vt / 10);
  switch (digit1) {
    case 2:
      return aisOther; // "wig";
    case 4:
      return aisOther; // "hsc";
    case 6:
      return aisPassenger; // passenger ship
    case 7:
      return aisCommercial; // cargo ship
    case 8:
      return aisCommercial; // tanker
    case 9:
      return aisOther; // Other
  }
  const digit2 = vt % 10;
  switch (digit2) {
    case 0:
      return aisOther; // fishing
    case 1:
      return aisOther; // "towing";
    case 2:
      return aisOther; // "towing";
    case 3:
      return aisOther; // "dredging";
    case 4:
      return aisOfficial; // diving
    case 5:
      return aisOfficial; // "military";
    case 6:
      return aisPassenger; // "sailing";
    case 7:
      return aisPassenger; // "pleasure_craft";
  }
  return aisOther;
};

const styler = (feature, img) => resolution => {
  const props = feature.getProperties();
  let icon = iconOther;
  let type = aisOther;
  if (props.metadata) {
    type = vesselType(props.metadata.shipAndCargoType);

    switch (type) {
      case aisOfficial:
        icon = iconOfficial;
        break;
      case aisPassenger:
        icon = iconPassenger;
        break;
      case aisCommercial:
        icon = iconCommercial;
        break;
    }
  }

  let params = {
    icon: {
      src: icon,
      color,
    },
  };

  const speed = props.target.speed || 0;
  if (speed < 0.2) {
    params.icon.src = iconStationary;
    params.icon.opacity = 0.5;
    type = aisStationary;
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
  let opacity = 0.4;

  setDefaultIcon({
    track_type: trackGroup,
    track_sub_type: aisOther,
    url: iconOther,
    color,
    opacity,
  });
  setDefaultIcon({
    track_type: trackGroup,
    track_sub_type: aisOfficial,
    url: iconOfficial,
    color,
    opacity,
  });
  setDefaultIcon({
    track_type: trackGroup,
    track_sub_type: aisPassenger,
    url: iconPassenger,
    color,
    opacity,
  });
  setDefaultIcon({
    track_type: trackGroup,
    track_sub_type: aisCommercial,
    url: iconCommercial,
    color,
    opacity,
  });
  setDefaultIcon({
    track_type: trackGroup,
    track_sub_type: aisStationary,
    url: iconStationary,
    color,
    opacity,
  });
};

export const ais = () => ({
  type: 'track:AIS',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
  inHeatmap: true,
});

export const tv32 = () => ({
  type: 'track:TV32',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
  inHeatmap: true,
});

export const orbcomm = () => ({
  type: 'track:Orbcomm',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
  inHeatmap: true,
});

export const vtsais = () => ({
  type: 'track:VTSAIS',
  layer: new ol.layer.Vector({ source: new ol.source.Vector() }),
  styler,
  initDefaultIcon,
  inHeatmap: true,
})
