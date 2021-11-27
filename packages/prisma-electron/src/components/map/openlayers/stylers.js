import ol from 'openlayers';

const maxResolution = 156543.03392804097;
const resources = `${__dirname}/../../../resources`;

export const scaleStyler = (params, resolution) => {
  let base = 1;
  if (params.icon && params.icon.scale) {
    base = params.icon.scale;
  }
  const zoom = Math.log2(maxResolution / resolution);
  const scale = base * Math.log10((zoom / 20) * 10);
  params.icon.scale = scale;
  return params;
};

export const targetStyler = (params, feature) => {
  const props = feature.getProperties();
  const angle = props.target.course || props.target.heading || 0;
  if (angle !== 0) {
    params.icon.rotation = angle * (Math.PI / 180);
  }
  return params;
};

export const hoverStyler = (params, feature) => {
  if (feature.getProperties().hovering) {
    if (params.icon) {
      const scale = params.icon.scale || 1.0;
      params.icon.scale = scale * 1.5;
    }
    if (params.stroke) {
      params.stroke.width += 2;
    }
  }
  return params;
};

export const selectStyler = (params, feature) => {
  let props = feature.getProperties();
  if (props.selected) {
    if (params.icon) {
      // If feature type is Marker or should be drawn with custom icon image, then draw stroke along the edge
      if (props.type == 'Marker' || props.customIcon) {
        params.icon2 = {
          src: `${resources}/map-crosshairs.png`,
          color: '#000',
        };
      } else {
        params.icon.color = '#fff';
      }
    }
  }
  return params;
};

export const hiddenStyler = (params, feature) => {
  if (feature.getProperties().hidden) {
    params.icon.color = '#aaa';
  }
  return params;
};

export const editingStyler = (params, feature) => {
  if (feature.getProperties().editing) {
    params.fill.color = 'rgba(0, 0, 0, 0)';
    // params.stroke.color = "#0a0";
    params.stroke.color = 'rgba(0, 0, 0, 0)';
  }
  return params;
};

export const priorityColorStyler = (params, feature) => {
  const props = feature.getProperties();

  if (!props.customIcon && props.priorityColor) {
    params.icon.color = feature.getProperties().priorityColor;
  }
};

export const crosshairStyler = (params, feature) => {
  if (feature.getProperties().crosshairs) {
    params.icon2 = {
      src: `${resources}/map-crosshairs.png`,
      color: '#000',
    };
  }
};

export const historyStyler = (params, feature) => {
  if (feature.getProperties().historical) {
    params.icon.color = '#d2691e';
    params.icon.scale *= 0.5;
  }
  return params;
};

export const commonStylers = (params, feature) => {
  historyStyler(params, feature);
  hoverStyler(params, feature);
  hiddenStyler(params, feature);
  priorityColorStyler(params, feature);
  selectStyler(params, feature);
  editingStyler(params, feature);
  crosshairStyler(params, feature);
  return params;
};

export const resolveStylers = params => {
  let icon;
  if (params.icon) {
    icon = new ol.style.Icon(params.icon);
  }
  let icon2;
  if (params.icon2) {
    icon2 = new ol.style.Icon(params.icon2);
  }
  const style = {};
  if (icon) {
    style.image = icon;
  }
  const styles = [new ol.style.Style(style)];
  if (icon2) {
    styles.push(new ol.style.Style({ image: icon2 }));
  }
  return styles;
};
