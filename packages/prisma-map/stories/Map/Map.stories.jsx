import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, number } from '@storybook/addon-knobs';
import BasicUsage from './BasicUsage.md';

import Map from '../../src/Map';

const mapStories = storiesOf('Components/Map', module);

mapStories.add('Basic Component', () => <Map />, { notes: BasicUsage, info: { inline: true } });

mapStories.add('Change Map Size', () => <Map width={600} height={200} />);

mapStories.add('"Full Screen Map"', () => <Map fullScreen />);

mapStories.add(
  'Viewport Properties',
  () => (
    <Map
      latitude={number('latitude', 37.799, { min: -90, max: 90 })}
      longitude={number('longitude', -122.444, { min: -180, max: 180 })}
      zoom={number('zoom', 12, { min: 0, max: 24 })}
      pitch={number('pitch', 60, { min: 0, max: 60 })}
      bearing={number('bearing', 45, { min: 0, max: 359 })}
      width={number('width', 500)}
      height={number('height', 500)}
      fullScreen={boolean('fullScreen', false)}
    />
  ),
  { info: { inline: true } },
);
