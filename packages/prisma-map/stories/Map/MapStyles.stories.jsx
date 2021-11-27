import React from 'react';
import { storiesOf } from '@storybook/react';

import Map from '../../src/Map';

const mapStories = storiesOf('Components/Map/Styles', module);

mapStories.add('Style as URL', () => (
  <Map style="https://maps.tilehosting.com/styles/darkmatter/style.json?key=trAQJW6wzLknLPZbbbam" />
));
