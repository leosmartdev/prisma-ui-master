import { __ } from 'lib/i18n';

const latitude = {
  // L10n: Compass rose direction, North
  positive: __('N'),
  // L10n: Compass rose direction, South
  negative: __('S'),
};

const longitude = {
  // L10n: Compass rose direction, East
  positive: __('E'),
  // L10n: Compass rose direction, West
  negative: __('W'),
};

const separate = value => {
  const degrees = value;
  const minutes = Math.abs((degrees % 1) * 60);
  const seconds = Math.abs((minutes % 1) * 60);
  return [degrees, minutes, seconds];
};

const format = (value, format, count, hemis) => {
  const values = separate(value).slice(0, count);
  let hemi;
  if (count > 1) {
    hemi = values[0] < 0 ? hemis.negative : hemis.positive;
    values[0] = Math.abs(values[0]);
  }
  return format(...values, hemi);
};

const DECIMAL_FORMAT = degrees => `${degrees.toFixed(5)}°`;
const DEGREES_MINUTES_FORMAT = (degrees, minutes, hemi) =>
  `${Math.floor(degrees)}° ${minutes.toFixed(3)}' ${hemi}`; // "%d° %06.3f' %s";
const DEGREES_MINUTES_SECONDS_FORMAT = (degrees, minutes, seconds, hemi) =>
  `${Math.floor(degrees)}° ${Math.floor(minutes)}' ${seconds.toFixed(1)}" ${hemi}`;
// "%d° %06.3f' %s";

export const DecimalFormatter = {
  latitude: value => format(value, DECIMAL_FORMAT, 1, latitude),
  longitude: value => format(value, DECIMAL_FORMAT, 1, longitude),
};

export const DegreesMinutesFormatter = {
  latitude: value => format(value, DEGREES_MINUTES_FORMAT, 2, latitude),
  longitude: value => format(value, DEGREES_MINUTES_FORMAT, 2, longitude),
};

export const DegreesMinutesSecondsFormatter = {
  latitude: value => format(value, DEGREES_MINUTES_SECONDS_FORMAT, 3, latitude),
  longitude: value => format(value, DEGREES_MINUTES_SECONDS_FORMAT, 3, longitude),
};

export function getCoordinateFormatter(formatString) {
  switch (formatString) {
    case 'decimalDegrees':
    case 'decimal': {
      return DecimalFormatter;
    }
    case 'degreesMinutes': {
      return DegreesMinutesFormatter;
    }
    case 'degreesMinutesSeconds': {
      return DegreesMinutesSecondsFormatter;
    }
    default: {
      return DegreesMinutesFormatter;
    }
  }
}

const CoordinateFormatter = {
  DecimalFormatter,
  DegreesMinutesFormatter,
  DegreesMinutesSecondsFormatter,
  getCoordinateFormatter,
};

export default CoordinateFormatter;
