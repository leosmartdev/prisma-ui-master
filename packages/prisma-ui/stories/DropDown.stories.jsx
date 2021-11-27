import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import DropDownButton from '../src/DropDownButton';

const stories = storiesOf('DropDownButton', module);

stories.add(
  'Basic Component',
  () => (
    <DropDownButton
      onChange={action('DropDownButton Changed')}
      options={[
        {
          id: 'foo',
          title: 'Foo',
        },
        {
          id: 'bar',
          title: 'Bar',
        },
      ]}
    />
  ),
  { info: { inline: true } },
);

stories.add(
  'Empty options',
  () => <DropDownButton onChange={action('DropDownButton Changed')} options={[]} label="Empty" />,
  { info: { inline: true } },
);

stories.add('With Label', () => (
  <DropDownButton
    onChange={action('DropDownButton Changed')}
    label="LABEL"
    variant="contained"
    options={[
      {
        id: 'foo',
        title: 'Foo',
      },
      {
        id: 'bar',
        title: 'Bar',
      },
    ]}
  />
));

stories.add('ID only', () => (
  <DropDownButton
    onChange={action('DropDownButton Changed')}
    variant="contained"
    options={[
      {
        id: 'foo',
      },
      {
        id: 'bar',
      },
    ]}
  />
));

stories.add('Name instead of title property', () => (
  <DropDownButton
    onChange={action('DropDownButton Changed')}
    variant="contained"
    options={[
      {
        id: 'foo',
        name: 'Foo',
      },
      {
        id: 'bar',
        name: 'Bar',
      },
    ]}
  />
));

stories.add('Setting selection', () => (
  <DropDownButton
    onChange={action('DropDownButton Changed')}
    variant="contained"
    selectedId="bar"
    options={[
      {
        id: 'foo',
        name: 'Foo',
      },
      {
        id: 'bar',
        name: 'Bar',
      },
    ]}
  />
));

function StatefulDropDown() {
  const [selection, changeSelection] = React.useState();

  return (
    <DropDownButton
      onChange={selected => changeSelection(selected.id)}
      variant="contained"
      selectedId={selection}
      options={[
        {
          id: 'foo',
          name: 'Foo',
        },
        {
          id: 'bar',
          name: 'Bar',
        },
      ]}
    />
  );
}

stories.add('With Controlled Selection', () => <StatefulDropDown />);
