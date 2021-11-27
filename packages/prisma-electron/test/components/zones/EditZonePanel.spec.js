import React from 'react';
import { PureEditZonePanel } from 'components/zones/EditZonePanel';
import { mount, shallow } from 'enzyme';
import { mockStore } from '../../common';
import * as zonesActions from 'zones/zones';
import * as draw from 'draw/draw';
import PropTypes from 'prop-types';
import { units } from '../../../src/format/units';

const initialState = {
  zones: {
    zones: [],
    editing: null,
    fillColor: {
      r: 255,
      g: 0,
      b: 0,
      a: 0.25,
    },
    fillPattern: 'solid',
    strokeColor: { r: 0, g: 0, b: 0 },
    updating: false,
    error: null,
    areaSelector: false,
    areaObject: null,
  },
  draw: {
    enabled: false,
    type: null,
    style: null,
    measure: false,
    measureUnits: 'nauticalMiles',
    distance: undefined,
    bearing: undefined,
    edit: null,
    drawnGeometry: null,
    reset: false,
    interaction: null,
    radius: undefined,
  },
};

const store = mockStore(initialState);
const mountOptions = {
  context: {
    store,
  },
  childContextTypes: {
    store: PropTypes.object,
  },
};

const mapDispatchToProps = {
  startDraw: options => {
    store.dispatch(draw.enable(options));
  },
  stopDraw: () => {
    store.dispatch(draw.disable());
  },
  changeFillColor: color => {
    store.dispatch(zonesActions.changeFillColor(color));
  },
  changeFillPattern: pattern => {
    store.dispatch(zonesActions.changeFillPattern(pattern));
  },
  changeStrokeColor: color => {
    store.dispatch(zonesActions.changeStrokeColor(color));
  },
  updateStyle: options => {
    store.dispatch(draw.updateStyle(options));
  },
  sendUpsert: zone => {
    store.dispatch(zonesActions.sendUpsert(zone));
  },
  clearError: () => {
    store.dispatch(zonesActions.clearError());
  },
  reset: () => {
    store.dispatch(draw.reset());
  },
  updateRadius: r => {
    store.dispatch(draw.updateRadius(r));
  },
};

const state = store.getState();
const stateToProps = {
  drawn: state.draw.drawnGeometry,
  editing: state.zones.editing,
  fillColor: state.zones.fillColor,
  fillPattern: state.zones.fillPattern,
  strokeColor: state.zones.strokeColor,
  updating: state.zones.updating,
  error: state.zones.error,
};

describe('EditZonePanel', () => {
  let stub;
  beforeEach(function() {
    stub = jest.spyOn(PureEditZonePanel.prototype, 'setupInteraction');
  });

  afterEach(function() {
    stub.mockClear();
  });

  describe('when a user chooses proximity zones', () => {
    const wrapper = shallow(
      <PureEditZonePanel
        history={{}}
        classes={{ form: {} }}
        {...mapDispatchToProps}
        {...stateToProps}
      />,
      mountOptions,
    );
    it('by default the mode is Polygon', () => {
      expect(wrapper.state().mode).toBe('Polygon');
    });

    xdescribe('change state to area', () => {
      beforeEach(() => {
        wrapper.setState({
          mode: 'Area',
        });
      });

      it('should be visible a radius edit box', () => {
        expect(wrapper.find('Collapse').props().in).toBe(true);
      });

      it('changing units should work', () => {
        wrapper.setState({
          radiusNumber: 1,
        });
        expect(
          wrapper
            .find('Collapse')
            .find('TextField')
            .props().value,
        ).toBe(1);
        wrapper.instance().unitsChanged(units.meters);
        wrapper.update();
        expect(
          wrapper
            .find('Collapse')
            .find('TextField')
            .props().value,
        ).toBe(1852);
      });
    });

    describe('change state back', () => {
      beforeEach(() => {
        wrapper.setState({
          mode: 'Polygon',
        });
      });
      it('radio buttons should be enabled', () => {
        expect(wrapper.state().enableAlertSelector).toBe(true);
      });
      wrapper.find('Radio').forEach(node => {
        it(`alert radios should be unchecked, but none. Radio is ${node.props().value}`, () => {
          expect(node.props().disabled).toBe(false);
          expect(node.props().checked).toBe(node.props().value === 'none');
        });
      });
    });
  });
});
