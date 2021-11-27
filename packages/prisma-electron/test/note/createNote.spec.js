import { mockStore } from '../common';
import * as noteActions from 'note/note';
import { types } from 'incident/log-entries';

describe('Create a standalone note', () => {
  let mockServer = null;
  let defaultState = {};
  const note = {};

  beforeEach(() => {
    mockServer = jest.fn().mockImplementation(() => {
      return {};
    });
    defaultState = {
      server: mockServer,
    };
  });

  describe('[thunk] createNote', () => {
    it('on success dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const newNote = {
        type: types.NOTE,
        note: 'NEW NOTE',
      };

      const url = `/note`;

      mockServer.post = jest.fn(() => Promise.resolve(note));

      return store.dispatch(noteActions.createNote(newNote)).then(response => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(url, newNote);

        const actions = store.getActions();
        expect(actions.length).toBe(1);
        expect(actions).toEqual(
          expect.arrayContaining([noteActions.createNoteSuccess(note)]),
        );

        expect(response).toEqual(note);
      });
    });

    it('on failure dispatches correct actions', () => {
      const store = mockStore({ ...defaultState });

      const newNote = {
        type: types.NOTE,
        note: 'NEW NOTE',
      };

      const error = {
        error: {},
      };

      const url = `/note`;

      mockServer.post = jest.fn(() => Promise.reject(error));

      return store.dispatch(noteActions.createNote(newNote)).catch(response => {
        expect(mockServer.post).toHaveBeenCalledTimes(1);
        expect(mockServer.post).toHaveBeenCalledWith(url, newNote);

        expect(response).toEqual(error);
      });
    });
  });
});
