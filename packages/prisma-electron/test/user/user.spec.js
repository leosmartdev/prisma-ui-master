import reducer, { init, create, update, loadAll, load, updateState, remove } from 'auth/user';
import { mockStore } from '../common';

describe('auth/user', () => {
  let mockServer = null;
  let defaultState = {};
  // give the known mock data of one user
  let user = {
    userName: 'admin',
    userId: 'admin',
    profile: {
      lastName: 'admin',
      firstName: 'admin',
    },
    password: '12345',
    roles: ['Administrator'],
  };
  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
    };
  });

  describe('[thunk] createUser()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });
      // response from the server, right now this is mock data
      const response = {
        userId: 'admin',
        profile: {
          lastName: 'admin',
          firstName: 'admin',
        },
        roles: ['Administrator'],
      };

      mockServer.post = jest.fn(() => Promise.resolve(response));

      return store.dispatch(create(user)).then(newUser => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post.mock.calls[0][0]).toEqual('/auth/user');
        expect(mockServer.post.mock.calls[0][1]).toEqual(user);
        expect(newUser).toEqual(response);
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

      mockServer.post = jest.fn(() => Promise.reject(response));

      return store.dispatch(create(user)).catch(error => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post.mock.calls[0][0]).toEqual('/auth/user');
        expect(mockServer.post.mock.calls[0][1]).toEqual(user);
        expect(error).toEqual(response);
      });
    });
  });
});
