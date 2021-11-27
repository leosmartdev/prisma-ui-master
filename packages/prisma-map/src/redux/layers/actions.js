import { createAction } from 'redux-actions';
import { ADD_LAYER } from './types';

/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Actions for map layers.
 */

/**
 * Create a new single layer that maps can use. NOTE: this does not add the layer to a map, just
 * adds the metadata for a map like what features should be on the layer, type of layer, and
 * layout, style, etc...
 *
 * The map style and config has a list of layers each which a layerId, those ids map to the id of a
 * layer here and that is how a layer is actually added a map.
 */
const addLayer = createAction(ADD_LAYER, layer => ({ layer }));

export default addLayer;

