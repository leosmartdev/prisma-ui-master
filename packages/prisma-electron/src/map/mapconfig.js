import { createAction, handleActions } from 'redux-actions';

// Action Types
const LIST_MAPCONFIG = 'mapconfig/list';
const SETTRACKTIMEOUTS_MAPCONFIG = 'mapconfig/set_track_timeouts';

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

/**
 * Initial state
 * @property {array} mapconfig               : Array of the map config
 * @property {array} track_timeoutss               : Array of the registered tracks
 * - @property {string} type              : Track type
 * - @property {string} displayName       : Displayed name of the track on the right panel checkbox list
 * - @property {arrayOf(string)} children : The tracks belong to the track type
 * - @property {number} timeout         : Delayed time of the track
 */
const initialState = {
    mapconfiglist: [],
    track_timeouts: [
        {
            type: 'adsb',
            displayName: 'ADS-B',
            children: [
                'track:ADSB',
            ],
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
            timeout: 720,
        },
        {
            type: 'manual',
            displayName: 'Manual',
            children: [
                'track:Manual',
            ],
            timeout: 720,
        },
        {
            type: 'omnicom',
            displayName: 'Omnicom',
            children: [
                'track:OmnicomVMS',
                'track:OmnicomSolar',
            ],
            timeout: 720,
        },
        {
            type: 'radar',
            displayName: 'Radar',
            show: true,
            children: [
                'track:Radar',
                'track:VTSRadar',
            ],
            timeout: 720,
        },
        {
            type: 'sarsat',
            displayName: 'Sarsat',
            children: [
                'track:SARSAT',
            ],
            timeout: 720,
        },
        {
            type: 'sart',
            displayName: 'Sart',
            children: [
                'track:SART',
            ],
            timeout: 720,
        },
        {
            type: 'spidertrack',
            displayName: 'Spidertrack',
            children: [
                'track:Spidertracks',
            ],
            timeout: 720,
        },
        {
            type: 'unknown',
            displayName: 'Unknown',
            children: [
                'unknown',
            ],
            timeout: 720,
        },
        {
            type: 'marker',
            displayName: 'Marker',
            children: [
                'Marker',
            ],
            timeout: 720,
        }
    ]
};

/**
 * Action Creators
 */
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

/**
 * Reducers
 */
export const reducer = handleActions(
    {
        [setTrackTimeoutsSuccess]: (state, action) => {
            let timeoutList = action.payload;
            console.log(timeoutList);
            let track_timeouts = state.track_timeouts.map(resultItem => {
                return { ...resultItem, timeout: timeoutList[resultItem.type] };
            });

            return { ...state, track_timeouts };
        },
        [listMapConfigSuccess]: (state, action) => {
            let mapconfiglist = action.payload;
            let track_timeouts = state.track_timeouts;
            let mapconfig_trackTimeouts = mapconfiglist.find(item => item.key === 'track_timeouts');
            if (mapconfig_trackTimeouts) {
                track_timeouts = state.track_timeouts.map(resultItem => {
                    if (mapconfig_trackTimeouts.value[resultItem.type]) {
                        return { ...resultItem, timeout: mapconfig_trackTimeouts.value[resultItem.type] };
                    }
                    return resultItem;
                });
            }
            return {
                ...state,
                mapconfiglist: mapconfiglist,
                track_timeouts: track_timeouts,
            };
        },
    },
    initialState,
);

export const init = store => {
    store.addReducer('mapconfig', reducer);
};