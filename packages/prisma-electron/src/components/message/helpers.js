import moment from 'moment-timezone';

/**
 * Reformats a time with the provided format, or defaults to
 * MM/DD/YYY hh:mm:ss A z in the current time zone.
 * @return string Reformatted Time
 */
 export function formatTime(time, format) {
  const timeFormat = format || 'l LTS z';

  if (time) {
    const momentTime = moment(time).tz(moment().tz() || moment.tz.guess());

    return momentTime.format(timeFormat);
  }

  return null;
}