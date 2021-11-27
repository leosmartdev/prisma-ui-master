import * as incidentActions from 'incident/incident';

export const types = {
  NOTE: 'NOTE',
  FILE: 'NOTE_FILE',
  ENTITY: 'ENTITY',
  TRACK: 'TRACK',
  MARKER: 'MARKER',
  ACTION_OPEN: 'ACTION_OPEN',
  ACTION_CLOSE: 'ACTION_CLOSE',
  ACTION_REOPEN: 'ACTION_REOPEN',
  ACTION_TRANSFER_RECEIVE: 'ACTION_TRANSFER_RECEIVE',
  ACTION_TRANSFER_SEND: 'ACTION_TRANSFER_SEND',
  ACTION_TRANSFER_FAIL: 'ACTION_TRANSFER_FAIL',
};

/** *************************************
 * Thunks
 ************************************* */
export const createLogEntry = (incident, logEntry) => (dispatch, getState) => {
  const server = getState().server;

  return new Promise((resolve, reject) => {
    server.post(`/incident/${incident.id}/log`, logEntry).then(
      response => {
        dispatch(incidentActions.getIncidentSuccess(response));
        resolve(response);
      },
      error => {
        reject(error);
      },
    );
  });
};

export const updateLogEntry = (incident, logEntry) => (dispatch, getState) => {
  const server = getState().server;

  return new Promise((resolve, reject) => {
    server.put(`/incident/${incident.id}/log/${logEntry.id}`, logEntry).then(
      response => {
        dispatch(incidentActions.getIncidentSuccess(response));
        resolve(response);
      },
      error => {
        reject(error);
      },
    );
  });
};

export const deleteLogEntry = (incident, logEntry) => (dispatch, getState) => {
  const server = getState().server;

  return new Promise((resolve, reject) => {
    server.delete(`/incident/${incident.id}/log/${logEntry.id}`).then(
      response => {
        dispatch(incidentActions.getIncidentSuccess(response));
        resolve(response);
      },
      error => {
        reject(error);
      },
    );
  });
};

// wrapped in a thunks object for testing.
export const thunks = {
  createLogEntry,
  deleteLogEntry,
};

export function createTrackLogEntry(incident, trackId, trackType) {
  const logEntry = {
    type: types.TRACK,
    entity: {
      id: trackId,
      type: trackType,
    },
  };

  return thunks.createLogEntry(incident, logEntry);
}

export function createMarkerLogEntry(incident, markerId, markerType) {
  const logEntry = {
    type: types.MARKER,
    entity: {
      id: markerId,
      type: markerType,
    },
  };

  return thunks.createLogEntry(incident, logEntry);
}