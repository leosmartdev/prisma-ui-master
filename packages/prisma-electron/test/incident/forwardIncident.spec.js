/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 *
 * These tests cover forwarding an incident using the multicast API. The thunks handle the creation
 * of the multicast, but not the follow up transmission updates. Those are handled by multicast
 * reducer tests.
 */
import { forwardIncidentToSite, getMulticastsForIncident } from 'incident/forward-incident';
import { mockStore } from '../common';

describe('[thunk] forwardIncidentToSite()', () => {
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

  it('resolves data from server when server promise resolves', () => {
    const store = mockStore({ ...defaultState });

    const siteId = '100';
    const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

    const request = {
      payload: {
        '@type': 'prisma.tms.moc.Incident',
        id: incidentId,
      },
    };

    const response = {
      id: '1234',
      destinations: [
        {
          type: 'prisma.tms.moc.Site',
          id: '100',
        },
      ],
      payload: {
        '@type': 'prisma.tms.moc.Incident',
        id: incidentId,
      },
      transmissions: [
        {
          id: '5ac2540ad680055aba1ab01a',
          messageId: '1270',
          destination: {
            type: 'prisma.tms.moc.Site',
            id: '100',
          },
          packets: [
            {
              name: 'log',
              state: 1,
              status: { code: 102 },
            },
          ],
          state: 1,
        },
      ],
    };

    mockServer.post = jest.fn(() => Promise.resolve(response));

    return store.dispatch(forwardIncidentToSite(incidentId, siteId)).then(multicast => {
      expect(mockServer.post).toHaveBeenCalledTimes(1);
      expect(mockServer.post).toHaveBeenCalledWith('/multicast/site/100', request, undefined, {});
      expect(multicast).toEqual(response);
    });
  });

  it('rejects with error from server when server promise rejects', () => {
    const store = mockStore({ ...defaultState });

    const siteId = '100';
    const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

    const request = {
      payload: {
        '@type': 'prisma.tms.moc.Incident',
        id: incidentId,
      },
    };

    const response = [
      {
        property: 'payload[0].id',
        rule: 'Required',
        message: 'Property is required',
      },
    ];

    mockServer.post = jest.fn(() => Promise.reject(response));

    return store.dispatch(forwardIncidentToSite(incidentId, siteId)).catch(error => {
      expect(mockServer.post).toHaveBeenCalledTimes(1);
      expect(mockServer.post).toHaveBeenCalledWith('/multicast/site/100', request, undefined, {});
      expect(error).toEqual(response);
    });
  });

  it('dispatches Multicast/GET:success when successfully created on the server', () => {
    const store = mockStore({ ...defaultState });

    const siteId = '100';
    const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

    const request = {
      payload: {
        '@type': 'prisma.tms.moc.Incident',
        id: incidentId,
      },
    };

    const response = {
      ...request,
      id: '1234',
    };

    mockServer.post = jest.fn(() => Promise.resolve(response));

    return store.dispatch(forwardIncidentToSite(incidentId, siteId)).then(multicast => {
      const actions = store.getActions();
      expect(actions.length).toBe(1);
      expect(actions[0]).toEqual({ type: 'Multicast/GET:success', payload: response });
    });
  });

  it('doesnt dispatch Multicast/GET:success when rejected by the server', () => {
    const store = mockStore({ ...defaultState });

    const siteId = '100';
    const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

    const request = {
      payload: {
        '@type': 'prisma.tms.moc.Incident',
        id: incidentId,
      },
    };

    const response = [
      {
        property: 'payload[0].id',
        rule: 'Required',
        message: 'Property is required',
      },
    ];

    mockServer.post = jest.fn(() => Promise.reject(response));

    return store.dispatch(forwardIncidentToSite(incidentId, siteId)).catch(multicast => {
      const actions = store.getActions();
      expect(actions.length).toBe(0);
    });
  });
});

