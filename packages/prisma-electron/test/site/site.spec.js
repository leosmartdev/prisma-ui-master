import reducer, { init, getSites, getSite } from 'site/site';
import { mockStore } from '../common';

describe('site/site', () => {
  let mockServer = null;
  let defaultState = {};

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
    };
  });

  describe('[thunk] getSites()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = [
        {
          id: '0d1153c69b434efebdf4695d',
          type: 'MRCC',
          name: 'Chile',
          description:
            'General Directorate for Maritime Terrritory and Merchant Marine (DIRECTEMAR)',
          country: 'CHL',
          state: 'Active',
        },
      ];

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(getSites()).then(sites => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/site', undefined, {});
        expect(sites).toEqual(response);
      });
    });

    it('rejects with error from server when server promise rejects', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        error: {
          status: 400,
          message: 'ERROR',
        },
      };

      mockServer.get = jest.fn(() => Promise.reject(response));

      return store.dispatch(getSites()).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/site', undefined, {});
        expect(error).toEqual(response);
      });
    });
  });

  describe('[thunk] getSite(id)', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        id: '0d1153c69b434efebdf4695d',
        type: 'MRCC',
        name: 'Chile',
        description: 'General Directorate for Maritime Terrritory and Merchant Marine (DIRECTEMAR)',
        country: 'CHL',
        state: 'Active',
      };

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(getSite('0d1153c69b434efebdf4695d')).then(site => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith(
          '/site/0d1153c69b434efebdf4695d',
          undefined,
          {},
        );
        expect(site).toEqual(response);
      });
    });

    it('rejects with error from server when server promise rejects', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        error: {
          status: 400,
          message: 'ERROR',
        },
      };

      mockServer.get = jest.fn(() => Promise.reject(response));

      return store.dispatch(getSite('100')).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/site/100', undefined, {});
        expect(error).toEqual(response);
      });
    });
  });
});
