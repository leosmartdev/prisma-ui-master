import { mockStore } from '../common';
import * as noteActions from 'note/note';

describe('Delete the note', () => {
	let mockServer = null;
	let defaultState = {};

	const emptyNotes = {
		notes: {
			notes: [],
		},
	};

	describe('[thunk] deleteNote (for assigned note)', () => {
		beforeEach(() => {
			mockServer = jest.fn().mockImplementation(() => {
				return {};
			});
			defaultState = {
				server: mockServer,
				...emptyNotes,
			};
		});

		const res = { id: '1', note: 'This is a deleted note.', deleted: true };
		it('on success dispatches correct actions', () => {
			const store = mockStore({ ...defaultState });

			mockServer.delete = jest.fn(() => Promise.resolve(res));

			return store.dispatch(noteActions.deleteNote(true, '1', '2')).then(response => {
				expect(mockServer.delete).toHaveBeenCalledTimes(1);
				expect(mockServer.delete).toHaveBeenCalledWith('/incident/2/log/1');

				const actions = store.getActions();
				expect(actions).toEqual(
					expect.arrayContaining([noteActions.deleteNoteSuccess(res)]),
				);

				expect(response).toEqual(res);
			});
		});

		it('on failure calls transaction failed to return error content', () => {
			const store = mockStore({ ...defaultState });
			const error = { statusText: 'failed' };

			mockServer.delete = jest.fn(() => Promise.reject(error));

			return store.dispatch(noteActions.deleteNote(true, '1', '2')).catch(response => {
				expect(mockServer.delete).toHaveBeenCalledTimes(1);
                expect(mockServer.delete).toHaveBeenCalledWith('/incident/2/log/1');

				expect(response).toEqual(error);
			});
		});
	});

    describe('[thunk] deleteNote (for unassigned note)', () => {
		beforeEach(() => {
			mockServer = jest.fn().mockImplementation(() => {
				return {};
			});
			defaultState = {
				server: mockServer,
				...emptyNotes,
			};
		});

		const res = { id: '1', note: 'This is a deleted note.', deleted: true };
		it('on success dispatches correct actions', () => {
			const store = mockStore({ ...defaultState });

			mockServer.delete = jest.fn(() => Promise.resolve(res));

			return store.dispatch(noteActions.deleteNote(false, '1', null)).then(response => {
				expect(mockServer.delete).toHaveBeenCalledTimes(1);
				expect(mockServer.delete).toHaveBeenCalledWith('/note/1');

				const actions = store.getActions();
				expect(actions).toEqual(
					expect.arrayContaining([noteActions.deleteNoteSuccess(res)]),
				);

				expect(response).toEqual(res);
			});
		});

		it('on failure calls transaction failed to return error content', () => {
			const store = mockStore({ ...defaultState });
			const error = { statusText: 'failed' };

			mockServer.delete = jest.fn(() => Promise.reject(error));

			return store.dispatch(noteActions.deleteNote(false, '1', null)).catch(response => {
				expect(mockServer.delete).toHaveBeenCalledTimes(1);
                expect(mockServer.delete).toHaveBeenCalledWith('/note/1');
                
				expect(response).toEqual(error);
			});
		});
	});
});
