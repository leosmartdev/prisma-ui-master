import { assignIncidentToUser } from 'incident/incident';
import { mockStore } from '../common';

describe('incident/incident', () => {
  let mockServer = null;
  let defaultState = {};

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
      notifications: { list: [] },
    };
  });

  describe('[thunk] assignIncidentToUser()', () => {
    const incident = {
      id: '0d1153c69b434efebdf4695d',
      name: 'Incident',
      assignee: 'im0',
      commander: 'im3',
    };

    it('resolves data from server when server promise resolves', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        id: '0d1153c69b434efebdf4695d',
        name: 'Incident',
        assignee: 'im2',
        commander: 'im3',
      };

      const user = { userId: 'im2' };

      mockServer.put = jest.fn(() => Promise.resolve(response));

      return store.dispatch(assignIncidentToUser(incident, user, 'assignee')).then(newIncident => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toBeCalledWith('/incident/0d1153c69b434efebdf4695d', {
          ...incident,
          assignee: 'im2',
        });
        expect(newIncident).toEqual(response);
      });
    });

    it('defaults assignmentType to assignee', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        id: '0d1153c69b434efebdf4695d',
        name: 'Incident',
        assignee: 'im2',
        commander: 'im3',
      };

      const user = { userId: 'im2' };

      mockServer.put = jest.fn(() => Promise.resolve(response));

      return store.dispatch(assignIncidentToUser(incident, user)).then(incident => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toBeCalledWith('/incident/0d1153c69b434efebdf4695d', {
          ...incident,
          assignee: 'im2',
        });
        expect(incident).toEqual(response);
      });
    });

    it('sets commander when passed assignmentType', () => {
      const store = mockStore({ ...defaultState });

      const response = {
        id: '0d1153c69b434efebdf4695d',
        name: 'Incident',
        assignee: 'im0',
        commander: 'im2',
      };

      const user = { userId: 'im2' };

      mockServer.put = jest.fn(() => Promise.resolve(response));

      return store.dispatch(assignIncidentToUser(incident, user, 'commander')).then(incident => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toBeCalledWith('/incident/0d1153c69b434efebdf4695d', {
          ...incident,
          commander: 'im2',
        });
        expect(incident).toEqual(response);
      });
    });

    it('rejects with error from server when server promise rejects', () => {
      const store = mockStore({ ...defaultState });

      const user = { userId: 'im2' };
      const response = {
        error: {
          status: 400,
          message: 'ERROR',
        },
      };

      mockServer.put = jest.fn(() => Promise.reject(response));

      return store.dispatch(assignIncidentToUser(incident, user, 'assignee')).catch(error => {
        expect(error).toEqual(response);
      });
    });

    it('calls ack when successful to remove notification', () => {
      const store = mockStore({
        ...defaultState,
        notifications: {
          list: [
            {
              databaseId: '1234',
              source: {
                incidentId: '0d1153c69b434efebdf4695d',
              },
            },
          ],
        },
      });

      const response = { id: '0d1153c69b434efebdf4695d' };
      const user = { userId: 'im2' };

      mockServer.put = jest.fn(() => Promise.resolve(response));
      mockServer.post = jest.fn(() => Promise.resolve({}));

      return store.dispatch(assignIncidentToUser(incident, user)).then(newIncident => {
        expect(mockServer.put).toHaveBeenCalledTimes(1);
        expect(mockServer.put).toBeCalledWith('/incident/0d1153c69b434efebdf4695d', {
          ...incident,
          assignee: 'im2',
        });

        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith('/notice/1234/ack', {});
      });
    });
  });
});
