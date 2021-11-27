import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// Create a mock redux store for testing thunks.
const middlewares = [thunk];
export const mockStore = configureMockStore(middlewares);
