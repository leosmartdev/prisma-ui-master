import * as redux from 'incident/incident';
import { mockStore } from '../common';
import deepFreeze from 'deep-freeze';

describe('incident/incident', () => {
  let mockServer = null;
  let defaultState = {};

  const emptyIncidents = {
    incidents: {
      incidents: [],
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

  describe('[thunk] incident/create', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const newIncident = { id: '1', incidentId: 'test' };
      const auditRecordsMap = { 2: { id: '2' } };
      const auditGetArgs = [
        '/auth/audit/incident',
        { action: 'CREATE,UPDATE,CLOSE,ASSIGN,UNASSIGN', objectId: '1' },
      ];

      mockServer.post = jest.fn(() => Promise.resolve(newIncident));
      mockServer.get = jest.fn(() => Promise.resolve(auditRecordsMap));

      return store.dispatch(redux.createIncident({ incidentId: 'test' })).then(response => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith('/incident/', { incidentId: 'test' });
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith(...auditGetArgs);

        const actions = store.getActions();
        expect(actions.length).toBe(2);
        expect(actions[1]).toMatchObject({
          type: 'incident/audit/get:success',
          payload: auditRecordsMap,
        });
        expect(actions[0]).toMatchObject({ type: 'incident/create:success', payload: newIncident });

        expect(response).toEqual(newIncident);
      });
    });

    it('on create failure dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const error = { statusText: 'Error', code: 400 };

      mockServer.post = jest.fn(() => Promise.reject(error));
      mockServer.get = jest.fn();

      return store.dispatch(redux.createIncident({ incidentId: 'test' })).catch(response => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith('/incident/', { incidentId: 'test' });
        expect(mockServer.get).not.toBeCalled();

        expect(response).toEqual(error);
      });
    });

    it('on audit records failure should not effect incident create', () => {
      const store = mockStore({ ...defaultState });

      const newIncident = { id: '1', incidentId: 'test' };
      const error = { statusText: 'failed' };
      mockServer.post = jest.fn(() => Promise.resolve(newIncident));
      mockServer.get = jest.fn(() => Promise.reject(error));

      return store.dispatch(redux.createIncident({ incidentId: 'test' })).then(() => {
        const actions = store.getActions();
        expect(actions.length).toBe(1);
        expect(actions[0]).toMatchObject({ type: 'incident/create:success', payload: newIncident });
      });
    });
  });

  describe('[reducer] incident/create:success', () => {
    const action = redux.createIncidentSuccess({ id: 'Test', incidentId: 'Test Incident' });

    it('adds new incident to empty incidents list', () => {
      const state = { incidents: [] };
      deepFreeze(state);
      const newState = redux.reducer(state, action);

      expect(newState.incidents.length).toBe(1);
      expect(newState.incidents[0]).toEqual({ id: 'Test', incidentId: 'Test Incident' });
    });

    it('adds incident to the end of the list', () => {
      const state = {
        incidents: [{ id: 'Another Test', incidentId: 'Another Test Incident' }],
      };

      deepFreeze(state);
      const newState = redux.reducer(state, action);

      expect(newState).toEqual({
        incidents: [
          { id: 'Another Test', incidentId: 'Another Test Incident' },
          { id: 'Test', incidentId: 'Test Incident' },
        ],
      });
    });
  });
});
