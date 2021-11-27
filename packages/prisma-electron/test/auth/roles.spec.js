import * as redux from 'auth/roles';
import { mockStore } from '../common';
import deepFreeze from 'deep-freeze';

describe('auth/roles', () => {
  let mockServer = null;
  let defaultState = {};

  const emptyIncidents = {
    incidents: {
      incidents: [],
      auditRecordsMap: {},
    },
  };

  beforeEach(() => {
    // server = new Server({ validation: { enabled: false } });
    mockServer = jest.fn().mockImplementation(() => {
      return {
        get: jest.fn(),
      };
    });
    defaultState = {
      server: mockServer,
      ...emptyIncidents,
    };
  });

  describe('[thunk] getAllRoles()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });
      // response from the server, right now this is mock data
      const response = [{ id: 'role1' }, { id: 'role2' }, { id: 'role3' }];

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(redux.getAllRoles()).then(newRoles => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get.mock.calls[0][0]).toEqual('/auth/role');
        expect(newRoles).toEqual(response);
      });
    });

    it('rejects with error from server when server promise rejects', () => {
      const store = mockStore({ ...defaultState });
      // response from the server, right now this is mock data
      const response = {
        error: {
          status: 400,
          message: 'ERROR',
        },
      };

      mockServer.get = jest.fn(() => Promise.reject(response));

      return store.dispatch(redux.getAllRoles()).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get.mock.calls[0][0]).toEqual('/auth/role');
        expect(error).toEqual(response);
      });
    });
  });

  describe('[thunk] auth/roles/getUserByRole', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const role = 'Role';
      const response = [{ userId: 'user1' }, { userId: 'user2' }, { userId: 'user3' }];

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(redux.thunks.getUsersByRole(role)).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get.mock.calls[0][0]).toEqual(`/auth/role/${role}/user`);

        const actions = store.getActions();
        expect(actions.length).toBe(1);
        expect(actions[0]).toMatchObject({
          type: 'auth/roles/getUsers:success',
          payload: { role, users: response },
        });
      });
    });

    it('on failure dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const role = 'Role';
      const response = { error: { statusText: 'failed' } };

      mockServer.get = jest.fn(() => Promise.reject(response));

      return store.dispatch(redux.thunks.getUsersByRole(role)).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get.mock.calls[0][0]).toEqual(`/auth/role/${role}/user`);

        const actions = store.getActions();
        expect(actions.length).toBe(0);
        expect(error).toEqual(response);
      });
    });
  });

  describe('[thunk] getIncidentManagers()', () => {
    it('calls get users by role with role=IncidentManager', () => {
      redux.thunks.getUsersByRole = jest.fn();
      const dispatch = jest.fn();

      redux.getIncidentManagers()(dispatch);

      expect(redux.thunks.getUsersByRole).toHaveBeenCalledTimes(1);
      expect(redux.thunks.getUsersByRole.mock.calls[0][0]).toEqual('IncidentManager');

      expect(dispatch).toBeCalledTimes(1);
    });
  });

  describe('[reducer] getAllRolesSuccess()', () => {
    it('stores roles', () => {
      const roles = [{ id: 'Role1' }, { id: 'Role2' }];
      const action = redux.getAllRolesSuccess(roles);

      const state = {
        roles: [],
      };

      deepFreeze(state);

      const newState = redux.reducer(state, action);

      expect(newState).toEqual({
        roles,
      });
    });

    it('replaces list with new roles', () => {
      const roles = [{ id: 'Role2' }];
      const action = redux.getAllRolesSuccess(roles);

      const state = {
        roles: [{ id: 'Role1' }],
      };

      deepFreeze(state);

      const newState = redux.reducer(state, action);

      expect(newState).toEqual({
        roles: [{ id: 'Role2' }],
      });
    });

    it('replaces existing roles when IDs Match', () => {
      const roles = [{ id: 'Role1' }, { id: 'Role2', value: 'value' }];
      const action = redux.getAllRolesSuccess(roles);

      const state = {
        roles: [{ id: 'Role2' }],
      };

      deepFreeze(state);

      const newState = redux.reducer(state, action);

      expect(newState).toEqual({
        roles: [{ id: 'Role1' }, { id: 'Role2', value: 'value' }],
      });
    });
  });

  describe('[reducer] getUsersByRoleSuccess()', () => {
    it('stores users under the correct role key', () => {
      const role = 'IncidentManager';
      const users = [{ userId: 'User1' }, { userId: 'User2' }];

      const action = redux.getUsersByRoleSuccess(role, users);

      const state = {
        usersByRole: {},
      };

      deepFreeze(state);

      const newState = redux.reducer(state, action);

      expect(newState).toEqual({
        usersByRole: {
          IncidentManager: [...users],
        },
      });
    });

    it('replaces list with new users', () => {
      const role = 'IncidentManager';
      const users = [{ userId: 'User2' }];

      const action = redux.getUsersByRoleSuccess(role, users);

      const state = {
        usersByRole: {
          IncidentManager: [{ userId: 'User1' }],
        },
      };

      deepFreeze(state);

      const newState = redux.reducer(state, action);

      expect(newState).toEqual({
        usersByRole: {
          IncidentManager: [{ userId: 'User2' }],
        },
      });
    });

    it('Doest effect other roles', () => {
      const role = 'IncidentManager';
      const users = [{ userId: 'User1' }, { userId: 'User2' }];

      const action = redux.getUsersByRoleSuccess(role, users);

      const state = {
        roles: [{ id: 'OtherRole' }],
        usersByRole: {
          OtherRole: [{ userId: 'User3' }],
        },
      };

      deepFreeze(state);

      const newState = redux.reducer(state, action);

      expect(newState).toEqual({
        roles: [{ id: 'OtherRole' }],
        usersByRole: {
          OtherRole: [{ userId: 'User3' }],
          IncidentManager: [...users],
        },
      });
    });
  });

  it('intializes correctly', () => {
    const store = {
      addReducer: jest.fn(),
    };

    redux.init(store);

    expect(store.addReducer).toBeCalledTimes(1);
    expect(store.addReducer).toBeCalledWith('roles', redux.reducer);
  });
});
