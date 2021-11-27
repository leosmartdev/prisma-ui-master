import React from 'react';
import { storiesOf } from '@storybook/react';
import { select, color, number, boolean } from '@storybook/addon-knobs';
import ShapeStylePreview from '../src/ShapeStylePreview';

const mapStories = storiesOf('ShapeStylePreview', module);

mapStories.add(
  'Basic Component',
  () => <ShapeStylePreview strokeColor="#FF0000" fillColor="#00FFFF" fillPattern="crosses" />,
  { info: { inline: true } },
);

const patterns = {
  solid: 'Solid',
  horizontalLines: 'Horizontal Lines',
  verticalLines: 'Vertical Lines',
  crosses: 'Crosses',
  diagonalCrosses: 'Diagonal Crosses',
  slashes: 'Slashes',
  backslashes: 'Backslashes',
};

const shape = {
  polygon: 'Polygon',
  circle: 'Circle',
};

mapStories.add(
  'Property Knobs',
  () => (
    <ShapeStylePreview
      strokeColor={color('strokeColor', '#00FF00')}
      fillColor={color('fillColor', '#0000FF')}
      fillPattern={select('fillPattern', patterns, 'solid')}
      width={number('width', 64)}
      height={number('height', 64)}
      hideOutline={boolean('hideOutline', false)}
      shape={select('shape', shape, 'polygon')}
    />
  ),
  { info: { inline: true } },
);
