import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import mapboxgl from 'mapbox-gl';
import { setupMapboxGlMocks } from '../../test/mapboxMock';
import Hover, { MapHover } from './Hover';
import Map from './Map';
import { Provider as MapProvider } from './MapContext';

// mock the mapbox library
jest.mock('mapbox-gl');

describe('Hover default export', () => {
  beforeEach(() => {
    setupMapboxGlMocks(mapboxgl);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Renders', () => {
    const map = {
      on: jest.fn(),
      off: jest.fn(),
    };

    mount(<MapProvider value={map}><Hover /></MapProvider>);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<Map mapId="hover"><Hover /></Map>);
    expect(tree).toMatchSnapshot();
  });
});

describe('Hover.MapHover', () => {
  const map = {
    on: jest.fn(),
    off: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Renders', () => {
    shallow(<MapHover map={map} />);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<MapHover map={map} />);
    expect(tree).toMatchSnapshot();
  });

  it('map not passed in', () => {
    const wrapper = shallow(<MapHover map={null} layers={['foo']} />);

    wrapper.setProps({ layers: ['bar'] });
    // If map == null is not properly handled, the test will fail with an exception at this point.
  });

  it('subscribes to events when map is no longer null', () => {
    const wrapper = shallow(<MapHover map={null} layers={['foo']} />);

    expect(map.on).not.toBeCalled();
    expect(map.off).not.toBeCalled();

    wrapper.setProps({ map });

    expect(map.on).toBeCalledWith('mouseover', 'foo', expect.any(Function));
    expect(map.on).toBeCalledWith('mouseleave', 'foo', expect.any(Function));
    expect(map.off).not.toBeCalled();
  });

  describe('layers property', () => {
    it('subscribes to events when layer property has a layer', () => {
      const layers = ['foo'];
      shallow(<MapHover map={map} layers={layers} />);

      expect(map.on).toBeCalledWith('mouseover', 'foo', expect.any(Function));
      expect(map.on).toBeCalledWith('mouseleave', 'foo', expect.any(Function));
      expect(map.off).not.toBeCalled();
    });

    it('subscribes to layers events when a new layer is added', () => {
      const layers = ['foo'];
      const wrapper = shallow(<MapHover map={map} layers={layers} />);

      wrapper.setProps({ layers: [...layers, 'bar'] });

      expect(map.on).toBeCalledWith('mouseover', 'bar', expect.any(Function));
      expect(map.on).toBeCalledWith('mouseleave', 'bar', expect.any(Function));
    });

    it('unsubscribes to layers events when a layer is removed', () => {
      const layers = ['foo'];
      const wrapper = shallow(<MapHover map={map} layers={layers} />);

      jest.resetAllMocks();

      wrapper.setProps({ layers: [] });

      expect(map.off).toBeCalledWith('mouseover', 'foo', expect.any(Function));
      expect(map.off).toBeCalledWith('mouseleave', 'foo', expect.any(Function));
      expect(map.off).toBeCalledWith('move', expect.any(Function));
      expect(map.on).not.toBeCalledWith('mouseover', 'foo', expect.any(Function));
      expect(map.on).not.toBeCalledWith('mouseleave', 'foo', expect.any(Function));
    });

    it('only unsubscribes to layers that were removed', () => {
      const layers = ['foo', 'bar'];
      const wrapper = shallow(<MapHover map={map} layers={layers} />);

      jest.resetAllMocks();

      wrapper.setProps({ layers: ['bar'] });

      expect(map.off).toBeCalledWith('mouseover', 'foo', expect.any(Function));
      expect(map.off).toBeCalledWith('mouseleave', 'foo', expect.any(Function));
      expect(map.off).not.toBeCalledWith('mouseover', 'bar', expect.any(Function));
      expect(map.off).not.toBeCalledWith('mouseleave', 'bar', expect.any(Function));
    });

    it('only subscribes to layers that were added', () => {
      const layers = ['foo'];
      const wrapper = shallow(<MapHover map={map} layers={layers} />);

      expect(map.on).toBeCalledWith('mouseover', 'foo', expect.any(Function));
      expect(map.on).toBeCalledWith('mouseleave', 'foo', expect.any(Function));

      jest.resetAllMocks();

      wrapper.setProps({ layers: ['foo', 'bar'] });

      expect(map.on).not.toBeCalledWith('mouseover', 'foo', expect.any(Function));
      expect(map.on).not.toBeCalledWith('mouseleave', 'foo', expect.any(Function));
      expect(map.on).toBeCalledWith('mouseover', 'bar', expect.any(Function));
      expect(map.on).toBeCalledWith('mouseleave', 'bar', expect.any(Function));
    });

    it('doesnt change listeners if the same layers are passed in', () => {
      const layers = ['foo', 'bar'];
      const wrapper = shallow(<MapHover map={map} layers={layers} />);

      expect(map.off).not.toBeCalled();
      expect(map.on).toBeCalledWith('mouseover', 'foo', expect.any(Function));
      expect(map.on).toBeCalledWith('mouseleave', 'foo', expect.any(Function));
      expect(map.on).toBeCalledWith('mouseover', 'bar', expect.any(Function));
      expect(map.on).toBeCalledWith('mouseleave', 'bar', expect.any(Function));

      jest.resetAllMocks();

      wrapper.setProps({ layers: ['foo', 'bar'] });

      expect(map.off).not.toBeCalledWith('mouseover', 'foo', expect.any(Function));
      expect(map.off).not.toBeCalledWith('mouseleave', 'foo', expect.any(Function));
      expect(map.off).not.toBeCalledWith('mouseover', 'bar', expect.any(Function));
      expect(map.off).not.toBeCalledWith('mouseleave', 'bar', expect.any(Function));
      expect(map.on).not.toBeCalledWith('mouseover', 'foo', expect.any(Function));
      expect(map.on).not.toBeCalledWith('mouseleave', 'foo', expect.any(Function));
      expect(map.on).not.toBeCalledWith('mouseover', 'bar', expect.any(Function));
      expect(map.on).not.toBeCalledWith('mouseleave', 'bar', expect.any(Function));
    });
  });

  describe('onMouseOver', () => {
    it('subscribes to move to track new changes', () => {
      const event = {
        features: [],
      };
      const wrapper = shallow(<MapHover map={map} layers={['foo']} />);

      wrapper.instance().onMouseOver(event);

      expect(map.on).toHaveBeenCalledWith('move', expect.any(Function));
    });

    it('saves features and event to the state', () => {
      const event = {
        features: [{ id: 'foo' }, { id: 'bar' }],
      };
      const wrapper = shallow(<MapHover map={map} layers={['foo']} />);

      wrapper.instance().onMouseOver(event);

      expect(wrapper.state('features')).toEqual([{ id: 'foo' }, { id: 'bar' }]);
      expect(wrapper.state('lastMouseEvent')).toEqual(event);
    });

    it('sets is hovering to true', () => {
      const event = { features: [] };
      const wrapper = shallow(<MapHover map={map} layers={['foo']} />);

      expect(wrapper.state('isHovering')).toBe(false);

      wrapper.instance().onMouseOver(event);

      expect(wrapper.state('isHovering')).toBe(true);
    });
  });

  describe('onMouseLeave', () => {
    it('unsubscribes to move event', () => {
      const wrapper = shallow(<MapHover map={map} layers={['foo']} />);

      wrapper.instance().onMouseLeave();

      expect(map.off).toHaveBeenCalledWith('move', expect.any(Function));
    });

    it('clears features and event on state', () => {
      const event = { features: [] };
      const wrapper = shallow(<MapHover map={map} layers={['foo']} />);

      wrapper.instance().onMouseOver(event);
      expect(wrapper.state('features')).toEqual(event.features);
      expect(wrapper.state('lastMouseEvent')).toEqual(event);

      wrapper.instance().onMouseLeave();

      expect(wrapper.state('features')).toEqual(null);
      expect(wrapper.state('lastMouseEvent')).toEqual(null);
    });

    it('sets is hovering to false', () => {
      const event = { features: [] };
      const wrapper = shallow(<MapHover map={map} layers={['foo']} />);

      wrapper.instance().onMouseOver(event);

      expect(wrapper.state('isHovering')).toBe(true);

      wrapper.instance().onMouseLeave();

      expect(wrapper.state('isHovering')).toBe(false);
    });
  });

  describe('onMove', () => {
    it('updates lastMouseEvent', () => {
      const event = {
        features: [],
      };
      const wrapper = shallow(<MapHover map={map} layers={['foo']} />);

      wrapper.setState({ features: [{ id: 'foo' }] });
      expect(wrapper.state('lastMouseEvent')).toEqual(null);
      expect(wrapper.state('features')).toEqual([{ id: 'foo' }]);
      wrapper.instance().onMove(event);
      expect(wrapper.state('lastMouseEvent')).toEqual(event);
      expect(wrapper.state('features')).toEqual([{ id: 'foo' }]);
    });
  });

  describe('children', () => {
    it('doesnt render child when mouse is not hovering', () => {
      const child = jest.fn();
      shallow((
        <MapHover map={map} layers={['foo']}>
          {child}
        </MapHover>
      ));

      expect(child).not.toHaveBeenCalled();
    });

    it('renders child when mouse is hovering', () => {
      const event = {
        features: [{ id: 'foo' }, { id: 'bar' }],
      };
      const child = jest.fn();
      const wrapper = shallow((
        <MapHover map={map} layers={['foo']}>
          {child}
        </MapHover>
      ));

      wrapper.setState({
        isHovering: true,
        features: event.features,
        lastMouseEvent: event,
      });

      expect(child).toHaveBeenCalledWith(event.features, event);
    });
  });
});
