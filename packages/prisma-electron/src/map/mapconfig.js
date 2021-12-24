import { createAction, handleActions } from 'redux-actions';

// Action Types
const LIST_MAPCONFIG = 'mapconfig/list';
const SETTRACKTIMEOUTS_MAPCONFIG = 'mapconfig/set_track_timeouts';
const SETTRACKDISPLAY_MAPCONFIG = 'mapconfig/set_track_display';

/** *************************************
 * Thunks
 ************************************* */
  
function listMapConfigThunk() {
    return (dispatch, getState) => {
      const server = getState().server;
  
      return new Promise((resolve, reject) => {
        server.get('/mapconfig').then(
          json => {
            log.info('Got Map Config', json);
            dispatch(listMapConfigSuccess(json));
            resolve(json);
          },
          error => {
            reject(error);
          },
        );
      });
    };
}

function setTrackTimeoutsThunk(trackTimeouts) {
    // console.log(trackTimeouts);
    return (dispatch, getState) => {
        const server = getState().server;

        return new Promise((resolve, reject) => {
            server.post('/mapconfig/set', { key: 'track_timeouts', value: trackTimeouts }).then(
                json => {
                    log.info('Save Track Timeout', json);
                    dispatch(setTrackTimeoutsSuccess(trackTimeouts));
                    resolve(json);
                },
                error => {
                    reject(error);
                },
            );
        });
    }
}

function setTrackDisplayThunk(trackDisplay) {
    return (dispatch, getState) => {
        const server = getState().server;

        return new Promise((resolve, reject) => {
            server.post('/mapconfig/set', { key: 'track_display', value: trackDisplay }).then(
                json => {
                    log.info('Save Track Filter Display', json);
                    dispatch(setTrackDisplaySuccess(trackDisplay));
                    resolve(json);
                },
                error => {
                    reject(error);
                },
            );
        });
    }
}

/**
 * Initial state
 * @property {bool} initFilter            : To initialize the map only once when filter action occurs
 * @property {array} mapconfig               : Array of the map config
 * @property {array} tracks               : Array of the registered tracks
 * - @property {string} type              : Track type
 * - @property {string} displayName       : Displayed name of the track on the right panel checkbox list
 * - @property {arrayOf(string)} children : The tracks belong to the track type
 * - @property {number} timeout         : Delayed time of the track
 */
const initialState = {
    initFilter: false,
    mapconfiglist: [],
    tracks: [
        {
            type: 'adsb',
            displayName: 'ADS-B',
            children: [
                'track:ADSB',
            ],
            show: true,
            timeout: 720,
        },
        {
            type: 'ais',
            displayName: 'AIS',
            children: [
                'track:AIS',
                'track:TV32',
                'track:Orbcomm',
                'track:VTSAIS',
            ],
            show: true,
            timeout: 720,
        },
        {
            type: 'manual',
            displayName: 'Manual',
            children: [
                'track:Manual',
            ],
            show: true,
            timeout: 720,
        },
        {
            type: 'omnicom',
            displayName: 'Omnicom',
            children: [
                'track:OmnicomVMS',
                'track:OmnicomSolar',
            ],
            show: true,
            timeout: 720,
        },
        {
            type: 'radar',
            displayName: 'Radar',
            children: [
                'track:Radar',
                'track:VTSRadar',
            ],
            show: true,
            timeout: 720,
        },
        {
            type: 'sarsat',
            displayName: 'Sarsat',
            children: [
                'track:SARSAT',
            ],
            show: true,
            timeout: 720,
        },
        {
            type: 'sart',
            displayName: 'Sart',
            children: [
                'track:SART',
            ],
            show: true,
            timeout: 720,
        },
        {
            type: 'spidertrack',
            displayName: 'Spidertrack',
            children: [
                'track:Spidertracks',
            ],
            show: true,
            timeout: 720,
        },
        {
            type: 'unknown',
            displayName: 'Unknown',
            children: [
                'unknown',
            ],
            show: true,
            timeout: 720,
        },
        {
            type: 'marker',
            displayName: 'Marker',
            children: [
                'Marker',
            ],
            show: true,
            timeout: 720,
        }
    ]
};

/**
 * Action Creators
 */
 export const filter = createAction('mapconfig/filter');
 export const initFilter = createAction('mapconfig/initFilter');

// List FilterTracks
export const listMapConfig = listMapConfigThunk;
export const listMapConfigSuccess = createAction(
    `${LIST_MAPCONFIG}:success`,
    mapconfiglist => mapconfiglist,
);
// Set Track Timeouts
export const setTrackTimeouts = setTrackTimeoutsThunk;
export const setTrackTimeoutsSuccess = createAction(
    `${SETTRACKTIMEOUTS_MAPCONFIG}:success`,
    mapconfiglist => mapconfiglist,
);
// Set Track Display
export const setTrackDisplay = setTrackDisplayThunk;
export const setTrackDisplaySuccess = createAction(
    `${SETTRACKDISPLAY_MAPCONFIG}:success`,
    mapconfiglist => mapconfiglist,
);

/**
 * Reducers
 */
export const reducer = handleActions(
    {
        [filter]: (state, action) => {
            let filterList = action.payload;
            let tracks = state.tracks.map(resultItem => {
                if (filterList[resultItem.type] === true) {
                    return { ...resultItem, show: true };
                } else {
                    return { ...resultItem, show: false };
                }

                return { ...resultItem };
            });

            return { ...state, tracks };
        },
        [initFilter]: (state, action) => ({
            ...state,
            initFilter: action.payload,
        }),
        [setTrackTimeoutsSuccess]: (state, action) => {
            let timeoutList = action.payload;
            // console.log(timeoutList);
            let tracks = state.tracks.map(resultItem => {
                return { ...resultItem, timeout: timeoutList[resultItem.type] };
            });

            return { ...state, tracks };
        },
        [setTrackDisplaySuccess]: (state, action) => {
            let trackDisplayList = action.payload;
            // console.log(timeoutList);
            let tracks = state.tracks.map(resultItem => {
                return { ...resultItem, show: Boolean(trackDisplayList[resultItem.type]) };
            });

            return { ...state, tracks };
        },
        [listMapConfigSuccess]: (state, action) => {
            let mapconfiglist = action.payload;
            let tracks = state.tracks;
            let mapconfig_trackTimeouts = mapconfiglist.find(item => item.key === 'track_timeouts');
            if (mapconfig_trackTimeouts) {
                tracks = tracks.map(resultItem => {
                    if (mapconfig_trackTimeouts.value[resultItem.type]) {
                        return { ...resultItem, timeout: mapconfig_trackTimeouts.value[resultItem.type] };
                    }
                    return resultItem;
                });
            }
            let mapconfig_trackDisplay = mapconfiglist.find(item => item.key === 'track_display');
            if (mapconfig_trackDisplay) {
                tracks = tracks.map(resultItem => {
                    if (mapconfig_trackDisplay.value[resultItem.type]) {
                        return { ...resultItem, show: Boolean(mapconfig_trackDisplay.value[resultItem.type]) };
                    }
                    return { ...resultItem, show: false};
                });
            }
            return {
                ...state,
                mapconfiglist: mapconfiglist,
                tracks: tracks,
            };
        },
    },
    initialState,
);

export const init = store => {
    store.addReducer('mapconfig', reducer);
};