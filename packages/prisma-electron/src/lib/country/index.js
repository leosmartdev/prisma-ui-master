import Immutable from 'immutable';

import { __ } from '../i18n';
import iso2 from './iso2';
import mid from './mid';
import flags from './flags';

const loadISO2 = () => {
  const table = iso2;
  return Immutable.Map(table);
};

const loadMID = () => Immutable.Map(mid);

export const loadFlags = () => Immutable.Map(flags);

export const tables = {
  iso2: loadISO2(),
  mid: loadMID(),
  flag: loadFlags(),
};

const invalid = () => ({
  iso2: '-',
  name: '-',
  // blank image
  // flag: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  flag: '',
});

export const fromISO2 = iso2 => {
  const enName = tables.iso2.get(iso2);
  if (!enName) {
    return invalid();
  }
  const country = {
    iso2,
    name: __(enName),
  };

  country.flag = tables.flag.get(iso2);

  return country;
};

export const fromMID = mid => {
  const iso2 = tables.mid.get(mid.toString());
  if (!iso2) {
    return invalid();
  }
  return fromISO2(iso2);
};

export const fromMMSI = mmsi => {
  mmsi = mmsi.toString();
  // Make sure the MMSI is 9 digit long, NMEA messages treat MMSI as an
  // integer, so any leading 0's may be missing.
  while (mmsi.length < 9) {
    mmsi = `0${mmsi}`;
  }

  let mid = false;

  // VHF coast station
  if (mmsi.startsWith('0099')) {
    // no MID in MMSI
  } else if (mmsi.startsWith('00')) {
    // Coast station identites
    mid = mmsi.substring(2, 5);
  } else if (mmsi.startsWith('0')) {
    mid = mmsi.substring(1, 4);
  } else {
    mid = mmsi.substring(0, 3);
  }
  if (!mid) {
    throw new Error(`No MID in MMSI: ${mmsi}`);
  }
  return fromMID(mid);
};
