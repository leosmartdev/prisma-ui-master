import { createAction, handleActions } from 'redux-actions';

// Action Types
const GET_FILTERTRACKS = 'filtertracks/get';
const SAVE_FILTERTRACKS = 'filtertracks/save';

/** *************************************
 * Thunks
 ************************************* */
  
function getFilterTracksThunk(userId) {
    return (dispatch, getState) => {
      const server = getState().server;
  
      return new Promise((resolve, reject) => {
        server.get(`/filtertracks/get/${userId}`).then(
          json => {
            log.info('Got Filter Tracks', json);
            dispatch(getFilterTracksSuccess({ userId, filterTracks: json }));
            resolve(json);
          },
          error => {
            reject(error);
          },
        );
      });
    };
}

function saveFilterTracksThunk(userId, filterTracks) {
    return (dispatch, getState) => {
        const server = getState().server;
        const filterTracksArr = [];
        for(let key in filterTracks) {
            filterTracksArr.push({ type: key, show: filterTracks[key].show, timeout: filterTracks[key].timeout });
        }

        return new Promise((resolve, reject) => {
            server.post(`/filtertracks/save/${userId}`, { filterTracks: filterTracksArr }).then(
                json => {
                    log.info('Saved Filter Tracks', json);
                    dispatch(saveFilterTracksSuccess({ userId, filterTracks }));
                    resolve(json);
                },
                error => {
                    reject(error);
                },
            );
        });
    };
}

/**
 * Initial state
 * @property {bool} initFilter            : To initialize the map only once when filter action occurs
 * @property {array} tracks               : Array of the registered tracks
 * - @property {string} type              : Track type
 * - @property {string} displayName       : Displayed name of the track on the right panel checkbox list
 * - @property {bool} show                : True -> show tracks, False -> hide tracks
 * - @property {arrayOf(string)} children : The tracks belong to the track type
 * - @property {number} delayTime         : Delayed time of the track
 */
const initialState = {
    initFilter: false,
    user: { userId: "", profile: {} },
    tracks: [
        {
            type: 'adsb',
            displayName: 'ADS-B',
            show: true,
            children: [
                'track:ADSB',
            ],
            timeout: 720,
        },
        {
            type: 'ais',
            displayName: 'AIS',
            show: true,
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
            show: true,
            children: [
                'track:Manual',
            ],
            timeout: 720,
        },
        {
            type: 'omnicom',
            displayName: 'Omnicom',
            show: true,
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
            show: true,
            children: [
                'track:SARSAT',
            ],
            timeout: 720,
        },
        {
            type: 'sart',
            displayName: 'Sart',
            show: true,
            children: [
                'track:SART',
            ],
            timeout: 720,
        },
        {
            type: 'spidertrack',
            displayName: 'Spidertrack',
            show: true,
            children: [
                'track:Spidertracks',
            ],
            timeout: 720,
        },
        {
            type: 'unknown',
            displayName: 'Unknown',
            show: true,
            children: [
                'unknown',
            ],
            timeout: 720,
        },
        {
            type: 'marker',
            displayName: 'Marker',
            show: true,
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
export const filter = createAction('filterTracks/filter');
export const initFilter = createAction('filterTracks/init');

// List FilterTracks
export const getFilterTracks = getFilterTracksThunk;
export const getFilterTracksSuccess = createAction(
    `${GET_FILTERTRACKS}:success`,
    data => data,
);
export const saveFilterTracks = saveFilterTracksThunk;
export const saveFilterTracksSuccess = createAction(
    `${SAVE_FILTERTRACKS}:success`,
    data => data,
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
        [getFilterTracksSuccess]: (state, action) => {
            const {userId, filterTracks} = action.payload;
            
            let tracks = state.tracks;
            
            const filterTracksObj = {};
            for (let i = 0; i < filterTracks.length; i++) {
                const element = filterTracks[i];
                filterTracksObj[element.type] = {show: element.show, timeout: element.timeout};
            }
            
            tracks = tracks.map(resultItem => {
                if (filterTracksObj[resultItem.type]) {
                    return {
                        ...resultItem,
                        show: Boolean(filterTracksObj[resultItem.type].show),
                        timeout: filterTracksObj[resultItem.type].timeout,
                    };
                }
                return { ...resultItem, show: true, timeout: 720};
            });
            
            return {
                ...state,
                userId: userId,
                tracks: tracks,
            };
        },
        [saveFilterTracksSuccess]: (state, action) => {
            const {userId, filterTracks} = action.payload;
            console.log(userId, filterTracks);
            let tracks = state.tracks;

            tracks = tracks.map(resultItem => {
                if (filterTracks[resultItem.type]) {
                    return {
                        ...resultItem,
                        show: Boolean(filterTracks[resultItem.type].show),
                        timeout: filterTracks[resultItem.type].timeout,
                    };
                }
                return { ...resultItem};
            });
            
            return {
                ...state,
                userId: userId,
                tracks: tracks,
            };
        },
    },
    initialState,
);

export const init = store => {
    store.addReducer('filterTracks', reducer);
};