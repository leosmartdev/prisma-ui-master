import { handleActions, createAction } from 'redux-actions';

// Action Types
const CREATE_ALL_ROLES_SUCCESS = 'auth/roles/list:success';
const GET_USERS_BY_ROLE_SUCCESS = 'auth/roles/getUsers:success';

/** *************************************
 * Thunks
 ************************************* */

const getAllRolesThunk = (opts = {}) => async (dispatch, getState) => {
  const server = getState().server;
  return server.get('/auth/role', opts.params, opts);
};

/* eslint-disable implicit-arrow-linebreak */
const getIncidentManagersThunk = () => dispatch =>
  dispatch(thunks.getUsersByRole('IncidentManager'));
/* eslint-enable implicit-arrow-linebreak */

const getUsersByRoleThunk = role => async (dispatch, getState) => {
  try {
    const server = getState().server;
    const response = await server.get(`/auth/role/${role}/user`);
    dispatch(getUsersByRoleSuccess(role, response));
    return response;
  } catch (error) {
    throw error;
  }
};

// For testing and mocks
export const thunks = {
  getAllRoles: getAllRolesThunk,
  getUsersByRole: getUsersByRoleThunk,
  getIncidentManagers: getIncidentManagersThunk,
};

/** *************************************
 * Action Creators
 ************************************* */
export const getAllRoles = thunks.getAllRoles;
export const getAllRolesSuccess = createAction(CREATE_ALL_ROLES_SUCCESS, roles => roles);

export const getIncidentManagers = thunks.getIncidentManagers;
export const getUsersByRoleSuccess = createAction(GET_USERS_BY_ROLE_SUCCESS, (role, users) => ({
  role,
  users,
}));

/** *************************************
 * Reducers
 ************************************* */

const defaultState = {
  roles: [],
  usersByRole: {},
};

export const reducer = handleActions(
  {
    [getAllRolesSuccess]: (state, action) => ({
      ...state,
      roles: [...action.payload],
    }),
    [getUsersByRoleSuccess]: (state, action) => {
      const newState = {
        ...state,
        usersByRole: {
          ...state.usersByRole,
          [action.payload.role]: action.payload.users,
        },
      };
      return newState;
    },
  },
  defaultState,
);

export const init = store => {
  store.addReducer('roles', reducer);
};
