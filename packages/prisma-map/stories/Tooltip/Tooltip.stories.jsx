/* eslint-disable react/no-multi-comp  */
import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Map from '../../src/Map';

const mapStories = storiesOf('Components/Tooltip', module);

class TooltipOnMouse extends React.Component {
  state = {
    point: null,
    coordinates: { latitude: 0, longitude: 0 },
  };

  updateMouse = event => {
    this.setState({
      point: {
        x: event.point.x,
        y: event.point.y - 10,
      },
      coordinates: {
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      },
    });
  };

  render() {
    return (
      <Map longitude={-90} latitude={1} onMouseMove={this.updateMouse} style={this.state.mapStyle}>
        <Map.Tooltip point={this.state.point} show={!!this.state.point}>
          <Paper>
            <Typography variant="body1">
              Latitude: {parseFloat(this.state.coordinates.latitude).toFixed(4)}
            </Typography>
            <Typography variant="body1">
              Longitude: {parseFloat(this.state.coordinates.longitude).toFixed(4)}
            </Typography>
          </Paper>
        </Map.Tooltip>
      </Map>
    );
  }
}

mapStories.add('Basic Component', () => <TooltipOnMouse />, { info: { inline: true } });

class TooltipPlacement extends React.Component {
  state = {
    point: null,
    coordinates: { latitude: 0, longitude: 0 },
  };

  updateMouse = event => {
    this.setState({
      point: {
        x: event.point.x,
        y: event.point.y - 10,
      },
      coordinates: {
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      },
    });
  };

  render() {
    return (
      <Map longitude={-90} latitude={1} onMouseMove={this.updateMouse} style={this.state.mapStyle}>
        <Map.Tooltip
          placement={this.props.placement}
          point={this.state.point}
          show={!!this.state.point}
        >
          <Paper>
            <Typography variant="body1">
              Latitude: {parseFloat(this.state.coordinates.latitude).toFixed(4)}
            </Typography>
            <Typography variant="body1">
              Longitude: {parseFloat(this.state.coordinates.longitude).toFixed(4)}
            </Typography>
          </Paper>
        </Map.Tooltip>
      </Map>
    );
  }
}

TooltipPlacement.propTypes = {
  placement: PropTypes.string.isRequired,
};

const placementLocations = {
  'top-left': 'top-left',
  'top-center': 'top-center',
  'top-right': 'top-right',
  'middle-left': 'middle-left',
  'middle-center': 'middle-center',
  'middle-right': 'middle-right',
  'bottom-left': 'bottom-left',
  'bottom-center': 'bottom-center',
  'bottom-right': 'bottom-right',
};

mapStories.add('Tooltip Placement', () => (
  <TooltipPlacement placement={select('placement', placementLocations, 'bottom-right')} />
));

const customStyle = {
  sources: {
    data: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-90, 1],
            },
            properties: {
              description: 'This is a tooltip attached to a Point feature.',
            },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-90, 4], [-90, 8], [-93, 8], [-90, 4]]],
            },
            properties: {
              description: 'This is a tooltip attached to a Polygon feature.',
            },
          },
        ],
      },
    },
  },
  layers: [
    {
      id: 'test',
      type: 'circle',
      paint: {
        'circle-color': 'white',
      },
      source: 'data',
      filter: ['==', '$type', 'Point'],
    },
  ],
};

class TooltipOnFeatureHover extends React.Component {
  state = {
    mapStyle: undefined,
  };

  onMapLoad = style => {
    this.setState({
      mapStyle: {
        ...style,
        ...customStyle,
        sources: {
          ...style.sources,
          ...customStyle.sources,
        },
        layers: [...style.layers, ...customStyle.layers],
      },
    });
  };

  render() {
    const { mapStyle } = this.state;

    return (
      <Map longitude={-90} latitude={1} onLoad={this.onMapLoad} style={mapStyle}>
        <Map.Hover layers={['test']}>
          {features => (
            <Map.Tooltip
              placement="bottom-middle"
              feature={features.length > 0 ? features[0] : null}
              show={features.length > 0}
            >
              <Paper>
                <Typography variant="body1">{features[0].properties.description}</Typography>
              </Paper>
            </Map.Tooltip>
          )}
        </Map.Hover>
      </Map>
    );
  }
}

mapStories.add('Tooltip on Feature Hover', () => <TooltipOnFeatureHover />);

const additionalStyle = {
  ...customStyle,
  layers: [
    {
      id: 'polygon',
      type: 'fill',
      source: 'data',
      paint: {
        'fill-color': 'green',
        'fill-outline-color': 'white',
      },
      filter: ['==', '$type', 'Polygon'],
    },
    {
      id: 'point',
      type: 'circle',
      source: 'data',
      paint: {
        'circle-color': 'white',
      },
      filter: ['==', '$type', 'Point'],
    },
  ],
};

class TooltipMultipleLayersHover extends React.Component {
  state = {
    mapStyle: undefined,
  };

  onMapLoad = style => {
    this.setState({
      mapStyle: {
        ...style,
        ...additionalStyle,
        sources: {
          ...style.sources,
          ...additionalStyle.sources,
        },
        layers: [...style.layers, ...additionalStyle.layers],
      },
    });
  };

  render() {
    const { mapStyle } = this.state;

    return (
      <Map longitude={-90} latitude={1} onLoad={this.onMapLoad} style={mapStyle}>
        <Map.Hover layers={['point', 'polygon']}>
          {features => (
            <Map.Tooltip
              feature={features.length > 0 ? features[0] : null}
              show={features.length > 0}
            >
              <Paper>
                <Typography variant="body1">{features[0].properties.description}</Typography>
              </Paper>
            </Map.Tooltip>
          )}
        </Map.Hover>
      </Map>
    );
  }
}

mapStories.add('Tooltip on Features Across Multiple Layers', () => <TooltipMultipleLayersHover />);

/* eslint-enable react/no-multi-comp  */
