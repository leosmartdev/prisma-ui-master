/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */

// Map lifecycle events
export const MAP_LOADED = 'Map/LOAD'; // handled in epic
export const SET_MAP_LOADED = 'Map/SET_LOADED'; // handled in reducer
export const MAP_WILL_UNLOAD = 'Map/UNLOAD';
export const CREATE_MAP = 'Map/CREATE'; // handled in reducer

// CRUD operations for map style
/**
 * Sets the base map style. This is the style the generated style will use as a base for computing
 * sources.
 */
export const SET_MAP_STYLE = 'Map/Style/SET';
/**
 * Sets the generated map style. This is the style that is actually sent to the
 * map component.
 */
export const SET_GENERATED_MAP_STYLE = 'Map/Style/SET_GENERATED';
/**
 * Request for an update to the map style.
 */
export const REQUEST_UPDATE_MAP_STYLE = 'Map/Style/REQUEST_UPDATE';

// Change styles of a specific layer (per map!)
export const SET_LAYER_VISIBILE = 'Map/Style/Layer/SET_VISIBLE';
export const SET_LAYER_HIDDEN = 'Map/Style/Layer/SET_HIDDEN';
export const SET_LAYER_VISIBILITY = 'Map/Style/Layer/SET_VISIBILITY';

// Map Movement
export const FLY_TO = 'Map/FLY_TO';

// Change map mode
export const SET_MAP_MODE = 'Map/Mode/SET';
