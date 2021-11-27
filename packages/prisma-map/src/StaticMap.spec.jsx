import React from 'react';
import { shallow } from 'enzyme';
import StaticMap from './StaticMap';
import Map from './Map';

describe('<StaticMap>', () => {
  it('renders <Map> with static prop', () => {
    const wrapper = shallow(<StaticMap />);

    expect(wrapper.find(Map)).toHaveLength(1);
    expect(wrapper.find(Map).prop('static')).toBe(true);
  });

  it('passes props to <Map>', () => {
    const viewport = {
      latitude: 34,
      longitude: 45,
      bearing: 178,
      pitch: 40,
      zoom: 10,
    };

    const wrapper = shallow(<StaticMap {...viewport} />);

    expect(wrapper.find(Map)).toHaveLength(1);
    expect(wrapper.find(Map).prop('static')).toBe(true);

    Object.keys(viewport).forEach((prop) => {
      expect(wrapper.find(Map).prop(prop)).toEqual(viewport[prop]);
    });
  });
});
