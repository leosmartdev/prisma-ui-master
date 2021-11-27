import React from 'react';
import { shallow } from 'enzyme';
import FlexContainer from './FlexContainer';

describe('FlexContainer', () => {
  describe('defaults', () => {
    it('are correct', () => {
      const wrapper = shallow(<FlexContainer />).dive();
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toBeUndefined();
      expect(wrapper.prop('padding')).toBeUndefined();

      const style = wrapper.state('style');

      expect(style.flexDirection).toEqual('row');
      expect(style.display).toEqual('flex');
      expect(style.justifyContent).toBeUndefined();
      expect(style.alignItems).toBeUndefined();
      expect(style.flexWrap).toBeUndefined();
      expect(style.padding).toBeUndefined();
    });
  });

  describe('direction', () => {
    it('defaults to row mode', () => {
      const wrapper = shallow(<FlexContainer />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toBeUndefined();
      expect(wrapper.dive().state('style').flexDirection).toEqual('row');
    });

    it('column prop sets column mode', () => {
      const wrapper = shallow(<FlexContainer column />);
      expect(wrapper.prop('column')).toBe(true);
      expect(wrapper.prop('direction')).toBeUndefined();
      expect(wrapper.dive().state('style').flexDirection).toEqual('column');
    });

    it('direction=column prop sets column mode', () => {
      const wrapper = shallow(<FlexContainer direction="column" />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toEqual('column');
      expect(wrapper.dive().state('style').flexDirection).toEqual('column');
    });

    it('direction=row prop sets row mode', () => {
      const wrapper = shallow(<FlexContainer direction="row" />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toEqual('row');
      expect(wrapper.dive().state('style').flexDirection).toEqual('row');
    });

    it('direction=dskfaj prop fails', () => {
      const wrapper = shallow(<FlexContainer direction="dskfaj" />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toEqual('dskfaj');
      expect(wrapper.dive().state('style').flexDirection).toEqual('row');
    });
  });

  describe('align', () => {
    it('sets justifyContent', () => {
      const wrapper = shallow(<FlexContainer align="flex-start" />).dive();

      expect(wrapper.state('style').justifyContent).toEqual('flex-start');
    });

    it('doesnt set alignItems when only justifyContent provided', () => {
      const wrapper = shallow(<FlexContainer align="flex-start" />).dive();

      expect(wrapper.state('style').justifyContent).toEqual('flex-start');
      expect(wrapper.state('style').alignItems).not.toEqual('flex-start');
      expect(wrapper.state('style').alignItems).toBeUndefined();
    });

    it('sets justifyContent and align items', () => {
      const wrapper = shallow(<FlexContainer align="flex-start flex-end" />).dive();

      expect(wrapper.state('style').justifyContent).toEqual('flex-start');
      expect(wrapper.state('style').alignItems).toEqual('flex-end');
    });

    it('normalizes start', () => {
      const wrapper = shallow(<FlexContainer align="start start" />).dive();

      expect(wrapper.state('style').justifyContent).toEqual('flex-start');
      expect(wrapper.state('style').alignItems).toEqual('flex-start');
    });

    it('normalizes end', () => {
      const wrapper = shallow(<FlexContainer align="end end" />).dive();

      expect(wrapper.state('style').justifyContent).toEqual('flex-end');
      expect(wrapper.state('style').alignItems).toEqual('flex-end');
    });
  });

  describe('wrap', () => {
    it('sets nowrap when provided', () => {
      const wrapper = shallow(<FlexContainer wrap="nowrap" />).dive();

      expect(wrapper.state('style').flexWrap).toEqual('nowrap');
    });

    it('sets wrap when provided', () => {
      const wrapper = shallow(<FlexContainer wrap="wrap" />).dive();

      expect(wrapper.state('style').flexWrap).toEqual('wrap');
    });

    it('sets wrap-reverse when provided', () => {
      const wrapper = shallow(<FlexContainer wrap="wrap-reverse" />).dive();

      expect(wrapper.state('style').flexWrap).toEqual('wrap-reverse');
    });

    it('normalizes wrap-reverse when provided', () => {
      const wrapper = shallow(<FlexContainer wrap="reverse" />).dive();

      expect(wrapper.state('style').flexWrap).toEqual('wrap-reverse');
    });

    it('doesnt set with invalid value', () => {
      const wrapper = shallow(<FlexContainer wrap="kldsfj" />).dive();

      expect(wrapper.state('style').flexWrap).toBeUndefined();
    });
  });

  describe('getDerivedStateFromProps', () => {
    it('calls createStyleFromProps and updates', () => {
      FlexContainer.createStyleFromProps = jest.fn();

      const wrapper = shallow(<FlexContainer />);
      expect(wrapper.prop('column')).toBeUndefined();
      expect(wrapper.prop('direction')).toBeUndefined();

      expect(wrapper.dive().state('style').flexDirection).toEqual('row');

      wrapper.setProps({ column: true });

      expect(wrapper.prop('column')).toBe(true);
      expect(wrapper.dive().state('style').flexDirection).toEqual('column');
    });
  });

  describe('className', () => {
    it('defaults to c2-flex-container', () => {
      const wrapper = shallow(<FlexContainer />);
      const div = wrapper.dive();
      expect(wrapper.prop('classes')).toBeUndefined();
      expect(div.prop('className')).toEqual('c2-flex-container');
    });

    it('is overridden with classes.root', () => {
      const wrapper = shallow(<FlexContainer classes={{ root: 'test' }} />);
      const div = wrapper.dive();
      expect(wrapper.prop('classes')).toBeDefined();
      expect(div.prop('className')).toEqual('test');
    });
  });

  describe('padding', () => {
    it('="none"', () => {
      const wrapper = shallow(<FlexContainer padding="none" />);

      expect(wrapper.prop('padding')).toEqual('none');
      expect(wrapper.find('FlexContainer').dive().state('style').padding).toBeUndefined();
    });

    it('="dense"', () => {
      const wrapper = shallow(<FlexContainer padding="dense" />);

      expect(wrapper.prop('padding')).toEqual('dense');
      expect(wrapper.dive().state('style').padding).toEqual(8);
    });

    it('="normal"', () => {
      const wrapper = shallow(<FlexContainer padding="normal" />);

      expect(wrapper.prop('padding')).toEqual('normal');
      expect(wrapper.dive().state('style').padding).toEqual(24);
    });
  });

  describe('style', () => {
    it('is not overriden by custom style', () => {
      const wrapper = shallow(<FlexContainer column style={{ foo: 'bar' }} />);

      expect(wrapper.dive().props().style).toEqual(expect.objectContaining({
        foo: 'bar',
        flexDirection: 'column',
      }));
    });
  });
});
