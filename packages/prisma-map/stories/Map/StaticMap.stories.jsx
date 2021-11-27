import React from 'react';
import { withNotes } from '@storybook/addon-notes';
import { storiesOf } from '@storybook/react';

import StaticMap from '../../src/StaticMap';
import Map from '../../src/Map';

const mapStories = storiesOf('Components/StaticMap', module);

mapStories.add(
  'Base Component',

  withNotes(
    'Static map is a map with no controls. You can set (or change) the viewport using the props, but all mouse and cursor movements will be blocked.',
  )(() => <StaticMap />),
  { info: { inline: true } },
);
mapStories.add('Change map location', () => <StaticMap latitude={37} longitude={-76} />);
mapStories.add('with all viewport properties', () => (
  <StaticMap latitude={37.799} longitude={-122.444} zoom={12} pitch={60} bearing={45} />
));

mapStories.add('Using standard <Map />', () => <Map static />);
