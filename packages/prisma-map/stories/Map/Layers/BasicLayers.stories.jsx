/* eslint-disable react/no-multi-comp  */
import React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Switch from '@material-ui/core/Switch';

import Map from '../../../src/Map';
import MapCard from '../../../src/MapCard';
import darkMatterStyle from '../../../src/dark-matter-style';
import geoJsonTestData from './geoJsonTestData';

const mapStories = storiesOf('Components/Map/Layers', module);

const customRasterStyles = {
  version: 8,
  name: 'raster-style',
  sources: {
    base: {
      type: 'raster',
      tileSize: 256,
      tiles: ['http://10.20.128.220:8089/lyrk_KCAA/{z}/{x}/{y}.png'],
    },
  },
  layers: [
    {
      id: 'rasterBase',
      type: 'raster',
      source: 'base',
    },
  ],
};

mapStories.add('Custom Raster Basemap', () => <Map style={customRasterStyles} />);

class MapWithLayers extends React.Component {
  state = {
    style: 'mapbox://styles/mapbox/dark-v9',
  };

  onLoad = style => {
    this.setState({ style });
  };

  showSatellite = () => {
    const style = { ...this.state.style };
    if (!style.sources.satellite) {
      style.sources.satellite = {
        type: 'raster',
        tiles: [
          'https://maps.tilehosting.com/styles/hybrid/{z}/{x}/{y}.jpg?key=trAQJW6wzLknLPZbbbam',
        ],
      };
    }

    style.layers = style.layers.filter(layer => layer.id !== 'satellite-layer');
    style.layers.push({
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite',
    });

    this.setState({
      style,
    });
  };

  showHybrid = () => {
    const { style } = this.state;
    const copiedStyle = { ...style };
    if (!copiedStyle.sources.satellite) {
      copiedStyle.sources.satellite = {
        type: 'raster',
        tiles: [
          'https://maps.tilehosting.com/styles/hybrid/{z}/{x}/{y}.jpg?key=trAQJW6wzLknLPZbbbam',
        ],
      };
    }

    copiedStyle.layers = copiedStyle.layers.filter(layer => layer.id !== 'satellite-layer');
    const waterIndex = copiedStyle.layers.findIndex(layer => layer.id === 'water');
    copiedStyle.layers.splice(waterIndex + 1, 0, {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite',
    });

    this.setState({
      style: copiedStyle,
    });
  };

  showStreets = () => {
    const { style } = this.state;
    const copiedStyle = { ...style };

    const newLayers = copiedStyle.layers.filter(layer => layer.id !== 'satellite-layer');
    copiedStyle.layers = newLayers;

    this.setState({
      style: copiedStyle,
    });
  };

  render() {
    const { style } = this.state;
    return (
      <React.Fragment>
        <Map onLoad={this.onLoad} style={style} />
        <Button variant="contained" onClick={this.showSatellite}>
          Satellite
        </Button>
        <Button variant="contained" onClick={this.showHybrid}>
          Hybrid
        </Button>
        <Button variant="contained" onClick={this.showStreets}>
          Streets
        </Button>
      </React.Fragment>
    );
  }
}

mapStories.add('Toggle Layers', () => <MapWithLayers />);

class MapWithServerLayers extends React.Component {
  state = {
    style: 'https://maps.tilehosting.com/styles/basic/style.json?key=trAQJW6wzLknLPZbbbam',
  };

  setLightStyle = () => {
    this.setState({
      style: 'https://maps.tilehosting.com/styles/basic/style.json?key=trAQJW6wzLknLPZbbbam',
    });
  };

  setDarkStyle = () => {
    this.setState({
      style: 'https://maps.tilehosting.com/styles/darkmatter/style.json?key=trAQJW6wzLknLPZbbbam',
    });
  };

  setTopographyStyle = () => {
    this.setState({
      style: 'https://maps.tilehosting.com/styles/topo/style.json?key=trAQJW6wzLknLPZbbbam',
    });
  };

  render() {
    const { style } = this.state;
    return (
      <React.Fragment>
        <Map style={style} />
        <Button variant="contained" onClick={this.setLightStyle}>
          Light
        </Button>
        <Button variant="contained" onClick={this.setDarkStyle}>
          Dark
        </Button>
        <Button variant="contained" onClick={this.setTopographyStyle}>
          Topography
        </Button>
      </React.Fragment>
    );
  }
}

