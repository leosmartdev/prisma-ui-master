import { mockStore } from '../common';
import * as noteActions from 'note/note';

describe('Get note(s)', () => {
  let mockServer = null;
  let defaultState = {};

  const emptyNotes = {
    notes: {
      notes: [],
    },
  };

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
      ...emptyNotes,
    };
  });

  describe('[thunk] listNotes', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const notes = [{ id: '1' }, { id: '2' }, { id: '3' }];

      mockServer.get = jest.fn(() => Promise.resolve(notes));

      return store.dispatch(noteActions.listNotes()).then(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/note');

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([noteActions.listNotesSuccess(notes)]),
        );

        expect(response).toEqual(notes);
      });
    });

    it('on failure calls transaction failed to return error content', () => {
      const store = mockStore({ ...defaultState });

      const error = { statusText: 'failed' };
      mockServer.get = jest.fn(() => Promise.reject(error));

      return store.dispatch(noteActions.listNotes()).catch(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/note');

        expect(response).toEqual(error);
      });
    });
  });

  describe('[thunk] getNote', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const note = { id: '1' };
      mockServer.get = jest.fn(url => Promise.resolve('/note/1/true' === url ? note : []));

      return store.dispatch(noteActions.getNote('1', true)).then(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenNthCalledWith(1, '/note/1/true');

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([noteActions.getNoteSuccess(note)]),
        );

        expect(response).toEqual(note);
      });
    });

    it('on failure calls transaction failed to return error content', () => {
      const store = mockStore({ ...defaultState });

      const error = { statusText: 'failed' };

      mockServer.get = jest.fn(() => Promise.reject(error));

      return store.dispatch(noteActions.getNote('1', true)).catch(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/note/1/true');

        expect(response).toEqual(error);
      });
    });
  });
});
