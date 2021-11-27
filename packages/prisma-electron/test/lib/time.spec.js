import moment from 'moment-timezone';
import * as time from 'lib/time';

describe('lib/time', () => {
  describe('getDisplayTimeGroup', () => {
    it('is a function', () => {
      time.getDisplayTimeGroup(moment());
    });

    it('returns Today when date is now', () => {
      const { label, order } = time.getDisplayTimeGroup(moment());

      expect(label).toBe('Today');
      expect(order).toBe(0);
    });

    it('returns Today when date is 12:00 this morning', () => {
      const { label, order } = time.getDisplayTimeGroup(moment.utc({ hours: 0, minutes: 0, seconds: 0 }), moment.utc());

      expect(label).toBe('Today');
      expect(order).toBe(0);
    });

    it('returns Yesterday when date is yesterday', () => {
      const { label, order } = time.getDisplayTimeGroup(moment().subtract(1, 'day'));

      expect(label).toBe('Yesterday');
      expect(order).toBe(1);
    });

    it('returns Yesterday when date is yesterday at 23:59', () => {
      const { label, order } = time.getDisplayTimeGroup(moment().subtract(1, 'day').hours(23).minutes(59)
        .seconds(59));

      expect(label).toBe('Yesterday');
      expect(order).toBe(1);
    });

    it('returns This Week when date is first day of the week and now is thursday/friday', () => {
      const { label, order } = time.getDisplayTimeGroup(moment().weekday(0), moment().weekday(4));

      expect(label).toBe('This Week');
      expect(order).toBe(2);
    });

    it('returns this month when the date is older than this week but within the month', () => {
      const { label, order } = time.getDisplayTimeGroup(moment().startOf('month'), moment().endOf('month'));

      expect(label).toBe('This Month');
      expect(order).toBe(3);
    });

    it('returns earlier when the date is older than a month', () => {
      const { label, order } = time.getDisplayTimeGroup(moment().subtract(2, 'months'));

      expect(label).toBe('Earlier');
      expect(order).toBe(4);
    });
  });
});
