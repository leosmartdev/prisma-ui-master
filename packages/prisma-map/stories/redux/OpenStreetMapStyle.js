export default {
  name: 'dark',
  version: 8,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tileSize: 256,
      tiles: ['https://b.tile.openstreetmap.org/{z}/{x}/{y}.png'],
    },
    weather: {
      type: 'raster',
      tiles: [
        'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=664aa2a896afa78a3cbf93bd0d801fa8',
      ],
    },
    weatherStations: {
      type: 'geojson',
      data: 'https://api.weather.gov/stations',
      cluster: true,
      clusterRadius: 5,
    },
    weatherAlerts: {
      type: 'geojson',
      data: 'https://api.weather.gov/alerts/active',
    },
    aircraft: {
      type: 'geojson',
      data:
        'https://www.chapelhillopendata.org/api/v2/catalog/datasets/traffic-signals-in-chapel-hill/exports/geojson',
      cluster: true,
      clusterRadius: 5,
    },
    ports: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              label: 'Punta Arenas (Cobrem Par)',
              deviceId: '3',
              deviceType: 'MRCC',
              type: 'Site',
              status: 'Ok',
              elevation: 1000,
            },
            geometry: {
              type: 'Point',
              coordinates: [-70.80000305, -53.15000153],
            },
          },
          {
            type: 'Feature',
            properties: {
              color: [255, 0, 255, 1],
              'marker-color': '#ff00ff',
              'marker-size': 'medium',
              'marker-symbol': '',
            },
            geometry: {
              type: 'Point',
              coordinates: [-122.44477272033691, 37.79906910652822, 1000],
            },
          },
        ],
        cluster: true,
        clusterRadius: 50,
      },
    },
  },
  layers: [
    {
      id: 'basemap',
      type: 'raster',
      source: 'raster-tiles',
    },
    {
      id: 'overlays',
      type: 'raster',
      source: 'weather',
    },
    {
      id: 'aircraftLayer',
      type: 'circle',
      source: 'aircraft',
      layout: {
        visibility: 'visible',
      },
    },
    {
      id: 'features',
      type: 'circle',
      source: 'ports',
      paint: {
        'circle-color': 'green',
      },
    },
    {
      id: 'alerts',
      type: 'fill-extrusion',
      source: 'weatherAlerts',
      paint: {
        'fill-extrusion-color': ['match', ['get', 'severity'],
          'Minor', 'yellow',
          'Moderate', 'yellow',
          'Severe', 'red',
          'green',
        ],
        'fill-extrusion-height': 40000,
        'fill-extrusion-opacity': 0.75,
      },
    },
  ],
};
