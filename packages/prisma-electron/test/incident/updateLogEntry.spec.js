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
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
    };
  });

  describe('[thunk] updateLogEntry', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const entry = {
        id: 'ID',
        type: logEntryActions.types.NOTE,
        note: 'NOTE',
      };

      const url = `/incident/${incident.id}/log/ID`;

      mockServer.put = jest.fn(() => Promise.resolve(incident));

      return store.dispatch(logEntryActions.updateLogEntry(incident, entry)).then(response => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toHaveBeenCalledWith(url, entry);

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
        id: 'ID',
        type: logEntryActions.types.NOTE,
        note: 'NEW NOTE',
      };

      const error = {
        error: {},
      };

      const url = `/incident/${incident.id}/log/ID`;

      mockServer.put = jest.fn(() => Promise.reject(error));

      return store.dispatch(logEntryActions.updateLogEntry(incident, newEntry)).catch(response => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toHaveBeenCalledWith(url, newEntry);

        expect(response).toEqual(error);
      });
    });
  });
});
