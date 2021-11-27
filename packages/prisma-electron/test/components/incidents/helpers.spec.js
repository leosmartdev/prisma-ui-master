import React from 'react';
import moment from 'moment';

import * as helpers from 'components/incidents/helpers';

// React imports
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import ArchiveIcon from '@material-ui/icons/Archive';
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import HelpIcon from '@material-ui/icons/Help';

describe('components/incidents/helpers', () => {
  describe('getIncidentOutcomes', () => {
    it('returns correct outcomes', () => {
      const outcomes = helpers.getIncidentOutcomes();
      expect(outcomes[0].value).toBe('Non-Distress');
      expect(outcomes[1].value).toBe('Hand Off');
      expect(outcomes[2].value).toBe('Rescue/MEDEVAC Provided');
      expect(outcomes[3].value).toBe('Fatality');
      expect(outcomes[4].value).toBe('Training');
      expect(outcomes[5].value).toBe('Unresolved');
    });
  });

  describe('getIncidentStateIcon', () => {
    it('returns open lock icon', () => {
      const icon = helpers.getIncidentStateIcon({ state: helpers.STATE.OPEN });

      expect(icon).toEqual(<LockOpenIcon />);
    });

    it('returns closed lock icon', () => {
      const icon = helpers.getIncidentStateIcon({ state: helpers.STATE.CLOSED });

      expect(icon).toEqual(<LockIcon />);
    });

    it('returns archive icon', () => {
      const icon = helpers.getIncidentStateIcon({ state: helpers.STATE.ARCHIVED });

      expect(icon).toEqual(<ArchiveIcon />);
    });

    it('returns received icon', () => {
      const icon = helpers.getIncidentStateIcon({ state: helpers.STATE.TRANSERRING });

      expect(icon).toEqual(<CallReceivedIcon />);
    });

    it('returns Help Icon when state is invalid', () => {
      const icon = helpers.getIncidentStateIcon({ state: 10 });

      expect(icon).toEqual(<HelpIcon />);
    });

    it('returns Help Icon when incident isnt valid', () => {
      const icon = helpers.getIncidentStateIcon();

      expect(icon).toEqual(<HelpIcon />);
    });
  });

  describe('getPhase()', () => {
    it('returns Uncertainty', () => {
      const phase = helpers.getPhase({ phase: helpers.PHASE.UNCERTAINTY });

      expect(phase).toBe('Uncertainty');
    });

    it('returns Alert', () => {
      const phase = helpers.getPhase({ phase: helpers.PHASE.ALERT });

      expect(phase).toBe('Alert');
    });

    it('returns Distress', () => {
      const phase = helpers.getPhase({ phase: helpers.PHASE.DISTRESS });

      expect(phase).toBe('Distress');
    });

    it('returns empty string when phase is invalid', () => {
      const phase = helpers.getPhase({ phase: 10 });

      expect(phase).toBe('');
    });

    it('returns empty string when incident is undefined', () => {
      const phase = helpers.getPhase();

      expect(phase).toBe('');
    });
  });

  describe('formatTime()', () => {
    beforeEach(() => {
      moment.tz.setDefault('UTC');
    });

    it('returns default format', () => {
      const formatted = helpers.formatTime(new Date(Date.UTC(2017, 0, 31, 0, 0, 0, 0)));

      expect(formatted).toBe(
        moment([2017, 0, 31, 0, 0, 0, 0])
          .tz(moment().tz())
          .format('l LTS z'),
      );
    });

    it('returns time converted to provided format', () => {
      const formatted = helpers.formatTime(new Date(Date.UTC(2017, 0, 31, 0, 0, 0, 0)), 'HH:MM:SS');

      expect(formatted).toBe(
        moment([2017, 0, 31, 0, 0, 0, 0])
          .tz(moment().tz())
          .format('HH:MM:SS'),
      );
    });

    it('returns null when time isnt provided', () => {
      const formatted = helpers.formatTime();

      expect(formatted).toBeNull();
    });

    it('accepts time already parsed by moment', () => {
      const time = moment();
      const formatted = helpers.formatTime(time);

      expect(formatted).toBe(time.tz(moment().tz()).format('l LTS z'));
    });
  });

  describe('filterIncidents()', () => {
    const incidents = [
      { id: '1', state: helpers.STATE.OPEN },
      { id: '2', state: helpers.STATE.CLOSED },
      { id: '3', state: helpers.STATE.CLOSED },
      { id: '4', state: helpers.STATE.OPEN },
    ];

    it("returns open incidents when passed filter='opened'", () => {
      const filtered = helpers.filterIncidents(incidents, 'opened');

      expect(filtered).toEqual([
        { id: '1', state: helpers.STATE.OPEN },
        { id: '4', state: helpers.STATE.OPEN },
      ]);
    });

    it("returns closed incidents when passed filter='closed'", () => {
      const filtered = helpers.filterIncidents(incidents, 'closed');

      expect(filtered).toEqual([
        { id: '2', state: helpers.STATE.CLOSED },
        { id: '3', state: helpers.STATE.CLOSED },
      ]);
    });

    it("returns original list if filter isn't valid", () => {
      const filtered = helpers.filterIncidents(incidents, 'dskljf');

      expect(filtered).toEqual(incidents);
    });

    it('returns original list if filter is undefined', () => {
      const filtered = helpers.filterIncidents(incidents, undefined);

      expect(filtered).toEqual(incidents);
    });

    it('returns original list if filter is null', () => {
      const filtered = helpers.filterIncidents(incidents, null);

      expect(filtered).toEqual(incidents);
    });

    it('accepts custom filter function', () => {
      const filtered = helpers.filterIncidents(incidents, incident => incident.id === '3');

      expect(filtered).toEqual([{ id: '3', state: helpers.STATE.CLOSED }]);
    });
  });

  describe('areIncidentsEqual()', () => {
    it('returns true when incident are equal for all properties', () => {
      const incident1 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      const incident2 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      expect(helpers.areIncidentsEqual(incident1, incident2)).toBe(true);
    });

    it('returns true when incident are the same object', () => {
      const incident1 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      expect(helpers.areIncidentsEqual(incident1, incident1)).toBe(true);
    });

    it('returns false when incident ids are different', () => {
      const incident1 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      const incident2 = {
        id: '1235',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      expect(helpers.areIncidentsEqual(incident1, incident2)).toBe(false);
    });

    it('returns false when incident names are different', () => {
      const incident1 = {
        id: '1234',
        name: 'Foo1',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      const incident2 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      expect(helpers.areIncidentsEqual(incident1, incident2)).toBe(false);
    });

    it('returns false when incident phases are different', () => {
      const incident1 = {
        id: '1234',
        name: 'Foo',
        phase: 'Uncertainty',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      const incident2 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      expect(helpers.areIncidentsEqual(incident1, incident2)).toBe(false);
    });

    it('returns false when incident types are different', () => {
      const incident1 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      const incident2 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 3,
        assignee: 'im0',
        commander: 'im0',
      };

      expect(helpers.areIncidentsEqual(incident1, incident2)).toBe(false);
    });

    it('returns false when incident assignees are different', () => {
      const incident1 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im2',
        commander: 'im0',
      };

      const incident2 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      expect(helpers.areIncidentsEqual(incident1, incident2)).toBe(false);
    });

    it('returns false when incident commanders are different', () => {
      const incident1 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im1',
      };

      const incident2 = {
        id: '1234',
        name: 'Foo',
        phase: 'Alert',
        type: 2,
        assignee: 'im0',
        commander: 'im0',
      };

      expect(helpers.areIncidentsEqual(incident1, incident2)).toBe(false);
    });

    it('returns true when partial incidents are equivalent', () => {
      const incident1 = {
        id: '1234',
        phase: 'Alert',
        type: 2,
        commander: 'im1',
      };

      const incident2 = {
        id: '1234',
        phase: 'Alert',
        type: 2,
        commander: 'im1',
      };

      expect(helpers.areIncidentsEqual(incident1, incident2)).toBe(true);
    });

    it('returns false when partial incidents are not equivalent', () => {
      const incident1 = {
        id: '1234',
        phase: 'Alert',
        type: 2,
        commander: 'im1',
      };

      const incident2 = {
        id: '1234',
        phase: 'Alert',
        type: 2,
        commander: 'im1',
        assignee: 'im1',
      };

      expect(helpers.areIncidentsEqual(incident1, incident2)).toBe(false);
    });
  });
});
