import { mockStore } from '../common';
import * as noteActions from 'note/note';

describe('Update the note', () => {
	let mockServer = null;
	let defaultState = {};

	const emptyNotes = {
		notes: {
			notes: [],
		},
	};

	describe('[thunk] updateNote (for assigned note)', () => {
		beforeEach(() => {
			mockServer = jest.fn().mockImplementation(() => {
				return {};
			});
			defaultState = {
				server: mockServer,
				...emptyNotes,
			};
		});

		const note = { id: '1', note: 'This is an updated note.' };
		const res = { log: [note] };
		it('on success dispatches correct actions', () => {
			const store = mockStore({ ...defaultState });

			mockServer.put = jest.fn(() => Promise.resolve(res));

			return store.dispatch(noteActions.updateNote(true, '2', note)).then(response => {
				expect(mockServer.put).toHaveBeenCalledTimes(1);
				expect(mockServer.put).toHaveBeenCalledWith('/incident/2/log/1', note);

				const actions = store.getActions();
				expect(actions).toEqual(
					expect.arrayContaining([noteActions.updateNoteSuccess(note)]),
				);

				expect(response).toEqual(res);
			});
		});

		it('on failure calls transaction failed to return error content', () => {
			const store = mockStore({ ...defaultState });
			const error = { statusText: 'failed' };

			mockServer.put = jest.fn(() => Promise.reject(error));

			return store.dispatch(noteActions.updateNote(true, '2', note)).catch(response => {
				expect(mockServer.put).toHaveBeenCalledTimes(1);
				expect(mockServer.put).toHaveBeenCalledWith('/incident/2/log/1', note);

				expect(response).toEqual(error);
			});
		});
	});

	describe('[thunk] updateNote (for unassigned note)', () => {
		beforeEach(() => {
			mockServer = jest.fn().mockImplementation(() => {
				return {};
			});
			defaultState = {
				server: mockServer,
				...emptyNotes,
			};
		});

		const note = { id: '1', note: 'This is an updated note.' };
		it('on success dispatches correct actions', () => {
			const store = mockStore({ ...defaultState });

			mockServer.put = jest.fn(() => Promise.resolve(note));

			return store.dispatch(noteActions.updateNote(false, null, note)).then(response => {
				expect(mockServer.put).toHaveBeenCalledTimes(1);
				expect(mockServer.put).toHaveBeenCalledWith('/note/1', note);

				const actions = store.getActions();
				expect(actions).toEqual(
					expect.arrayContaining([noteActions.updateNoteSuccess(note)]),
				);

				expect(response).toEqual(note);
			});
		});

		it('on failure calls transaction failed to return error content', () => {
			const store = mockStore({ ...defaultState });
			const error = { statusText: 'failed' };

			mockServer.put = jest.fn(() => Promise.reject(error));

			return store.dispatch(noteActions.updateNote(false, null, note)).catch(response => {
				expect(mockServer.put).toHaveBeenCalledTimes(1);
				expect(mockServer.put).toHaveBeenCalledWith('/note/1', note);

				expect(response).toEqual(error);
			});
		});
	});
});
