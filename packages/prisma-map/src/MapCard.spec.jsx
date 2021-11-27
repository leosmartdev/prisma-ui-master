import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import MapCard from './MapCard';

describe('<MapCard>', () => {
  it('Renders', () => {
    const wrapper = shallow(<MapCard />);
    expect(wrapper).not.toBeNull();
  });

  it('snapshots', () => {
    const tree = renderer.create(<MapCard />);
    expect(tree).toMatchSnapshot();
  });

  describe('passes className through to <Card/>', () => {
    it('renders with correct dimensions when passed as props', () => {
      const wrapper = shallow(<MapCard className="foo" />);
      expect(wrapper.prop('className')).toEqual('foo'); // <MapCard>
      expect(wrapper.dive().prop('classes').root).toEqual(wrapper.prop('classes').root); // <Card>
      expect(wrapper.dive().prop('className')).toContain('foo'); // <Card>
    });
  });

  describe('anchor positions', () => {
    it('top-left', () => {
      const wrapper = shallow(<MapCard anchor="top-left" />);
      expect(wrapper.dive().prop('className')).toEqual('MapCard-top-left-2');
    });

    it('combines classNames and doesn\'t override user input className', () => {
      const wrapper = shallow(<MapCard anchor="top-left" className="foo" />);
      expect(wrapper.dive().prop('className')).toEqual('MapCard-top-left-2 foo');
    });
  });
});
