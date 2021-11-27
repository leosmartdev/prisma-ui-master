import React from 'react';
import { storiesOf } from '@storybook/react';

// Components
import AboutApplication from 'components/AboutApplication';

import {
  Paper,
} from '@material-ui/core';

storiesOf('Components/AboutApplication', module)
  .add('Basic', () => (
    <Paper elevation={2} style={{ width: '300px', height: '300px' }}>
      <AboutApplication
        brand={{
          name: 'PRISMA RCC',
          clientVersion: '1.1',
          version: '1.8.1',
          releaseDate: 'August 16, 2021',
          copyright: '© 2021 TSi',
        }}
      />
    </Paper>
  ))
  .add('Empty data', () => (
    <Paper elevation={2} style={{ width: '300px', height: '300px' }}>
      <AboutApplication
        brand={{
          name: 'PRISMA RCC',
          version: '1.8.1',
          copyright: '© 2021 TSi',
        }}
      />
    </Paper>
  ));
