import { mockStore } from '../common';
import * as incidentActions from 'incident/incident';
import deepFreeze from 'deep-freeze';

describe('incident/incident', () => {
  let mockServer = null;
  let defaultState = {};

  const emptyIncidents = {
    incidents: {
      incidents: [],
    },
  };

  describe('[thunk] updateIncident', () => {
    beforeEach(() => {
      mockServer = jest.fn().mockImplementation(() => {
        return {};
      });
      defaultState = {
        server: mockServer,
        ...emptyIncidents,
      };
    });

    const incident = { id: '1', incidentId: 'incident' };
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      mockServer.put = jest.fn(() => Promise.resolve(incident));
      mockServer.get = jest.fn(() => Promise.resolve({}));

      return store.dispatch(incidentActions.updateIncident(incident)).then(response => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toHaveBeenCalledWith('/incident/1', incident);
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/auth/audit/incident', {
          action: 'CREATE,UPDATE,CLOSE,ASSIGN,UNASSIGN',
          objectId: '1',
        });

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([incidentActions.updateIncidentSuccess(incident)]),
        );

        expect(response).toEqual(incident);
      });
    });

    it('on failure calls transaction failed to return error content', () => {
      const store = mockStore({ ...defaultState });
      const error = { statusText: 'failed' };

      mockServer.put = jest.fn(() => Promise.reject(error));
      mockServer.get = jest.fn();

      return store.dispatch(incidentActions.updateIncident(incident)).catch(response => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.get).not.toBeCalled();

        expect(response).toEqual(error);
      });
    });
  });

  describe('[reducer] incidents/update', () => {
    const incident = { id: '1', incidentId: 'incident' };

    it('adds incident if not already in the existing state', () => {
      const action = incidentActions.updateIncidentSuccess(incident);

      const state = { incidents: [] };
      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        incidents: [incident],
      });
    });

    it('replaces existing incident', () => {
      const action = incidentActions.updateIncidentSuccess({ id: '1', value: 2 });

      const state = {
        incidents: [{ id: 'old' }, incident, { id: 'old2' }],
      };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        incidents: [{ id: 'old' }, { id: '1', value: 2 }, { id: 'old2' }],
      });
    });

    it('ignores null vaules', () => {
      const action = incidentActions.updateIncidentSuccess(null);

      const state = { incidents: [] };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({ incidents: [] });
    });

    it('ignores undefined vaules', () => {
      const action = incidentActions.updateIncidentSuccess(undefined);

      const state = { incidents: [] };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({ incidents: [] });
    });
  });
});
