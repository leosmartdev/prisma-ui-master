import reducer, {
  init,
  getVessels,
  searchVessels,
  updateVessel,
  createVessel,
  getVesselByImei,
} from 'fleet/vessel';
import { mockStore } from '../common';

describe('fleet/vessel', () => {
  let mockServer = null;
  let defaultState = {};

  const emptyState = {
    vessel: {
      vessels: [],
    },
  };

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
      ...emptyState,
    };
  });

  describe('[thunk] getVesselByImei()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = [{ id: 'vessel1' }];

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(getVesselByImei('123', { withFleet: true })).then(vessels => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith(
          '/vessel/fleet',
          { 'devices.networks.subscriberId': '123' },
          { params: { 'devices.networks.subscriberId': '123' }, withFleet: true },
        );
        expect(vessels).toEqual(response);
      });
    });
  });

  describe('[thunk] getVessels()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = [{ id: 'vessel1' }, { id: 'vessel2' }, { id: 'vessel3' }];

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(getVessels({ withFleet: true })).then(vessels => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/vessel/fleet', undefined, {
          withFleet: true,
        });
        expect(vessels).toEqual(response);
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

      return store.dispatch(getVessels()).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/vessel/fleet', undefined, {
          withFleet: true,
        });
        expect(error).toEqual(response);
      });
    });

    it('passes options to the internal server call', () => {
      const store = mockStore({ ...defaultState });
      const opts = {
        headers: {
          test: 'test',
        },
        params: {},
        withFleet: true,
      };

      mockServer.get = jest.fn(() => Promise.resolve([]));

      return store.dispatch(getVessels(opts)).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/vessel/fleet', {}, opts);
      });
    });
  });

  it('getting data without fleet information', () => {
    const store = mockStore({ ...defaultState });
    const opts = {
      headers: {
        test: 'test',
      },
      params: {},
      withFleet: false,
    };

    mockServer.get = jest.fn(() => Promise.resolve([]));

    return store.dispatch(getVessels(opts)).then(() => {
      expect(mockServer.get).toHaveBeenCalledTimes(1);
      expect(mockServer.get).toHaveBeenCalledWith('/vessel/', {}, opts);
    });
  });

  describe('[thunk] searchVessels()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = [{ id: 'vessel1' }, { id: 'vessel2' }, { id: 'vessel3' }];

      mockServer.get = jest.fn(() => Promise.resolve(response));

      return store.dispatch(searchVessels('foo')).then(vessels => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/search/vessel', { query: 'foo' }, undefined);
        expect(vessels).toEqual(response);
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

      return store.dispatch(searchVessels('foo')).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/search/vessel', { query: 'foo' }, undefined);
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

      return store.dispatch(searchVessels('foo', opts)).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/search/vessel', { query: 'foo' }, opts);
      });
    });

    it('accepts limit option and passes to fetch as GET parameter', () => {
      const store = mockStore({ ...defaultState });
      const opts = {
        limit: 5,
      };

      mockServer.get = jest.fn(() => Promise.resolve([]));

      return store.dispatch(searchVessels('foo', opts)).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith(
          '/search/vessel',
          { query: 'foo', limit: 5 },
          opts,
        );
      });
    });

    it('when query is null param is not sent', () => {
      const store = mockStore({ ...defaultState });

      mockServer.get = jest.fn(() => Promise.resolve([]));

      return store.dispatch(searchVessels(null)).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/search/vessel', {}, undefined);
      });
    });
  });

  describe('[thunk] updateVessel()', () => {
    const vessel = { id: 'vessel1', name: 'Vessel One' };

    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });
      const response = { id: 'vessel1', name: 'Vessel One' };

      mockServer.put = jest.fn(() => Promise.resolve(response));

      return store.dispatch(updateVessel(vessel)).then(updatedVessel => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toHaveBeenCalledWith('/vessel/vessel1', vessel, {}, undefined);
        expect(updatedVessel).toEqual(response);
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

      return store.dispatch(updateVessel(vessel)).catch(error => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toHaveBeenCalledWith('/vessel/vessel1', vessel, {}, undefined);
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

      return store.dispatch(updateVessel(vessel, opts)).then(() => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toHaveBeenCalledWith('/vessel/vessel1', vessel, {}, opts);
      });
    });
  });

  describe('[thunk] createVessel()', () => {
    const vessel = { id: 'vessel1', name: 'Vessel One' };

    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });
      const response = { id: 'vessel1', name: 'Vessel One' };

      mockServer.post = jest.fn(() => Promise.resolve(response));

      return store.dispatch(createVessel(vessel)).then(createdVessel => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith('/vessel', vessel, {}, undefined);
        expect(createdVessel).toEqual(response);
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

      mockServer.post = jest.fn(() => Promise.reject(response));

      return store.dispatch(createVessel(vessel)).catch(error => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith('/vessel', vessel, {}, undefined);
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

      return store.dispatch(createVessel(vessel, opts)).then(() => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith('/vessel', vessel, {}, opts);
      });
    });
  });
});

describe('fleet/vessel', () => {
  it('initializes correctly', () => {
    const store = {
      addReducer: jest.fn(),
    };

    init(store);

    expect(store.addReducer).toHaveBeenCalledWith('vessel', reducer);
  });
});