mapStories.add('Toggle Layers with server driven styles', () => <MapWithServerLayers />);

class MapWithCustomGeoJsonLayers extends React.Component {
  state = {
    style: darkMatterStyle,
  };

  onLoad = () => {
    const { style } = this.state;
    this.setState({
      style: {
        ...style,
        sources: {
          ...style.sources,
          customGeo: {
            type: 'geojson',
            data: geoJsonTestData,
          },
        },
        layers: [
          // Layers render in order, so we are putting the geojson stuff at the top
          ...style.layers,
          // Our new layers. For this we are goind to add 1 layer per type. You can split it up
          // into more layers if you want, but you can't combine types of layers into 1
          {
            id: 'custom-geojson-points',
            type: 'circle',
            source: 'customGeo',
            paint: {
              'circle-color': 'blue',
            },
            filter: ['==', '$type', 'Point'],
          },
          {
            id: 'custom-geojson-polygons',
            type: 'fill',
            source: 'customGeo',
            paint: {
              'fill-color': 'green',
            },
            filter: ['==', '$type', 'Polygon'],
          },
        ],
      },
    });
  };

  render() {
    const { style } = this.state;
    return (
      <Map onLoad={this.onLoad} style={style} latitude={37.7492} longitude={-122.4586} zoom={10} />
    );
  }
}

mapStories.add('Add custom geojson data layers', () => <MapWithCustomGeoJsonLayers />);

class MapWithCustomGeoJsonUrlLayers extends React.Component {
  state = {
    style: darkMatterStyle,
  };

  onLoad = () => {
    const { style } = this.state;
    this.setState({
      style: {
        ...style,
        sources: {
          ...style.sources,
          nwsWeatherStations: {
            type: 'geojson',
            data: 'https://api.weather.gov/stations',
            cluster: true, // clusters data together
            clusterRadius: 8, // the radius to consider the elements close enough to cluster
            // larger the radius number, the larger the area that can be considered a single cluster
          },
        },
        layers: [
          ...style.layers,
          {
            id: 'new-stations',
            type: 'circle',
            source: 'nwsWeatherStations',
            paint: {
              'circle-color': 'rgb(229,190,60)',
            },
          },
        ],
      },
    });
  };

  render() {
    const { style } = this.state;
    return <Map onLoad={this.onLoad} style={style} latitude={39.887} longitude={-98} zoom={3} />;
  }
}
mapStories.add('Add custom geojson url data layers', () => <MapWithCustomGeoJsonUrlLayers />);

class MapToggleLayers extends React.Component {
  state = {
    style: {
      ...darkMatterStyle,
      sources: {
        ...darkMatterStyle.sources,
        nwsWeatherStations: {
          type: 'geojson',
          data: 'https://api.weather.gov/stations',
          cluster: true, // clusters data together
          clusterRadius: 5, // the radius to consider the elements close enough to cluster
        },
      },
      layers: [
        ...darkMatterStyle.layers,
        {
          id: 'nws-stations',
          type: 'circle',
          source: 'nwsWeatherStations',
          paint: {
            'circle-color': 'rgb(229,190,60)',
          },
        },
      ],
    },
  };

  handleChange = changedLayer => event => {
    this.setState({
      style: {
        ...this.state.style,
        layers: this.state.style.layers.map(layer => {
          if (changedLayer === layer.id) {
            return {
              ...layer,
              layout: {
                ...layer.layout,
                visibility: event.target.checked ? 'visible' : 'none',
              },
            };
          }

          return layer;
        }),
      },
    });
  };

  render() {
    const { style } = this.state;
    const stationLayer = style.layers.find(layer => layer.id === 'nws-stations');
    const isVisible = !(stationLayer.layout && stationLayer.layout.visibility === 'none');

    return (
      <React.Fragment>
        <Map style={style} latitude={39.887} longitude={-98} zoom={3}>
          <MapCard>
            <CardHeader title="Toggle Layers" />
            <CardContent>
              <div style={{ flex: 1, justifyContent: 'space-between' }}>
                <Typography variante="body1">NWS Weather Stations</Typography>
                <Switch
                  checked={isVisible}
                  onChange={this.handleChange('nws-stations')}
                  value="showStations"
                />
              </div>
            </CardContent>
          </MapCard>
        </Map>
      </React.Fragment>
    );
  }
}

mapStories.add('Toggle layer visibility', () => <MapToggleLayers />);

/* eslint-enable react/no-multi-comp */
