import { mockStore } from '../common';
import * as noteActions from 'note/note';

describe('Assign the note to incident', () => {
	let mockServer = null;
	let defaultState = {};

	const emptyNotes = {
		notes: {
			notes: [],
		},
	};

	describe('[thunk] assignNote', () => {
		beforeEach(() => {
			mockServer = jest.fn().mockImplementation(() => {
				return {};
			});
			defaultState = {
				server: mockServer,
				...emptyNotes,
			};
		});

		const note = { id: '1', note: 'This is an assigned note.', assigned: true };
		const res = { log: [note] };
		it('on success dispatches correct actions', () => {
			const store = mockStore({ ...defaultState });

			mockServer.put = jest.fn(() => Promise.resolve(res));

			return store.dispatch(noteActions.assignNote('1', '2')).then(response => {
				expect(mockServer.put).toHaveBeenCalledTimes(1);
				expect(mockServer.put).toHaveBeenCalledWith('/note/1/assignee/2');

				const actions = store.getActions();
				expect(actions).toEqual(
					expect.arrayContaining([noteActions.assignNoteSuccess(res)]),
				);

				expect(response).toEqual(res);
			});
		});

		it('on failure calls transaction failed to return error content', () => {
			const store = mockStore({ ...defaultState });
			const error = { statusText: 'failed' };

			mockServer.put = jest.fn(() => Promise.reject(error));

			return store.dispatch(noteActions.assignNote('1', '2', note)).catch(response => {
				expect(mockServer.put).toHaveBeenCalledTimes(1);
				expect(mockServer.put).toHaveBeenCalledWith('/note/1/assignee/2');

				expect(response).toEqual(error);
			});
		});
	});
});
