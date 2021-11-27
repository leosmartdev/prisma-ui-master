/*
 * We disable this eslint rule becaue its not picking up we are using the props in the new React
 * lifecycle method getDerivedStateFromProps.
 */
/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import { center } from '@turf/turf';
import { getCoord } from '@turf/invariant';

import { Consumer as MapConsumer } from './MapContext';

class Tooltip extends React.Component {
  static propTypes = {
    point: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    coordinates: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    feature: PropTypes.shape({
      type: PropTypes.oneOf(['Feature']),
      geometry: PropTypes.shape({
        type: PropTypes.string.isRequired,
        coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
      }),
      properties: PropTypes.object,
    }),
    /**
     * placement location of the tooltip in relation to the mouse.
     * Valid values are:
     *
     * ----------------------------------------------
     * | top-left        top-center       top-right |
     * |                                            |
     * | middle-left        mouse      middle-right |
     * |                                            |
     * | bottom-left   bottom-center   bottom-right |
     * ---------------------------------------------|
     * /
    placement: PropTypes.oneOf([
      'top-left',
      'top-center',
      'top-right',
      'middle-left',
      'middle-center',
      'middle-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ]),
    */
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.element, PropTypes.func])),
    ]),
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    feature: null,
    point: null,
    coordinates: null,
    // placement: 'bottom-right',
    children: null,
  };

  static getDerivedStateFromProps(props, prevState) {
    if (
      props.feature !== prevState.feature ||
      props.coordinates !== prevState.coordinates ||
      props.point !== prevState.point
    ) {
      return {
        feature: props.feature,
        coordinates: props.coordinates,
        point: Tooltip.getPointFromProps(props),
      };
    }

    return null;
  }

  static getPointFromProps(props) {
    if (props.point !== null) {
      return props.point;
    }

    let point = null;
    let coord = null;
    const { coordinates, feature } = props;

    if (coordinates) {
      coord = [coordinates.lng || coordinates.longitude, coordinates.lat || coordinates.latitude];
    } else if (feature) {
      coord = center(props.feature);
    }

    if (coord && props.map) {
      const lngLat = getCoord(coord);
      point = props.map.project(lngLat);
    }

    return point;
  }

  state = {
    point: null,
  };

  /* TODO: this wasn't working, so we will come back to handling placement
  calculatePlacementOffsets = (placement) => {
    let xOffset = '0px';
    let yOffset = '0px';
    let transformOrigin = '';

    switch(placement) {
      case 'top-left': {
      }
      case 'top-middle': {
      }
      case 'top-right': {
      }
      case 'middle-left': {
      }
      case 'middle-right': {
      }
      case 'bottom-left': {
      }
      case 'bottom-middle': {
      }
      case 'bottom-right': {
        xOffset = '8px';
        yOffset = '16px';
        break;
      }
    }


    return { xOffset, yOffset, transformOrigin };
  }
  */

  render() {
    const {
      children,
      classes,
      // placement,
    } = this.props;

    const { point } = this.state;

    if (!point) {
      return null;
    }

    // TODO: need to get transform origin to work so we can accurately calculate
    // placement, so for now, lets just offset so the mouse doesnt' cover and leave it.
    // const { xOffset, yOffset, transformOrigin } = this.calculatePlacementOffsets(placement);
    const xOffset = '15px';
    const yOffset = '15px';
    const translateX = `calc(${point.x}px + ${xOffset})`;
    const translateY = `calc(${point.y}px + ${yOffset})`;

    return (
      <div
        className={classes.root}
        style={{
          transform: `translate(${translateX}, ${translateY})`,
        }}
      >
        {children}
      </div>
    );
  }
}

export const MapTooltip = withStyles({
  root: {
    position: 'absolute',
  },
})(Tooltip);

export default props => <MapConsumer>{map => <MapTooltip {...props} map={map} />}</MapConsumer>;
