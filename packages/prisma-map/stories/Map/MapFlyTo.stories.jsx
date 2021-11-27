import React from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import Button from '@material-ui/core/Button';

import Map from '../../src/Map';

const mapStories = storiesOf('Components/Map/FlyTo', module);

class MapWithRef extends React.Component {
  constructor(props) {
    super(props);

    this.mapRef = React.createRef();
  }

  flyToDC = () => {
    if (this.mapRef.current) {
      this.mapRef.current.flyTo(38.9072, -77.0369);
    }
  };

  flyToLA = () => {
    if (this.mapRef.current) {
      this.mapRef.current.flyTo(34.0522, -118.2437);
    }
  };

  render() {
    return (
      <React.Fragment>
        <Map ref={this.mapRef} />
        <Button variant="contained" onClick={this.flyToDC}>
          Fly To DC
        </Button>
        <Button variant="contained" onClick={this.flyToLA}>
          Fly To LA
        </Button>
      </React.Fragment>
    );
  }
}

mapStories.add('Get Map Reference', () => <MapWithRef />);

mapStories.add('As Property Reference', () => (
  <Map
    flyTo={{
      latitude: number('latitude', 37.799, { min: -90, max: 90 }),
      longitude: number('longitude', -122.444, { min: -180, max: 180 }),
    }}
  />
));
