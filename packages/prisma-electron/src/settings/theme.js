import { createAction } from 'redux-actions';

import { createMuiTheme } from '@material-ui/core/styles';

import { CONFIGURATION_UPDATED } from 'configuration';
import { primary, secondary, error, success, grey } from './colors';

// Action Types
const TOGGLE_THEME = 'settings/theme/TOGGLE';

/** *************************************
 * Action Creators
 ************************************* */
export const toggleTheme = createAction(TOGGLE_THEME);

/** *************************************
 * Reducers
 ************************************* */
export function reducer(state = {}, action = {}) {
  let theme = state.config ? state.config.theme : 'dark';
  if (action.type === CONFIGURATION_UPDATED) {
    theme = action.payload.theme || 'dark';
  }

  let newState = state;
  if (typeof state.palette === 'undefined' || action.type === CONFIGURATION_UPDATED) {
    const navBarWidth = '50px';
    newState = createMuiTheme({
      // Until material-ui 4.0 when old typography variants are removed.
      // This removes the warnings in the console
      typography: {
      },
      palette: {
        type: theme,
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
      c2: {
        navBar: {
          width: navBarWidth, // Width of the nav bar in px.
          expandedWidth: '150px', // Width of the nav bar in px.
          offsetX: '0px', // Number of pixels/percent to the left of the nav bar.
          offsetY: '0px', // Number of pixels/percent to the top of the nav bar.
        },
        mainContent: {
          // Number of pixels/percent to leave to the left for nav bar and drawers
          offsetX: navBarWidth,
          offsetY: '0px', // Number of pixels/percent to leave to the top for drawers
        },
        drawers: {
          top: {
            width: '500px',
            height: '0px',
            rowHeight: 50,
            rows: 2,
            left: navBarWidth,
          },
          profile: {
            width: '300px',
          },
          left: {
            width: '350px',
          },
          right: {
            width: '400px',
          },
          rightDetails: {
            width: '300px',
          },
        },
        map: {
          backgroundColor: '#3a3a3a',
        },
      },
    });
  }

  switch (action.type) {
    case TOGGLE_THEME: {
      const type = newState.palette.type === 'light' ? 'dark' : 'light';
      return {
        ...newState,
        palette: {
          ...newState.palette,
          type,
        },
      };
    }
    default: {
      return newState;
    }
  }
}

export const init = store => {
  store.addReducer('theme', reducer);
};
