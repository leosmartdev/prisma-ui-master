import { mockStore } from '../common';
import * as noteActions from 'note/note';

describe('Detach the note from incident', () => {
	let mockServer = null;
	let defaultState = {};

	const emptyNotes = {
		notes: {
			notes: [],
		},
	};

	describe('[thunk] detachNote', () => {
		beforeEach(() => {
			mockServer = jest.fn().mockImplementation(() => {
				return {};
			});
			defaultState = {
				server: mockServer,
				...emptyNotes,
			};
		});

		const note = { id: '1', note: 'This is a detached note.' };
		it('on success dispatches correct actions', () => {
			const store = mockStore({ ...defaultState });

			mockServer.put = jest.fn(() => Promise.resolve(note));

			return store.dispatch(noteActions.detachNote('1', '2')).then(response => {
				expect(mockServer.put).toHaveBeenCalledTimes(1);
				expect(mockServer.put).toHaveBeenCalledWith('/incident/1/log-detach/2');

				const actions = store.getActions();
				expect(actions).toEqual(
					expect.arrayContaining([noteActions.detachNoteSuccess(note)]),
				);

				expect(response).toEqual(note);
			});
		});

		it('on failure calls transaction failed to return error content', () => {
			const store = mockStore({ ...defaultState });
			const error = { statusText: 'failed' };

			mockServer.put = jest.fn(() => Promise.reject(error));

			return store.dispatch(noteActions.detachNote('1', '2')).catch(response => {
				expect(mockServer.put).toHaveBeenCalledTimes(1);
				expect(mockServer.put).toHaveBeenCalledWith('/incident/1/log-detach/2');

				expect(response).toEqual(error);
			});
		});
	});
});
