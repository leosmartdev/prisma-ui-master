import React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';

import Map from '../../../src/Map';

const mapStories = storiesOf('Components/Map/Modes', module);

const modes = {
  normal: 'Normal',
  draw: 'Draw',
};

mapStories.add('Change Modes', () => <Map mode={select('Mode', modes, 'normal')} />);
mapStories.add('Draw Mode', () => <Map mode="draw" />);
