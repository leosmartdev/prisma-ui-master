import loglevel from 'loglevel';
import Server from 'server/server';

// Turn off logs for server
const log = loglevel.getLogger('server');
log.setLevel('silent');

describe('server/server Server()', () => {
  const responseData = [
    {
      message: 'Required non-empty property',
      property: 'name',
      rule: 'Required',
    },
  ];

  const successResponseData = {
    id: 'TEST',
    name: 'FOO',
  };

  const failureResponse = {
    json: jest.fn(() => Promise.resolve(responseData)),
    body: '', // binary
    bodyUsed: true,
    headers: {},
    ok: false,
    redirected: false,
    status: 400,
    statusText: 'Bad Request',
    type: 'cors',
    url: 'http://localhost:8080/api/v2/incident/59e61cf677f94b105f7fcf5b',
  };

  const successResponse = {
    json: jest.fn(() => Promise.resolve(successResponseData)),
    body: '', // binary
    bodyUsed: true,
    headers: {},
    ok: true,
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'cors',
    url: 'http://localhost:8080/api/v2/incident/59e61cf677f94b105f7fcf5b',
  };

  const successResponseNoContent = {
    json: jest.fn(() => Promise.reject('Failed to parse json. Unexpected end of string.')),
    body: '', // binary
    bodyUsed: false,
    headers: {},
    ok: true,
    redirected: false,
    status: 204,
    statusText: 'No Content',
    type: 'cors',
    url: 'http://localhost:8080/api/v2/incident/59e61cf677f94b105f7fcf5b',
  };

  class Response {
    constructor(failureResponse) {
      this.failureResponse = failureResponse;
    }

    get status() {
      return this.failureResponse.status;
    }

    get statusText() {
      return this.failureResponse.statusText;
    }

    get json() {
      return this.failureResponse.json;
    }

    get ok() {
      return this.failureResponse.ok;
    }
  }

  let server = null;
  let fetchStub = jest.fn();

  beforeEach(() => {
    server = new Server({ fetch: fetchStub, validation: { enabled: false } });
  });

  afterEach(() => {
    fetchStub.mockClear();
  });

  describe('.constructor()', () => {
    it('Sets config values when passed as arguments', () => {
      const newServer = new Server({ useMock: true, validation: { enabled: false } });

      expect(newServer.config.validation.enabled).toBe(false);
      expect(newServer.config.useMock).toBe(true);
    });
  });

  describe('.buildHttpUrl()', () => {
    it('calls endpoint map', () => {
      server = new Server({
        service: { tms: { base: 'https://test.com' } },
        validation: { enabled: false },
      });
      const path = '/base';
      const opts = { opts: true };
      const full = server.buildHttpUrl(path, opts);
      expect(full).toBe('https://test.com');
    });

    it('appends params to the url when provided', () => {
      server = new Server({
        service: { tms: { base: 'https://test.com' } },
        validation: { enabled: false },
      });
      const path = '/test';
      const opts = { params: { param1: 'TEST', param2: 'ME' } };
      const full = server.buildHttpUrl(path, opts);
      expect(full).toBe('https://test.com/test?param1=TEST&param2=ME');
    });
  });

  describe('.buildWsUrl()', () => {
    it('calls buildWsUrl with the correct parameters', () => {
      server = new Server({
        service: { ws: { tms: 'wss://ws/' } },
        validation: { enabled: false },
      });
      const path = '/';
      const opts = { opts: true };
      const full = server.buildWsUrl(path, opts);
      expect(full).toBe('wss://ws/');
    });
  });

  describe('.paginate()', () => {
    it('calls paginate() with the correct parameters', async done => {
      const link =
        '</api/v2/auth/user?limit=20&before=a0>; rel="previous",</api/v2/auth/user?limit=20&after=im7>; rel="next"';
      successResponse.headers.get = () => {
        return link;
      };

      server.fetch = jest.fn(() => Promise.resolve(successResponse));
      try {
        const response = await server.paginate('/', server.fetch);
        expect(server.fetch).toHaveBeenCalledTimes(1);
        expect(server.fetch).toHaveBeenCalledWith('/', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: 'GET',
        });
        expect(response.prev).toBe('/api/v2/auth/user?limit=20&before=a0');
      } catch (error) {
        done.fail(error);
      }
      done();
    });
  });

  describe('.fetch()', () => {
    it('responds with json data when fetch succeeds', () => {
      server.buildHttpUrl = jest.fn(() => 'http://test');

      const response = new Response(successResponse);

      fetchStub.mockImplementationOnce(() => Promise.resolve(response));

      return server.fetch('/url/test', {}).then(data => {
        expect(data).toEqual(successResponseData);
      });
    });

    it('resolves fetch promise will undefined when status code is 204', () => {
      server.buildHttpUrl = jest.fn(() => 'http://test');

      const response = new Response(successResponseNoContent);

      fetchStub.mockImplementationOnce(() => Promise.resolve(response));

      return server.fetch('/url/test', {}).then(data => {
        expect(data).toBeFalsy();
      });
    });

    it('Responds with correct error structure when fetch itself fails', () => {
      server.buildHttpUrl = jest.fn(() => 'http://test');
      fetchStub.mockImplementationOnce(() => Promise.reject({ ok: false }));

      return server.fetch('/url/test', {}).catch(error => {
        expect(error).toEqual({ ok: false, error: { ok: false }, data: null });
      });
    });

    it('Responds with correct error structure when fetch itself fails with TypeError', () => {
      server.buildHttpUrl = jest.fn(() => 'http://test');
      const exception = new TypeError('message');
      fetchStub.mockImplementationOnce(() => Promise.reject(exception));

      return server.fetch('/url/test', {}).catch(error => {
        expect(error).toEqual({ message: 'message', error: exception, data: null });
      });
    });

    it('responds with correct response structure on 400 error', () => {
      server.buildHttpUrl = jest.fn(() => 'http://test');
      fetchStub.mockImplementationOnce(() => Promise.resolve(failureResponse));

      return server.fetch('/url/test', {}).catch(error => {
        expect(error.ok).toBe(false);
        expect(error.status).toBe(failureResponse.status);
        expect(error.statusText).toBe(failureResponse.statusText);
        expect(error.data).toEqual(responseData);
      });
    });

    it('responds with correct response structure on 500 error', () => {
      server.buildHttpUrl = jest.fn(() => 'http://test');
      fetchStub.mockImplementationOnce(() => Promise.resolve({ ...failureResponse, status: 500 }));

      return server.fetch('/url/test', {}).catch(error => {
        expect(error.ok).toBe(false);
        expect(error.status).toBe(500);
        expect(error.statusText).toBe(failureResponse.statusText);
        expect(error.data).toEqual(responseData);
      });
    });

    it('responds with correct response structure when json response parsing fails', () => {
      server.buildHttpUrl = jest.fn(() => 'http://test');
      fetchStub.mockImplementationOnce(() =>
        Promise.resolve({ ...failureResponse, json: jest.fn(() => Promise.reject('FAILED')) }),
      );

      return server.fetch('/url/test', {}).catch(error => {
        expect(error.ok).toBe(false);
        expect(error.status).toBe(failureResponse.status);
        expect(error.statusText).toBe(failureResponse.statusText);
        expect(error.data).toBe(null);
      });
    });

    it('responds with correct response structure on 400 error with Response as an instance', () => {
      server.buildHttpUrl = jest.fn(() => 'http://test');
      const response = new Response(failureResponse);
      fetchStub.mockImplementationOnce(() => Promise.resolve(response));

      return server.fetch('/url/test', {}).catch(error => {
        // Ok to be false
        expect(error.ok).toBe(false);
        // Status to be 400
        expect(error.status).toBe(400);
        expect(error.statusText).toBe(failureResponse.statusText);
        expect(error.error).toBe(response);
        expect(error.data).toEqual(responseData);
      });
    });

    it('passes headers added through the opts param to the underlying fetch call', () => {
      server.buildHttpUrl = jest.fn(() => 'http://test');
      const response = new Response(successResponse);
      const opts = {
        headers: {
          'x-dummy-header': 'TEST',
        },
      };

      const fetchOptions = {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
      };

      fetchStub.mockImplementationOnce(() => Promise.resolve(response));

      return server.fetch('/url/test', {}, fetchOptions, opts).then(() => {
        expect(fetchStub).toHaveBeenCalledTimes(1);
        expect(fetchStub).toHaveBeenCalledWith('http://test', {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
            'x-dummy-header': 'TEST',
          },
        });
      });
    });
  });

  describe('post', () => {
    it('Responds with the provided error object when fetch fails', () => {
      server.fetch = jest.fn(() => Promise.resolve(failureResponse));

      return server.post('/test', {}).catch(error => {
        expect(server.fetch).toHaveBeenCalledTimes(1);
        expect(error).toEqual(failureResponse);
      });
    });

    it('Responds with provided success when fetch succeeds', () => {
      server.fetch = jest.fn(() => Promise.resolve(successResponse));

      return server.post('/test', {}).then(response => {
        expect(server.fetch).toHaveBeenCalledTimes(1);

        expect(response).toEqual(successResponse);
      });
    });

    it('passes opts to internal fetch call', () => {
      const opts = {
        headers: {
          foo: 'bar',
        },
      };

      server.fetch = jest.fn(() => Promise.resolve(failureResponse));

      return server.post('/test', {}, {}, opts).catch(error => {
        expect(server.fetch).toHaveBeenCalledTimes(1);
        expect(server.fetch[0][0]).toEqual('/test');
        expect(server.fetch[0][1]).toEqual({});
        expect(server.fetch[0][2]).any(Object);
        expect(server.fetch[0][3]).toEqual(opts);
      });
    });
  });
});
