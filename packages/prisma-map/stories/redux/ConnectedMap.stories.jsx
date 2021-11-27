/* eslint-disable react/prop-types,react/no-multi-comp,camelcase */
import React from 'react';
import { Provider, connect } from 'react-redux';
import { storiesOf } from '@storybook/react';
import uuid from 'uuid/v4';
import { randomPoint, featureEach } from '@turf/turf';

import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import ConnectedMap from '../../src/redux/ConnectedMap';
import MapCard from '../../src/MapCard';

import initStore from './store';
import { addFeature } from '../../src/redux/features/actions';
import { setLayerHidden, setLayerVisible } from '../../src/redux/map/actions';
import style from './OpenStreetMapStyle';

const mapStories = storiesOf('redux/ConnectedMap', module);
mapStories.addDecorator(getStory => <Provider store={initStore()}>{getStory()}</Provider>);

mapStories.add('Basic Component', () => <ConnectedMap />, { info: { inline: true } });

const ConnectedMapAddFeatures = connect(
  null,
  dispatch => ({
    addFeature: feature => {
      dispatch(addFeature(feature));
    },
  }),
)(
  class extends React.Component {
    state = {
      mapConfiguration: {
        id: 'test-map',
        style,
        layers: {
          dynamicLayers: ['dynamic1'],
          dynamic1: {
            id: 'dynamic1',
            name: 'Random Feature',
            type: 'circle',
            source: 'features',
            paint: {
              'circle-color': '#FF0000',
            },
            layout: {
              visibility: 'visible',
            },
            filter: ['featureType', 'Point'],
          },
        },
      },
      viewport: {
        bounds: {
          north: 1,
          south: -1,
          east: -1,
          west: 1,
        },
      },
    };

    onViewportChange = viewport => {
      this.setState({ viewport });
    };

    onClick = () => {
      const { north, south, east, west } = this.state.viewport.bounds;
      const collection = randomPoint(1, { bbox: [east, south, west, north] });
      featureEach(collection, feature => {
        const f = { ...feature, id: uuid() };
        this.props.addFeature(f);
      });
    };

    render() {
      return (
        <div>
          <ConnectedMap
            latitude={45}
            longitude={13}
            mapConfiguration={this.state.mapConfiguration}
            onViewportChange={this.onViewportChange}
          />
          <Button variant="contained" onClick={this.onClick}>
            Add Random Feature
          </Button>
        </div>
      );
    }
  },
);

mapStories.add('Add features', () => <ConnectedMapAddFeatures />);

const ToggleSwitch = connect(
  null,
  dispatch => ({
    setVisible: layerId => {
      dispatch(setLayerVisible('test-map', layerId));
    },
    setHidden: layerId => {
      dispatch(setLayerHidden('test-map', layerId));
    },
  }),
)(
  class extends React.Component {
    state = { dynamic1: true, boundary_country: true };

    onChange = layerId => event => {
      this.setState({ [layerId]: event.target.checked });

      if (event.target.checked) {
        this.props.setVisible(layerId);
      } else {
        this.props.setHidden(layerId);
      }
    };

    render() {
      const { dynamic1, boundary_country } = this.state;
      return (
        <React.Fragment>
          <FormControlLabel
            control={<Switch checked={dynamic1} onChange={this.onChange('dynamic1')} />}
            label="Features"
          />
          <FormControlLabel
            control={
              <Switch checked={boundary_country} onChange={this.onChange('boundary_country')} />
            }
            label="Country Boundaries"
          />
        </React.Fragment>
      );
    }
  },
);

mapStories.add('Toggle Layers', () => (
  <div style={{ position: 'relative', width: 800, height: 500 }}>
    <ConnectedMapAddFeatures latitude={45} longitude={13} />
    <MapCard anchor="top-left">
      <CardHeader title="Toggle Layers" />
      <CardContent>
        <ToggleSwitch />
      </CardContent>
    </MapCard>
  </div>
));
