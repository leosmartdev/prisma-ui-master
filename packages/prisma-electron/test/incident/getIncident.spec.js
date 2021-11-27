import { mockStore } from '../common';
import * as incidentActions from 'incident/incident';
import getMulticastForIncidentEpic from 'incident/forward-incident';
import deepFreeze from 'deep-freeze';

describe('incident/incident', () => {
  let mockServer = null;
  let defaultState = {};

  const emptyIncidents = {
    incidents: {
      incidents: [],
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

  describe('[thunk] listIncident', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const incidents = [{ id: '1' }, { id: '2' }, { id: '3' }];

      mockServer.get = jest.fn(() => Promise.resolve(incidents));

      return store.dispatch(incidentActions.listIncidents()).then(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/incident');

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([incidentActions.listIncidentsSuccess(incidents)]),
        );

        expect(response).toEqual(incidents);
      });
    });

    it('on failure calls transaction failed to return error content', () => {
      const store = mockStore({ ...defaultState });

      const error = { statusText: 'failed' };
      mockServer.get = jest.fn(() => Promise.reject(error));

      return store.dispatch(incidentActions.listIncidents()).catch(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/incident');

        expect(response).toEqual(error);
      });
    });
  });

  describe('[thunk] getIncident', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const incident = { id: '1' };
      const auditParams = {
        action: 'CREATE,UPDATE,CLOSE,ASSIGN,UNASSIGN',
        objectId: '1',
      };
      const incidentParams = { id: '1', deleted: false }
      mockServer.get = jest.fn(url => Promise.resolve('/incident/1' === url ? incident : []));

      return store.dispatch(incidentActions.getIncident('1')).then(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(2);
        expect(mockServer.get).toHaveBeenNthCalledWith(1, '/incident/1', {});
        expect(mockServer.get).toHaveBeenLastCalledWith('/auth/audit/incident', auditParams);

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([incidentActions.getIncidentSuccess(incident)]),
        );

        expect(response).toEqual(incident);
      });
    });

    it('on failure calls transaction failed to return error content', () => {
      const store = mockStore({ ...defaultState });

      const error = { statusText: 'failed' };

      mockServer.get = jest.fn(() => Promise.reject(error));

      return store.dispatch(incidentActions.getIncident('1')).catch(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/incident/1', {});

        expect(response).toEqual(error);
      });
    });
  });

  describe('[reducer] incidents/list', () => {
    it('adds the array to the state', () => {
      const action = incidentActions.listIncidentsSuccess([{ id: '1' }, { id: '2' }, { id: '3' }]);

      const state = { incidents: [] };
      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        incidents: [{ id: '1' }, { id: '2' }, { id: '3' }],
      });
    });

    it('ignores null values', () => {
      const action = incidentActions.listIncidentsSuccess(null);

      const state = { incidents: [] };
      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual(state);
    });

    it('ignores undefined values', () => {
      const action = incidentActions.listIncidentsSuccess(undefined);

      const state = { incidents: [] };
      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual(state);
    });
  });

  describe('[reducer] incidents/get', () => {
    it('adds the new incident to the state', () => {
      const action = incidentActions.getIncidentSuccess({ id: 'new' });

      const state = { incidents: [] };
      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        incidents: [{ id: 'new' }],
      });
    });

    it('appends the new incident to existing state', () => {
      const action = incidentActions.getIncidentSuccess({ id: 'new' });

      const state = {
        incidents: [{ id: 'old' }, { id: 'old2' }],
      };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        incidents: [{ id: 'old' }, { id: 'old2' }, { id: 'new' }],
      });
    });

    it('replaces existing incident if ID matches', () => {
      const action = incidentActions.getIncidentSuccess({ id: 'new', value: 2 });

      const state = {
        incidents: [{ id: 'old' }, { id: 'new', value: 1 }, { id: 'old2' }],
      };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({
        incidents: [{ id: 'old' }, { id: 'new', value: 2 }, { id: 'old2' }],
      });
    });

    it('ignores null vaules', () => {
      const action = incidentActions.getIncidentSuccess(null);

      const state = { incidents: [] };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({ incidents: [] });
    });

    it('ignores undefined vaules', () => {
      const action = incidentActions.getIncidentSuccess(undefined);

      const state = { incidents: [] };

      deepFreeze(state);

      const newState = incidentActions.reducer(state, action);

      expect(newState).toEqual({ incidents: [] });
    });
  });

  it('intializes correctly', () => {
    const store = {
      addReducer: jest.fn(),
      addEpic: jest.fn(),
    };

    incidentActions.init(store);

    expect(store.addReducer).toBeCalledTimes(1);
    expect(store.addReducer).toBeCalledWith('incidents', incidentActions.reducer);
    expect(store.addEpic).toBeCalledTimes(1);
    expect(store.addEpic).toBeCalledWith(getMulticastForIncidentEpic);
  });
});
