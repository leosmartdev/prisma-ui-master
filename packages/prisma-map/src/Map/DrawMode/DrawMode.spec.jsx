import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import mapboxgl from 'mapbox-gl';
import { setupMapboxGlMocks } from '../../../test/mapboxMock';
import DrawMode, { MapDrawMode } from './DrawMode';
import Map from '../Map';
import { Provider as MapProvider } from '../MapContext';

// mock the mapbox library
jest.mock('mapbox-gl');

describe('DrawMode default export', () => {
  beforeEach(() => {
    setupMapboxGlMocks(mapboxgl);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Renders', () => {
    const map = {
      getMapMode: jest.fn(),
    };

    mount(<MapProvider value={map}><DrawMode /></MapProvider>);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<Map mapId="draw"><DrawMode /></Map>);
    expect(tree).toMatchSnapshot();
  });
});

describe('DrawMode.MapDrawMode', () => {
  const map = {
    getMapMode: jest.fn(),
    draw: { name: 'foo' },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Renders', () => {
    shallow(<MapDrawMode map={map} />);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<MapDrawMode map={map} />);
    expect(tree).toMatchSnapshot();
  });

  it('map not passed in', () => {
    shallow(<MapDrawMode map={null} />);

    // If map == null is not properly handled, the test will fail with an exception at this point.
  });

  describe('child render props', () => {
    it('only renders child when in draw mode', () => {
      map.getMapMode = jest.fn(() => 'draw');
      const child = jest.fn();
      shallow(<MapDrawMode map={map}>{child}</MapDrawMode>);

      expect(child).toBeCalledWith(map, map.draw);
    });
  });
});