describe('[thunk] getMulticastsForIncident()', () => {
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

  it('resolves data from server when server promise resolves', () => {
    const store = mockStore({ ...defaultState });

    const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

    const response = [
      {
        id: '1234',
        destinations: [
          {
            type: 'prisma.tms.moc.Site',
            id: '100',
          },
        ],
        payload: {
          '@type': 'prisma.tms.moc.Incident',
          id: incidentId,
        },
        transmissions: [
          {
            id: '5ac2540ad680055aba1ab01a',
            messageId: '1270',
            destination: {
              type: 'prisma.tms.moc.Site',
              id: '100',
            },
            packets: [
              {
                name: 'log',
                state: 1,
                status: { code: 102 },
              },
            ],
            state: 1,
          },
        ],
      },
    ];

    mockServer.get = jest.fn(() => Promise.resolve(response));

    return store.dispatch(getMulticastsForIncident(incidentId)).then(multicasts => {
      expect(mockServer.get).toHaveBeenCalledTimes(1);
      expect(mockServer.get).toHaveBeenCalledWith(
        '/multicast/incident/9ecbc1dcde93f2ca2f0f3454bf4473e4',
        undefined,
        {},
      );
      expect(multicasts.length).toBe(1);
      expect(multicasts[0]).toEqual(response[0]);
    });
  });

  it('rejects with error from server when server promise rejects', () => {
    const store = mockStore({ ...defaultState });

    const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

    const response = [
      {
        property: 'payload[0].id',
        rule: 'Required',
        message: 'Property is required',
      },
    ];

    mockServer.get = jest.fn(() => Promise.reject(response));

    return store.dispatch(getMulticastsForIncident(incidentId)).catch(error => {
      expect(mockServer.get).toHaveBeenCalledTimes(1);
      expect(mockServer.get).toHaveBeenCalledWith(
        '/multicast/incident/9ecbc1dcde93f2ca2f0f3454bf4473e4',
        undefined,
        {},
      );
      expect(error).toEqual(response);
    });
  });

  it('dispatches Multicast/GET:success when successfully created on the server', () => {
    const store = mockStore({ ...defaultState });

    const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';
    const response = [
      {
        id: '1234',
        destinations: [
          {
            type: 'prisma.tms.moc.Site',
            id: '100',
          },
        ],
        payload: {
          '@type': 'prisma.tms.moc.Incident',
          id: incidentId,
        },
        transmissions: [
          {
            id: '5ac2540ad680055aba1ab01a',
            messageId: '1270',
            destination: {
              type: 'prisma.tms.moc.Site',
              id: '100',
            },
            packets: [
              {
                name: 'log',
                state: 1,
                status: { code: 102 },
              },
            ],
            state: 1,
          },
        ],
      },
    ];

    mockServer.get = jest.fn(() => Promise.resolve(response));

    return store.dispatch(getMulticastsForIncident(incidentId)).then(multicast => {
      const actions = store.getActions();
      // 1 Action should have been dispatched
      expect(actions.length).toBe(1);
      expect(actions[0]).toEqual({ type: 'Multicast/GET:success', payload: response[0] });
    });
  });

  it('doesnt dispatch Multicast/GET:success when rejected by the server', () => {
    const store = mockStore({ ...defaultState });

    const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';
    const response = [
      {
        property: 'payload[0].id',
        rule: 'Required',
        message: 'Property is required',
      },
    ];

    mockServer.get = jest.fn(() => Promise.reject(response));

    return store.dispatch(getMulticastsForIncident(incidentId)).catch(multicast => {
      const actions = store.getActions();
      expect(actions.length).toBe(0);
    });
  });

  it('passed completed GET param to get call', () => {
    const store = mockStore({ ...defaultState });

    const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';
    const params = {
      params: {
        completed: true,
      },
    };

    const response = [
      {
        id: '1234',
        destinations: [
          {
            type: 'prisma.tms.moc.Site',
            id: '100',
          },
        ],
        payload: {
          '@type': 'prisma.tms.moc.Incident',
          id: incidentId,
        },
        transmissions: [
          {
            id: '5ac2540ad680055aba1ab01a',
            messageId: '1270',
            destination: {
              type: 'prisma.tms.moc.Site',
              id: '100',
            },
            packets: [
              {
                name: 'log',
                state: 1,
                status: { code: 102 },
              },
            ],
            state: 1,
          },
        ],
      },
    ];

    mockServer.get = jest.fn(() => Promise.resolve(response));

    return store.dispatch(getMulticastsForIncident(incidentId, params)).then(multicasts => {
      expect(mockServer.get).toHaveBeenCalledTimes(1);
      expect(mockServer.get).toHaveBeenCalledWith(
        '/multicast/incident/9ecbc1dcde93f2ca2f0f3454bf4473e4',
        { completed: true },
        params,
      );
    });
  });
});
