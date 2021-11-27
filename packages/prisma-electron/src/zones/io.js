import os from 'os';
import fs from 'fs';

import { remote } from 'lib/electron';
import { __ } from 'lib/i18n';
import * as Protobuf from 'lib/protobuf';
import { csvToGeoJSON } from 'lib/geo/csv';

// L10n: Save dialog type, do not translate values in parenthesis
const geojson = __('GeoJSON (*.json, *.geojson)');
const csv = __('Comma separated values (*.csv)');

const filters = [{
  name: geojson,
  extensions: ['geojson', 'json']
}, {
  name: csv,
  extensions: ['csv']
}];

// Single zone
export const toFeatureJSON = zone => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: Protobuf.toPolygon(zone.poly),
  },
  properties: {
    name: zone.name,
    area: zone.area,
    description: zone.description,
    fillColor: zone.fillColor,
    fillPattern: zone.fillPattern,
    strokeColor: zone.strokeColor,
    createAlertOnEnter: zone.createAlertOnEnter,
    createAlertOnExit: zone.createAlertOnExit,
  },
});

// Because prettier.... https://github.com/prettier/prettier/issues/3465
/* eslint-disable implicit-arrow-linebreak */
export const serverDataFromFeatureJSON = features =>
  features.map(feature => ({
    poly: Protobuf.fromPolygon(feature.geometry.coordinates),
    // FIXME: area should probably be removed. Doesn't make sense with a
    // polygon but would with a point.
    // area: feature.properties.area,
    name: feature.properties.name || __('Imported Zone'),
    description: feature.properties.description || '',
    fill_color: feature.properties.fillColor || {r: 255, a: 0.25},
    fill_pattern: feature.properties.fillPattern || 'solid',
    stroke_color: feature.properties.strokeColor || {},
    create_alert_on_enter: feature.properties.createAlertOnEnter || false,
    create_alert_on_exit: feature.properties.createAlertOnExit || false,
  }));
/* eslint-enable implicit-arrow-linebreak */

// Array of zones
export const toFeatureCollectionJSON = zones => ({
  type: 'FeatureCollection',
  features: zones.map(zone => toFeatureJSON(zone)),
});

export const importZones = handleZone => {
  remote.showOpenDialog(
    {
      title: __('Import Zones'),
      defaultPath: os.homedir(),
      properties: ['openFile', 'multiSelections'],
      filters,
    },
    filePaths => {
      if (!filePaths) {
        return;
      }
      filePaths.forEach(file => {
        fs.readFile(file, (error, data) => {
          if (error) {
            remote.showMessageBox({
              type: 'error',
              title: __('Error'),
              buttons: [__('OK')],
              message: __('Unable to read zones'),
              detail: error.toString(),
            });
            return;
          }
          try {
            let features
            if (file.endsWith(".csv")) {
              features = csvToGeoJSON(String(data)).features;
            } else {
              features = JSON.parse(String(data)).features;
            }
            console.log('features', features)
            if (!features) {
              remote.showMessageBox({
                type: 'error',
                title: __('Error'),
                buttons: [__('OK')],
                message: __('Unable to read zones'),
              });
              return;
            }
            serverDataFromFeatureJSON(features).forEach(zone => handleZone(zone));
          } catch (e) {
            console.error(e)
            remote.showMessageBox({
              type: 'error',
              title: __('Error'),
              buttons: [__('OK')],
              message: __('Unable to read zones'),
              detail: e.toString(),
            });
          }
        });
      });
    },
  );
};

export const save = zones => {
  const file = remote.showSaveDialog({
    title: __('Export Zones'),
    defaultPath: os.homedir(),
    filters,
  });

  // Exit if nothing selected
  if (!file) {
    return;
  }
  const features = toFeatureCollectionJSON(zones);
  fs.writeFile(file, JSON.stringify(features), error => {
    if (error) {
      remote.showMessageBox({
        type: 'error',
        title: __('Error'),
        buttons: [__('OK')],
        message: __('Unable to save zones'),
        detail: error.toString(),
      });
    }
  });
};
