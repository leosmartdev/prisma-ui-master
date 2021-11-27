/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 *
 * Handles layers metadata and feature filtering for maps.
 *
 * Layers here are the base information and style for layers, but they are not added to maps
 * using these reducers. A layer must exist first before a map can reference the layer and add its
 * features to a map. See `@prisma/map/redux/map` for how to add layers to a map.
 *
 * Each layer defined here can be one of a few types of layers.
 *  - feature: this layer filters a feature source and displays those features on a map
 *  - composite: This layer only contains other layers. These layers are for the application only,
 *               not an actual map.
 *  - raster: This layer is a raster layer for the map. Eg weather radar, open street map tiles, etc
 *
 * All layers must have the following properties:
 *  - id: ID to reference the layer.
 *  - name: String name for the layer. This will be displayed to the user when toggling is enabled.
 *  - type: The type of layer, see above.
 *
 * For feature layers the following properties are available:
 *  - source: Source for the features for this layer. Source is the key for the features list on the
 *            redux state. Eg. normally `features` which pulls from `state['@prisma/map'].features`
 *            or `hisoricalFeatures` which pulls from `state['@prisma/map'].historicalFeatures`
 *            Note: this is different from the mapboxgl style spec sources which is the same concept
 *            When this layer is applied to the mapbox gl style, it will references a generated
 *            source name that is the combo of this property sources run through the provided filter
 *            or list of feature ids, the result is applied to the source on the style as `data`
 *  - filters: Array of filters to apple to the source dataset. See more info on filters in the
 *             @prisma/map documentation.
 *  - layout: Object containing layout properties for setting things like visibility. Se @prisma/map
 *            documentation for more information.
 *  - paint: Default paint object for the layer describing the style of the layer. Can be overriden
 *           by map style. This just provides sensible defaults.
 *  - static: boolean that when true, marks the layer as static. The features will not change. When
 *            this is true `features` is required.
 *  - features: List of feature IDs for this layer. Only these features will be included in the
 *              layer and `filters` will be ignored. Required when `static` is true.
 *
 * For composite layers the following properties are available:
 *  - layers: List of layers IDs that this composite layer contains. This allows for layout or paint
 *            properties tied to the composite layer to be propgated down to the child layers.
 *            The main use case for composite layers are providing a nice layer for user to the turn
 *            visibility on or off (eg Incident 1) but have the action propogate to the actual map
 *            layers, (eg incident1:zones, incident1:log:ais, incident1:log)
 */

import reducer from './reducers';
import * as actions from './actions';
import * as types from './types';

export default reducer;

export {
  types,
  actions,
};
