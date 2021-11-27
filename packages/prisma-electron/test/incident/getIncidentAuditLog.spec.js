import { mockStore } from '../common';
import * as incidentActions from 'incident/incident';
import deepFreeze from 'deep-freeze';

describe('incident/incident', () => {
  let mockServer = null;
  let defaultState = {};

  const emptyIncidents = {
    incidents: {
      auditRecordsMap: {},
    },
  };

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
      ...emptyIncidents,
    };
  });

  describe('[thunk] getIncidentAuditLog', () => {
    const auditRecordsMap = {
      1: { id: '1' },
    };

    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const params = {
        action: 'CREATE,UPDATE,CLOSE,ASSIGN,UNASSIGN',
      };

      mockServer.get = jest.fn(() => Promise.resolve(auditRecordsMap));

      return store.dispatch(incidentActions.getIncidentAuditLog()).then(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/auth/audit/incident', params);

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([incidentActions.getIncidentAuditLogSuccess(auditRecordsMap)]),
        );

        expect(response).toEqual(auditRecordsMap);
      });
    });

    it('on failure calls transaction failed to return error content', () => {
      const store = mockStore({ ...defaultState });

      const error = { statusText: 'failed' };

      mockServer.get = jest.fn(() => Promise.reject(error));

      return store.dispatch(incidentActions.getIncidentAuditLog()).catch(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);

        expect(response).toEqual(error);
      });
    });

    it('accepts incidentId param', () => {
      const store = mockStore({ ...defaultState });

      const params = {
        action: 'CREATE,UPDATE,CLOSE,ASSIGN,UNASSIGN',
        objectId: 'incidentId',
      };

      mockServer.get = jest.fn(() => Promise.resolve(auditRecordsMap));

      return store.dispatch(incidentActions.getIncidentAuditLog('incidentId')).then(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/auth/audit/incident', params);

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([incidentActions.getIncidentAuditLogSuccess(auditRecordsMap)]),
        );

        expect(response).toEqual(auditRecordsMap);
      });
    });

    it('returns audit log from store if found', () => {
      const records = {
        1: { id: 'record1', incidentId: '1' },
      };

      const store = mockStore({
        ...defaultState,
        incidents: {
          auditRecordsMap: {
            ...records,
          },
        },
      });

      mockServer.get = jest.fn(() => Promise.resolve());

      return store.dispatch(incidentActions.getIncidentAuditLog('1')).then(response => {
        expect(mockServer.get).not.toHaveBeenCalled();

        expect(response).toEqual(records['1']);
      });
    });

    it('queries server even if found in state when force=true', () => {
      const store = mockStore({
        ...defaultState,
        incidents: {
          auditRecordsMap: {
            1: { id: 'record1', incidentId: '1' },
          },
        },
      });

      const newRecords = {
        1: { id: 'record2', incidentId: '1' },
      };

      mockServer.get = jest.fn(() => Promise.resolve(newRecords));

      return store.dispatch(incidentActions.getIncidentAuditLog('1', true)).then(response => {
        expect(mockServer.get).toHaveBeenCalled();

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([incidentActions.getIncidentAuditLogSuccess(newRecords)]),
        );

        expect(response).toEqual(newRecords);
      });
    });
  });

  describe('[reducer] incidents/audit/get', () => {
    const auditRecord = { id: '1', objectId: 'incident' };

    it('adds records if not already in the existing state', () => {
      const action = incidentActions.getIncidentAuditLogSuccess([auditRecord]);

      const state = { auditRecordsMap: {} };
      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        auditRecordsMap: {
          incident: [auditRecord],
        },
      });
    });

    it('replaces existing records', () => {
      const action = incidentActions.getIncidentAuditLogSuccess([auditRecord]);

      const state = {
        auditRecordsMap: {
          incident: [{ id: 'old', objectId: 'incident' }],
        },
      };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        auditRecordsMap: {
          incident: [auditRecord],
        },
      });
    });

    it('adds multiple records to incident record list', () => {
      const auditRecord2 = { id: '2', objectId: 'incident' };
      const action = incidentActions.getIncidentAuditLogSuccess([auditRecord, auditRecord2]);

      const state = { auditRecordsMap: {} };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        auditRecordsMap: {
          incident: [auditRecord, auditRecord2],
        },
      });
    });

    it('doesnt erase existing records not found in the update', () => {
      const auditRecord2 = { id: '6', objectId: '2' };
      const action = incidentActions.getIncidentAuditLogSuccess([auditRecord, auditRecord2]);

      const state = {
        auditRecordsMap: {
          'Incident OLD': [{ id: '35', objectId: 'Incident OLD' }],
        },
      };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        auditRecordsMap: {
          'Incident OLD': [{ id: '35', objectId: 'Incident OLD' }],
          incident: [auditRecord],
          2: [auditRecord2],
        },
      });
    });

    it('ignores null vaules', () => {
      const action = incidentActions.getIncidentAuditLogSuccess(null);

      const state = { auditRecordsMap: {} };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({ auditRecordsMap: {} });
    });

    it('ignores undefined vaules', () => {
      const action = incidentActions.getIncidentAuditLogSuccess(undefined);

      const state = { auditRecordsMap: {} };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({ auditRecordsMap: {} });
    });

    it('ignores objects without objectId', () => {
      const action = incidentActions.getIncidentAuditLogSuccess([{ id: '1' }]);

      const state = { auditRecordsMap: {} };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({ auditRecordsMap: {} });
    });
  });
});
