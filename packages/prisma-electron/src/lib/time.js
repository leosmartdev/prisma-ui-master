import moment from 'moment-timezone';

import { __ } from 'lib/i18n';

export function getDisplayTimeGroup(time, now = {}) {
  if (moment(time).isSameOrAfter(moment(now).startOf('day'))) {
    return { label: __('Today'), order: 0 };
  }
  if (
    moment(time).isSameOrAfter(
      moment(now)
        .subtract(1, 'days')
        .startOf('day'),
    )
  ) {
    return { label: __('Yesterday'), order: 1 };
  }
  if (moment(time).isSameOrAfter(moment(now).startOf('week'))) {
    return { label: __('This Week'), order: 2 };
  }
  if (moment(time).isSameOrAfter(moment(now).startOf('month'))) {
    return { label: __('This Month'), order: 3 };
  }

  return { label: __('Earlier'), order: 4 };
}
