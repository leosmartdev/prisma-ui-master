import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import mapboxgl from 'mapbox-gl';
import configureMockStore from 'redux-mock-store';
import { setupMapboxGlMocks } from '../../../test/mapboxMock';
import ConnectedMap from './ConnectedMap';

jest.mock('mapbox-gl');

const mockStore = configureMockStore([]);

describe('redux.ConnectedMap', () => {
  let store = null;
  beforeEach(() => {
    setupMapboxGlMocks(mapboxgl);
    store = mockStore({
      '@prisma/map': {
        map: { mapIds: [] },
        features: {},
        layers: {},
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Renders', () => {
    shallow(<ConnectedMap store={store} />);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<ConnectedMap store={store} mapId="map" />);
    expect(tree).toMatchSnapshot();
  });

  describe('onLoad', () => {
    it('doesnt error without onLoad callback', () => {
      const wrapper = shallow(<ConnectedMap store={store} />);

      const mapComponent = wrapper.dive().dive();
      const inst = mapComponent.instance();
      inst.onLoad({}, {});
    });

    it('calls onLoad with style and map.', () => {
      const style = { name: 'foo' };
      const map = { id: 'map' };
      const onLoad = jest.fn();

      const wrapper = shallow(<ConnectedMap store={store} onLoad={onLoad} />);

      wrapper
        .dive()
        .dive()
        .instance()
        .onLoad(style, map);

      expect(onLoad).toHaveBeenCalledWith(style, map);
    });
  });

  describe('mapId', () => {
    // TODO: handle all the types of map ids
  });
});
