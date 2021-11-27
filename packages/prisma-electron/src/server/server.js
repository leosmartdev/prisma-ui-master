import loglevel from 'loglevel';
import { URI } from 'swagger-router';

import Validator from 'server/validator';
import { getSession } from 'session/session';

const log = loglevel.getLogger('server');

const defaultConfig = {
  fetchOptions: {
    // Pass cookies to the server, including the authentication token
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  // SSL connection or not
  secure: true,
  useMock: false,
  validation: {
    enabled: true,
  },
  client: {},
  service: {},
  policy: {},
};

const validateFailed = {
  ok: false,
  status: 400,
  statusText: 'Bad Request',
};

const pathEndpointMap = {
  '/ws/': ['ws', 'tms'],
  '/ws/view/stream': ['ws', 'map'],
  '/auth/base': ['aaa', 'base'],
  '/auth/apidocs.json': ['aaa', 'swagger'],
  '/auth/session': ['aaa', 'session'],
  '/auth/pagination': ['aaa', 'pagination'],
  '/auth/audit': ['aaa', 'audit'],
  '/auth/role': ['aaa', 'role'],
  '/auth/user': ['aaa', 'user'],
  '/base': ['tms', 'base'],
  '/apidocs.json': ['tms', 'swagger'],
  '/api/v2/auth/session': ['aaa', 'session'],
  '/view': ['tms', 'map'],
  '/pagination': ['tms', 'pagination'],
  '/incident': ['tms', 'incident'],
  '/fleet': ['tms', 'fleet'],
  '/vessel': ['tms', 'vessel'],
};

class EndpointError {
  constructor(path) {
    this.path = path;
  }
}

/**
 * Server provides a light wrapper around fetch for
 * request/response interactions to the RESTful server.
 * It also will provide streaming API access in a future update.
 */
export default class Server {
  constructor(config) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    this.validator = new Validator(this, this.config.validation);
  }

  /**
   * Used in pagination via Link headers
   * @param path string
   * @param linkQuery string from Link header
   * @param params object
   * @returns string full url
   */
  buildPaginationUrl = (path, linkQuery, params = null) => {
    const endpoint = pathEndpointMap[path];
    if (endpoint == null) {
      loglevel.error(path);
      throw new EndpointError(path);
    }
    let fullPath = this.config.service[endpoint[0]][endpoint[1]] + linkQuery;

    if (params != null) {
      let paramsString = '';
      for (const param in params) {
        if (param && param !== '') {
          paramsString += '&';
          paramsString += `${param}=${params[param]}`;
        }
      }
      if (paramsString !== '') {
        fullPath += `${paramsString}`;
      }
    }
    return fullPath;
  };

  buildHttpUrl = (path, opts = {}) => {
    const uri = new URI(path, opts, true);
    let fullPath;
    const endpoint = pathEndpointMap[uri.toString({})];
    if (endpoint == null) {
      if (uri.toString({}).startsWith('/auth')) {
        fullPath = this.config.service.aaa.base;
      } else {
        fullPath = this.config.service.tms.base;
      }
      fullPath += uri.toString({});
    } else {
      fullPath = this.config.service[endpoint[0]][endpoint[1]];
      const { headers } = this.config.service[endpoint[0]];
      if (headers) {
        Object.assign(defaultConfig.fetchOptions.headers, headers);
      }
    }
    let paramsString = '';
    for (const param in opts.params) {
      if (param && param !== '') {
        if (paramsString !== '') {
          paramsString += '&';
        }
        paramsString += `${param}=${opts.params[param]}`;
      }
    }
    if (paramsString !== '') {
      fullPath += `?${paramsString}`;
    }
    return fullPath;
  };

  buildWsUrl(path) {
    let fullPath;
    const endpoint = pathEndpointMap[`/ws${path.toString()}`];
    if (endpoint == null) {
      throw new EndpointError(path.toString());
    } else {
      fullPath = this.config.service[endpoint[0]][endpoint[1]];
    }
    return fullPath;
  }

  fetch(path, params, fetchOptions, opts) {
    return new Promise((resolve, reject) => {
      const url = this.buildHttpUrl(path, { ...opts, params });

      // Combine any headers found in opts with the fetch function.
      // This allows users of the server to send in custom headers
      // if needed.
      let fetchOpts = {};
      if (fetchOptions) {
        fetchOpts = {
          ...fetchOptions,
          headers: {
            ...(fetchOptions.headers || {}),
            ...(opts.headers || {}),
          },
        };
      }

      log.trace(`Fetch ${path}`);
      log.trace(`Request ${url}`, fetchOpts);

      // Really for testing, we may provide the fetch function through the config
      // since node doesn't have fetch built in, and isomorphic-fetch fails in
      // the browser environment. So if we have provided an alternate function,
      // use it here. Otherwise, use the default browser fetch
      let fetchFunc = null;
      /* istanbul ignore else */
      if (this.config.fetch) {
        fetchFunc = this.config.fetch;
      } else {
        fetchFunc = fetch; // can't test this line 🙁
      }

      // TODO: response.error is deprecated in favor of the response
      // object itself containing the information provided from fetch.
      // Before it was {error: {}, data:{}} and success was data, but now
      // it should be {...response, data: {}} where data is the parsed json
      // or null.
      fetchFunc(url, fetchOpts).then(
        async response => {
          // 200 response
          if (response.ok) {
            log.trace(`Response ${response.status} ${response.statusText}`, response);

            try {
              // If the response is 204, then there is no body content so just resolve.
              if (response.status === 204) {
                resolve();
              } else {
                resolve(await response.json());
                // .then(json => resolve(json), error => reject(error));
              }
            } catch (error) {
              reject(error);
            }

            // 400 or 500 Response
          } else {
            if (response.status >= 500) {
              log.error(
                `Fetch ${path} failed: Response ${response.status} ${response.statusText}`,
                response,
              );
            } else {
              log.warn(
                `Fetch ${path} request failed: Response ${response.status} ${response.statusText}`,
                response,
              );
            }
            if (response.status === 403) {
              // store comes from app.js closure TODO refactor
              // eslint-disable-next-line no-undef
              store.dispatch(getSession());
              reject({
                ...Server.responseToObj(response),
                error: response,
                data: null,
              });
              return;
            }
            response.json().then(
              json => {
                Validator.localize(json);
                reject({
                  ...Server.responseToObj(response),
                  error: response,
                  data: json,
                });
              },
              error => {
                log.error(`Fetch ${path} failed: Could not parse json response`, error);
                reject({
                  ...Server.responseToObj(response),
                  error: response,
                  data: null,
                });
              },
            );
          }
          // All other failures
        },
        error => {
          log.error(`Fetch ${path} failed: Response`, error);
          if (error instanceof Error) {
            reject({ message: error.message, error, data: null });
          } else {
            reject({ ...error, error, data: null });
          }
        },
      );
    });
  }

  paginate(url, fetchFunc = fetch) {
    return new Promise((resolve, reject) => {
      const options = {
        ...this.config.fetchOptions,
        method: 'GET',
      };
      // TODO use a common fetch function, don't do something special here.
      fetchFunc(url, options).then(
        response => {
          // 200 response
          if (response.ok) {
            // Link header
            let next;
            let prev;
            const linkHeader = response.headers.get('Link');
            if (linkHeader) {
              const links = linkHeader.split(',');
              links.map(link => {
                const segments = link.split(';');
                if (segments.length > 1) {
                  let linkPart = segments[0].trim();
                  if (linkPart.startsWith('<') && linkPart.endsWith('>')) {
                    linkPart = linkPart.substring(1, linkPart.length - 1);
                  }
                  segments.map(segment => {
                    const rel = segment.trim().split('=');
                    if (rel.length > 1 && rel[0] === 'rel') {
                      let relValue = rel[1];
                      if (relValue.startsWith('"') && relValue.endsWith('"')) {
                        relValue = relValue.substring(1, relValue.length - 1);
                        if (relValue === 'next') {
                          next = linkPart;
                        } else if (relValue === 'previous') {
                          prev = linkPart;
                        }
                      }
                    }
                  });
                }
              });
            }
            // return json, url for next and prev
            response.json().then(json => resolve({ json, next, prev }), error => reject(error));
            // 400 or 500 Response
          } else {
            if (response.status >= 500) {
              log.error(
                `Fetch ${url} failed: Response ${response.status} ${response.statusText}`,
                response,
              );
            } else {
              log.warn(
                `Fetch ${url} request failed: Response ${response.status} ${response.statusText}`,
                response,
              );
            }
            if (response.status === 403) {
              // store comes from app.js closure TODO refactor
              // eslint-disable-next-line no-undef
              store.dispatch(getSession());
              reject({
                ...Server.responseToObj(response),
                error: response,
                data: null,
              });
              return;
            }
            response.json().then(
              json => {
                Validator.localize(json);
                reject({ error: response, data: json });
              },
              () => reject({ error: response, data: null }),
            );
          }
          // All other failures
        },
        error => {
          log.error(`Fetch ${url} failed: Response`, error);
          reject({ error, data: null });
        },
      );
    });
  }

  get(path, params = {}, opts = {}) {
    return this.fetch(
      path,
      params,
      {
        ...this.config.fetchOptions,
        method: 'GET',
      },
      opts,
    );
  }

  put(path, data, params = {}, opts = {}) {
    const errs = this.validator.validate(path, 'PUT', data);
    if (errs) {
      return Promise.reject({ ...validateFailed, error: validateFailed, data: errs });
    }
    return this.fetch(
      path,
      params,
      {
        ...this.config.fetchOptions,
        body: JSON.stringify(data),
        method: 'PUT',
      },
      opts,
    );
  }

  post(path, data, params = {}, opts = {}) {
    const errs = this.validator.validate(path, 'POST', data);
    if (errs) {
      return Promise.reject({ ...validateFailed, error: validateFailed, data: errs });
    }
    return this.fetch(
      path,
      params,
      {
        ...this.config.fetchOptions,
        body: JSON.stringify(data),
        method: 'POST',
      },
      opts,
    );
  }

  delete(path, params = {}, opts = {}) {
    return this.fetch(
      path,
      params,
      {
        ...this.config.fetchOptions,
        method: 'DELETE',
      },
      opts,
    );
  }

  socket(path, data) {
    const socket = new WebSocket(this.buildWsUrl(path));
    if (data) {
      socket.onopen = () => {
        socket.send(JSON.stringify(data));
      };
    }
    return socket;
  }

  /*
    delete(path, params={}) {
    } */

  postMultipart(path, file, params = {}, opts = {}) {
    const fetchOptions = {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    };
    const formData = new FormData();
    formData.append('file', file);
    return this.fetch(
      path,
      params,
      {
        ...fetchOptions,
        body: formData,
        method: 'POST',
      },
      opts,
    );
  }

  /**
   * Converts the Response object returned from fetch
   * and converts it to a primitive object.
   * This allows the spread operator (...obj) to work
   * on Responses.
   *
   * Copies properties defined here, except for those
   * implemented by Body:
   * https://developer.mozilla.org/en-US/docs/Web/API/Response
   */
  static responseToObj(response) {
    return {
      ok: response.ok,
      headers: response.headers,
      redirected: response.redirected,
      status: response.status,
      statusText: response.statusText,
      type: response.type,
      url: response.url,
      useFinalURL: response.useFinalURL,
      bodyUsed: response.bodyUsed,
    };
  }
}
