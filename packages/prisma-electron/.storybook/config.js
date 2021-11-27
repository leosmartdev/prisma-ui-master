import { configure, addDecorator, addParameters } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { create } from '@storybook/theming';
import { withKnobs } from '@storybook/addon-knobs';
import centered from '@storybook/addon-centered/react';
// import { themes } from '@storybook/components';

// https://material-ui.com/css-in-js/basics/#migration-for-material-ui-core-users
// Needed until v4 is released
import '../src/bootstrap';
import withThemeProvider from './themes';

// automatically import all files ending in *.stories.jsx
const req = require.context('../stories', true, /.stories.jsx$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addDecorator(withInfo);
addDecorator(withKnobs);
addDecorator(withThemeProvider);
addDecorator(centered);

addParameters({
  options: {
    theme: create({
      base: 'dark',
      /**
       * Value for name in top left corner
       * @type {String}
       */
      name: '@prisma/electron',
      /**
       * URL for name in top left corner to link to
       * @type {String}
       */
      brandUrl: 'https://github.com/orolia/prisma-ui',
    }),
  },
});

configure(loadStories, module);
