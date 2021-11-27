/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Component for detecting hover events on specific map layers and rendering a child function
 * when the hover occurs.
 */
import React from 'react';
import PropTypes from 'prop-types';

import { Consumer as MapConsumer } from './MapContext';

export class MapHover extends React.Component {
  static propTypes = {
    /**
     * Map instance passed from the <Map.Consumer> context wrapper when using <Hover> or if using
     * `MapHover` directly, this must be an instance of `<Map>` component.
     *
     * If you use `<Hover>` or the reexported, `<Map.Hover>` from `@prisma/Map` then you can safely
     * ignore this property as it will be provided to `<MapHover>` automatically.
     */
    map: PropTypes.object.isRequired,

    /**
     * The children to render, must be a function that will be called whenever the hover occurs
     * over the provided layers. The hover event will happen when the mouseover event is triggered
     * by the mouse over a feature on the layers. The function will then be called whenever the map
     * is moved or the mouse is moved until mouseleave event occurs. At this point, the hover render
     * will return null instead of calling this child function to render nothing.
     *
     * ## Signature
     * ```
     * (features: array(object), event: object) => Component
     * ```
     *
     * @param {array} features Array of all features currently under the mouse cursor. Each feature
     *                         is a geojson object.
     * @param {object} event   The mouse event that started the hover, with additional mouse events
     *                         points added so the `event.point` property always contains the
     *                         latest x, y values of the mouse cursor and coordinates always has
     *                         latest lat, lng values of the mouse cursor as well. The features
     *                         array will hold the actual coordinates of the feature the house is
     *                         over where the event is the location of the mouse pointer itself.
     *
     *
     */
    children: PropTypes.func,

    /**
     * Array of all the layer ids this hover should listen for mouse events. When a layer id is
     * removed from this array, the component will stop listening to events on that layer, and when
     * a new layer id is added it will immeditately subscribe to events.
     * Unknown layer ids will be ignore and an empty array will unsubscribe from all events.
     */
    layers: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    layers: [],
    children: null,
  };

  state = {
    isHovering: false,
    features: null,
    lastMouseEvent: null,
  };

  componentDidMount() {
    const { map } = this.props;
    if (!map) {
      return;
    }

    this.updateLayers();
  }

  componentDidUpdate(prevProps) {
    const { map, layers } = this.props;
    if (!map) {
      return;
    }

    // If the map changed we need to subscribe to all events on the new map
    if (prevProps.map !== map) {
      this.updateLayers();
    }

    if (prevProps.layers !== layers) {
      this.updateLayers(prevProps.layers);
    }
  }

  onMouseOver = event => {
    const { map } = this.props;

    map.on('move', this.onMove);

    this.setState({
      lastMouseEvent: event,
      isHovering: true,
      features: this.getFeatures(event),
    });
  };

  onMouseLeave = () => {
    const { map } = this.props;

    map.off('move', this.onMove);

    this.setState({
      features: null,
      lastMouseEvent: null,
      isHovering: false,
    });
  };

  onMove = event => {
    this.setState({
      lastMouseEvent: event,
    });
  };

  getFeatures = event => {
    if (event.features.length > 0) {
      return event.features;
    }
    return [];
  };

  updateLayers = (prevLayers = []) => {
    const { layers } = this.props;
    if (prevLayers.length > 0) {
      prevLayers.forEach(layer => {
        if (!layers.includes(layer)) {
          this.off(layer);
        }
      });
    }

    if (layers.length > 0) {
      layers.forEach(layer => {
        if (!prevLayers.includes(layer)) {
          this.on(layer);
        }
      });
    }
  };

  on = layer => {
    const { map } = this.props;

    map.on('mouseover', layer, this.onMouseOver);
    map.on('mouseleave', layer, this.onMouseLeave);
  };

  off = layer => {
    const { map } = this.props;

    map.off('mouseover', layer, this.onMouseOver);
    map.off('mouseleave', layer, this.onMouseLeave);
    map.off('move', this.onMove);
  };

  render() {
    const { children } = this.props;

    const { isHovering, lastMouseEvent, features } = this.state;

    if (!isHovering || !children) {
      return null;
    }

    return children(features, lastMouseEvent);
  }
}

export default function Hover(props) {
  return <MapConsumer>{map => <MapHover {...props} map={map} />}</MapConsumer>;
}
