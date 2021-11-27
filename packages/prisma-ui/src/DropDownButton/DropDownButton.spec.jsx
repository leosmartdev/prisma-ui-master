import React from 'react';
import { shallow } from 'enzyme';
import DropDownButton from './DropDownButton';

describe('DropDownButton', () => {
  it('renders', () => {
    shallow(<DropDownButton options={[{ id: 'foo' }]} />);
  });

  describe('closeMenu()', () => {
    it('sets correct state', () => {
      const foo = { id: 'foo' };
      const wrapper = shallow(<DropDownButton options={[{ id: 'foo' }]} />);

      wrapper.setState({ anchorEl: foo });
      wrapper.instance().closeMenu({ currentTarget: foo });

      expect(wrapper.state('open')).toBe(false);
      expect(wrapper.state('anchorEl')).toBeUndefined();
    });
  });

  describe('openMenu()', () => {
    it('sets correct state', () => {
      const foo = { id: 'foo' };
      const wrapper = shallow(<DropDownButton options={[{ id: 'foo' }]} />);

      wrapper.instance().openMenu({ currentTarget: foo });

      expect(wrapper.state('open')).toBe(true);
      expect(wrapper.state('anchorEl')).toBe(foo);
    });
  });

  describe('handleMenuChange()', () => {
    it('calls close menu', () => {
      const event = { currentTarget: 'foo' };
      const option = 'foo';
      const wrapper = shallow(<DropDownButton options={[{ id: 'foo' }]} />);
      wrapper.instance().closeMenu = jest.fn();

      wrapper.instance().handleMenuChange(event, option);

      expect(wrapper.instance().closeMenu).toHaveBeenCalledWith(event, option);
    });

    it('calls onChange when change is valid object', () => {
      const event = { currentTarget: 'foo' };
      const option = { id: 'foo' };
      const onChange = jest.fn();
      const wrapper = shallow(<DropDownButton options={[{ id: 'foo' }]} onChange={onChange} />);
      wrapper.instance().closeMenu = jest.fn();

      wrapper.instance().handleMenuChange(event, option);

      expect(onChange).toHaveBeenCalledWith(option);
    });

    it('doesnt call onChange when change is string', () => {
      const event = { currentTarget: 'foo' };
      const option = 'foo';
      const onChange = jest.fn();
      const wrapper = shallow(<DropDownButton options={[{ id: 'foo' }]} onChange={onChange} />);
      wrapper.instance().closeMenu = jest.fn();

      wrapper.instance().handleMenuChange(event, option);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('doesnt call onChange when change is undefined', () => {
      const event = { currentTarget: 'foo' };
      const onChange = jest.fn();
      const wrapper = shallow(<DropDownButton options={[{ id: 'foo' }]} onChange={onChange} />);
      wrapper.instance().closeMenu = jest.fn();

      wrapper.instance().handleMenuChange(event);

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
