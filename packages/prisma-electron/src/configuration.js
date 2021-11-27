/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Actions and reducers for handling configuration of the application.
 *
 * Primarily, this file is responsible for getting the configuration from the server and providing
 * the actions for dispatching a configuration object to the application when its updated or
 * initially received. This way, reducers can handle setting defaults based on the configuration
 * object.
 */
import { createAction } from 'redux-actions';

/**
 * Action Types
 */
export const CONFIGURATION_UPDATED = 'Configuration/UPDATED';

/**
 * Thunks
 */
 function updateConfigThunk(config) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.put('/config', config).then(
        json => {
          log.info('Updated Config', json);
          dispatch(configurationUpdated(json));
          resolve(json);
        },
        error => {
          reject(error);
        }
      );
    });
  };
}

/**
 * Actions
 */
export const configurationUpdated = createAction(
  CONFIGURATION_UPDATED,
  configuration => configuration,
);

export const updateConfig = updateConfigThunk;

/**
 * Reducers
 */
 export const actionMap = {
  [configurationUpdated]: (state, action) => ({
    ...state,
    ...action.payload,
  }),
};