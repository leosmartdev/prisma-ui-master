import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { withStyles } from '@material-ui/core/styles';
import { select } from '@storybook/addon-knobs';

import Button from '@material-ui/core/Button';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Map from '../../src/Map';
import MapCard from '../../src/MapCard';

const mapStories = storiesOf('Components/MapCard', module);

mapStories.add(
  'Basic Component',
  () => (
    <Map longitude={-90} latitude={1}>
      <MapCard>
        <CardHeader title="Header" subheader="Subheader" />
        <CardContent>
          <Typography variant="body1">This is some content in the card.</Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => console.info('Hello Click')}>
            Click Me
          </Button>
        </CardActions>
      </MapCard>
    </Map>
  ),
  { info: { inline: true } },
);

const anchorLocations = {
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

mapStories.add('Map Card Location', () => (
  <Map>
    <MapCard anchor={select('anchor', anchorLocations, 'top-left')}>
      <CardHeader title="Header" subheader="Subheader" />
    </MapCard>
  </Map>
));

ChangeDimensionComponent.propTypes = {
  classes: PropTypes.shape({
    root: PropTypes.string,
  }).isRequired,
};

function ChangeDimensionComponent({ classes }) {
  return (
    <Map>
      <MapCard className={classes.root}>
        <CardHeader title="Header" subheader="Subheader" />
        <CardContent>
          <Typography variant="body1">This is some content in the card.</Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => console.info('Hello Click')}>
            Click Me
          </Button>
        </CardActions>
      </MapCard>
    </Map>
  );
}

const Wrapped = withStyles({
  root: {
    width: '600px',
    height: '400px',
  },
})(ChangeDimensionComponent);

mapStories.add('Change dimensions', () => <Wrapped />);

const OverflowWrapped = withStyles({
  root: {
    width: '900px',
    height: '600px',
  },
})(ChangeDimensionComponent);

mapStories.add('Dimensions larger than the map are prevented', () => <OverflowWrapped />);
