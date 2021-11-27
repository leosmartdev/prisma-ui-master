import reducer, {
  init,
  getFleets,
  getFleet,
  getPaged,
  searchFleets,
  createFleet,
  updateFleet,
  deleteFleet,
} from 'fleet/fleet';
import { mockStore } from '../common';

describe('fleet/fleet', () => {
  let mockServer = null;
  let defaultState = {};

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        buildHttpUrl: jest.fn(),
        paginate: jest.fn(),
      };
    });
    defaultState = {
      server: mockServer,
    };
  });

  describe('[thunk] getFleets()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = [{ id: 'fleet1' }, { id: 'fleet2' }, { id: 'fleet3' }];

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(getFleets()).then(fleets => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/fleet', undefined, {});
        expect(fleets).toEqual(response);
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

      return store.dispatch(getFleets()).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/fleet', undefined, {});
        expect(error).toEqual(response);
      });
    });

    it('passes options to the internal server call', () => {
      const store = mockStore({ ...defaultState });
      const path = '/fleet';
      const opts = {
        headers: {
          test: 'test',
        },
      };
      const response = [{ id: 'fleet1' }, { id: 'fleet2' }, { id: 'fleet3' }];

      mockServer.buildHttpUrl = jest.fn(() => Promise.resolve(path));
      mockServer.paginate = jest.fn(() => Promise.resolve(response));

      return store.dispatch(getPaged(path, opts)).then(() => {
        expect(mockServer.buildHttpUrl).toHaveBeenCalledTimes(1);
        expect(mockServer.buildHttpUrl).toHaveBeenCalledWith(path, opts);
        expect(mockServer.paginate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('[thunk] getFleet()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        id: 'fleet1',
      };

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(getFleet('fleet1')).then(fleet => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/fleet/fleet1', {}, undefined);
        expect(fleet).toEqual(response);
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

      return store.dispatch(getFleet('fleet1')).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/fleet/fleet1', {}, undefined);
        expect(error).toEqual(response);
      });
    });

    it('passes options to the internal server call', () => {
      const store = mockStore({ ...defaultState });
      const opts = {
        headers: {
          test: 'test',
        },
      };

      mockServer.get = jest.fn(() => Promise.resolve([]));

      return store.dispatch(getFleet('fleet1', opts)).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/fleet/fleet1', {}, opts);
      });
    });
  });

  describe('[thunk] searchFleets()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = [{ id: 'fleet1' }, { id: 'fleet2' }, { id: 'fleet3' }];
      const params = { query: 'foo' };

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(searchFleets('foo')).then(fleets => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get.mock.calls[0][0]).toEqual('/search/fleet');
        expect(mockServer.get.mock.calls[0][1]).toEqual(params);
        expect(fleets).toEqual(response);
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
      const params = { query: 'foo' };

      mockServer.get = jest.fn(() => Promise.reject(response));

      return store.dispatch(searchFleets('foo')).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/search/fleet', params, undefined);
        expect(error).toEqual(response);
      });
    });

    it('passes options to the internal server call', () => {
      const store = mockStore({ ...defaultState });
      const params = { query: 'foo' };
      const opts = {
        headers: {
          test: 'test',
        },
      };

      mockServer.get = jest.fn(() => Promise.resolve([]));

      return store.dispatch(searchFleets('foo', opts)).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/search/fleet', params, opts);
      });
    });

    it('accepts limit option and passes to fetch as GET parameter', () => {
      const store = mockStore({ ...defaultState });
      const opts = {
        limit: 5,
      };
      const params = { query: 'foo', limit: 5 };

      mockServer.get = jest.fn(() => Promise.resolve([]));

      return store.dispatch(searchFleets('foo', opts)).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/search/fleet', params, opts);
      });
    });

    it('when query is null param is not sent', () => {
      const store = mockStore({ ...defaultState });

      mockServer.get = jest.fn(() => Promise.resolve([]));

      return store.dispatch(searchFleets(null)).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/search/fleet', {}, undefined);
      });
    });
  });

  describe('[thunk] createFleet()', () => {
    const request = {
      name: 'fleet',
      description: 'fleet description',
    };

    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        id: 'fleet1',
        name: 'fleet',
        description: 'fleet description',
        vessels: [],
      };

      mockServer.post = jest.fn(() => Promise.resolve(response));

      return store.dispatch(createFleet(request)).then(fleet => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith('/fleet', request, {}, undefined);
        expect(fleet).toEqual(response);
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

      mockServer.post = jest.fn(() => Promise.resolve(response));

      return store.dispatch(createFleet(request)).catch(error => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith('/fleet', request, {}, undefined);
        expect(error).toEqual(response);
      });
    });

    it('passes options to the internal server call', () => {
      const store = mockStore({ ...defaultState });
      const opts = {
        headers: {
          test: 'test',
        },
      };

      mockServer.post = jest.fn(() => Promise.resolve([]));

      return store.dispatch(createFleet(request, opts)).then(() => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith('/fleet', request, {}, opts);
      });
    });
  });

  describe('[thunk] updateFleet()', () => {
    const request = {
      id: 'fleet1',
      name: 'fleet',
      description: 'fleet description',
    };

    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        id: 'fleet1',
        name: 'fleet',
        description: 'fleet description',
        vessels: [],
      };

      mockServer.put = jest.fn(() => Promise.resolve(response));

      return store.dispatch(updateFleet(request)).then(fleet => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toHaveBeenCalledWith('/fleet/fleet1', request, {}, undefined);
        expect(fleet).toEqual(response);
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

      mockServer.put = jest.fn(() => Promise.reject(response));

      return store.dispatch(updateFleet(request)).catch(error => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toHaveBeenCalledWith('/fleet/fleet1', request, {}, undefined);
        expect(error).toEqual(response);
      });
    });

    it('passes options to the internal server call', () => {
      const store = mockStore({ ...defaultState });
      const opts = {
        headers: {
          test: 'test',
        },
      };

      mockServer.put = jest.fn(() => Promise.resolve([]));

      return store.dispatch(updateFleet(request, opts)).then(() => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toHaveBeenCalledWith('/fleet/fleet1', request, {}, opts);
      });
    });
  });

  describe('[thunk] deleteFleet()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        id: 'fleet1',
        name: 'fleet',
        description: 'fleet description',
        vessels: [],
      };

      mockServer.delete = jest.fn(() => Promise.resolve(response));

      return store.dispatch(deleteFleet('fleet1')).then(fleet => {
        expect(mockServer.delete).toHaveBeenCalledTimes(1);
        expect(mockServer.delete).toHaveBeenCalledWith('/fleet/fleet1', {}, undefined);
        expect(fleet).toEqual(response);
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

      mockServer.delete = jest.fn(() => Promise.reject(response));

      return store.dispatch(deleteFleet('fleet1')).catch(error => {
        expect(mockServer.delete).toHaveBeenCalledTimes(1);
        expect(mockServer.delete).toHaveBeenCalledWith('/fleet/fleet1', {}, undefined);
        expect(error).toEqual(response);
      });
    });

    it('passes options to the internal server call', () => {
      const store = mockStore({ ...defaultState });
      const opts = {
        headers: {
          test: 'test',
        },
      };

      mockServer.delete = jest.fn(() => Promise.resolve([]));

      return store.dispatch(deleteFleet('fleet1', opts)).then(() => {
        expect(mockServer.delete).toHaveBeenCalledTimes(1);
        expect(mockServer.delete).toHaveBeenCalledWith('/fleet/fleet1', {}, opts);
      });
    });
  });
});

describe('fleet/fleet', () => {
  it('intializes correctly', () => {
    const store = {
      addReducer: jest.fn(),
    };

    init(store);

    expect(store.addReducer).toHaveBeenCalledTimes(1);
    expect(store.addReducer).toHaveBeenCalledWith('fleet', reducer);
  });
});
