import React from 'react';
import { mount } from 'enzyme';
import { BaseFlexContainer } from 'components/layout/Container';

describe('components/layout/Container.BaseFlexContainer', () => {
  describe('defaults', () => {
    it('are correct', () => {
      const wrapper = mount(<BaseFlexContainer />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toBeUndefined();

      const style = wrapper.state('style');
      expect(style.flexDirection).toBe('row');
      expect(style.display).toBe('flex');
      expect(style.justifyContent).toBeUndefined();
      expect(style.alignItems).toBeUndefined();
      expect(style.flexWrap).toBeUndefined();
    });
  });

  describe('direction', () => {
    it('defaults to row mode', () => {
      const wrapper = mount(<BaseFlexContainer />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toBeUndefined();
      expect(wrapper.state('style').flexDirection).toBe('row');
    });

    it('column prop sets column mode', () => {
      const wrapper = mount(<BaseFlexContainer column />);
      expect(wrapper.prop('column')).toBe(true);
      expect(wrapper.prop('direction')).toBeUndefined();
      expect(wrapper.state('style').flexDirection).toBe('column');
    });

    it('direction=column prop sets column mode', () => {
      const wrapper = mount(<BaseFlexContainer direction="column" />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toBe('column');
      expect(wrapper.state('style').flexDirection).toBe('column');
    });

    it('direction=row prop sets row mode', () => {
      const wrapper = mount(<BaseFlexContainer direction="row" />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toBe('row');
      expect(wrapper.state('style').flexDirection).toBe('row');
    });

    it('direction=dskfaj prop fails', () => {
      const wrapper = mount(<BaseFlexContainer direction="dskfaj" />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toBe('dskfaj');
      expect(wrapper.state('style').flexDirection).toBe('row');
    });
  });

  describe('align', () => {
    it('sets justifyContent', () => {
      const wrapper = mount(<BaseFlexContainer align="flex-start" />);

      expect(wrapper.state('style').justifyContent).toBe('flex-start');
    });

    it('doesnt set alignItems when only justifyContent provided', () => {
      const wrapper = mount(<BaseFlexContainer align="flex-start" />);

      expect(wrapper.state('style').justifyContent).toBe('flex-start');
      expect(wrapper.state('style').alignItems).not.toBe('flex-start');
      expect(wrapper.state('style').alignItems).toBeUndefined();
    });

    it('sets justifyContent and align items', () => {
      const wrapper = mount(<BaseFlexContainer align="flex-start flex-end" />);

      expect(wrapper.state('style').justifyContent).toBe('flex-start');
      expect(wrapper.state('style').alignItems).toBe('flex-end');
    });

    it('normalizes start', () => {
      const wrapper = mount(<BaseFlexContainer align="start start" />);

      expect(wrapper.state('style').justifyContent).toBe('flex-start');
      expect(wrapper.state('style').alignItems).toBe('flex-start');
    });

    it('normalizes end', () => {
      const wrapper = mount(<BaseFlexContainer align="end end" />);

      expect(wrapper.state('style').justifyContent).toBe('flex-end');
      expect(wrapper.state('style').alignItems).toBe('flex-end');
    });
  });

  describe('wrap', () => {
    it('sets nowrap when provided', () => {
      const wrapper = mount(<BaseFlexContainer wrap="nowrap" />);

      expect(wrapper.state('style').flexWrap).toBe('nowrap');
    });

    it('sets wrap when provided', () => {
      const wrapper = mount(<BaseFlexContainer wrap="wrap" />);

      expect(wrapper.state('style').flexWrap).toBe('wrap');
    });

    it('sets wrap-reverse when provided', () => {
      const wrapper = mount(<BaseFlexContainer wrap="wrap-reverse" />);

      expect(wrapper.state('style').flexWrap).toBe('wrap-reverse');
    });

    it('normalizes wrap-reverse when provided', () => {
      const wrapper = mount(<BaseFlexContainer wrap="reverse" />);

      expect(wrapper.state('style').flexWrap).toBe('wrap-reverse');
    });

    it('doesnt set with invalid value', () => {
      const wrapper = mount(<BaseFlexContainer wrap="kldsfj" />);

      expect(wrapper.state('style').flexWrap).toBeUndefined();
    });
  });

  describe('componentWillReceiveProps', () => {
    it('calls createStyleFromProps and updates', () => {
      const createStyleSpy = jest.spyOn(BaseFlexContainer.prototype, 'createStyleFromProps');

      const wrapper = mount(<BaseFlexContainer />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toBeUndefined();

      expect(wrapper.state('style').flexDirection).toBe('row');

      expect(BaseFlexContainer.prototype.createStyleFromProps).toBeCalledTimes(1);

      wrapper.setProps({
        column: true,
      });

      expect(wrapper.prop('column')).toBe(true);
      expect(BaseFlexContainer.prototype.createStyleFromProps).toBeCalledTimes(2);
      expect(BaseFlexContainer.prototype.createStyleFromProps).toHaveLastReturnedWith({
        display: 'flex',
        flexDirection: 'column',
      });
      expect(wrapper.state('style').flexDirection).toBe('column');
    });
  });

  describe('className', () => {
    it('defaults to c2-flex-container', () => {
      const wrapper = mount(<BaseFlexContainer />);
      const div = wrapper.find('div');
      expect(wrapper.prop('classes')).toBeUndefined();
      expect(div.prop('className')).toBe('c2-flex-container');
    });

    it('is overridden with classes.root', () => {
      const wrapper = mount(<BaseFlexContainer classes={{ root: 'test' }} />);
      const div = wrapper.find('div');
      expect(wrapper.prop('classes')).toBeDefined();
      expect(div.prop('className')).toBe('test');
    });
  });
});
