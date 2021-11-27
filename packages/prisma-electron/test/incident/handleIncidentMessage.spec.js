import * as redux from 'incident/incident';
import { mockStore } from '../common';

describe('incident/incident', () => {
  let mockServer = null;
  let defaultState = {};

  const auditParams = {
    action: 'CREATE,UPDATE,CLOSE,ASSIGN,UNASSIGN',
    objectId: 'ID',
  };

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
    };
  });

  describe('[thunk] handleIncidentMessage', () => {
    it('handles Incident/UPDATE', () => {
      const store = mockStore({
        ...defaultState,
        incidents: [{ id: 'ID' }],
      });

      const updated = {
        id: 'ID',
        value: 'HELLO WORLD',
      };

      mockServer.get = jest.fn(url =>
        Promise.resolve(url === '/auth/audit/incident' ? [] : updated),
      );

      return store
        .dispatch(redux.handleIncidentMessage('incident/update', { id: 'ID' }))
        .then(response => {
          expect(mockServer.get).toHaveBeenCalledTimes(2);
          expect(mockServer.get).toHaveBeenNthCalledWith(1, `/incident/${updated.id}`, {});
          expect(mockServer.get).toHaveBeenLastCalledWith('/auth/audit/incident', auditParams);

          const actions = store.getActions();
          expect(actions.length).toBe(2);
          expect(actions[0]).toMatchObject({ type: 'incident/get:success', payload: updated });

          expect(response).toEqual(updated);
        });
    });

    it('handles Incident/CREATE', () => {
      const store = mockStore({
        ...defaultState,
        incidents: [],
      });

      const updated = {
        id: 'ID',
        value: 'HELLO WORLD',
      };

      mockServer.get = jest.fn(url =>
        Promise.resolve(url === '/auth/audit/incident' ? [] : updated),
      );

      return store
        .dispatch(redux.handleIncidentMessage('Incident/CREATE', { id: 'ID' }))
        .then(response => {
          expect(mockServer.get).toHaveBeenCalledTimes(2);
          expect(mockServer.get).toHaveBeenNthCalledWith(1, `/incident/${updated.id}`, {});
          expect(mockServer.get).toHaveBeenLastCalledWith('/auth/audit/incident', auditParams);

          const actions = store.getActions();
          expect(actions.length).toBe(2);
          expect(actions[0]).toMatchObject({ type: 'incident/get:success', payload: updated });

          expect(response).toEqual(updated);
        });
    });
  });
});
