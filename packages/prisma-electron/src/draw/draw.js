import { createAction, handleActions } from 'redux-actions';

const defaultState = {
  enabled: false,
  type: null,
  area: null,
  style: null,
  editable: true,
  measure: false,
  measureUnits: 'nauticalMiles',
  distance: undefined,
  bearing: undefined,
  edit: null,
  drawnGeometry: null,
  reset: false,
  activeDraw: false,
  interaction: null,
  radius: undefined,
  updatedByClient: 0,
};

export const enable = createAction('draw/enable');
export const disable = createAction('draw/disable');
export const updateStyle = createAction('draw/updateStyle');
export const updateRadius = createAction('draw/updateRadius');
export const setMeasureUnits = createAction('draw/setMeasureUnits');
export const updateMeasure = createAction('draw/updateMeasure');
export const clearMeasure = createAction('draw/clearMeasure');
export const setDrawnGeometry = createAction('draw/setDrawnGeometry');
export const updateByClient = createAction('draw/updateByClient');
export const reset = createAction('draw/reset');
export const clearReset = createAction('draw/clearReset');

export const reducer = handleActions(
  {
    [enable]: (state, action) => ({
      ...state,
      enabled: true,
      type: action.payload.type || 'LineString',
      editable: action.payload.editable,
      style: action.payload.style || 'checkered',
      measure: action.payload.measure || false,
      edit: action.payload.edit,
      drawnGeometry: null,
      activeDraw: action.payload.activeDraw,
      interaction: action.payload.interaction,
      area: action.payload.area,
    }),
    [disable]: state => ({
      ...state,
      enabled: false,
      type: null,
      editable: true,
      style: null,
      measure: false,
      distance: undefined,
      bearing: undefined,
      activeDraw: false,
      area: null,
      drawnGeometry: null,
      interaction: null,
    }),
    [setMeasureUnits]: (state, action) => ({
      ...state,
      measureUnits: action.payload,
    }),
    [updateStyle]: (state, action) => ({
      ...state,
      style: action.payload,
    }),
    [updateRadius]: (state, action) => ({
      ...state,
      radius: parseFloat(action.payload),
    }),
    [updateMeasure]: (state, action) => ({
      ...state,
      distance: action.payload.distance,
      bearing: action.payload.bearing,
    }),
    [clearMeasure]: state => ({
      ...state,
      distance: undefined,
      bearing: undefined,
    }),
    [setDrawnGeometry]: (state, action) => ({
      ...state,
      drawnGeometry: action.payload,
    }),
    [updateByClient]: state => ({
      ...state,
      updatedByClient: state.updatedByClient + 1,
    }),
    [reset]: state => ({
      ...state,
      reset: true,
      drawnGeometry: null,
      area: null,
    }),
    [clearReset]: state => ({
      ...state,
      reset: false,
    }),
  },
  defaultState,
);

export const init = store => {
  store.addReducer('draw', reducer);
};
