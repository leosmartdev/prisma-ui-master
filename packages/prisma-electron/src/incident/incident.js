import { createAction, handleActions } from 'redux-actions';
import loglevel from 'loglevel';

import { upsert } from 'lib/list';
import { acknowledgeForTarget } from 'notices/notices';
import { init as forwardIncidentInit } from './forward-incident';

const log = loglevel.getLogger('incidents');

// Action Types
const LIST_INCIDENTS = 'incident/list';
const UPDATE_INCIDENT = 'incident/update';
const CREATE_INCIDENT = 'incident/create';
const GET_INCIDENT = 'incident/get';
const GET_INCIDENT_AUDIT_LOG = 'incident/audit/get';

/** *************************************
 * Thunks
 ************************************* */

/* eslint-disable implicit-arrow-linebreak */
export const handleIncidentMessage = (actionType, incident) => dispatch =>
  dispatch(getIncidentThunk(incident.id));
/* eslint-enable implicit-arrow-linebreak */

function createIncidentThunk(incident) {
  return (dispatch, getState) => {
    const state = getState();
    const server = state.server;

    return new Promise((resolve, reject) => {
      server.post('/incident/', incident).then(
        json => {
          dispatch(getIncidentAuditLog(json.id, true)).catch(() => {});
          dispatch(createIncidentSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

function listIncidentsThunk() {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.get('/incident').then(
        json => {
          log.info('Got Incidents', json);
          dispatch(listIncidentsSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

function getIncidentThunk(id, deleted) {
  let params = {}
  if (deleted) {
    params.deleted = true
  }
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.get(`/incident/${id}`, params).then(
        json => {
          log.info('Got Incident', json);
          dispatch(getIncidentSuccess(json));
          dispatch(getIncidentAuditLog(json.id, true)).catch(() => {});
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

function updateIncidentThunk(incident) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.put(`/incident/${incident.id}`, incident).then(
        json => {
          dispatch(updateIncidentSuccess(json));
          dispatch(getIncidentAuditLog(incident.id, true)).catch(() => {});
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

/**
 * Assigns the incident to the provided user. assignmentType specifies if the assignment is general
 * or a specific type of assignment, IE, SAR Mission Controller.
 *
 * @param {object} incident The incident we are modifying
 * @param {object} user The user account object we are assigning
 * @param {string} assignmentType The property we are assigning, `assignee` or `commander` Defaults
 *                                to assignee.
 */
const assignIncidentToUserThunk = (
  incident,
  user,
  assignmentType = 'assignee',
) => async dispatch => {
  const updatedIncident = {
    ...incident,
    [assignmentType]: user.userId,
  };

  try {
    const updated = await dispatch(updateIncident(updatedIncident));
    dispatch(acknowledgeForTarget(updated.id));
    return updated;
  } catch (error) {
    throw error;
  }
};

function getIncidentAuditLogThunk(incidentId, forceUpdate = false, all = false) {
  return (dispatch, getState) => {
    const state = getState();
    const server = state.server;

    if (forceUpdate || !{}.hasOwnProperty.call(state.incidents.auditRecordsMap, incidentId)) {
      const params = {};
      if (!all) {
        params.action = 'CREATE,UPDATE,CLOSE,ASSIGN,UNASSIGN'
      };

      if (incidentId) {
        params.objectId = incidentId;
      }
      return new Promise((resolve, reject) => {
        server.get('/auth/audit/incident', params).then(
          auditRecords => {
            dispatch(getIncidentAuditLogSuccess(auditRecords));
            resolve(auditRecords);
          },
          error => {
            reject(error);
          },
        );
      });
    }
    // we already have the record and weren't forced to update
    return Promise.resolve(state.incidents.auditRecordsMap[incidentId]);
  };
}

/** *************************************
 * Action Creators
 ************************************* */
// List Incidents
export const listIncidents = listIncidentsThunk;
export const listIncidentsSuccess = createAction(
  `${LIST_INCIDENTS}:success`,
  incidents => incidents,
);
// Get Incidents
export const getIncident = getIncidentThunk;
export const getIncidentSuccess = createAction(`${GET_INCIDENT}:success`, incident => incident);
// Create Incidents
export const createIncident = createIncidentThunk;
export const createIncidentSuccess = createAction(
  `${CREATE_INCIDENT}:success`,
  incident => incident,
);
// Update Incidents
export const updateIncident = updateIncidentThunk;
export const updateIncidentSuccess = createAction(
  `${UPDATE_INCIDENT}:success`,
  incident => incident,
);
export const assignIncidentToUser = assignIncidentToUserThunk;
// Audit Logs
export const getIncidentAuditLog = getIncidentAuditLogThunk;
export const getIncidentAuditLogSuccess = createAction(
  `${GET_INCIDENT_AUDIT_LOG}:success`,
  auditRecordMap => auditRecordMap,
);

/** *************************************
 * Reducers
 ************************************* */
const initialState = {
  incidents: [],
  auditRecordsMap: {},
};

const actionMap = {
  /*
   * List
   */
  [listIncidentsSuccess]: (state, action) => ({
    ...state,
    incidents: action.payload || state.incidents,
  }),

  /*
   * Get Incident
   */
  [getIncidentSuccess]: (state, action) => ({
    ...state,
    incidents: upsert(state.incidents, action.payload),
  }),

  /*
   * Create Incident
   */
  [createIncidentSuccess]: (state, action) => ({
    ...state,
    incidents: [...state.incidents, action.payload],
  }),

  /*
   * Update Incident
   */
  [updateIncidentSuccess]: (state, action) => ({
    ...state,
    incidents: upsert(state.incidents, action.payload),
  }),

  /*
   * Audit Log
   */
  [getIncidentAuditLogSuccess]: (state, action) => {
    let newRecords = {};

    if (action.payload) {
      newRecords = action.payload.reduce((recordMap, record) => {
        if (record.objectId) {
          if (!{}.hasOwnProperty.call(recordMap, record.objectId)) {
            recordMap[record.objectId] = [record];
          } else {
            recordMap[record.objectId].push(record);
          }
        }

        return recordMap;
      }, {});
    }

    return {
      ...state,
      auditRecordsMap: {
        ...state.auditRecordsMap,
        ...newRecords,
      },
    };
  },
};

export const reducer = handleActions(
  {
    ...actionMap,
  },
  initialState,
);

export const init = store => {
  store.addReducer('incidents', reducer);
  forwardIncidentInit(store);
  // add epics here
};
