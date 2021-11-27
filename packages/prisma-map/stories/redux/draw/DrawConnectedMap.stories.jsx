/* eslint-disable react/prop-types,react/no-multi-comp,camelcase */
import React from 'react';
import { Provider, connect } from 'react-redux';
import { storiesOf } from '@storybook/react';
import { randomPolygon } from '@turf/turf';

import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import ConnectedMap from '../../../src/redux/ConnectedMap';
import MapCard from '../../../src/MapCard';
import style from '../OpenStreetMapStyle';

import initStore from '../store';
import { addFeature, timeoutFeature } from '../../../src/redux/features/actions';
import {
  startDrawMode,
  stopDrawMode,
  changeDrawTool,
  addInputFeatureToDraw,
} from '../../../src/redux/map/draw/actions';
import { Typography } from '@material-ui/core';
import {
  getDrawToolForMap,
  getOutputDrawFeatureForMap,
} from '../../../src/redux/map/draw/selectors';

const mapStories = storiesOf('redux/ConnectedMap/DrawActions', module);
mapStories.addDecorator(getStory => <Provider store={initStore()}>{getStory()}</Provider>);

const ModeToggleSwitch = connect(
  null,
  dispatch => ({
    startDrawMode: () => {
      dispatch(startDrawMode('test-map'));
    },
    stopDrawMode: () => {
      dispatch(stopDrawMode('test-map'));
    },
  }),
)(
  class extends React.Component {
    state = { drawActive: false };

    onChange = event => {
      this.setState({ drawActive: event.target.checked });

      if (event.target.checked) {
        this.props.startDrawMode();
      } else {
        this.props.stopDrawMode();
      }
    };

    render() {
      const { drawActive } = this.state;
      return (
        <FormControlLabel
          control={<Switch checked={drawActive} onChange={this.onChange} />}
          label="Draw Mode"
        />
      );
    }
  },
);

mapStories.add('Toggle Draw Mode', () => (
  <div style={{ position: 'relative', width: 800, height: 500 }}>
    <ConnectedMap mapId="test-map" />
    <MapCard anchor="top-left">
      <CardHeader title="Toggle Mode" />
      <CardContent>
        <ModeToggleSwitch />
      </CardContent>
    </MapCard>
  </div>
));

const ToolToggleButtons = connect(
  state => ({
    tool: getDrawToolForMap(state, 'test-map'),
  }),
  dispatch => ({
    useSelectTool: () => {
      dispatch(changeDrawTool('test-map', 'select'));
    },
    useLineTool: () => {
      dispatch(changeDrawTool('test-map', 'line'));
    },
    usePolygonTool: () => {
      dispatch(changeDrawTool('test-map', 'polygon'));
    },
    usePointTool: () => {
      dispatch(changeDrawTool('test-map', 'point'));
    },
    startDraw: () => {
      dispatch(startDrawMode('test-map'));
    },
  }),
)(({ tool, useSelectTool, usePointTool, useLineTool, usePolygonTool, startDraw }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <Typography variant="subheading">Current Tool {tool}</Typography>
    <Button onClick={startDraw}>Start Draw Mode</Button>
    <Button onClick={useSelectTool}>Select</Button>
    <Button onClick={usePointTool}>Point</Button>
    <Button onClick={useLineTool}>Line</Button>
    <Button onClick={usePolygonTool}>Polygon</Button>
  </div>
));

mapStories.add('Change Draw Tools', () => (
  <div style={{ position: 'relative', width: 800, height: 500 }}>
    <ConnectedMap mapId="test-map" />
    <MapCard anchor="top-left">
      <CardHeader title="Change Draw Tools" />
      <CardContent>
        <ToolToggleButtons />
      </CardContent>
    </MapCard>
  </div>
));

const AddFeatureButtons = connect(
  null,
  dispatch => ({
    startDraw: () => {
      dispatch(startDrawMode('test-map'));
    },
    addDrawFeature: () => {
      const collection = randomPolygon(1, { bbox: [-8, -8, 8, 8] });
      const feature = collection.features[0];
      feature.id = 'drawn';
      feature.properties.fillColor = '#00FFFF';
      feature.properties.borderColor = '#FF0000';
      dispatch(addInputFeatureToDraw('test-map', feature));
    },
  }),
)(
  class extends React.Component {
    componentDidMount() {
      this.props.startDraw();
    }

    render() {
      const { addDrawFeature } = this.props;

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Button onClick={addDrawFeature}>Add Feature</Button>
        </div>
      );
    }
  },
);

mapStories.add('Add Feature to Draw Tool', () => (
  <div style={{ position: 'relative', width: 800, height: 500 }}>
    <ConnectedMap mapId="test-map" />
    <MapCard anchor="top-left">
      <CardContent>
        <AddFeatureButtons />
      </CardContent>
    </MapCard>
  </div>
));

const SyncMaps = connect(
  state => ({
    drawnFeature: getOutputDrawFeatureForMap(state, 'test-map'),
  }),
  dispatch => ({
    addFeature: feature => {
      dispatch(addFeature(feature));
    },
    timeoutFeature: feature => {
      dispatch(timeoutFeature(feature));
    },
  }),
)(
  class extends React.Component {
    componentDidUpdate(prevProps) {
      if (this.props.drawnFeature !== prevProps.drawnFeature) {
        if (prevProps.drawnFeature) {
          this.props.timeoutFeature(prevProps.drawnFeature);
        }
        this.props.addFeature(this.props.drawnFeature);
      }
    }

    /**
     * TODO: So to get line and fill done we need two layers, but currently only one layer
     * can get a feature, so we need the layer groups to be able to get a feature, then any layer in
     * the groups have access to that 'source'. So essentially, all layers in a group access the same
     * source in the map, but have their own filters at the mapbox style layer to deal with filtering
     * the list.
     */
    mapConfiguration = {
      id: 'feature-view',
      style,
      layers: {
        dynamicLayers: ['dynamic:outline', 'dynamic:fill'],
        'dynamic:fill': {
          id: 'dynamic:fill',
          name: 'Synced Feature',
          type: 'fill',
          source: 'features',
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-outline-color': ['get', 'borderColor'],
          },
          layout: {
            visibility: 'visible',
          },
          filter: ['featureType', 'Polygon'],
        },
        'dynamic:outline': {
          id: 'dynamic:fill',
          name: 'Synced Feature',
          type: 'line',
          source: 'features',
          paint: {
            'line-color': ['get', 'borderColor'],
            'line-width': 4,
          },
          layout: {
            visibility: 'visible',
          },
          filter: ['featureType', 'Polygon'],
        },
      },
    };

    render() {
      return (
        <div style={{ display: 'flex' }}>
          <div style={{ position: 'relative', width: 400, height: 400 }}>
            <ConnectedMap mapId="test-map" height={400} width={400} />
            <MapCard anchor="top-left">
              <CardContent>
                <AddFeatureButtons />
              </CardContent>
            </MapCard>
          </div>
          <ConnectedMap
            mapId="feature-view"
            height={400}
            width={400}
            mapConfiguration={this.mapConfiguration}
          />
        </div>
      );
    }
  },
);

mapStories.add('Get Feature from Draw Tool', () => <SyncMaps />);
