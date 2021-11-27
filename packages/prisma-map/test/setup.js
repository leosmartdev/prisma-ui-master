/* setup.js */

global.window.resizeTo = (width, height) => {
  global.window.innerWidth = width || global.window.innerWidth;
  global.window.innerHeight = height || global.window.innerHeight;
  global.window.dispatchEvent(new global.Event('resize'));
};

// Must be present for mapbox-gl to load in the test environment.
global.window.URL.createObjectURL = () => {};
