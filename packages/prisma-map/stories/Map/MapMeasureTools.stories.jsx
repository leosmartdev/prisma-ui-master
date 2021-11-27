import React from 'react';
import { storiesOf } from '@storybook/react';

import { length } from '@turf/turf';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Map from '../../src/Map';
import MapCard from '../../src/MapCard';

const stories = storiesOf('Components/Map/Measure', module);

class MapMeasureLine extends React.Component {
  state = {
    distance: 0,
  };

  onDrawRender = (event, feature) => {
    if (feature.geometry && feature.geometry.coordinates.length > 0) {
      console.info(this.calculateLineDistance(feature));
      this.setState(() => ({
        distance: this.calculateLineDistance(feature),
      }));
    }
  };

  onDrawStart = () => {
    this.setState({
      distance: 0,
    });
  };

  onDrawCreate = event => {
    this.setState({
      distance: this.calculateLineDistance(event.features[0]),
    });
  };

  onDrawDelete = () => {
    this.setState({
      distance: 0,
    });
  };

  onDrawUpdate = event => {
    this.setState({
      distance: this.calculateLineDistance(event.features[0]),
    });
  };

  onDrawMouseMove = event => {
    this.setState({
      distance: this.calculateLineDistance(event.features[0]),
    });
  };

  calculateLineDistance = feature => length(feature);

  render() {
    const { distance } = this.state;

    return (
      <div style={{ position: 'relative', width: 800, height: 500 }}>
        <Map
          mode="draw"
          onDrawRender={this.onDrawRender}
          onDrawCreate={this.onDrawCreate}
          onDrawUpdate={this.onDrawUpdate}
          onDrawDelete={this.onDrawDelete}
        />
        {/* DONT PUT MAP CARD UNDER MAP. Instead do what we did here (until I can get a proper
         * MapContainer component that passes fullScreen, width, height, and offsets down to the
         * map). If you put map card inside the map, when it renders it will break the draw tool.
         */}
        <MapCard anchor="top-left">
          <CardHeader title="Line Distance" />
          <CardContent>
            <Typography variant="body2">
              Total Distance: {parseFloat(distance).toFixed(2)} km
            </Typography>
          </CardContent>
        </MapCard>
      </div>
    );
  }
}

stories.add('Measure Total Line Distance', () => <MapMeasureLine />);
