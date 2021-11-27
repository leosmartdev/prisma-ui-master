import React from 'react';
import { storiesOf } from '@storybook/react';

import ErrorBanner from 'components/error/ErrorBanner';

const stories = storiesOf('Components/Error/ErrorBanner', module);

stories.add('Basic Banner', () => <ErrorBanner message="This is an error" />);
stories.add('Compact Banner', () => <ErrorBanner message="This is an error" compact />);
stories.add('No message', () => <ErrorBanner />);
stories.add('Content Group', () => (
  <ErrorBanner message="This is an error in a content group" contentGroup />
));
