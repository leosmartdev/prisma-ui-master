import { mockStore } from '../common';
import * as searchActions from 'search/search';

describe('search/search', () => {
  let mockServer = null;
  let defaultState = {};

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {
        get: jest.fn(),
      };
    });
    defaultState = {
      server: mockServer,
    };
  });

  describe('[thunk] search()', () => {
    it('calls correct server function', () => {
      const store = mockStore({ ...defaultState });

      const query = '5653';
      const url = '/search/registry';

      mockServer.get = jest.fn(() => Promise.resolve({}));

      return store.dispatch(searchActions.searchRegistry(query)).then(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith(url, { query });
        expect(response).toEqual({});
      });
    });

    it('passes limit through', () => {
      const store = mockStore({ ...defaultState });

      const query = '5653';
      const limit = 10;
      const url = '/search/registry';

      mockServer.get = jest.fn(() => Promise.resolve({}));

      return store.dispatch(searchActions.searchRegistry(query, limit)).then(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith(url, { query, limit });
        expect(response).toEqual({});
      });
    });

    it('returns error from server properly', () => {
      const store = mockStore({ ...defaultState });

      const query = '5653';
      const error = {
        error: {},
      };

      mockServer.get = jest.fn(() => Promise.reject(error));

      return store.dispatch(searchActions.searchRegistry(query)).catch(response => {
        expect(response).toEqual(error);
      });
    });

    it('returns empty list when query is null', () => {
      const store = mockStore({ ...defaultState });

      return store.dispatch(searchActions.searchRegistry(null)).then(response => {
        expect(response).toEqual([]);
      });
    });

    it('returns empty list when query is undefined', () => {
      const store = mockStore({ ...defaultState });

      return store.dispatch(searchActions.searchRegistry(undefined)).then(response => {
        expect(response).toEqual([]);
      });
    });
  });
});
