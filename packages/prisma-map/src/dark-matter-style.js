export default {
  glyphs: 'https://maps.tilehosting.com/fonts/{fontstack}/{range}.pbf.pict?key=trAQJW6wzLknLPZbbbam',
  layers: [
    {
      id: 'background',
      paint: {
        'background-color': 'rgb(12,12,12)',
      },
      type: 'background',
    },
    {
      filter: [
        '==',
        '$type',
        'Polygon',
      ],
      id: 'water',
      layout: {
        visibility: 'visible',
      },
      paint: {
        'fill-antialias': false,
        'fill-color': 'rgb(27 ,27 ,29)',
      },
      source: 'openmaptiles',
      'source-layer': 'water',
      type: 'fill',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Polygon',
        ],
        [
          '==',
          'subclass',
          'ice_shelf',
        ],
      ],
      id: 'landcover_ice_shelf',
      layout: {
        visibility: 'visible',
      },
      maxzoom: 8,
      paint: {
        'fill-color': 'rgb(12,12,12)',
        'fill-opacity': 0.7,
      },
      source: 'openmaptiles',
      'source-layer': 'landcover',
      type: 'fill',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Polygon',
        ],
        [
          '==',
          'subclass',
          'glacier',
        ],
      ],
      id: 'landcover_glacier',
      layout: {
        visibility: 'visible',
      },
      maxzoom: 8,
      paint: {
        'fill-color': 'hsl(0, 1%, 2%)',
        'fill-opacity': {
          base: 1,
          stops: [
            [
              0,
              1,
            ],
            [
              8,
              0.5,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'landcover',
      type: 'fill',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Polygon',
        ],
        [
          '==',
          'class',
          'residential',
        ],
      ],
      id: 'landuse_residential',
      layout: {
        visibility: 'visible',
      },
      maxzoom: 9,
      paint: {
        'fill-color': 'hsl(0, 2%, 5%)',
        'fill-opacity': 0.4,
      },
      source: 'openmaptiles',
      'source-layer': 'landuse',
      type: 'fill',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Polygon',
        ],
        [
          '==',
          'class',
          'wood',
        ],
      ],
      id: 'landcover_wood',
      layout: {
        visibility: 'visible',
      },
      minzoom: 10,
      paint: {
        'fill-color': 'rgb(32,32,32)',
        'fill-opacity': {
          base: 0.3,
          stops: [
            [
              8,
              0,
            ],
            [
              10,
              0.8,
            ],
            [
              13,
              0.4,
            ],
          ],
        },
        'fill-pattern': 'wood-pattern',
        'fill-translate': [
          0,
          0,
        ],
      },
      source: 'openmaptiles',
      'source-layer': 'landcover',
      type: 'fill',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Polygon',
        ],
        [
          '==',
          'class',
          'park',
        ],
      ],
      id: 'landuse_park',
      layout: {
        visibility: 'visible',
      },
      paint: {
        'fill-color': 'rgb(32,32,32)',
      },
      source: 'openmaptiles',
      'source-layer': 'landuse',
      type: 'fill',
    },
    {
      filter: [
        '==',
        '$type',
        'LineString',
      ],
      id: 'waterway',
      layout: {
        visibility: 'visible',
      },
      paint: {
        'line-color': 'rgb(27 ,27 ,29)',
      },
      source: 'openmaptiles',
      'source-layer': 'waterway',
      type: 'line',
    },
    {
      filter: [
        '==',
        '$type',
        'LineString',
      ],
      id: 'water_name',
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 500,
        'text-field': '{name:latin}\n{name:nonlatin}',
        'text-font': [
          'Metropolis Medium Italic',
          'Noto Sans Italic',
        ],
        'text-rotation-alignment': 'map',
        'text-size': 12,
      },
      paint: {
        'text-color': 'hsla(0, 0%, 0%, 0.7)',
        'text-halo-color': 'hsl(0, 0%, 27%)',
      },
      source: 'openmaptiles',
      'source-layer': 'water_name',
      type: 'symbol',
    },
    {
      filter: [
        '==',
        '$type',
        'Polygon',
      ],
      id: 'building',
      minzoom: 12,
      paint: {
        'fill-antialias': true,
        'fill-color': 'rgb(10,10,10)',
        'fill-outline-color': 'rgb(27 ,27 ,29)',
      },
      source: 'openmaptiles',
      'source-layer': 'building',
      type: 'fill',
    },
    {
      filter: [
        'all',
        [
          'in',
          'class',
          'taxiway',
        ],
      ],
      id: 'aeroway-taxiway',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': '1444849345966.4436',
      },
      minzoom: 12,
      paint: {
        'line-color': '#181818',
        'line-opacity': 1,
        'line-width': {
          base: 1.55,
          stops: [
            [
              13,
              1.8,
            ],
            [
              20,
              20,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'aeroway',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          'in',
          'class',
          'runway',
        ],
      ],
      id: 'aeroway-runway-casing',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': '1444849345966.4436',
      },
      minzoom: 11,
      paint: {
        'line-color': 'rgba(60,60,60,0.8)',
        'line-opacity': 1,
        'line-width': {
          base: 1.5,
          stops: [
            [
              11,
              5,
            ],
            [
              17,
              55,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'aeroway',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Polygon',
        ],
        [
          'in',
          'class',
          'runway',
          'taxiway',
        ],
      ],
      id: 'aeroway-area',
      layout: {
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': '1444849345966.4436',
      },
      minzoom: 4,
      paint: {
        'fill-color': '#000',
        'fill-opacity': 1,
      },
      source: 'openmaptiles',
      'source-layer': 'aeroway',
      type: 'fill',
    },
    {
      filter: [
        'all',
        [
          'in',
          'class',
          'runway',
        ],
        [
          '==',
          '$type',
          'LineString',
        ],
      ],
      id: 'aeroway-runway',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': '1444849345966.4436',
      },
      minzoom: 11,
      paint: {
        'line-color': '#000',
        'line-opacity': 1,
        'line-width': {
          base: 1.5,
          stops: [
            [
              11,
              4,
            ],
            [
              17,
              50,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'aeroway',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          '==',
          'class',
          'path',
        ],
      ],
      id: 'highway_path',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      paint: {
        'line-color': 'rgb(27 ,27 ,29)',
        'line-dasharray': [
          1.5,
          1.5,
        ],
        'line-opacity': 0.9,
        'line-width': {
          base: 1.2,
          stops: [
            [
              13,
              1,
            ],
            [
              20,
              10,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          'in',
          'class',
          'minor',
          'service',
          'track',
        ],
      ],
      id: 'highway_minor',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 8,
      paint: {
        'line-color': '#181818',
        'line-opacity': 0.9,
        'line-width': {
          base: 1.55,
          stops: [
            [
              13,
              1.8,
            ],
            [
              20,
              20,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          'in',
          'class',
          'primary',
          'secondary',
          'tertiary',
          'trunk',
        ],
      ],
      id: 'highway_major_casing',
      layout: {
        'line-cap': 'butt',
        'line-join': 'miter',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 11,
      paint: {
        'line-color': 'rgba(60,60,60,0.8)',
        'line-dasharray': [
          12,
          0,
        ],
        'line-width': {
          base: 1.3,
          stops: [
            [
              10,
              3,
            ],
            [
              20,
              23,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          'in',
          'class',
          'primary',
          'secondary',
          'tertiary',
          'trunk',
        ],
      ],
      id: 'highway_major_inner',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 11,
      paint: {
        'line-color': 'hsl(0, 0%, 7%)',
        'line-width': {
          base: 1.3,
          stops: [
            [
              10,
              2,
            ],
            [
              20,
              20,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          'in',
          'class',
          'primary',
          'secondary',
          'tertiary',
          'trunk',
        ],
      ],
      id: 'highway_major_subtle',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      maxzoom: 11,
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 6,
      paint: {
        'line-color': '#2a2a2a',
        'line-width': {
          stops: [
            [
              6,
              0,
            ],
            [
              8,
              2,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          '==',
          'class',
          'motorway',
        ],
      ],
      id: 'highway_motorway_casing',
      layout: {
        'line-cap': 'butt',
        'line-join': 'miter',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 6,
      paint: {
        'line-color': 'rgba(60,60,60,0.8)',
        'line-dasharray': [
          2,
          0,
        ],
        'line-opacity': 1,
        'line-width': {
          base: 1.4,
          stops: [
            [
              5.8,
              0,
            ],
            [
              6,
              3,
            ],
            [
              20,
              40,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          '==',
          'class',
          'motorway',
        ],
      ],
      id: 'highway_motorway_inner',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 6,
      paint: {
        'line-color': {
          base: 1,
          stops: [
            [
              5.8,
              'hsla(0, 0%, 85%, 0.53)',
            ],
            [
              6,
              '#000',
            ],
          ],
        },
        'line-width': {
          base: 1.4,
          stops: [
            [
              4,
              2,
            ],
            [
              6,
              1.3,
            ],
            [
              20,
              30,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          '==',
          'class',
          'motorway',
        ],
      ],
      id: 'highway_motorway_subtle',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      maxzoom: 6,
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      paint: {
        'line-color': '#181818',
        'line-width': {
          base: 1.4,
          stops: [
            [
              4,
              2,
            ],
            [
              6,
              1.3,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          'all',
          [
            '==',
            'class',
            'transit',
          ],
          [
            '!in',
            'brunnel',
            'tunnel',
          ],
        ],
      ],
      id: 'railway_transit',
      layout: {
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 16,
      paint: {
        'line-color': 'rgb(35,35,35)',
        'line-width': 3,
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          'all',
          [
            '==',
            'class',
            'transit',
          ],
          [
            '!in',
            'brunnel',
            'tunnel',
          ],
        ],
      ],
      id: 'railway_transit_dashline',
      layout: {
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 16,
      paint: {
        'line-color': 'rgb(12,12,12)',
        'line-dasharray': [
          3,
          3,
        ],
        'line-width': 2,
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          'all',
          [
            '==',
            'class',
            'rail',
          ],
          [
            'has',
            'service',
          ],
        ],
      ],
      id: 'railway_minor',
      layout: {
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 16,
      paint: {
        'line-color': 'rgb(35,35,35)',
        'line-width': 3,
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          'all',
          [
            '==',
            'class',
            'rail',
          ],
          [
            'has',
            'service',
          ],
        ],
      ],
      id: 'railway_minor_dashline',
      layout: {
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 16,
      paint: {
        'line-color': 'rgb(12,12,12)',
        'line-dasharray': [
          3,
          3,
        ],
        'line-width': 2,
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          '==',
          'class',
          'rail',
        ],
        [
          '!has',
          'service',
        ],
      ],
      id: 'railway',
      layout: {
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 13,
      paint: {
        'line-color': 'rgb(35,35,35)',
        'line-width': {
          base: 1.3,
          stops: [
            [
              16,
              3,
            ],
            [
              20,
              7,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          '==',
          'class',
          'rail',
        ],
        [
          '!has',
          'service',
        ],
      ],
      id: 'railway_dashline',
      layout: {
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      minzoom: 13,
      paint: {
        'line-color': 'rgb(12,12,12)',
        'line-dasharray': [
          3,
          3,
        ],
        'line-width': {
          base: 1.3,
          stops: [
            [
              16,
              2,
            ],
            [
              20,
              6,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'transportation',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '!=',
          'class',
          'motorway',
        ],
        [
          '==',
          '$type',
          'LineString',
        ],
      ],
      id: 'highway_name_other',
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 350,
        'text-field': '{name:latin} {name:nonlatin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-max-angle': 30,
        'text-pitch-alignment': 'viewport',
        'text-rotation-alignment': 'map',
        'text-size': 10,
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      paint: {
        'text-color': 'rgba(80, 78, 78, 1)',
        'text-halo-blur': 0,
        'text-halo-color': 'rgba(0, 0, 0, 1)',
        'text-halo-width': 1,
        'text-translate': [
          0,
          0,
        ],
      },
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'LineString',
        ],
        [
          '==',
          'class',
          'motorway',
        ],
      ],
      id: 'highway_name_motorway',
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 350,
        'text-field': '{ref}',
        'text-font': [
          'Metropolis Light',
          'Noto Sans Regular',
        ],
        'text-pitch-alignment': 'viewport',
        'text-rotation-alignment': 'viewport',
        'text-size': 10,
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'b6371a3f2f5a9932464fa3867530a2e5',
      },
      paint: {
        'text-color': 'hsl(0, 0%, 37%)',
        'text-translate': [
          0,
          2,
        ],
      },
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      type: 'symbol',
    },
    {
      filter: [
        '==',
        'admin_level',
        4,
      ],
      id: 'boundary_state',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      metadata: {
        'mapbox:group': 'a14c9607bc7954ba1df7205bf660433f',
      },
      paint: {
        'line-blur': 0.4,
        'line-color': 'hsl(0, 0%, 21%)',
        'line-dasharray': [
          2,
          2,
        ],
        'line-opacity': 1,
        'line-width': {
          base: 1.3,
          stops: [
            [
              3,
              1,
            ],
            [
              22,
              15,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'boundary',
      type: 'line',
    },
    {
      filter: [
        '==',
        'admin_level',
        2,
      ],
      id: 'boundary_country',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      metadata: {
        'mapbox:group': 'a14c9607bc7954ba1df7205bf660433f',
      },
      paint: {
        'line-blur': {
          base: 1,
          stops: [
            [
              0,
              0.4,
            ],
            [
              22,
              4,
            ],
          ],
        },
        'line-color': 'hsl(0, 0%, 23%)',
        'line-opacity': 1,
        'line-width': {
          base: 1.1,
          stops: [
            [
              3,
              1,
            ],
            [
              22,
              20,
            ],
          ],
        },
      },
      source: 'openmaptiles',
      'source-layer': 'boundary',
      type: 'line',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          'in',
          'class',
          'hamlet',
          'isolated_dwelling',
          'neighbourhood',
        ],
      ],
      id: 'place_other',
      layout: {
        'text-anchor': 'center',
        'text-field': '{name:latin}\n{name:nonlatin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-justify': 'center',
        'text-offset': [
          0.5,
          0,
        ],
        'text-size': 10,
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 14,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'text-color': 'rgb(101,101,101)',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          '==',
          'class',
          'suburb',
        ],
      ],
      id: 'place_suburb',
      layout: {
        'text-anchor': 'center',
        'text-field': '{name:latin}\n{name:nonlatin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-justify': 'center',
        'text-offset': [
          0.5,
          0,
        ],
        'text-size': 10,
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 15,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'text-color': 'rgb(101,101,101)',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          '==',
          'class',
          'village',
        ],
      ],
      id: 'place_village',
      layout: {
        'icon-size': 0.4,
        'text-anchor': 'left',
        'text-field': '{name:latin}\n{name:nonlatin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-justify': 'left',
        'text-offset': [
          0.5,
          0.2,
        ],
        'text-size': 10,
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 14,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'icon-opacity': 0.7,
        'text-color': 'rgb(101,101,101)',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          '==',
          'class',
          'town',
        ],
      ],
      id: 'place_town',
      layout: {
        'icon-image': {
          base: 1,
          stops: [
            [
              0,
              'circle-11',
            ],
            [
              9,
              '',
            ],
          ],
        },
        'icon-size': 0.4,
        'text-anchor': {
          base: 1,
          stops: [
            [
              0,
              'left',
            ],
            [
              8,
              'center',
            ],
          ],
        },
        'text-field': '{name:latin}\n{name:nonlatin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-justify': 'left',
        'text-offset': [
          0.5,
          0.2,
        ],
        'text-size': 10,
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 15,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'icon-opacity': 0.7,
        'text-color': 'rgb(101,101,101)',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          '==',
          'class',
          'city',
        ],
        [
          '>',
          'rank',
          3,
        ],
      ],
      id: 'place_city',
      layout: {
        'icon-image': {
          base: 1,
          stops: [
            [
              0,
              'circle-11',
            ],
            [
              9,
              '',
            ],
          ],
        },
        'icon-size': 0.4,
        'text-anchor': {
          base: 1,
          stops: [
            [
              0,
              'left',
            ],
            [
              8,
              'center',
            ],
          ],
        },
        'text-field': '{name:latin}\n{name:nonlatin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-justify': 'left',
        'text-offset': [
          0.5,
          0.2,
        ],
        'text-size': 10,
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 14,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'icon-opacity': 0.7,
        'text-color': 'rgb(101,101,101)',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          '<=',
          'rank',
          3,
        ],
        [
          '==',
          'class',
          'city',
        ],
      ],
      id: 'place_city_large',
      layout: {
        'icon-image': {
          base: 1,
          stops: [
            [
              0,
              'circle-11',
            ],
            [
              9,
              '',
            ],
          ],
        },
        'icon-size': 0.4,
        'text-anchor': {
          base: 1,
          stops: [
            [
              0,
              'left',
            ],
            [
              8,
              'center',
            ],
          ],
        },
        'text-field': '{name:latin}\n{name:nonlatin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-justify': 'left',
        'text-offset': [
          0.5,
          0.2,
        ],
        'text-size': 14,
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 12,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'icon-opacity': 0.7,
        'text-color': 'rgb(101,101,101)',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          '==',
          'class',
          'state',
        ],
      ],
      id: 'place_state',
      layout: {
        'text-field': '{name:latin}\n{name:nonlatin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-size': 10,
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 12,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'text-color': 'rgb(101,101,101)',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          '==',
          'class',
          'country',
        ],
        [
          '!has',
          'iso_a2',
        ],
      ],
      id: 'place_country_other',
      layout: {
        'text-field': '{name:latin}',
        'text-font': [
          'Metropolis Light Italic',
          'Noto Sans Italic',
        ],
        'text-size': {
          base: 1,
          stops: [
            [
              0,
              9,
            ],
            [
              1,
              11,
            ],
          ],
        },
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 8,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'text-color': 'rgb(101,101,101)',
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1.4,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          '==',
          'class',
          'country',
        ],
        [
          '>=',
          'rank',
          2,
        ],
        [
          'has',
          'iso_a2',
        ],
      ],
      id: 'place_country_minor',
      layout: {
        'text-field': '{name:latin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-size': {
          base: 1,
          stops: [
            [
              0,
              10,
            ],
            [
              6,
              12,
            ],
          ],
        },
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 8,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'text-color': 'rgb(101,101,101)',
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1.4,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
    {
      filter: [
        'all',
        [
          '==',
          '$type',
          'Point',
        ],
        [
          '<=',
          'rank',
          1,
        ],
        [
          '==',
          'class',
          'country',
        ],
        [
          'has',
          'iso_a2',
        ],
      ],
      id: 'place_country_major',
      layout: {
        'text-anchor': 'center',
        'text-field': '{name:latin}',
        'text-font': [
          'Metropolis Regular',
          'Noto Sans Regular',
        ],
        'text-size': {
          base: 1.4,
          stops: [
            [
              0,
              10,
            ],
            [
              3,
              12,
            ],
            [
              4,
              14,
            ],
          ],
        },
        'text-transform': 'uppercase',
        visibility: 'visible',
      },
      maxzoom: 6,
      metadata: {
        'mapbox:group': '101da9f13b64a08fa4b6ac1168e89e5f',
      },
      paint: {
        'text-color': 'rgb(101,101,101)',
        'text-halo-color': 'rgba(0,0,0,0.7)',
        'text-halo-width': 1.4,
      },
      source: 'openmaptiles',
      'source-layer': 'place',
      type: 'symbol',
    },
  ],
  metadata: {
    'mapbox:autocomposite': false,
    'mapbox:groups': {
      '101da9f13b64a08fa4b6ac1168e89e5f': {
        collapsed: false,
        name: 'Places',
      },
      a14c9607bc7954ba1df7205bf660433f: {
        name: 'Boundaries',
      },
      b6371a3f2f5a9932464fa3867530a2e5: {
        collapsed: false,
        name: 'Transportation',
      },
    },
    'mapbox:type': 'template',
    'openmaptiles:mapbox:owner': 'openmaptiles',
    'openmaptiles:mapbox:source:url': 'mapbox://openmaptiles.4qljc88t',
    'openmaptiles:version': '3.x',
  },
  name: 'Dark Matter',
  pitch: 0,
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://maps.tilehosting.com/data/v3.json?key=trAQJW6wzLknLPZbbbam',
    },
  },
  sprite: 'https://maps.tilehosting.com/styles/bright/sprite',
  version: 8,
  zoom: 3.8053494517746405,
};
