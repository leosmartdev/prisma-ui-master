import { createAction, handleActions } from 'redux-actions';

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
    tracks: [
        {
            type: 'adsb',
            displayName: 'ADS-B',
            show: true,
            children: [
                'track:ADSB',
            ],
            delayTime: 3,
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
            delayTime: 4,
        },
        {
            type: 'manual',
            displayName: 'Manual',
            show: true,
            children: [
                'track:Manual',
            ],
            delayTime: 2,
        },
        {
            type: 'omnicom',
            displayName: 'Omnicom',
            show: true,
            children: [
                'track:OmnicomVMS',
                'track:OmnicomSolar',
            ],
            delayTime: 1,
        },
        {
            type: 'radar',
            displayName: 'Radar',
            show: true,
            children: [
                'track:Radar',
                'track:VTSRadar',
            ],
            delayTime: 0,
        },
        {
            type: 'sarsat',
            displayName: 'Sarsat',
            show: true,
            children: [
                'track:SARSAT',
            ],
            delayTime: 0,
        },
        {
            type: 'sart',
            displayName: 'Sart',
            show: true,
            children: [
                'track:SART',
            ],
            delayTime: 2,
        },
        {
            type: 'spidertrack',
            displayName: 'Spidertrack',
            show: true,
            children: [
                'track:Spidertracks',
            ],
            delayTime: 1,
        },
        {
            type: 'unknown',
            displayName: 'Unknown',
            show: true,
            children: [
                'unknown',
            ],
            delayTime: 3,
        },
        {
            type: 'marker',
            displayName: 'Marker',
            show: true,
            children: [
                'Marker',
            ],
            delayTime: 2,
        }
    ]
};

/**
 * Action Creators
 */
export const filter = createAction('filterTracks/filter');
export const initFilter = createAction('filterTracks/init');
export const setDelay = createAction('filterTracks/setDelay');

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
        [setDelay]: (state, action) => {
            let delayList = action.payload;
            let tracks = state.tracks.map(resultItem => {
                return { ...resultItem, delayTime: delayList[resultItem.type] };
            });

            return { ...state, tracks };
        },
    },
    initialState,
);

export const init = store => {
    store.addReducer('filterTracks', reducer);
};