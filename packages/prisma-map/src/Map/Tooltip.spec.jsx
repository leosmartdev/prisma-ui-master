import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import mapboxgl from 'mapbox-gl';
import { setupMapboxGlMocks } from '../../test/mapboxMock';
import Tooltip, { MapTooltip } from './Tooltip';
import Map from './Map';
import { Provider as MapProvider } from './MapContext';

// mock the mapbox library
jest.mock('mapbox-gl');

describe('Tooltip default export', () => {
  beforeEach(() => {
    setupMapboxGlMocks(mapboxgl);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Renders', () => {
    const map = {
      project: jest.fn(),
    };

    mount(<MapProvider value={map}><Tooltip /></MapProvider>);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<Map mapId="tooltip"><Tooltip /></Map>);
    expect(tree).toMatchSnapshot();
  });
});

describe('Tooltip.MapTooltip', () => {
  const map = {
    project: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Renders', () => {
    shallow(<MapTooltip map={map} />);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<MapTooltip map={map} />);
    expect(tree).toMatchSnapshot();
  });

  it('map not passed in', () => {
    const wrapper = shallow(<MapTooltip map={null} />);

    wrapper.setProps({ feature: {} });
    // If map == null is not properly handled, the test will fail with an exception at this point.
  });

  describe('point', () => {
    it('just sets point on state when provided', () => {
      const point = { x: 100, y: 200 };
      const wrapper = shallow(<MapTooltip map={map} point={point} />).dive();

      expect(map.project).not.toHaveBeenCalled();
      expect(wrapper.state('point')).toEqual({ x: 100, y: 200 });
    });
  });

  describe('coordinates', () => {
    it('calls project to get x, y of coordinates', () => {
      map.project = jest.fn(() => ({ x: 100, y: 200 }));
      const wrapper = shallow(<MapTooltip map={map} coordinates={{ lat: -37, lng: 77 }} />).dive();

      expect(map.project).toHaveBeenCalledWith([77, -37]);
      expect(wrapper.state('point')).toEqual({ x: 100, y: 200 });
    });

    it('handles coordinates with long form', () => {
      map.project = jest.fn(() => ({ x: 100, y: 200 }));
      const coordinates = {
        longitude: 77,
        latitude: -37,
      };
      const wrapper = shallow(<MapTooltip map={map} coordinates={coordinates} />).dive();

      expect(map.project).toHaveBeenCalledWith([77, -37]);
      expect(wrapper.state('point')).toEqual({ x: 100, y: 200 });
    });

    xit('calls project to get x, y of coordinates when they change', () => {
      map.project = jest.fn(() => ({ x: 100, y: 200 }));
      const wrapper = shallow(<MapTooltip map={map} coordinates={{ lat: -37, lng: 77 }} />).dive();

      map.project.mockClear();
      wrapper.setProps({ coordinates: { lat: 0, lng: 0 } });
      expect(map.project).toHaveBeenCalledWith([0, 0]);
    });
  });

  describe('feature', () => {
    const PointFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-37, 77],
      },
      properties: {},
    };

    const PolygonFeature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 0],
        ]],
      },
      properties: {},
    };

    it('calls project when passed feature to get x,y coordinates', () => {
      map.project = jest.fn(() => ({ x: 100, y: 200 }));
      const wrapper = shallow(<MapTooltip map={map} feature={PointFeature} />).dive();

      expect(map.project).toHaveBeenCalledWith([-37, 77]);
      expect(wrapper.state('point')).toEqual({ x: 100, y: 200 });
    });

    it('can accept polygon features', () => {
      map.project = jest.fn(() => ({ x: 100, y: 200 }));
      const wrapper = shallow(<MapTooltip map={map} feature={PolygonFeature} />).dive();

      expect(map.project).toHaveBeenCalledWith([0.5, 0.5]);
      expect(wrapper.state('point')).toEqual({ x: 100, y: 200 });
    });
  });
});
