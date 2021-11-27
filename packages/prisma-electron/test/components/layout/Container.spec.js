import React from 'react';
import { mount } from 'enzyme';
import Container from 'components/layout/Container';

describe('Container', () => {
  describe('className', () => {
    it('defaults to c2-flex-container', () => {
      const wrapper = mount(<Container />);
      const div = wrapper.find('div');
      expect(wrapper.prop('classes')).toBeUndefined();
      expect(div.prop('className')).toBe('c2-container');
    });

    it('is overridden with classes.root', () => {
      const wrapper = mount(<Container classes={{ root: 'test' }} />);
      const div = wrapper.find('div');
      expect(wrapper.prop('classes')).toBeDefined();
      expect(div.prop('className')).toBe('test');
    });
  });

  describe('renders', () => {
    it('renders div', () => {
      const wrapper = mount(<Container />);
      const div = wrapper.find('div');
      const child = wrapper.find('h2');

      expect(div).toBeDefined();
      expect(child.exists()).toBe(false);
    });

    it('renders children', () => {
      const wrapper = mount(
        <Container>
          <h2>Test</h2>
        </Container>,
      );
      const child = wrapper.find('h2');

      expect(child.exists()).toBe(true);
    });
  });
});
