import React from 'react';
import { PureFilterTracksPanel } from 'components/filter-tracks/FilterTracksPanel';
import { mockStore } from '../../common';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import { createMount } from '@material-ui/core/test-utils';
import { withStyles } from "@material-ui/styles";

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
        },
        {
            type: 'manual',
            displayName: 'Manual',
            show: true,
            children: [
                'track:Manual',
            ],
        },
        {
            type: 'omnicom',
            displayName: 'Omnicom',
            show: true,
            children: [
                'track:OmnicomVMS',
                'track:OmnicomSolar',
            ],
        },
        {
            type: 'radar',
            displayName: 'Radar',
            show: true,
            children: [
                'track:Radar',
                'track:VTSRadar',
            ],
        },
        {
            type: 'sarsat',
            displayName: 'Sarsat',
            show: true,
            children: [
                'track:SARSAT',
            ],
        },
        {
            type: 'sart',
            displayName: 'Sart',
            show: true,
            children: [
                'track:SART',
            ],
        },
        {
            type: 'spidertrack',
            displayName: 'Spidertrack',
            show: true,
            children: [
                'track:Spidertracks',
            ],
        },
        {
            type: 'unknown',
            displayName: 'Unkown',
            show: true,
            children: [
                'unknown',
            ],
        },
    ],
    defaultIcons: [],
    customIcons: [],
};

const styles = {
    root: {
        paddingBottom: '20px',
        marginRight: '5px',
    },
    label: {
        width: '100%',
    },
    iconImage: {
        marginLeft: '15px',
    }
}

const store = mockStore(initialState);

const mountOptions = {
    context: {
        store,
    },
    childContextTypes: {
        store: PropTypes.object,
    },
};

const mapDispatchToProps = {
    filter: jest.fn(),
    initFilter: jest.fn(),
};

const state = store.getState();
const stateToProps = {
    tracks: state.tracks,
    defaultIcons: state.defaultIcons,
    customIcons: state.customIcons,
};

describe('FilterTracksPanel', () => {
    let mount;
    let wrapper;
    let checkboxList;
    let btnSelectAll;
    let btnDeselectAll;
    let btnFilter;

    beforeAll(() => {
        mount = createMount();

        const Component = classes => (
            <PureFilterTracksPanel
                {...mapDispatchToProps}
                {...stateToProps}
                classes={classes}
            />
        );

        const Wrapper = withStyles(styles)(Component);

        wrapper = mount(
            <Wrapper />,
            mountOptions,
        );

        checkboxList = wrapper.find(Checkbox);
        btnSelectAll = wrapper.find(`#btn-filter-tracks-select-all`).first();
        btnDeselectAll = wrapper.find(`#btn-filter-tracks-deselect-all`).first();
        btnFilter = wrapper.find(`#btn-filter-tracks`).first();
    });        

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(`Check if the checkboxes are displayed`, () => {
        expect(checkboxList).toHaveLength(initialState.tracks.length);
    });

    it(`When a user filters the map by "Select all"`, () => {
        btnSelectAll.simulate('click');
        btnFilter.simulate('click');

        let expectedState = [];
        initialState.tracks.forEach(elem => {
            expectedState[elem.type] = true;
        });

        let component = wrapper.find(PureFilterTracksPanel);
        expect(component.prop('initFilter')).toHaveBeenCalledTimes(1);
        expect(component.prop('initFilter')).toHaveBeenCalledWith(true);
        expect(component.prop('filter')).toHaveBeenCalledTimes(1);
        expect(component.prop('filter')).toHaveBeenCalledWith(expectedState);
    });

    it(`When a user filters the map by "Deselect all"`, () => {
        btnDeselectAll.simulate('click');
        btnFilter.simulate('click');

        let expectedState = [];
        initialState.tracks.forEach(elem => {
            expectedState[elem.type] = false;
        });

        let component = wrapper.find(PureFilterTracksPanel);
        expect(component.prop('initFilter')).toHaveBeenCalledTimes(1);
        expect(component.prop('initFilter')).toHaveBeenCalledWith(true);
        expect(component.prop('filter')).toHaveBeenCalledTimes(1);
        expect(component.prop('filter')).toHaveBeenCalledWith(expectedState);
    });

    it(`When a user filter the map manually`, () => {
        btnDeselectAll.simulate('click');

        let firstCheckbox = wrapper.find(Checkbox).first();
        firstCheckbox.props().onChange({ target: { checked: true } });

        btnFilter.simulate('click');

        let expectedState = [];
        let isFirst = true;
        initialState.tracks.forEach(elem => {
            if (isFirst === true) {
                expectedState[elem.type] = true;
                isFirst = false;
            } else {
                expectedState[elem.type] = false;
            }
        });

        let component = wrapper.find(PureFilterTracksPanel);
        expect(component.prop('initFilter')).toHaveBeenCalledTimes(1);
        expect(component.prop('initFilter')).toHaveBeenCalledWith(true);
        expect(component.prop('filter')).toHaveBeenCalledTimes(1);
        expect(component.prop('filter')).toHaveBeenCalledWith(expectedState);
    });
});
