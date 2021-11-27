import reducer, {
  init,
  setPositionReportingInterval,
  isMulticastPositionIntervalChange,
} from 'device/omnicom';
import { mockStore } from '../common';

describe('fleet/device', () => {
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

  describe('isMulticastPositionIntervalChange', () => {
    it('returns true when payload action is unit interval change', () => {
      const multicast = {
        payload: {
          '@type': 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration',
          configuration: {
            action: 1,
          },
        },
      };

      expect(isMulticastPositionIntervalChange(multicast)).toBe(true);
    });

    it('returns true when payload action is a string', () => {
      const multicast = {
        payload: {
          '@type': 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration',
          configuration: {
            action: 'UnitIntervalChange',
          },
        },
      };

      expect(isMulticastPositionIntervalChange(multicast)).toBe(true);
    });

    it('returns false when payload action is not unit interval change', () => {
      const multicast = {
        payload: {
          '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
          action: 3,
        },
      };

      expect(isMulticastPositionIntervalChange(multicast)).toBe(false);
    });

    it('returns false when payload type is not OmniCom', () => {
      const multicast = {
        payload: {
          '@type': 'type.googleapis.com/prisma.tms.moc.Device',
          action: 1,
        },
      };

      expect(isMulticastPositionIntervalChange(multicast)).toBe(false);
    });
  });

  describe('[thunk] setPositionReportingInterval', () => {
    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const deviceId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

      const request = {
        payload: {
          '@type': 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration',
          configuration: {
            '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
            positionReportingInterval: 5,
            action: 'UnitIntervalChange',
          },
        },
      };
      const response = {
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
      };

      mockServer.post = jest.fn(() => Promise.resolve(response));

      return store.dispatch(setPositionReportingInterval(deviceId, 5)).then(multicast => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(
          '/multicast/device/9ecbc1dcde93f2ca2f0f3454bf4473e4',
          request,
        );
        expect(multicast).toEqual(response);
      });
    });

    it('rejects with error from server when server promise rejects', () => {
      const store = mockStore({ ...defaultState });

      const deviceId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

      const request = {
        payload: {
          '@type': 'type.googleapis.com/prisma.tms.moc.DeviceConfiguration',
          configuration: {
            '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
            positionReportingInterval: 3,
            action: 'UnitIntervalChange',
          },
        },
      };

      const response = [
        {
          property: 'payload.positionReportingInterval',
          rule: 'OutOfRange',
          message: 'Value must be between 5 and 1440',
        },
      ];

      mockServer.post = jest.fn(() => Promise.reject(response));

      return store.dispatch(setPositionReportingInterval(deviceId, 3)).catch(error => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(
          '/multicast/device/9ecbc1dcde93f2ca2f0f3454bf4473e4',
          request,
        );
        expect(error).toEqual(response);
      });
    });

    it('dispatches Multicast/GET:success when successfully created on the server', () => {
      const store = mockStore({ ...defaultState });
      const deviceId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

      const request = {
        payload: {
          '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
          positionReportingInterval: 5,
          action: 1,
        },
      };

      const response = {
        ...request,
        id: '1234',
      };

      mockServer.post = jest.fn(() => Promise.resolve(response));

      return store.dispatch(setPositionReportingInterval(deviceId, 5)).then(multicast => {
        const actions = store.getActions();
        expect(actions.length).toBe(1);
        expect(actions[0]).toEqual({ type: 'Multicast/GET:success', payload: response });
      });
    });

    it('doesnt dispatch Multicast/GET:success when rejected by the server', () => {
      const store = mockStore({ ...defaultState });

      const deviceId = '9ecbc1dcde93f2ca2f0f3454bf4473e4';

      const request = {
        payload: {
          '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
          positionReportingInterval: 3,
          action: 1,
        },
      };

      const response = [
        {
          property: 'payload.positionReportingInterval',
          rule: 'OutOfRange',
          message: 'Value must be between 5 and 1440',
        },
      ];

      mockServer.post = jest.fn(() => Promise.reject(response));

      return store.dispatch(setPositionReportingInterval(deviceId, 3)).catch(multicast => {
        const actions = store.getActions();
        expect(actions.length).toBe(0);
      });
    });
  });
});
