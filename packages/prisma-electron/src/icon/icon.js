import { createAction, handleActions } from 'redux-actions';

const initialState = {
  /**
   * Default icons   
   * @key track_type:     type of track
   * @key track_sub_type: track sub-type: for AIS, Omnicom, SART
   * @key url:            image path
   * @key color:          color of the image
   */
  defaultIcons: [],
  /**
   * Custom icons   
   * @key mac_address:    client's MAC address
   * @key track_type:     type of track
   * @key track_sub_type: track sub-type: for AIS, Omnicom, SART
   * @key metadata:       file metadata
   * @key url:            image path
   */
  customIcons: [],
  /**
   * Current editing track
   */
  currentTarget: null,
};

/** *************************************
 * Thunks
 ************************************* */
const createIconThunk = (icon, url) => {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.post('/icon', icon).then(
        json => {
          json['url'] = url;
          dispatch(setCustomIcon(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
};

const getIconThunk = mac_address => {
  return (dispatch, getState) => {
    const server = getState().server;

    const params = {
      mac_address,
    };

    return new Promise((resolve, reject) => {
      server.get('/icon', params).then(
        json => {
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
};

const updateIconThunk = (id, icon, url) => {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.put(`/icon/${id}`, icon).then(
        json => {
          json['url'] = url;
          dispatch(setCustomIcon(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
};

const deleteIconThunk = id => {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.delete(`/icon/${id}`).then(
        json => {
          dispatch(setCustomIcon(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
};

const createIconImageThunk = (mac_address, metadata) => {
  return (dispatch, getState) => {
    const server = getState().server;

    const params = {
      mac_address,
      metadata,
    };

    return new Promise((resolve, reject) => {
      server.post('/icon/image', params).then(
        json => {
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

const getIconImageThunk = mac_address => {
  return (dispatch, getState) => {
    const server = getState().server;

    const params = {
      mac_address,
    };

    return new Promise((resolve, reject) => {
      server.get('/icon/image', params).then(
        json => {
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

/** *************************************
 * Action Creators
 ************************************* */
export const createIcon = createIconThunk;
export const getIcon = getIconThunk;
export const updateIcon = updateIconThunk;
export const deleteIcon = deleteIconThunk;
export const createIconImage = createIconImageThunk;
export const getIconImage = getIconImageThunk;

export const setDefaultIcon = createAction('icon/set-default-icon');
export const initCustomIcon = createAction('icon/init-custom-icon');
export const setCustomIcon = createAction('icon/set-custom-icon');

/** *************************************
 * Reducers
 ************************************* */
export const reducer = handleActions(
  {
    [setDefaultIcon]: (state, action) => {
      let payload = action.payload;
      let trackType = payload.track_type;
      let trackSubType;
      if (payload.track_sub_type) {
        trackSubType = payload.track_sub_type;
      }

      let icons = [...state.defaultIcons];
      let index;

      icons.forEach((elem, idx) => {
        if ((elem.track_type == trackType) && (
          !trackSubType ||
          (trackSubType && elem.track_sub_type == trackSubType)
        )) {
          index = idx;
        }
      });

      if (index != undefined) {
        return state;
      }

      icons.push(payload);

      return {
        ...state,
        defaultIcons: icons,
      };
    },
    [initCustomIcon]: (state, action) => ({
      ...state,
      customIcons: action.payload,
    }),
    [setCustomIcon]: (state, action) => {
      let icon = action.payload;
      let customIcons = [...state.customIcons];
      let trackType = icon.track_type;
      let trackSubType;
      if (icon.track_sub_type) {
        trackSubType = icon.track_sub_type;
      }
      let index;

      customIcons.forEach((elem, idx) => {
        if (elem.track_type == trackType && (
          !trackSubType ||
          (trackSubType && elem.track_sub_type == trackSubType)
        )) {
          index = idx;
        }
      });

      if (index == undefined) {
        customIcons.push(icon);
      } else {
        customIcons.splice(index, 1, icon);
      }

      return {
        ...state,
        customIcons,
        currentTarget: icon,
      };
    },
  },
  initialState
);

export const init = store => {
  store.addReducer('icon', reducer);
};