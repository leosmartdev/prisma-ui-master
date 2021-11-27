import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Map from '../../../src/Map';
import MapCard from '../../../src/MapCard';

const stories = storiesOf('Components/Map/Events', module);

stories.add('Listen for Map Events', () => (
  <Map
    onZoom={action('onZoom Event')}
    onMove={action('onMove Event')}
    onMoveStart={action('onMoveStart Event')}
    onMoveEnd={action('onMoveEnd Event')}
  />
));

stories.add('onViewportChange() callback', () => (
  <Map onViewportChange={action('Viewport changed')} />
));

stories.add('Listen for Draw Mode Events', () => (
  <Map
    mode="draw"
    onClick={action('onClick')}
    onDrawCreate={action('onDrawCreate Event')}
    onDrawUpdate={action('onDrawUpdate Event')}
    onDrawDelete={action('onDrawDelete Event')}
    onDrawStart={action('onDrawStart Event')}
  />
));

stories.add('Click event', () => <Map onClick={action('onClick event')} />);

stories.add('Listen for events on a specific layer', () => (
  <Map mode="draw" onLayerClick={{ alerts: action('onClick') }} />
));

class MapWithCoordinatesCard extends React.Component {
  state = {
    latitude: 0,
    longitude: 0,
  };

  onMouseMove = event => {
    const { lat, lng } = event.lngLat;
    this.setState(() => ({
      latitude: lat,
      longitude: lng,
    }));
  };

  render() {
    const { latitude, longitude } = this.state;

    return (
      <Map onMouseMove={this.onMouseMove}>
        <MapCard achor="top-right" style={{ width: '200px' }}>
          <CardHeader title="Coordinates" />
          <CardContent>
            <Typography variant="body2">Latitude: {parseFloat(latitude).toFixed(4)}</Typography>
            <Typography variant="body2">Longitude: {parseFloat(longitude).toFixed(4)}</Typography>
          </CardContent>
        </MapCard>
      </Map>
    );
  }
}
stories.add('Latitude Longitude Mouse Location', () => <MapWithCoordinatesCard />);
