import { mockStore } from '../common';
import * as logEntryActions from 'incident/log-entries';
import * as incidentActions from 'incident/incident';

describe('incident/incident', () => {
  let mockServer = null;
  let defaultState = {};
  const incident = {
    id: 'ID',
    log: [],
  };

  beforeEach(() => {
    // mockServer = new Server({ validation: { enabled: false } });
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
    };
  });

  describe('[thunk] createLogEntry', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const newEntry = {
        type: logEntryActions.types.NOTE,
        note: 'NEW NOTE',
      };

      const url = `/incident/${incident.id}/log`;

      mockServer.post = jest.fn(() => Promise.resolve(incident));

      return store.dispatch(logEntryActions.createLogEntry(incident, newEntry)).then(response => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(url, newEntry);

        const actions = store.getActions();
        expect(actions.length).toBe(1);
        expect(actions).toEqual(
          expect.arrayContaining([incidentActions.getIncidentSuccess(incident)]),
        );

        expect(response).toEqual(incident);
      });
    });

    it('on failure dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const newEntry = {
        type: logEntryActions.types.NOTE,
        note: 'NEW NOTE',
      };

      const error = {
        error: {},
      };

      const url = `/incident/${incident.id}/log`;

      mockServer.post = jest.fn(() => Promise.reject(error));

      return store.dispatch(logEntryActions.createLogEntry(incident, newEntry)).catch(response => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(url, newEntry);

        expect(response).toEqual(error);
      });
    });
  });

  describe('[function] createTrackLogEntry', () => {
    it('calls createLogEntry with appropriate logEntry', () => {
      logEntryActions.createLogEntry = jest.spyOn(logEntryActions.thunks, 'createLogEntry');

      const trackId = 'trackID';
      const type = 'registry';
      logEntryActions.createTrackLogEntry(incident, trackId, type);

      expect(logEntryActions.createLogEntry).toHaveBeenCalledTimes(1);
      expect(logEntryActions.createLogEntry).toHaveBeenCalledWith(incident, {
        type: logEntryActions.types.TRACK,
        entity: {
          id: 'trackID',
          type: 'registry',
        },
      });

      logEntryActions.createLogEntry.mockRestore();
    });

    it('returns response from createLogEntry', () => {
      logEntryActions.createLogEntry = jest
        .spyOn(logEntryActions.thunks, 'createLogEntry')
        .mockImplementation(() => 'RESPONSE');

      const trackId = 'trackID';
      const type = 'registry';
      const resp = logEntryActions.createTrackLogEntry(incident, trackId, type);

      expect(resp).toBe('RESPONSE');

      logEntryActions.createLogEntry.mockRestore();
    });
  });
});
