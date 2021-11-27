import reducer, { init, registerDevice, getMulticastsForDevice } from 'fleet/device';
import { mockStore } from '../common';

describe('fleet/device', () => {
  let mockServer = null;
  let defaultState = {};

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {
        get: jest.fn(),
        post: jest.fn(),
      };
    });
    defaultState = {
      server: mockServer,
    };
  });

  describe('[thunk] registerDevice()', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const vesselId = 'vessel1';
      const device = {
        deviceId: 'foo',
      };

      const response = {
        id: 'device1',
        deviceId: 'foo',
      };

      mockServer.post = jest.fn(() => Promise.resolve(response));

      return store.dispatch(registerDevice(vesselId, device)).then(newDevice => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(
          '/device/vessel/vessel1',
          device,
          undefined,
          {},
        );
        expect(newDevice).toEqual(response);
      });
    });

    it('rejects with error from server when server promise rejects', () => {
      const store = mockStore({ ...defaultState });

      const vesselId = 'vessel1';
      const device = {
        deviceId: 'foo',
      };

      const response = {
        error: {
          status: 400,
          message: 'ERROR',
        },
      };

      mockServer.post = jest.fn(() => Promise.reject(response));

      return store.dispatch(registerDevice(vesselId, device)).catch(error => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(
          '/device/vessel/vessel1',
          device,
          undefined,
          {},
        );
        expect(error).toEqual(response);
      });
    });
  });

  describe('[thunk] getMulticastsForDevice(deviceId)', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const deviceId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

      const response = [
        {
          id: '1234',
          destinations: [
            {
              type: 'prisma.tms.moc.Device',
              id: deviceId,
            },
          ],
          payload: {
            '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
            positionReportingInterval: 5,
            action: 1,
          },
          transmissions: [
            {
              id: '5ac2540ad680055aba1ab01a',
              messageId: '1270',
              destination: {
                type: 'prisma.tms.moc.Device',
                id: deviceId,
              },
              packets: [
                {
                  name: 'SetPositionReportingInterval',
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

      return store.dispatch(getMulticastsForDevice(deviceId)).then(multicasts => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith(
          '/multicast/device/9ecbc1dcde93f2ca2f0f3454bf4473e4',
          undefined,
          {},
        );
        expect(multicasts.length).toBe(1);
        expect(multicasts[0]).toEqual(response[0]);
      });
    });

    it('rejects with error from server when server promise rejects', () => {
      const store = mockStore({ ...defaultState });

      const deviceId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';
      const response = [
        {
          property: 'payload[0].id',
          rule: 'NotFound',
          message: 'Device with ID not found',
        },
      ];

      mockServer.get = jest.fn(() => Promise.reject(response));

      return store.dispatch(getMulticastsForDevice(deviceId)).catch(error => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith(
          '/multicast/device/9ecbc1dcde93f2ca2f0f3454bf4473e4',
          undefined,
          {},
        );
        expect(error).toEqual(response);
      });
    });

    it('dispatches Multicast/GET:success when successfully created on the server', () => {
      const store = mockStore({ ...defaultState });

      const deviceId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';
      const response = [
        {
          id: '1234',
          destinations: [
            {
              type: 'prisma.tms.moc.Device',
              id: deviceId,
            },
          ],
          payload: {
            '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
            positionReportingInterval: 5,
            action: 1,
          },
          transmissions: [
            {
              id: '5ac2540ad680055aba1ab01a',
              messageId: '1270',
              destination: {
                type: 'prisma.tms.moc.Device',
                id: deviceId,
              },
              packets: [
                {
                  name: 'SetPositionReportingInterval',
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

      return store.dispatch(getMulticastsForDevice(deviceId)).then(multicast => {
        const actions = store.getActions();
        // 1 Action should have been dispatched
        expect(actions.length).toBe(1);
        expect(actions[0]).toEqual({ type: 'Multicast/GET:success', payload: response[0] });
      });
    });

    it('doesnt dispatch Multicast/GET:success when rejected by the server', () => {
      const store = mockStore({ ...defaultState });

      const deviceId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';
      const response = [
        {
          property: 'payload[0].id',
          rule: 'NotFound',
          message: 'Device with ID not found',
        },
      ];

      mockServer.get = jest.fn(() => Promise.reject(response));

      return store.dispatch(getMulticastsForDevice(deviceId)).catch(multicast => {
        const actions = store.getActions();
        expect(actions.length).toBe(0);
      });
    });

    it('passed completed GET param to get call', () => {
      const store = mockStore({ ...defaultState });

      const incidentId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';
      const deviceId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';
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
              type: 'prisma.tms.moc.Device',
              id: deviceId,
            },
          ],
          payload: {
            '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
            positionReportingInterval: 5,
            action: 1,
          },
          transmissions: [
            {
              id: '5ac2540ad680055aba1ab01a',
              messageId: '1270',
              destination: {
                type: 'prisma.tms.moc.Device',
                id: deviceId,
              },
              packets: [
                {
                  name: 'SetPositionReportingInterval',
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

      return store.dispatch(getMulticastsForDevice(deviceId, params)).then(multicasts => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith(
          '/multicast/device/9ecbc1dcde93f2ca2f0f3454bf4473e4',
          { completed: true },
          { params: { completed: true } },
        );
      });
    });
  });
});
