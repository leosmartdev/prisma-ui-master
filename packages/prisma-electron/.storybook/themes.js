import React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

/**
 * Holds references to the two themes. Currently, we are
 * re-creating the themes that are in `src/settings/themes.js` but in the future
 * we should import the themes directly. TODO:
 */
import { primary, secondary, error, success, grey } from '../src/settings/colors';

const c2Theme = {
  navBar: {
    width: '50px', // Width of the nav bar in px.
    expandedWidth: '150px', // Width of the nav bar in px.
    offsetX: '0px', // Number of pixels/percent to the left of the nav bar.
    offsetY: '0px', // Number of pixels/percent to the top of the nav bar.
  },
  mainContent: {
    // Number of pixels/percent to leave to the left for nav bar and drawers
    offsetX: '50px',
    offsetY: '0px', // Number of pixels/percent to leave to the top for drawers
  },
  drawers: {
    top: {
      width: '500px',
      height: '0px',
      rowHeight: 50,
      rows: 2,
      left: '50px',
    },
    profile: {
      width: '300px',
    },
    left: {
      width: '350px',
    },
    right: {
      width: '300px',
    },
    rightDetails: {
      width: '300px',
    },
  },
  map: {
    backgroundColor: '#b5d0d0',
  },
};

export const lightTheme = createMuiTheme({
  themeName: 'PRISMA Light',
  typography: {
  },
  palette: {
    type: 'light',
    primary: {
      light: primary[300],
      main: primary[500],
      dark: primary[700],
    },
    secondary: {
      light: secondary[300],
      main: secondary[500],
      dark: secondary[700],
    },
    error: {
      light: error[300],
      main: error[500],
      dark: error[700],
    },
    grey,
    success: {
      light: success[500],
      dark: success[500],
      main: success[500],
    },
  },
  c2: c2Theme,
});

export const darkTheme = createMuiTheme({
  themeName: 'PRISMA Dark',
  typography: {
  },
  palette: {
    type: 'dark',
    primary: {
      light: primary[300],
      main: primary[500],
      dark: primary[700],
    },
    secondary: {
      light: secondary[300],
      main: secondary[500],
      dark: secondary[700],
    },
    error: {
      light: error[300],
      main: error[500],
      dark: error[700],
    },
    grey,
    success: {
      light: success[500],
      dark: success[500],
      main: success[500],
    },
  },
  c2: c2Theme,
});

export default storyFn => (
  <div>
    <CssBaseline />
    <ThemeProvider theme={darkTheme}>{storyFn()}</ThemeProvider>
  </div>
);
