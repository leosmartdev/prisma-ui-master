import { createAction } from 'redux-actions';

import { ADD_HISTORY, CLEAR_HISTORY } from './types';

export const addHistoryFeature = createAction(ADD_HISTORY, feature => ({ feature }));
export const clearAllHistoryFeatures = createAction(CLEAR_HISTORY);
