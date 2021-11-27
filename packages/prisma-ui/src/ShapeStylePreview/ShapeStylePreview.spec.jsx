import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import ShapeStylePreview from './ShapeStylePreview';
import * as BuildPatterns from './build-patterns';

jest.mock('./build-patterns');

describe('ShapeStylePreview', () => {
  beforeEach(() => {
    BuildPatterns.getRendererForPattern = jest.fn(() => ({ renderer: jest.fn() }));
  });

  it('mounts', () => {
    const tree = renderer.create(<ShapeStylePreview />);

    expect(tree).toMatchSnapshot();
  });

  describe('properties', () => {
    it('calls for update when fillColor is changed', () => {
      const wrapper = shallow(<ShapeStylePreview />);
      wrapper.instance().updateCanvas = jest.fn();

      wrapper.setProps({ fillColor: '#123456' });

      expect(wrapper.instance().updateCanvas).toHaveBeenCalled();
    });

    it('calls for update when strokeColor is changed', () => {
      const wrapper = shallow(<ShapeStylePreview />);
      wrapper.instance().updateCanvas = jest.fn();

      wrapper.setProps({ strokeColor: '#123456' });

      expect(wrapper.instance().updateCanvas).toHaveBeenCalled();
    });

    it('calls for update when fillPattern is changed', () => {
      const wrapper = shallow(<ShapeStylePreview />);
      wrapper.instance().updateCanvas = jest.fn();

      wrapper.setProps({ fillPattern: 'horizontalLines' });

      expect(wrapper.instance().updateCanvas).toHaveBeenCalled();
    });

    it('calls for update when shape is changed', () => {
      const wrapper = shallow(<ShapeStylePreview />);
      wrapper.instance().updateCanvas = jest.fn();

      wrapper.setProps({ shape: 'circle' });

      expect(wrapper.instance().updateCanvas).toHaveBeenCalled();
    });

    it('calls for update when hideOutline is changed', () => {
      const wrapper = shallow(<ShapeStylePreview />);
      wrapper.instance().updateCanvas = jest.fn();

      wrapper.setProps({ hideOutline: true });

      expect(wrapper.instance().updateCanvas).toHaveBeenCalled();
    });

    it('calls for update when width is changed', () => {
      const wrapper = shallow(<ShapeStylePreview />);
      wrapper.instance().updateCanvas = jest.fn();

      wrapper.setProps({ width: 50 });

      expect(wrapper.instance().updateCanvas).toHaveBeenCalled();
    });

    it('calls for update when height is changed', () => {
      const wrapper = shallow(<ShapeStylePreview />);
      wrapper.instance().updateCanvas = jest.fn();

      wrapper.setProps({ height: 50 });

      expect(wrapper.instance().updateCanvas).toHaveBeenCalled();
    });

    it('does not call for update when another prop is changed', () => {
      const wrapper = shallow(<ShapeStylePreview />);
      wrapper.instance().updateCanvas = jest.fn();

      wrapper.setProps({ foo: 50 });

      expect(wrapper.instance().updateCanvas).not.toHaveBeenCalled();
    });
  });

  describe('updateCanvas', () => {
    let mockContext = {};
    let canvasMock = {};

    beforeEach(() => {
      mockContext = {
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        stroke: jest.fn(),
        fillRect: jest.fn(),
        fillStyle: jest.fn(),
        fill: jest.fn(),
        strokeRect: jest.fn(),
      };

      canvasMock = {
        getContext: jest.fn(() => mockContext),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('calls correct canvas code when creating a polygon shape', () => {
      const wrapper = shallow(<ShapeStylePreview width={30} height={10} strokeColor="#123456" />);
      wrapper.instance().canvas = canvasMock;

      wrapper.instance().updateCanvas();

      expect(canvasMock.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 30, 10);
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 30, 10);
      expect(mockContext.strokeRect).toHaveBeenCalledWith(0, 0, 30, 10);
      expect(mockContext).toMatchObject({
        strokeStyle: 'rgb(18, 52, 86)',
        lineWidth: 4,
        fillStyle: {},
      });
    });

    it('calls correct canvas code when creating a circle shape', () => {
      const wrapper = shallow(<ShapeStylePreview
        width={30}
        height={10}
        strokeColor="#123456"
        shape="circle"
      />);
      wrapper.instance().canvas = canvasMock;

      wrapper.instance().updateCanvas();

      expect(canvasMock.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 30, 10);
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.arc).toHaveBeenCalledWith(15, 5, 13, 0, Math.PI * 2, false);
      expect(mockContext.fill).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
      expect(mockContext).toMatchObject({
        strokeStyle: 'rgb(18, 52, 86)',
        lineWidth: 4,
        fillStyle: {},
      });
    });

    it('doesnt add outline when hideOutline is present in circle mode', () => {
      const wrapper = shallow(<ShapeStylePreview
        width={30}
        height={10}
        strokeColor="#123456"
        shape="circle"
        hideOutline
      />);
      wrapper.instance().canvas = canvasMock;

      wrapper.instance().updateCanvas();

      expect(mockContext.stroke).not.toHaveBeenCalled();
      expect(mockContext.strokeStyle).toBeUndefined();
    });

    it('doesnt add outline when hideOutline is present in polygon mode', () => {
      const wrapper = shallow(<ShapeStylePreview
        width={30}
        height={10}
        strokeColor="#123456"
        shape="polygon"
        hideOutline
      />);
      wrapper.instance().canvas = canvasMock;

      wrapper.instance().updateCanvas();

      expect(mockContext.strokeRect).not.toHaveBeenCalled();
      expect(mockContext.strokeStyle).toBeUndefined();
    });
  });
});
