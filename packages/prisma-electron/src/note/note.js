import { createAction, handleActions } from 'redux-actions';
import loglevel from 'loglevel';
import * as incidentActions from 'incident/incident';

const log = loglevel.getLogger('notes');

// Action Types
const INIT_CURRENTNOTE = 'note/initCurrentNote';
const CREATE_NOTE = 'note/create';
const LIST_NOTES = 'note/list';
const GET_NOTE = 'note/get';
const UPDATE_NOTE = 'note/update';
const ASSIGN_NOTE = 'note/assign';
const DETACH_NOTE = 'note/detach';
const DELETE_NOTE = 'note/delete';

/** *************************************
 * Thunks
 ************************************* */

function createNoteThunk(note) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.post('/note', note).then(
        json => {
          log.info('Created Note', json);
          dispatch(createNoteSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        }
      );
    });
  };
}

function listNotesThunk() {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.get('/note').then(
        json => {
          log.info('Got Notes', json);
          dispatch(listNotesSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

function getNoteThunk(id, assigned) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.get(`/note/${id}/${assigned}`).then(
        json => {
          log.info('Got Note', json);
          dispatch(getNoteSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

function updateNoteThunk(assigned, incidentId, note) {
  return (dispatch, getState) => {
    const server = getState().server;
    let uri;

    if (assigned === true) {
      uri = `/incident/${incidentId}/log/${note.id}`;
    } else {
      uri = `/note/${note.id}`;
    }

    return new Promise((resolve, reject) => {
      server.put(uri, note).then(
        json => {
          log.info('Updated Note', json);
          let currentNote = json;

          // if the note is assigned one, the backend deletes the previous one and 
          // creates new one with new value
          if (assigned === true) {
            currentNote = json.log[json.log.length - 1];
          }

          dispatch(updateNoteSuccess(currentNote));
          resolve(json);
        },
        error => {
          reject(error);
        }
      );
    });
  };
}

function assignNoteThunk(noteId, incidentId) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.put(`/note/${noteId}/assignee/${incidentId}`).then(
        json => {
          log.info('Assigned Note', json);
          dispatch(assignNoteSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  }
}

function detachNoteThunk(incidentId, noteId, insideIncident = false) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.put(`/incident/${incidentId}/log-detach/${noteId}`).then(
        json => {
          log.info('Detached Note', json);

          /**
           * If the note is detaching in Incident detail panel,refresh the logEntry list
           * Else it means that the note is detaching in Note detail panel
           */
          if (insideIncident === true) {
            dispatch(incidentActions.getIncidentSuccess(json));
          } else {
            dispatch(detachNoteSuccess(json));
          }
          resolve(json);
        },
        error => {
          reject(error);
        }
      );
    });
  };
}

function deleteNoteThunk(assigned, noteId, incidentId) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      let uri;
      if (assigned === true) {
        uri = `/incident/${incidentId}/log/${noteId}`;
      } else {
        uri = `/note/${noteId}`;
      }

      server.delete(uri).then(
        json => {
          log.info('Deleted Note', json);
          dispatch(deleteNoteSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    })
  }
}

/** *************************************
 * Action Creators
 ************************************* */
// Init currentNote
export const initCurrentNote = createAction(`${INIT_CURRENTNOTE}`);
// Create Note
export const createNote = createNoteThunk;
export const createNoteSuccess = createAction(
  `${CREATE_NOTE}:success`,
  note => note,
);
// List Notes
export const listNotes = listNotesThunk;
export const listNotesSuccess = createAction(
  `${LIST_NOTES}:success`,
  notes => notes,
);
// Get Note
export const getNote = getNoteThunk;
export const getNoteSuccess = createAction(
  `${GET_NOTE}:success`,
  note => note,
);
// Update Note
export const updateNote = updateNoteThunk;
export const updateNoteSuccess = createAction(
  `${UPDATE_NOTE}:success`,
  note => note,
);
// Assign Note
export const assignNote = assignNoteThunk;
export const assignNoteSuccess = createAction(
  `${ASSIGN_NOTE}:success`,
  incident => incident,
);
// Detach Note
export const detachNote = detachNoteThunk;
export const detachNoteSuccess = createAction(
  `${DETACH_NOTE}:success`,
  note => note,
);
// Delete Note
export const deleteNote = deleteNoteThunk;
export const deleteNoteSuccess = createAction(
  `${DELETE_NOTE}:success`,
  note => note,
);

/** *************************************
 * Reducers
 ************************************* */
const initialState = {
  // List of all the notes
  notes: [],
  // An editing note
  currentNote: null,
};

const actionMap = {
  /** Initialize currentNote */
  [initCurrentNote]: (state, action) => ({
    ...state,
    currentNote: null,
  }),

  /** Create Note */
  [createNoteSuccess]: (state, action) => {
    let notes = Object.assign(state.notes);
    let currentNote = action.payload;

    notes.push(currentNote);

    return {
      ...state,
      notes,
      currentNote: {
        note: currentNote,
      },
    };
  },

  /** List Notes */
  [listNotesSuccess]: (state, action) => ({
    ...state,
    notes: action.payload || state.notes,
  }),

  /** Get Note */
  [getNoteSuccess]: (state, action) => ({
    ...state,
    currentNote: action.payload,
  }),

  /** Update Note */
  [updateNoteSuccess]: (state, action) => {
    let notes = state.notes;
    let currentNote = state.currentNote;
    let newNote = action.payload;
    let deleteIdx = notes.findIndex(elem =>
      elem.id === currentNote.note.id
    );

    if (deleteIdx !== -1) {
      notes.splice(deleteIdx, 1, newNote);
    }

    return {
      ...state,
      notes,
      currentNote: {
        note: newNote,
        incident: currentNote.incident,
      },
    };
  },

  /** Assign Note */
  [assignNoteSuccess]: (state, action) => {
    let notes = Object.assign(state.notes);
    let currentNote = state.currentNote;

    action.payload.log.forEach(logEntry => {
      if (logEntry.id === currentNote.note.id && logEntry.assigned === true) {
        notes.forEach(elem => {
          if (elem.id === currentNote.note.id) {
            elem.assigned = true;
          }
        });
      }
    });

    currentNote.note.assigned = true;
    currentNote.incident = action.payload;

    return {
      ...state,
      notes,
      currentNote: currentNote,
    };
  },

  /** Detach Note */
  [detachNoteSuccess]: (state, action) => {
    let notes = Object.assign(state.notes);
    let currentNote = state.currentNote;

    currentNote.note.assigned = false;
    delete currentNote.incident;

    return {
      ...state,
      notes,
      currentNote: currentNote,
    };
  },

  /** Delete Note */
  [deleteNoteSuccess]: (state, action) => {
    let notes = state.notes;
    let payload = action.payload;
    let deleteIdx = notes.findIndex(elem =>
      elem.id === payload.id && payload.deleted === true
    );

    if (deleteIdx !== -1) {
      notes.splice(deleteIdx, 1);
    }

    return {
      ...state,
      notes,
    }
  },
};

export const reducer = handleActions(
  {
    ...actionMap,
  },
  initialState,
);

export const init = store => {
  store.addReducer('notes', reducer);
  // add epics here
};
