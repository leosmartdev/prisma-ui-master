import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import { setupMapboxGlMocks, setupMapboxGlDrawMocks } from '../../test/mapboxMock';
import Map from './Map';

jest.mock('mapbox-gl');
jest.mock('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw');

describe('Map', () => {
  beforeEach(() => {
    setupMapboxGlMocks(mapboxgl);
    setupMapboxGlDrawMocks(MapboxDraw);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Renders', () => {
    shallow(<Map />);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<Map mapId="map" />);
    expect(tree).toMatchSnapshot();
  });

  describe('style prop', () => {
    it('handles string versions of map style on mount', () => {
      // eslint-disable-next-line
      const wrapper = shallow(<Map style="mapbox://styles/foo" />);

      // expect(mapboxgl.Map.prototype.setStyle).toHaveBeenCalledWith('mapbox://foo.style.com');
    });

    it('handles string versions of map style when changing props', () => {
      const wrapper = shallow(<Map />);
      wrapper.instance().onLoad({});
      wrapper.setProps({ style: 'mapbox://styles/foo' });

      expect(mapboxgl.Map.prototype.setStyle).toHaveBeenCalledWith('mapbox://styles/foo');
    });
  });

  describe('dimension props', () => {
    it('matches snapshot', () => {
      const tree = renderer.create(
        <Map
          mapId="map"
          latitude={37}
          longitude={-77}
          pitch={34}
          bearing={45}
          zoom={8}
          onViewportChange={jest.fn()}
          width={1000}
          height={600}
        />,
      );
      expect(tree).toMatchSnapshot();
    });

    it('renders with correct dimensions when passed as props', () => {
      const defaultMap = shallow(<Map />);
      expect(defaultMap.find('div.prisma-map-div').prop('style')).toEqual({
        width: 800,
        height: 500,
      });
      expect(defaultMap.instance().props.width).toEqual(800);
      expect(defaultMap.instance().props.height).toEqual(500);

      const mapWithDimensions = shallow(<Map width={900} height={900} />);
      expect(mapWithDimensions.find('div.prisma-map-div').prop('style')).toEqual({
        width: 900,
        height: 900,
      });
      expect(mapWithDimensions.instance().props.width).toEqual(900);
      expect(mapWithDimensions.instance().props.height).toEqual(900);
    });

    it('renders with new dimensions when props are changed', () => {
      const defaultMap = shallow(<Map />);
      expect(defaultMap.find('div.prisma-map-div').prop('style')).toEqual({
        width: 800,
        height: 500,
      });

      defaultMap.setProps({ width: 432, height: 123 });

      // Changing dimensions is a two part operation. We must change the div, then tell mapbox to
      // resize
      expect(defaultMap.find('div.prisma-map-div').prop('style')).toEqual({
        width: 432,
        height: 123,
      });
      // TODO figure out why this wasn't called. Seems componentDidUpdate isn't being called
      // expect(mapboxgl.Map.prototype.resize).toBeCalled();
    });

    describe('viewport props', () => {
      it('updates viewport from prop after load', () => {
        mapboxgl.Map.prototype.getCenter = jest.fn(() => ({
          lat: 39,
          lng: -79,
        }));
        mapboxgl.Map.prototype.getBearing = jest.fn(() => 45);
        mapboxgl.Map.prototype.getPitch = jest.fn(() => 45);
        mapboxgl.Map.prototype.getZoom = jest.fn(() => 3);

        const map = shallow(<Map />);

        map.setProps({
          latitude: 39,
          longitude: -79,
          bearing: 45,
          pitch: 45,
          zoom: 3,
        });

        expect(mapboxgl.Map.prototype.setCenter).toBeCalledWith([-79, 39]);
        expect(mapboxgl.Map.prototype.setBearing).toBeCalledWith(45);
        expect(mapboxgl.Map.prototype.setPitch).toBeCalledWith(45);
        expect(mapboxgl.Map.prototype.setZoom).toBeCalledWith(3);
      });

      it('calls onViewportChange on initial load', () => {
        const onViewportChange = jest.fn();
        shallow(<Map onViewportChange={onViewportChange} />);

        expect(onViewportChange).toBeCalledWith({
          latitude: 0,
          longitude: 0,
          zoom: 4,
          bearing: 0,
          pitch: 0,
          bounds: {
            north: 45,
            south: -45,
            east: 100,
            west: -100,
          },
        });
      });

      it('onViewportChange sends view bounds', () => {
        const onViewportChange = jest.fn();
        shallow(<Map onViewportChange={onViewportChange} />);

        expect(onViewportChange).toBeCalledWith({
          latitude: 0,
          longitude: 0,
          zoom: 4,
          bearing: 0,
          pitch: 0,
          bounds: {
            north: 45,
            south: -45,
            east: 100,
            west: -100,
          },
        });
      });

      it('only updates zoom when only zoom prop changes', () => {
        mapboxgl.Map.prototype.getZoom = jest.fn(() => 3);
        const onViewportChange = jest.fn();
        const map = shallow(<Map onViewportChange={onViewportChange} />);

        map.setProps({
          zoom: 3,
        });

        expect(mapboxgl.Map.prototype.setCenter).not.toBeCalled();
        expect(mapboxgl.Map.prototype.setBearing).not.toBeCalled();
        expect(mapboxgl.Map.prototype.setPitch).not.toBeCalled();
        expect(mapboxgl.Map.prototype.setZoom).toBeCalledWith(3);
        expect(onViewportChange).toBeCalledWith(
          expect.objectContaining({
            latitude: 0,
            longitude: 0,
            zoom: 3,
            bearing: 0,
            pitch: 0,
          }),
        );
      });

      it('only updates pitch when only pitch prop changes', () => {
        mapboxgl.Map.prototype.getPitch = jest.fn(() => 34);
        const onViewportChange = jest.fn();
        const map = shallow(<Map onViewportChange={onViewportChange} />);

        map.setProps({
          pitch: 34,
        });

        expect(mapboxgl.Map.prototype.setCenter).not.toBeCalled();
        expect(mapboxgl.Map.prototype.setBearing).not.toBeCalled();
        expect(mapboxgl.Map.prototype.setPitch).toBeCalledWith(34);
        expect(mapboxgl.Map.prototype.setZoom).not.toBeCalled();
        expect(onViewportChange).toBeCalledWith(
          expect.objectContaining({
            latitude: 0,
            longitude: 0,
            zoom: 4,
            bearing: 0,
            pitch: 34,
          }),
        );
      });

      it('only updates bearing when only bearing prop changes', () => {
        mapboxgl.Map.prototype.getBearing = jest.fn(() => 90);
        const onViewportChange = jest.fn();
        const map = shallow(<Map onViewportChange={onViewportChange} />);

        map.setProps({
          bearing: 90,
        });

        expect(mapboxgl.Map.prototype.setCenter).not.toBeCalled();
        expect(mapboxgl.Map.prototype.setBearing).toBeCalledWith(90);
        expect(mapboxgl.Map.prototype.setPitch).not.toBeCalled();
        expect(mapboxgl.Map.prototype.setZoom).not.toBeCalled();
        expect(onViewportChange).toBeCalledWith(
          expect.objectContaining({
            latitude: 0,
            longitude: 0,
            zoom: 4,
            bearing: 90,
            pitch: 0,
          }),
        );
      });

      it('only updates center when only lat/lng props changes', () => {
        mapboxgl.Map.prototype.getCenter = jest.fn(() => ({ lng: -79, lat: 39 }));
        const onViewportChange = jest.fn();
        const map = shallow(<Map onViewportChange={onViewportChange} />);

        map.setProps({
          latitude: 39,
          longitude: -79,
        });

        expect(mapboxgl.Map.prototype.setCenter).toBeCalledWith([-79, 39]);
        expect(mapboxgl.Map.prototype.setBearing).not.toBeCalled();
        expect(mapboxgl.Map.prototype.setPitch).not.toBeCalled();
        expect(mapboxgl.Map.prototype.setZoom).not.toBeCalled();
        expect(onViewportChange).toBeCalledWith(
          expect.objectContaining({
            latitude: 39,
            longitude: -79,
            zoom: 4,
            bearing: 0,
            pitch: 0,
          }),
        );
      });

      it('emits viewport change when mapbox has mouse interaction', () => {
        const onViewportChange = jest.fn();
        const map = shallow(<Map onViewportChange={onViewportChange} />);

        map.find('div.prisma-map-div').simulate('moveend');

        expect(onViewportChange).toBeCalledWith(
          expect.objectContaining({
            latitude: 0,
            longitude: 0,
            zoom: 4,
            bearing: 0,
            pitch: 0,
          }),
        );
      });
    });

    describe('fullScreen', () => {
      global.window.innerWidth = 1024;
      global.window.innerHeight = 768;

      it('uses window dimensions', () => {
        const wrapper = shallow(<Map fullScreen />);

        expect(wrapper.find('div.prisma-map-div').prop('style')).toEqual({
          width: 1024,
          height: 768,
        });
      });

      it('goes back to prop dimensions when fullScreen is turned off', () => {
        const wrapper = shallow(<Map fullScreen width={323} height={587} />);

        expect(wrapper.find('div.prisma-map-div').prop('style')).toEqual({
          width: 1024,
          height: 768,
        });

        wrapper.setProps({ fullScreen: false });

        expect(wrapper.find('div.prisma-map-div').prop('style')).toEqual({
          width: 323,
          height: 587,
        });
        expect(mapboxgl.Map.prototype.resize).toBeCalled();
      });

      it('goes fullscreen when passed after initial mount', () => {
        const wrapper = shallow(<Map />);

        expect(wrapper.find('div.prisma-map-div').prop('style')).toEqual({
          width: 800,
          height: 500,
        });
        expect(wrapper.instance().props.fullScreen).toEqual(false);

        wrapper.setProps({ fullScreen: true });

        // TODO figure out why these aren't changing. Probably lifecycle functions not being called
        // expect(wrapper.find('div.prisma-map-div').prop('style')).toEqual({
        //   width: 1024,
        //   height: 768,
        // });
        expect(wrapper.instance().props.fullScreen).toEqual(true);
      });

      it('allows for width to be offset by integer prop', () => {
        const wrapper = shallow(<Map fullScreen widthOffset={50} />);

        expect(wrapper.find('div.prisma-map-div').prop('style')).toEqual({
          width: 974,
          height: 768,
        });
      });

      it('allows for height to be offset by prop', () => {
        const wrapper = shallow(<Map fullScreen heightOffset={50} />);

        expect(wrapper.find('div.prisma-map-div').prop('style')).toEqual({
          width: 1024,
          height: 718,
        });
      });

      it('widthOffset with string', () => {
        const wrapper = shallow(<Map fullScreen widthOffset="50px" />);

        expect(wrapper.find('div.prisma-map-div').prop('style')).toEqual({
          width: 974,
          height: 768,
        });
      });

      it('heightOffset with string', () => {
        const wrapper = shallow(<Map fullScreen heightOffset="50px" />);

        expect(wrapper.find('div.prisma-map-div').prop('style')).toEqual({
          width: 1024,
          height: 718,
        });
      });

      it('calls window addEventLister to listen to window events', () => {
        const spy = jest.spyOn(global.window, 'addEventListener');
        const wrapper = shallow(<Map />);

        expect(spy).toHaveBeenCalledWith('resize', wrapper.instance().updateWindowDimensions);
      });
    });
  });

  describe('draw mode', () => {
    describe('startDrawMode()', () => {
      it('when changed from normal tells mapbox to add draw tools', () => {
        const wrapper = shallow(<Map mode="normal" />);
        const spy = jest.spyOn(wrapper.instance(), 'startDrawMode');

        wrapper.setProps({ mode: 'draw' });

        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls.length).toBe(1);
        expect(mapboxgl.Map.prototype.addControl).toHaveBeenCalled();
      });

      it('when created with draw mode calls startDrawMode', () => {
        const spy = jest.spyOn(Map.prototype, 'startDrawMode');
        shallow(<Map mode="draw" />);

        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls.length).toBe(1);
      });

      it('creates draw tool when its not already on the class', () => {
        const wrapper = shallow(<Map mode="normal" />);

        expect(wrapper.instance().draw).not.toBeDefined();

        wrapper.setProps({ mode: 'draw' });

        expect(wrapper.instance().draw).toBeDefined();
      });

      it('uses default empty options block if modeOptions.draw is undefined', () => {
        const wrapper = shallow(<Map mode="normal" />);
        expect(wrapper.instance().draw).not.toBeDefined();

        wrapper.setProps({ mode: 'draw', modeOptions: {} });

        expect(wrapper.instance().draw).toBeDefined();
      });

      it('uses existing draw controls when re-adding draw mode', () => {
        const wrapper = shallow(<Map mode="draw" />);

        const { draw } = wrapper.instance();
        expect(draw).toBeDefined();

        wrapper.setProps({ mode: 'normal' });
        expect(wrapper.instance().draw).toEqual(draw);

        wrapper.setProps({ mode: 'draw' });
        expect(wrapper.instance().draw).toEqual(draw);
      });

      it('does nothing when map is undefined', () => {
        const map = shallow(<Map mode="normal" />);
        const spy = jest.spyOn(map.instance(), 'startDrawMode');
        map.instance().map = undefined;

        map.setProps({ mode: 'draw' });

        expect(spy).toHaveBeenCalled();
        expect(mapboxgl.Map.prototype.addControl).not.toHaveBeenCalled();
      });
    });

    describe('stopDrawMode()', () => {
      it('when changed from draw tells mapbox to remove draw tools', () => {
        const map = shallow(<Map mode="draw" />);
        map.instance().startDrawMode = jest.fn();
        map.instance().stopDrawMode = jest.fn();

        map.setProps({ mode: 'normal' });

        expect(map.instance().stopDrawMode).toHaveBeenCalled();
        expect(map.instance().stopDrawMode.mock.calls.length).toBe(1);
      });

      it('removes controls when stopping draw mode', () => {
        const map = shallow(<Map mode="draw" />);
        const spy = jest.spyOn(map.instance(), 'stopDrawMode');
        const { draw } = map.instance();

        map.setProps({ mode: 'normal' });

        expect(spy).toHaveBeenCalled();
        expect(mapboxgl.Map.prototype.removeControl).toHaveBeenCalledWith(draw);
      });

      it('doesnt remove control when draw is undefined', () => {
        const wrapper = shallow(<Map mode="draw" />);
        wrapper.instance().draw = undefined;

        wrapper.setProps({ mode: 'normal' });

        expect(mapboxgl.Map.prototype.removeControl).not.toHaveBeenCalled();
      });

      it('doesnt remove control when map is undefined', () => {
        const map = shallow(<Map mode="draw" />);
        map.instance().map = undefined;

        map.setProps({ mode: 'normal' });

        expect(mapboxgl.Map.prototype.removeControl).not.toHaveBeenCalled();
      });
    });
  });

  describe('clickLayers property', () => {
    it('subscribes to events when layer property has a layer', () => {
      const layers = ['foo'];
      shallow(<Map clickLayers={layers} />);

      expect(mapboxgl.Map.prototype.on).toBeCalledWith('click', 'foo', expect.any(Function));
      expect(mapboxgl.Map.prototype.off).not.toHaveBeenCalled();
    });

    it('subscribes to events when layer property has multiple layers', () => {
      const layers = ['foo', 'bar'];
      shallow(<Map clickLayers={layers} />);

      expect(mapboxgl.Map.prototype.on).toBeCalledWith('click', 'foo', expect.any(Function));
      expect(mapboxgl.Map.prototype.on).toBeCalledWith('click', 'bar', expect.any(Function));
      expect(mapboxgl.Map.prototype.off).not.toHaveBeenCalled();
    });

    it('doesnt subscribe to events when layer property is empty', () => {
      const layers = [];
      shallow(<Map clickLayers={layers} />);

      expect(mapboxgl.Map.prototype.on).not.toBeCalledWith(
        'click',
        expect.any(String),
        expect.any(Function),
      );
      expect(mapboxgl.Map.prototype.off).not.toHaveBeenCalled();
    });

    it('subscribes to layers events when a new layer is added', () => {
      const layers = ['foo'];
      const wrapper = shallow(<Map clickLayers={layers} />);

      wrapper.setProps({ clickLayers: [...layers, 'bar'] });

      expect(mapboxgl.Map.prototype.on).toBeCalledWith('click', 'bar', expect.any(Function));
    });

    it('unsubscribes to layers events when a layer is removed', () => {
      const layers = ['foo'];
      const wrapper = shallow(<Map clickLayers={layers} />);

      wrapper.setProps({ clickLayers: [] });

      mapboxgl.Map.prototype.on.mockClear();

      expect(mapboxgl.Map.prototype.off).toBeCalledWith('click', 'foo', expect.any(Function));
      expect(mapboxgl.Map.prototype.on).not.toBeCalledWith('click', 'foo', expect.any(Function));
    });

    it('only unsubscribes to layers that were removed', () => {
      const layers = ['foo', 'bar'];
      const wrapper = shallow(<Map clickLayers={layers} />);

      wrapper.setProps({ clickLayers: ['bar'] });

      expect(mapboxgl.Map.prototype.off).toBeCalledWith('click', 'foo', expect.any(Function));
      expect(mapboxgl.Map.prototype.off).not.toBeCalledWith('click', 'bar', expect.any(Function));
    });

    it('only subscribes to layers that were added', () => {
      const layers = ['foo'];
      const wrapper = shallow(<Map clickLayers={layers} />);

      expect(mapboxgl.Map.prototype.on).toBeCalledWith('click', 'foo', expect.any(Function));

      mapboxgl.Map.prototype.on.mockClear();

      wrapper.setProps({ clickLayers: ['foo', 'bar'] });

      expect(mapboxgl.Map.prototype.on).not.toBeCalledWith('click', 'foo', expect.any(Function));
      expect(mapboxgl.Map.prototype.on).toBeCalledWith('click', 'bar', expect.any(Function));
    });

    it('doesnt change listeners if the same layers are passed in', () => {
      const layers = ['foo', 'bar'];
      const wrapper = shallow(<Map clickLayers={layers} />);

      expect(mapboxgl.Map.prototype.off).not.toBeCalled();
      expect(mapboxgl.Map.prototype.on).toBeCalledWith('click', 'foo', expect.any(Function));
      expect(mapboxgl.Map.prototype.on).toBeCalledWith('click', 'bar', expect.any(Function));

      mapboxgl.Map.prototype.on.mockClear();
      mapboxgl.Map.prototype.off.mockClear();

      wrapper.setProps({ clickLayers: ['foo', 'bar'] });

      expect(mapboxgl.Map.prototype.off).not.toBeCalledWith('click', 'foo', expect.any(Function));
      expect(mapboxgl.Map.prototype.off).not.toBeCalledWith('click', 'bar', expect.any(Function));
      expect(mapboxgl.Map.prototype.on).not.toBeCalledWith('click', 'foo', expect.any(Function));
      expect(mapboxgl.Map.prototype.on).not.toBeCalledWith('click', 'bar', expect.any(Function));
    });
  });

  describe('flyTo()', () => {
    it('calls fly to when flyTo prop changes', () => {
      const startLatitude = 37;
      const startLongitude = -77;
      const newLatitude = 39;
      const newLongitude = -101;

      const wrapper = shallow(<Map latitude={startLatitude} longitude={startLongitude} />);

      wrapper.setProps({ flyTo: { longitude: newLongitude, latitude: newLatitude } });

      expect(mapboxgl.Map.prototype.flyTo).toBeCalledWith({
        center: [newLongitude, newLatitude],
      });
    });

    it('call to Map.flyTo() calls mapbox flyTo()', () => {
      const startLatitude = 37;
      const startLongitude = -77;
      const newLatitude = 39;
      const newLongitude = -101;

      const wrapper = shallow(<Map latitude={startLatitude} longitude={startLongitude} />);
      wrapper.instance().flyTo(newLatitude, newLongitude);

      expect(mapboxgl.Map.prototype.flyTo).toBeCalledWith({
        center: [newLongitude, newLatitude],
      });
    });
  });

  describe('setupMapboxEventHandlers()', () => {
    it('calls onLoad when map loads', () => {
      shallow(<Map />);

      expect(mapboxgl.Map.prototype.on).toBeCalledWith('load', expect.any(Function));
    });

    it('calls props.onLoad when load event is fired', () => {
      const style = {
        version: 8,
        name: 'foo',
        layers: [],
        sources: {},
      };

      mapboxgl.Map.prototype.getStyle = jest.fn(() => style);
      const onLoad = jest.fn();
      const wrapper = shallow(<Map onLoad={onLoad} />);

      wrapper.instance().onLoad(style);

      expect(onLoad).toHaveBeenCalledWith(style, wrapper.instance());
    });
  });

  describe('map event callbacks', () => {
    let callback;
    const event = { type: 'mock event' };
    beforeEach(() => {
      callback = jest.fn();
    });

    it('calls onLoad when map dispatches load event', () => {
      const style = { name: 'style' };
      mapboxgl.Map.prototype.getStyle = jest.fn(() => style);
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'load') {
          func({ target: { style: { stylesheet: style } } });
        }
      });

      const wrapper = shallow(<Map onLoad={callback} />);
      expect(callback).toHaveBeenCalledWith(style, wrapper.instance());
    });

    it('does not error when onLoad is not passed as a prop', () => {
      const spy = jest.spyOn(Map.prototype, 'onLoad');
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'load') {
          func({ target: { style: { stylesheet: {} } } });
        }
      });

      shallow(<Map />);

      expect(spy).toHaveBeenCalled();
    });

    it('calls onZoom when map dispatches zoom event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'zoom') {
          func(event);
        }
      });

      shallow(<Map onZoom={callback} />);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('does not register zoom when no onZoom prop is provided', () => {
      shallow(<Map />);

      expect(mapboxgl.Map.prototype.on).not.toHaveBeenCalledWith('zoom', expect.any(Function));
    });

    it('does register zoom when onZoom prop is provided', () => {
      shallow(<Map onZoom={jest.fn()} />);

      expect(mapboxgl.Map.prototype.on).toHaveBeenCalledWith('zoom', expect.any(Function));
    });

    it('calls onMove when map dispatches move event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'move') {
          func(event);
        }
      });

      shallow(<Map onMove={callback} />);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('does not register on move when no onMove prop is provided', () => {
      shallow(<Map />);

      expect(mapboxgl.Map.prototype.on).not.toHaveBeenCalledWith('move', expect.any(Function));
    });

    it('does register on move when onMove prop is provided', () => {
      shallow(<Map onMove={jest.fn()} />);

      expect(mapboxgl.Map.prototype.on).toHaveBeenCalledWith('move', expect.any(Function));
    });

    it('calls onMoveStart when map dispatches movestart event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'movestart') {
          func(event);
        }
      });

      shallow(<Map onMoveStart={callback} />);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('does not register on movestart when no onMoveStart prop is provided', () => {
      shallow(<Map />);

      expect(mapboxgl.Map.prototype.on).not.toHaveBeenCalledWith('movestart', expect.any(Function));
    });

    it('does register on movestart when onMoveStart prop is provided', () => {
      shallow(<Map onMoveStart={jest.fn()} />);

      expect(mapboxgl.Map.prototype.on).toHaveBeenCalledWith('movestart', expect.any(Function));
    });

    it('calls onMoveEnd when map dispatches moveend event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'moveend') {
          func(event);
        }
      });

      shallow(<Map onMoveEnd={callback} />);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('calls emitViewportChange when map dispatches moveend event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'moveend') {
          func(event);
        }
      });

      shallow(<Map onViewportChange={callback} />);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 0,
          longitude: 0,
          pitch: 0,
          zoom: 4,
          bearing: 0,
        }),
      );
    });

    it('registers on moveend when no onMoveEnd prop is provided', () => {
      shallow(<Map />);

      expect(mapboxgl.Map.prototype.on).toHaveBeenCalledWith('moveend', expect.any(Function));
    });

    it('does register on moveend when onMoveEnd prop is provided', () => {
      shallow(<Map onMoveEnd={jest.fn()} />);

      expect(mapboxgl.Map.prototype.on).toHaveBeenCalledWith('moveend', expect.any(Function));
    });

    it('calls onMouseMove when mousemove is dispatched', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'mousemove') {
          func(event);
        }
      });

      shallow(<Map onMouseMove={callback} />);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('does not error when mousemove emits and no onMouseMove prop is present', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'mousemove') {
          func(event);
        }
      });

      shallow(<Map />);
      // if onMouseMove call is attempted, a TypeError will be emitted at this point.
    });

    it('calls onClick when map dispatches click event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'click') {
          func(event);
        }
      });

      shallow(<Map onClick={callback} />);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('does not error when click emits and no onClick prop is present', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'click') {
          func(event);
        }
      });

      shallow(<Map />);
      // if onMouseMove call is attempted, a TypeError will be emitted at this point.
    });

    it('calls onLayerClick when map dispatches click event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, layer, func) => {
        if (type === 'click' && typeof layer === 'string') {
          func(event);
        }
      });

      shallow(<Map onLayerClick={callback} clickLayers={['foo']} />);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('does not error when click emits and no onLayerClick prop is present', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, layer, func) => {
        if (type === 'click' && typeof layer === 'string') {
          func(event);
        }
      });

      shallow(<Map clickLayers={['foo']} />);
      // if onLayerClick call is attempted, a TypeError will be emitted at this point.
    });
  });

  describe('map passthrough callbacks', () => {
    it('on passes through to map.on()', () => {
      const callback = jest.fn();
      const wrapper = shallow(<Map />);

      wrapper.instance().on('event', callback);

      expect(mapboxgl.Map.prototype.on).toHaveBeenCalledWith('event', callback);
    });

    it('on passes layer to map.on()', () => {
      const callback = jest.fn();
      const wrapper = shallow(<Map />);

      wrapper.instance().on('event', 'layer', callback);

      expect(mapboxgl.Map.prototype.on).toHaveBeenCalledWith('event', 'layer', callback);
    });

    it('off passes through to map.off()', () => {
      const callback = jest.fn();
      const wrapper = shallow(<Map />);

      wrapper.instance().off('event', callback);

      expect(mapboxgl.Map.prototype.off).toHaveBeenCalledWith('event', callback);
    });

    it('off passes layer to map.off()', () => {
      const callback = jest.fn();
      const wrapper = shallow(<Map />);

      wrapper.instance().off('event', 'layer', callback);

      expect(mapboxgl.Map.prototype.off).toHaveBeenCalledWith('event', 'layer', callback);
    });

    it('project passes through to map.project()', () => {
      const lat = 56;
      const lng = -130;
      const wrapper = shallow(<Map />);

      wrapper.instance().project([lng, lat]);

      expect(mapboxgl.Map.prototype.project).toHaveBeenCalledWith([lng, lat]);
    });

    it('project returns value from map.project', () => {
      mapboxgl.Map.prototype.project = jest.fn(() => ({ x: 4, y: 10 }));
      const wrapper = shallow(<Map />);

      const point = wrapper.instance().project([0, 0]);

      expect(point).toEqual({ x: 4, y: 10 });
    });

    it('unproject passes through to map.unproject()', () => {
      const x = 10;
      const y = 50;
      const wrapper = shallow(<Map />);

      wrapper.instance().unproject({ x, y });

      expect(mapboxgl.Map.prototype.unproject).toHaveBeenCalledWith({ x, y });
    });

    it('unproject returns value from map.project', () => {
      mapboxgl.Map.prototype.unproject = jest.fn(() => ({ lat: 10, lng: 130 }));
      const wrapper = shallow(<Map />);

      const point = wrapper.instance().unproject({});

      expect(point).toEqual({ lat: 10, lng: 130 });
    });
  });

  describe('map draw events callbacks', () => {
    let callback;
    const event = { type: 'mock event' };

    beforeEach(() => {
      callback = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('calls onDrawCreate when map dispatches draw.create event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'draw.create') {
          func(event);
        }
      });

      shallow(<Map onDrawCreate={callback} />);

      expect(callback).toHaveBeenCalledWith(null, event);
    });

    it('calls onDrawCreate with features when event has features', () => {
      const e = {
        ...event,
        features: [{ type: 'Feature', geometry: {} }],
      };
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'draw.create') {
          func(e);
        }
      });

      shallow(<Map onDrawCreate={callback} />);

      expect(callback).toHaveBeenCalledWith({ type: 'Feature', geometry: {} }, e);
    });

    it('calls onDrawUpdate when map dispatches draw.update event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'draw.update') {
          func(event);
        }
      });

      shallow(<Map onDrawUpdate={callback} />);

      expect(callback).toHaveBeenCalledWith(null, event);
    });

    it('does not throw exception when onDrawUpdate is null', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'draw.update') {
          func(event);
        }
      });

      shallow(<Map />);

      // Exception will be thrown here and test will fail if code is incorrect
    });

    it('calls onDrawDelete when map dispatches draw.delete event', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'draw.delete') {
          func(event);
        }
      });

      shallow(<Map onDrawDelete={callback} />);

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('does not throw exception when onDrawDelete is null', () => {
      mapboxgl.Map.prototype.on = jest.fn((type, func) => {
        if (type === 'draw.delete') {
          func(event);
        }
      });

      shallow(<Map />);

      // Exception will be thrown here and test will fail if code is incorrect
    });
  });

  describe('unmount', () => {
    it('unregisters from window resize on unmount', () => {
      jest.spyOn(global.window, 'removeEventListener');
      const wrapper = shallow(<Map />);
      const updateFunc = wrapper.instance().updateWindowDimensions;

      wrapper.unmount();

      expect(global.window.removeEventListener).toHaveBeenCalledWith('resize', updateFunc);
    });

    it('unregisters from mapboxgl events', () => {
      const wrapper = shallow(<Map />);
      const { onLoad } = wrapper.instance();

      wrapper.unmount();

      expect(mapboxgl.Map.prototype.off).toHaveBeenCalledTimes(1);
      expect(mapboxgl.Map.prototype.off).toHaveBeenCalledWith('load', onLoad);
    });

    it('calls props.onUnload', () => {
      const onUnload = jest.fn();
      const wrapper = shallow(<Map onUnload={onUnload} />);

      wrapper.unmount();

      expect(onUnload).toHaveBeenCalled();
    });
  });
});
