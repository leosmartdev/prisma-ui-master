import reducer, {
  init,
  filterMulticastsByDestinationId,
  listMulticastSuccess,
  isTransmissionPending,
  isMulticastPending,
  didMulticastFail,
} from 'multicast/multicast';
import { mockStore } from '../common';
import deepFreeze from 'deep-freeze';

describe('multicast/multicast', () => {
  describe('Initializes with proper state and reducers', () => {
    it('intializes correctly', () => {
      const store = {
        addReducer: jest.fn(),
      };

      init(store);

      expect(store.addReducer).toHaveBeenCalledWith('multicasts', reducer);
    });
  });

  describe('isTransmissionPending()', () => {
    it('returns false when transmission state is Success', () => {
      const transmission = {
        id: 'foo',
        state: 'Success',
      };

      expect(isTransmissionPending(transmission)).toBe(false);
    });

    it('returns false when transmission state is Failed', () => {
      const transmission = {
        id: 'foo',
        state: 'Failure',
      };

      expect(isTransmissionPending(transmission)).toBe(false);
    });

    it('returns true when transmission state is Pending', () => {
      const transmission = {
        id: 'foo',
        state: 'Pending',
      };

      expect(isTransmissionPending(transmission)).toBe(true);
    });

    it('returns true when transmission state is Partial', () => {
      const transmission = {
        id: 'foo',
        state: 'Partial',
      };

      expect(isTransmissionPending(transmission)).toBe(true);
    });

    it('returns true when transmission state is Retry', () => {
      const transmission = {
        id: 'foo',
        state: 'Retry',
      };

      expect(isTransmissionPending(transmission)).toBe(true);
    });
  });

  describe('isMulticastPending()', () => {
    const multicast = {
      id: 'foo',
      transmissions: [],
    };

    it('Returns true when single child transmission is pending', () => {
      multicast.transmissions = [
        {
          state: 'Pending',
        },
      ];

      expect(isMulticastPending(multicast)).toBe(true);
    });

    it('Returns true when all child transmissions are pending', () => {
      multicast.transmissions = [
        {
          state: 'Pending',
        },
        {
          state: 'Retry',
        },
        {
          state: 'Partial',
        },
      ];

      expect(isMulticastPending(multicast)).toBe(true);
    });

    it('Returns false when one child transmission is complete', () => {
      multicast.transmissions = [
        {
          state: 'Success',
        },
      ];

      expect(isMulticastPending(multicast)).toBe(false);
    });

    it('Returns false when all child transmissions are complete', () => {
      multicast.transmissions = [
        {
          state: 'Success',
        },
        {
          state: 'Success',
        },
        {
          state: 'Failure',
        },
      ];

      expect(isMulticastPending(multicast)).toBe(false);
    });

    it('Returns true when some child transmissions are pending and some are complete', () => {
      multicast.transmissions = [
        {
          state: 'Success',
        },
        {
          state: 'Success',
        },
        {
          state: 'Failure',
        },
        {
          state: 'Pending',
        },
        {
          state: 'Partial',
        },
      ];

      expect(isMulticastPending(multicast)).toBe(true);
    });
  });

  describe('didMulticastFail`()', () => {
    const multicast = {
      id: 'foo',
      transmissions: [],
    };

    it('Returns true when single child transmission failed', () => {
      multicast.transmissions = [
        {
          state: 'Failure',
        },
      ];

      expect(didMulticastFail(multicast)).toBe(true);
    });

    it('Returns true when all child transmissions are failures', () => {
      multicast.transmissions = [
        {
          state: 'Failure',
        },
        {
          state: 'Failure',
        },
        {
          state: 'Failure',
        },
      ];

      expect(didMulticastFail(multicast)).toBe(true);
    });

    it('Returns false when one child transmission completed', () => {
      multicast.transmissions = [
        {
          state: 'Success',
        },
      ];

      expect(didMulticastFail(multicast)).toBe(false);
    });

    it('Returns false when all child transmissions are complete', () => {
      multicast.transmissions = [
        {
          state: 'Success',
        },
        {
          state: 'Success',
        },
        {
          state: 'Success',
        },
      ];

      expect(didMulticastFail(multicast)).toBe(false);
    });

    it('Returns true when some child transmissions are pending and at least one failed', () => {
      multicast.transmissions = [
        {
          state: 'Success',
        },
        {
          state: 'Pending',
        },
        {
          state: 'Failure',
        },
        {
          state: 'Pending',
        },
        {
          state: 'Partial',
        },
      ];

      expect(didMulticastFail(multicast)).toBe(true);
    });
  });

  describe('filterByDestinationId()', () => {
    it('returns all multicasts that have same destination id as input param', () => {
      const multicastMap = {
        '1': {
          id: '1',
          destinations: [
            {
              '@type': 'foo',
              id: '9',
            },
          ],
        },
        '2': {
          id: '2',
          destinations: [
            {
              '@type': 'foo',
              id: '9',
            },
          ],
        },
        '3': {
          id: '9',
          destinations: [
            {
              '@type': 'foo',
              id: '23',
            },
          ],
        },
      };

      const multicasts = filterMulticastsByDestinationId(multicastMap, '9');

      expect(multicasts.length).toBe(2);
      expect(multicasts[0].id).toBe('1');
      expect(multicasts[1].id).toBe('2');
    });

    it('returns empty list when none are found that match the id', () => {
      const multicastMap = {
        '1': {
          id: '1',
          destinations: [
            {
              '@type': 'foo',
              id: '9',
            },
          ],
        },
        '2': {
          id: '2',
          destinations: [
            {
              '@type': 'foo',
              id: '9',
            },
          ],
        },
        '3': {
          id: '9',
          destinations: [
            {
              '@type': 'foo',
              id: '23',
            },
          ],
        },
      };

      const multicasts = filterMulticastsByDestinationId(multicastMap, '456');

      expect(multicasts.length).toBe(0);
    });

    it('skips over multicasts that dont have a destination id property', () => {
      const multicastMap = {
        '1': {
          id: '1',
          destinations: [
            {
              '@type': 'foo',
              id: '9',
            },
          ],
        },
        '2': {
          id: '2',
          destinations: [
            {
              '@type': 'foo',
              bar: 'hello world',
            },
          ],
        },
        '3': {
          id: '9',
          destinations: [
            {
              '@type': 'foo',
              id: '23',
            },
          ],
        },
      };

      const multicasts = filterMulticastsByDestinationId(multicastMap, '23');

      expect(multicasts.length).toBe(1);
      expect(multicasts[0].id).toBe('9');
    });

    it('skips over multicasts that dont have a destination property', () => {
      const multicastMap = {
        '1': {
          id: '1',
          destinations: [
            {
              '@type': 'foo',
              id: '9',
            },
          ],
        },
        '2': {
          id: '2',
        },
        '3': {
          id: '9',
          destinations: [
            {
              '@type': 'foo',
              id: '23',
            },
          ],
        },
      };

      const multicasts = filterMulticastsByDestinationId(multicastMap, '23');

      expect(multicasts.length).toBe(1);
      expect(multicasts[0].id).toBe('9');
    });
  });

  describe('[thunk] listMulticastSuccess', () => {
    const multicasts = [
      {
        id: '1234',
        destinations: [
          {
            type: 'prisma.tms.moc.Device',
            id: '13',
          },
        ],
        payload: {
          '@type': 'prisma.tms.omnicom.OmnicomConfiguration',
          value: 'EAVQAQ==',
        },
        transmissions: [
          {
            id: '5ac2540ad680055aba1ab01a',
            messageId: '1270',
            destination: {
              type: 'prisma.tms.moc.Device',
              id: '13',
            },
            packets: [
              {
                name: 'Request Unit Interval Change',
                state: 1,
                status: { code: 102 },
              },
            ],
            state: 1,
          },
        ],
      },
      {
        id: '1235',
        destinations: [
          {
            type: 'prisma.tms.moc.Device',
            id: '14',
          },
        ],
        payload: {
          '@type': 'prisma.tms.omnicom.OmnicomConfiguration',
          value: 'EAVQAQ==',
        },
        transmissions: [
          {
            id: '6ac2540ad680055aba1ab01a',
            messageId: '1270',
            destination: {
              type: 'prisma.tms.moc.Device',
              id: '14',
            },
            packets: [
              {
                name: 'Request Unit Interval Change',
                state: 2,
                status: { code: 200 },
              },
            ],
            state: 1,
          },
        ],
      },
    ];

    it('dispatches getMulticastSuccess for each multicast', () => {
      const state = {};
      deepFreeze(state);
      const store = mockStore(state);

      store.dispatch(listMulticastSuccess(multicasts));

      const actions = store.getActions();
      // Expect 2 actions for each multicast
      expect(actions.length).toBe(2);
      expect(actions[0].type).toBe('Multicast/GET:success');
      expect(actions[1].type).toBe('Multicast/GET:success');
      expect(actions[0].payload).toBe(multicasts[0]);
      expect(actions[1].payload).toBe(multicasts[1]);
    });

    it('doesnt dispatch when no multicasts are in the list', () => {
      const state = {};
      deepFreeze(state);
      const store = mockStore(state);

      store.dispatch(listMulticastSuccess([]));

      const actions = store.getActions();
      // Expect no actions empty multicast array
      expect(actions.length).toBe(0);
    });
  });

  describe('Multicast/GET:success', () => {
    const pendingMulticast = {
      id: '1234',
      destinations: [
        {
          type: 'prisma.tms.moc.Device',
          id: '13',
        },
      ],
      payload: {
        '@type': 'prisma.tms.omnicom.OmnicomConfiguration',
        value: 'EAVQAQ==',
      },
      transmissions: [
        {
          id: '5ac2540ad680055aba1ab01a',
          messageId: '1270',
          destination: {
            type: 'prisma.tms.moc.Device',
            id: '13',
          },
          packets: [
            {
              name: 'Request Unit Interval Change',
              state: 1,
              status: { code: 102 },
            },
          ],
          state: 1,
        },
      ],
    };

    const finishedMulticast = {
      id: '1234',
      destinations: [
        {
          type: 'prisma.tms.moc.Device',
          id: '13',
        },
      ],
      payload: {
        '@type': 'prisma.tms.omnicom.OmnicomConfiguration',
        value: 'EAVQAQ==',
      },
      transmissions: [
        {
          id: '5ac2540ad680055aba1ab01a',
          messageId: '1270',
          destination: {
            type: 'prisma.tms.moc.Device',
            id: '13',
          },
          packets: [
            {
              name: 'Request Unit Interval Change',
              state: 2,
              status: { code: 200 },
            },
          ],
          state: 1,
        },
      ],
    };

    it('initial state is correct', () => {
      const action = {
        type: 'initial',
        payload: null,
      };

      const state = {};
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({});
    });

    it('adds multicast to empty multicast state', () => {
      const action = {
        type: 'Multicast/GET:success',
        payload: { ...pendingMulticast },
      };

      const state = {};
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({
        '1234': { ...pendingMulticast },
      });
    });

    it('adds multicast without changing other multicasts', () => {
      const action = {
        type: 'Multicast/GET:success',
        payload: { ...pendingMulticast },
      };

      const state = {
        '12345': { ...pendingMulticast, id: '12345' },
      };
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({
        '12345': { ...pendingMulticast, id: '12345' },
        '1234': { ...pendingMulticast },
      });
    });

    it('updates multicast when multicast is already on the state', () => {
      const action = {
        type: 'Multicast/GET:success',
        payload: { ...finishedMulticast },
      };

      const state = {
        '1234': { ...pendingMulticast },
      };
      deepFreeze(state);

      const newState = reducer(state, action);
      expect(newState).toEqual({
        '1234': { ...finishedMulticast },
      });
    });

    /**
     * This covers the case where a transmission was received over the websocket for an unknown
     * multicast, then the multicast comes into the system. In that instance, the multicast needs
     * to update its information but the transmission data is considered newer and should replace
     * the recieved rest data. (websocket always pushes latest content, so can be considered the
     * primary data).
     *
     * TODO skipping this for now, it's an edge case for sure, and causing a lot of complication, so
     * lets see if its a real problem first.
     */
    xit('updates multicast with full data after a transmission for that multicast was recieved', () => {
      const action = {
        type: 'Multicast/GET:success',
        payload: { ...pendingMulticast },
      };

      const state = {
        '1234': {
          transmissions: [
            {
              id: '5ac2540ad680055aba1ab01a',
              messageId: '1270',
              destination: {
                type: 'prisma.tms.moc.Device',
                id: '13',
              },
              packets: [
                {
                  name: 'Request Unit Interval Change',
                  state: 2,
                  status: { code: 200 },
                },
              ],
              state: 1,
            },
          ],
        },
      };

      deepFreeze(state);

      const newState = reducer(state, action);
      expect(newState).toEqual({
        '1234': {
          ...pendingMulticast,
          transmissions: [
            {
              id: '5ac2540ad680055aba1ab01a',
              messageId: '1270',
              destination: {
                type: 'prisma.tms.moc.Device',
                id: '13',
              },
              packets: [
                {
                  name: 'Request Unit Interval Change',
                  state: 2,
                  status: { code: 200 },
                },
              ],
              state: 1,
            },
          ],
        },
      });
    });
  });

  describe('Multicast/UPDATE', () => {
    const pendingMulticast = {
      id: '1234',
      destinations: [
        {
          type: 'prisma.tms.moc.Device',
          id: '13',
        },
      ],
      payload: {
        '@type': 'prisma.tms.omnicom.OmnicomConfiguration',
        value: 'EAVQAQ==',
      },
      transmissions: [
        {
          id: '5ac2540ad680055aba1ab01a',
          messageId: '1270',
          destination: {
            type: 'prisma.tms.moc.Device',
            id: '13',
          },
          packets: [
            {
              name: 'Request Unit Interval Change',
              state: 1,
              status: { code: 102 },
            },
          ],
          state: 1,
        },
      ],
    };

    const finishedMulticast = {
      id: '1234',
      destinations: [
        {
          type: 'prisma.tms.moc.Device',
          id: '13',
        },
      ],
      payload: {
        '@type': 'prisma.tms.omnicom.OmnicomConfiguration',
        value: 'EAVQAQ==',
      },
      transmissions: [
        {
          id: '5ac2540ad680055aba1ab01a',
          messageId: '1270',
          destination: {
            type: 'prisma.tms.moc.Device',
            id: '13',
          },
          packets: [
            {
              name: 'Request Unit Interval Change',
              state: 2,
              status: { code: 200 },
            },
          ],
          state: 1,
        },
      ],
    };

    it('adds multicast to empty multicast state', () => {
      const action = {
        type: 'Multicast/UPDATE',
        payload: { ...pendingMulticast },
      };

      const state = {};
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({
        '1234': { ...pendingMulticast },
      });
    });

    it('adds multicast without changing other multicasts', () => {
      const action = {
        type: 'Multicast/UPDATE',
        payload: { ...pendingMulticast },
      };

      const state = {
        '12345': { ...pendingMulticast, id: '12345' },
      };
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({
        '12345': { ...pendingMulticast, id: '12345' },
        '1234': { ...pendingMulticast },
      });
    });

    it('updates multicast when multicast is already on the state', () => {
      const action = {
        type: 'Multicast/UPDATE',
        payload: { ...finishedMulticast },
      };

      const state = {
        '1234': { ...pendingMulticast },
      };
      deepFreeze(state);

      const newState = reducer(state, action);
      expect(newState).toEqual({
        '1234': { ...finishedMulticast },
      });
    });
  });

  describe('Transmission/UPDATE', () => {
    it('updates correct multicast transmission when a new transmission update comes in', () => {
      const action = {
        type: 'Transmission/UPDATE',
        payload: {
          id: '987',
          parentId: '12345',
          state: 2,
          status: {
            code: 200,
          },
        },
      };

      const state = {
        '12345': {
          id: '12345',
          transmissions: [
            {
              id: '987',
              parentId: '12345',
              state: 1,
            },
          ],
        },
      };
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({
        '12345': {
          id: '12345',
          transmissions: [
            {
              id: '987',
              parentId: '12345',
              state: 2,
              status: {
                code: 200,
              },
            },
          ],
        },
      });
    });

    it('doesnt error out when multicast doesnt exist', () => {
      const action = {
        type: 'Transmission/UPDATE',
        payload: {
          id: '987',
          parentId: '098765',
          state: 2,
          status: {
            code: 200,
          },
        },
      };

      const state = {
        '12345': {
          id: '12345',
          transmissions: [
            {
              id: '123',
              parentId: '12345',
              state: 1,
            },
          ],
        },
      };
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({
        '12345': {
          id: '12345',
          transmissions: [
            {
              id: '123',
              parentId: '12345',
              state: 1,
            },
          ],
        },
        '098765': {
          transmissions: [
            {
              id: '987',
              parentId: '098765',
              state: 2,
              status: {
                code: 200,
              },
            },
          ],
        },
      });
    });
  });

  describe('Multicast/Destination/UPDATE', () => {
    it('adds full destination object to multicast', () => {
      const action = {
        type: 'Multicast/Destination/UPDATE',
        payload: {
          multicast: {
            id: '1234',
          },
          destination: {
            id: 1,
            type: 'prisma.tms.moc.Site',
            foo: 'foo',
            bar: 'bar',
          },
          index: 0,
        },
      };
      const state = {
        '1234': {
          id: '1234',
          destinations: [
            {
              id: 1,
              type: 'prisma.tms.moc.Site',
            },
          ],
        },
      };
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({
        '1234': {
          id: '1234',
          destinations: [
            {
              id: 1,
              foo: 'foo',
              bar: 'bar',
              type: 'prisma.tms.moc.Site',
            },
          ],
        },
      });
    });

    it('does not update other multicasts', () => {
      const action = {
        type: 'Multicast/Destination/UPDATE',
        payload: {
          multicast: {
            id: '1234',
          },
          destination: {
            id: 1,
            type: 'prisma.tms.moc.Site',
            foo: 'foo',
            bar: 'bar',
          },
          index: 0,
        },
      };
      const state = {
        '1234': {
          id: '1234',
          destinations: [
            {
              id: 1,
              type: 'prisma.tms.moc.Site',
            },
          ],
        },
        '1235': {
          id: '1234',
          destinations: [
            {
              id: 1,
              type: 'prisma.tms.moc.Site',
            },
          ],
        },
      };
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({
        '1234': {
          id: '1234',
          destinations: [
            {
              id: 1,
              foo: 'foo',
              bar: 'bar',
              type: 'prisma.tms.moc.Site',
            },
          ],
        },
        '1235': {
          id: '1234',
          destinations: [
            {
              id: 1,
              type: 'prisma.tms.moc.Site',
            },
          ],
        },
      });
    });

    it('only updates the single destination on the multicast', () => {
      const action = {
        type: 'Multicast/Destination/UPDATE',
        payload: {
          multicast: {
            id: '1234',
          },
          destination: {
            id: 200,
            type: 'prisma.tms.moc.Site',
            foo: 'foo',
            bar: 'bar',
          },
          index: 1,
        },
      };
      const state = {
        '1234': {
          id: '1234',
          destinations: [
            {
              id: 1,
              type: 'prisma.tms.moc.Site',
            },
            {
              id: 200,
              type: 'prisma.tms.moc.Site',
            },
          ],
        },
      };
      deepFreeze(state);

      const newState = reducer(state, action);

      expect(newState).toEqual({
        '1234': {
          id: '1234',
          destinations: [
            {
              id: 1,
              type: 'prisma.tms.moc.Site',
            },
            {
              id: 200,
              foo: 'foo',
              bar: 'bar',
              type: 'prisma.tms.moc.Site',
            },
          ],
        },
      });
    });
  });
});
