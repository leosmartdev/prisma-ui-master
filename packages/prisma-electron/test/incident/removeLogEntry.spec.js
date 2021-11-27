import { mockStore } from '../common';
import * as logEntryActions from 'incident/log-entries';
import * as incidentActions from 'incident/incident';

describe('incident/incident', () => {
  let mockServer = null;
  let defaultState = {};

  const incidentBefore = {
    id: 'ID',
    log: [
      {
        id: 'LOGID',
        type: logEntryActions.types.NOTE,
        note: 'NEW NOTE',
      },
    ],
  };

  const incidentAfter = {
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

  describe('[thunk] deleteLogEntry', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const url = '/incident/ID/log/LOGID';

      mockServer.delete = jest.fn(() => Promise.resolve(incidentAfter));

      return store
        .dispatch(logEntryActions.deleteLogEntry(incidentBefore, incidentBefore.log[0]))
        .then(response => {
          expect(mockServer.delete).toHaveBeenCalledTimes(1);
          expect(mockServer.delete).toHaveBeenCalledWith(url);

          const actions = store.getActions();
          expect(actions.length).toBe(1);
          expect(actions).toEqual(
            expect.arrayContaining([incidentActions.getIncidentSuccess(incidentAfter)]),
          );

          expect(response).toEqual(incidentAfter);
        });
    });

    it('on failure dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const error = {
        error: {},
      };

      const url = '/incident/ID/log/LOGID';

      mockServer.delete = jest.fn(() => Promise.reject(error));

      return store
        .dispatch(logEntryActions.deleteLogEntry(incidentBefore, incidentBefore.log[0]))
        .catch(response => {
          expect(mockServer.delete).toHaveBeenCalledTimes(1);
          expect(mockServer.delete).toHaveBeenCalledWith(url);

          expect(response).toEqual(error);
        });
    });
  });
});
