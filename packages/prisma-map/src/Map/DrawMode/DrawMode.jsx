/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Container Component for creating custom interactions when the map is in draw mode. The child
 * function of this component will only be called when the map is in draw mode. Otherwise it will
 * just return null.
 */
import React from 'react';
import PropTypes from 'prop-types';

import { Consumer as MapConsumer } from '../MapContext';

export class MapDrawMode extends React.Component {
  static propTypes = {
    /**
     * Map instance passed from the <Map.Consumer> context wrapper when using <Hover> or if using
     * `MapHover` directly, this must be an instance of `<Map>` component.
     *
     * If you use `<DrawMode>` or the reexported, `<Map.DrawMode>` from `@prisma/map/Map` then
     * you can safely ignore this property as it will be provided to `<DrawMode>` automatically.
     */
    map: PropTypes.object.isRequired,

    /**
     * The children to render, must be a function that will be called whenever the draw mode changes
     * If the current map mode is anything else, the function will not be called and null will be
     * returned by this component.
     *
     * ## Signature
     * ```
     * (map, draw) => Component
     * ```
     *
     * @param {object} map The map reference object. This allows you to call functions on the map.
     * @param {object} draw The draw tool reference object that allows you to call functions on the
     *                      tool itself.
     *
     */
    children: PropTypes.func,
  };

  static defaultProps = {
    children: null,
  };

  state = {};

  render() {
    const { children, map } = this.props;

    if (!map || map.getMapMode() !== 'draw') {
      return null;
    }

    return children(map, map.draw);
  }
}

export default function DrawMode(props) {
  return <MapConsumer>{map => <MapDrawMode {...props} map={map} />}</MapConsumer>;
}
