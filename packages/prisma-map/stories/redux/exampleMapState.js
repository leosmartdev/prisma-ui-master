const state = {
  '@prisma/map': {
    maps: {
      mapIds: ['map1', 'map2'],
      map1: {
        style: {
          layers: [
            { id: 'base', source: 'rasterBase' },
            { id: 'vectorStuff', source: 'vector-sources...' },
          ],
          sources: {
            base: {
              type: 'raster',
              tiles: ['url://...'],
            },
          },
        },
        layers: {
          // Layers that visibility can be set. This provides a clean list of layers for layer buttons
          // to adjust.  May also expand from visibility to opacity and other paint/layout properties.
          // The actual values however will be on the `layers` object below to then be placed in the
          // generatedStyles.layers
          toggleableLayers: [
            'ais',
            'omnicom',
            'incident1',
          ],
          // List of layers that are dynamically generated. Order is order in which they will be
          // rendered.
          generatedLayers: [
            'ais',
            'omnicom',
            'incident1:zones',
            'incident1:log',
          ],
          // overrides for top level layers if this map want's custom paint, filters, etc...
          // these layers will be placed into the style when dynamic generation occurs
          ais: {
            id: 'ais',
            paint: {
              'circle-color': '#ffffff',
            },
            layout: {
              visibility: 'none',
            },
          },
        },
      },
      map2: {
        style: {
          layers: [
            { id: 'ais', source: 'generated:ais' },
            { id: 'fleet1', source: 'generated:fleet1' },
          ],
          sources: {
            'generated:ais': {
              type: 'geojson',
              data: [
                {}, {}, {},
              ],
            },
            'generated:fleet1': {
              type: 'geojson',
              data: [
                {},
              ],
            },
          },
        },
      },
    },
    layers: {
      ais: {
        id: 'ais',
        name: 'AIS',
        type: 'layer',
        source: 'features', // state['@prisma/map'].sources?[source]
        filter: ['featureProperty', '==', 'type', 'track:ais'],
        paint: {
          'circle-color': '#000000',
        },
      },
      incident1: {
        id: 'incident1',
        name: 'Incident 1',
        type: 'composite',
        layers: ['incident1:zones', 'incident1:log'],
      },
      'incident1:zones': {
        id: 'incident1:zones',
        name: 'Incident 1 Zones',
        type: 'layer',
        source: 'features',
        filter: [
          'all', // mapbox uses all/any
          ['featureProperty', '==', 'incidentId', 'incident1'],
          // featurePropertyEquals(comparison, property, propertyValue)
          // geojson.properties.incidentId === incident1
          ['featureType', 'Polygon'],
          // featureType(type)
          // geojson.geometry.type === Polygon
        ],
      },
      omnicom: {
      },
      fleet1: {
        filter: [
          'and',
          ['featureProperty', 'fleetId', '===', 'fleet1'],
        ],
        layout: {
          visible: ['featureProperty', 'is_vessel', '===', true],
        },
      },
      sites: {
        id: 'sites',
        static: true,
        source: 'features',
        features: [6],
      },
      history: {
        id: 'history',
        name: 'Track History',
        type: 'layer',
        source: 'historicalFeatures',
      },
    },
    historicalFeatures: {
      10: {
        id: 1,
        type: 'Feature',
      },
    },
    features: {
      1: {
        id: 1,
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-77, 37],
        },
        properties: {

        },
      },
      2: {
        id: 2,
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [10, -10],
        },
        properties: {

        },
      },
      3: {
        id: 3,
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [10, -10],
        },
        properties: {

        },
      },
      4: {
        id: 4,
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [10, -10],
        },
        properties: {

        },
      },
      5: {
        id: 5,
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [10, -10],
        },
        properties: {

        },
      },
    },
  },
};
