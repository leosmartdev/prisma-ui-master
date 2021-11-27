import { configure, addDecorator, addParameters } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { create } from '@storybook/theming';
import { withKnobs } from '@storybook/addon-knobs';
import centered from '@storybook/addon-centered/react';

// Add info decorators (react-docgen pulled information and knobs)
addDecorator(withInfo);
addDecorator(withKnobs);
addDecorator(centered);

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.jsx?$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addParameters({
  options: {
    theme: create({
      base: 'dark',
      /**
       * Value for name in top left corner
       * @type {String}
       */
      name: '@prisma/map',
      /**
       * URL for name in top left corner to link to
       * @type {String}
       */
      brandUrl: 'https://github.com/orolia/prisma-ui',
    }),
  },
});

configure(loadStories, module);
