import * as redux from 'notices/notices';
import { mockStore } from '../common';

describe('notices/notices', () => {
  let mockServer = null;
  let defaultState = {};

  const empty = {
    notifications: {
      list: [],
      highPriorityNotices: [],
      latest: null,
      soundOff: false,
    },
  };

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
      ...empty,
    };
  });

  describe('findNoticeById()', () => {
    const notices = [
      { id: '1', target: { registryId: 'registryid' } },
      { id: '2', target: { trackId: 'trackid' } },
      { id: '3', target: { databaseId: 'databaseid' } },
      { id: '4', target: { trackId: 'trackid2', registryId: 'registryid2' } },
      { id: '5', target: { trackId: 'trackid3', databaseId: 'databaseid2' } },
      { id: '6', target: { databaseId: 'databaseid3' } },
      { id: '7', source: { incidentId: 'incidentId' } },
      { id: '8', source: { zoneId: 'zoneId' } },
      { id: '9' },
    ];

    it('finds notice with track id', () => {
      const notice = redux.findNoticeById('trackid3', notices);

      expect(notice.id).toBe('5');
    });

    it('finds notice with target containing track id', () => {
      const notice = redux.findNoticeById({ targetId: 'trackid' }, notices);

      expect(notice.id).toBe('2');
    });

    it('finds notice with target containing registry id', () => {
      const notice = redux.findNoticeById({ registryId: 'registryid' }, notices);

      expect(notice.id).toBe('1');
    });

    it('finds notice with target containing database id', () => {
      const notice = redux.findNoticeById({ databaseId: 'databaseid' }, notices);

      expect(notice.id).toBe('3');
    });

    it("doest trip up when target isn't defined on a notice", () => {
      const notice = redux.findNoticeById('trackid2', [...notices, { id: '7' }]);

      expect(notice.id).toBe('4');
    });

    it('finds incident id', () => {
      const notice = redux.findNoticeById('incidentId', notices);

      expect(notice.id).toBe('7');
    });

    it('finds zone id', () => {
      const notice = redux.findNoticeById('zoneId', notices);

      expect(notice.id).toBe('8');
    });

    it('No match returns null', () => {
      const notice = redux.findNoticeById('notvalid', notices);

      expect(notice).toBeNull();
    });
  });

  describe('[thunk] notice/ACK by Track ID', () => {
    it('on calls proper api call', () => {
      const id = 'ID';
      const notice = { id, databaseId: id, target: { trackId: 'trackId' } };
      const store = mockStore({
        ...defaultState,
        notifications: {
          ...defaultState.notifications,
          list: [notice],
        },
      });

      const response = notice;

      mockServer.post = jest.fn(() => Promise.resolve(response));

      return store.dispatch(redux.acknowledgeForTarget({ trackId: 'trackId' })).then(() => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(`/notice/${id}/ack`, {});
      });
    });

    it("doesnt explode if notice isn't found", () => {
      const store = mockStore({ ...defaultState });

      mockServer.get = jest.fn();

      return store.dispatch(redux.acknowledgeForTarget('trackId')).catch(error => {
        expect(mockServer.get).not.toHaveBeenCalled();
        expect(error).toEqual({
          error: {
            statusText: 'Notice for target trackId not found. Could not acknowledge.',
          },
        });
      });
    });
  });

  describe('[thunk] notice/ACK_ALL', () => {
    it('on calls proper api call', () => {
      const store = mockStore({ ...defaultState });

      const response = [];

      mockServer.post = jest.fn(() => Promise.resolve(response));

      return store.dispatch(redux.acknowledgeAll()).then(() => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(`/notice/all/ack`);
      });
    });
  });

  describe('batches', () => {
    const notices = [
      {
        id: '1',
        databaseId: 'databaseid1',
        priority: 'Alert',
        target: { registryId: 'registryid' },
      },
      {
        id: '2',
        databaseId: 'databaseid2',
        priority: 'Alert',
        target: { trackId: 'trackid' },
      },
      {
        id: '3',
        databaseId: 'databaseid3',
        priority: 'Alert',
        target: { databaseId: 'databaseid' },
      },
      {
        id: '4',
        databaseId: 'databaseid4',
        target: { trackId: 'trackid2', registryId: 'registryid2' },
      },
      {
        id: '5',
        databaseId: 'databaseid5',
        target: { trackId: 'trackid3', databaseId: 'databaseid2' },
      },
      { id: '6', databaseId: 'databaseid6', target: { databaseId: 'databaseid3' } },
    ];
    const store = mockStore({ ...defaultState });
    it('upsertBatchToList should be able to handle a list of notices', () => {
      store.dispatch(redux.insertList(notices));
      const payload = store.getActions()[0].payload;
      const { list, highPriorityNotices } = redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload,
      });
      expect(list).toHaveLength(notices.length);
      expect(highPriorityNotices).toHaveLength(notices.filter(({ priority }) => priority).length);
    });

    it('upsertBatchToList should override existing notice', () => {
      const oldState = {
        list: [{ id: 'ID', databaseId: 'ID' }],
        highPriorityNotices: [{ id: 'ID', databaseId: 'ID' }],
      };

      const notice = { id: 'ID', databaseId: 'ID', value: 'TEST' };
      const newState = redux.reducer(oldState, redux.insertList([notice]));

      expect(newState.list.length).toBe(1);
      expect(newState.list[0].value).toBe('TEST');
    });

    it('upsertBatchToPriorityList should override existing notice', () => {
      const oldState = {
        list: [{ id: 'ID', databaseId: 'ID' }],
        highPriorityNotices: [{ id: 'ID', databaseId: 'ID' }],
      };

      const notice = {
        id: 'ID',
        databaseId: 'ID',
        value: 'TEST',
        priority: 'Alert',
      };
      const newState = redux.reducer(oldState, redux.insertList([notice]));

      expect(newState.highPriorityNotices.length).toBe(1);
      expect(newState.highPriorityNotices[0].value).toBe('TEST');
    });

    it('upsertBatchToList should not crash', () => {
      let countList = redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: [],
      }).list.length;
      countList += redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: {},
      }).list.length;
      countList += redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: undefined,
      }).list.length;
      countList += redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: NaN,
      }).list.length;
      countList += redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: null,
      }).list.length;

      let countPrior = redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: [],
      }).highPriorityNotices.length;
      countPrior += redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: {},
      }).highPriorityNotices.length;
      countPrior += redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: undefined,
      }).highPriorityNotices.length;
      countPrior += redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: NaN,
      }).highPriorityNotices.length;
      countPrior += redux.reducer(store.getState().notifications, {
        type: redux.insertList,
        payload: null,
      }).highPriorityNotices.length;
      expect(countList).toBe(0);
      expect(countPrior).toBe(0);
    });
  });

  describe('[reducer] soundOff', () => {
    it('defaults to sound on', () => {
      const oldState = undefined;

      const newState = redux.reducer(oldState, { type: 'INITIALIZE' });

      expect(newState.soundOff).toBe(false);
    });

    it('dispatch turnNoticeSoundOff sets state correctly', () => {
      const oldState = { soundOff: false };

      const newState = redux.reducer(oldState, redux.turnNoticeSoundOff());

      expect(newState.soundOff).toBe(true);
    });

    it('dispatch turnNoticeSoundOn sets state correctly', () => {
      const oldState = { soundOff: true };

      const newState = redux.reducer(oldState, redux.turnNoticeSoundOn());

      expect(newState.soundOff).toBe(false);
    });
  });

  it('intializes correctly', () => {
    const store = {
      addReducer: jest.fn(),
    };

    redux.init(store);

    expect(store.addReducer).toHaveBeenCalledWith('notifications', redux.reducer);
  });
});
