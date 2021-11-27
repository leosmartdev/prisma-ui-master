import moment from 'moment';

import { __ } from 'lib/i18n';
import { walk } from 'lib/object';
import * as Country from 'lib/country';
import TrackFormatter from './TrackFormatter';

export default class AISFormatter extends TrackFormatter {
  mmsi(track) {
    const mmsi = walk('target.nmea.vdm.m1371.mmsi', track);
    return mmsi || this.noValue;
  }

  label(track) {
    const name = walk('metadata.name', track);
    if (name) {
      return name.trim();
    }
    return __('MMSI:{{mmsi}}', { mmsi: this.mmsi(track) });
  }

  sublabel = (track) => {
    if (track.target.type === 'VTSAIS') {
      return __('AIS - VTS');
    }
    return __('AIS');
  }

  countryCode(track) {
    try {
      return Country.fromMMSI(this.mmsi(track)).iso2;
    } catch (error) {
      return '-';
    }
  }

  country(track) {
    try {
      return Country.fromMMSI(this.mmsi(track)).name;
    } catch (error) {
      return '-';
    }
  }

  flag(track) {
    try {
      return Country.fromMMSI(this.mmsi(track)).flag;
    } catch (error) {
      return '';
    }
  }

  rateOfTurn(track) {
    const left = __('left');
    // L10N: direction
    const right = __('right');
    // L10N: abbreviation for minutes
    const min = __('min');

    const rot = walk('target.rateOfTurn', track);
    if (rot >= 720) {
      return `> 720°/${min} ${right}`;
    }

    if (rot <= -720) {
      return `> 720°/${min} ${left}`;
    }
    return super.rateOfTurn(track);
  }

  speed(track) {
    const speed = walk('target.speed', track);
    if (speed > 102.2) {
      return `> ${this.f.knots(102.2)}`;
    }
    return super.speed(track);
  }

  navigationalStatus(track) {
    const navStatus = position(track, 'navigationalStatus');
    if (!navStatus) {
      return this.noValue;
    }
    switch (navStatus) {
      case 0:
        return __('Underway');
      case 1:
        return __('Anchored');
      case 2:
        return __('Not under command');
      case 3:
        return __('Restricted maneuverability');
      case 4:
        return __('Constrained by draft');
      case 5:
        return __('Moored');
      case 6:
        return __('Aground');
      case 7:
        return __('Fishing');
      case 8:
        return __('Sailing');
      case 15:
        return __('Unknown');
    }
    return __('Code {{code}}', { code: navStatus });
  }

  positionAccuracy(track) {
    const pa = position(track, 'positionAccuracy');
    switch (pa) {
      case true:
        return __('High');
      case false:
        return __('Low');
    }
    return this.noValue;
  }

  raim(track) {
    const raim = position(track, 'raimFlag');
    switch (raim) {
      case true:
        return __('Yes');
      case false:
        return __('No');
    }
    return this.noValue;
  }

  specialManeuver(track) {
    const sm = position(track, 'specialManoeuvre');
    switch (sm) {
      case 1:
        return __('No');
      case 2:
        // L10n: Special Maneuver
        return __('Engaged');
    }
    return this.noValue;
  }

  imo(track) {
    const imo = vessel(track, 'imoNumber');
    return imo === undefined ? this.noValue : imo.toString();
  }

  callsign(track) {
    const callsign = vessel(track, 'callSign');
    return callsign === undefined ? this.noValue : callsign.trim();
  }

  vesselType(track) {
    const code = vessel(track, 'shipAndCargoType');
    if (code === undefined) {
      return this.noValue;
    }
    switch (code) {
      case 50:
        return __('Pilot');
      case 51:
        return __('Search and rescue');
      case 52:
        return __('Tug');
      case 53:
        return __('Port tender');
      case 54:
        return __('Anti-pollution');
      case 55:
        return __('Law enforcement');
      case 58:
        return __('Medical transport');
      case 59:
        return __('Resolution 18');
    }
    const digit1 = Math.trunc(code / 10);
    switch (digit1) {
      case 2:
        return __('Wing-in-ground');
      case 4:
        return __('High-speed craft');
      case 6:
        return __('Passenger ship');
      case 7:
        return __('Cargo ship');
      case 8:
        return __('Tanker');
      case 9:
        return __('Other');
    }
    const digit2 = code % 10;
    switch (digit2) {
      case 0:
        return __('Fishing');
      case 1:
        return __('Towing');
      case 2:
        return __('Towing (large)');
      case 3:
        return __('Dredging or underwater');
      case 4:
        return __('Diving');
      case 5:
        return __('Military');
      case 6:
        return __('Sailing');
      case 7:
        return __('Pleasure craft');
    }
    return __('Code {{code}}', { code });
  }

  destination(track) {
    const dest = vessel(track, 'destination');
    return dest === undefined ? this.noValue : dest.trim();
  }

  length(track) {
    const bow = vessel(track, 'dimBow') || 0;
    const stern = vessel(track, 'dimStern') || 0;
    const length = bow + stern;
    if (length > 0) {
      return this.f.metersShort(length);
    }
    return this.noValue;
  }

  breadth(track) {
    const port = vessel(track, 'dimPort') || 0;
    const starboard = vessel(track, 'dimStarboard') || 0;
    const breadth = port + starboard;
    if (breadth > 0) {
      return this.f.metersShort(breadth);
    }
    return this.noValue;
  }

  draft(track) {
    const value = vessel(track, 'draught');
    if (value === undefined) {
      return this.noValue;
    }
    if (value === 0) {
      return __('Not available');
    }
    const draft = value / 10.0;
    return this.f.metersShort(draft, 1);
  }

  eta(track) {
    const month = vessel(track, 'etaMonth');
    const day = vessel(track, 'etaDay');
    const hour = vessel(track, 'etaHour');
    const minute = vessel(track, 'etaMinute');

    // Assume that if month is not specified, the entire ETA information
    // is not avaialable.
    if (month === undefined) {
      return this.noValue;
    }

    // TMS should probably not be returning ETAs in this way, but
    // it is so add in a special case.
    if (month === 0 && day == 0 && hour == 0 && minute == 0) {
      return this.noValue;
    }
    if (month == 0 && hour == 24) {
      return this.noValue;
    }
    if (hour === 24) {
      return this.etaDate(track);
    }
    if (month === 0) {
      return this.etaTime(track);
    }
    return this.etaDateTime(track);
  }

  etaDateTime(track) {
    const month = vessel(track, 'etaMonth');
    const date = vessel(track, 'etaDay');
    const hour = vessel(track, 'etaHour');
    const minute = vessel(track, 'etaMinute');

    const thisYear = moment()
      .utc()
      .year();
    const eta = moment()
      .utc()
      .set({
        year: thisYear,
        month: month - 1,
        date,
        hour,
        minute,
      });
    const diff = moment().diff(eta, 'days');
    if (diff > 180) {
      eta.year(thisYear + 1);
    } else if (diff < -180) {
      eta.year(thisYear - 1);
    }
    return eta.tz(this.f.timeZone).format('LLL z');
  }

  etaDate(track) {
    const year = moment()
      .utc()
      .year();
    const month = vessel(track, 'etaMonth');
    const date = vessel(track, 'etaDay');
    const eta = moment()
      .utc()
      .set({ year, month: month - 1, date });
    return eta.format('LL');
  }

  etaTime(track) {
    const today = moment().utc();
    const year = today.year();
    const month = today.month();
    const date = today.date();
    const hour = vessel(track, 'etaHour');
    const minute = vessel(track, 'etaMinute');
    const eta = moment()
      .utc()
      .set({
        year,
        month,
        date,
        hour,
        minute,
      });
    return eta.tz(this.f.timeZone).format('LT z');
  }

  positioningDevice(track) {
    const code = vessel(track, 'positionDevice');
    if (code === undefined) {
      return this.noValue;
    }
    switch (code) {
      case 0:
        return __('Undefined');
      case 1:
        // L10n: Abbreviation: Global Positioning System
        return __('GPS');
      case 2:
        // L10n: Abbreviation: Globalnaya Navigazionnaya Sputnikovaya Sistema
        return __('GLONASS');
      case 3:
        return __('GPS/GLONASS');
      case 4:
        /*
         * L10n: Loran-C was a hyperbolic radio navigation system which allowed a receiver to
         * determine its position by listening to low frequency radio signals transmitted by fixed
         * land-based radio beacons.
         */
        return __('Loran-C');
      case 5:
        // L10n: Chayka is a Russian terrestrial radio navigation system, similar to LORAN-C.
        return __('Chayka');
      case 6:
        return __('Integrated navigation system');
      case 7:
        return __('Surveyed');
      case 8:
        /*
         * L10n: Galileo is the global navigation satellite system (GNSS) that is currently being
         * created by the European Union (EU)
         */
        return __('Galileo');
      case 15:
        // L10n: GNSS = global navigation satellite system
        return __('Internal GNSS');
    }
    return __('Code {{code}}', { code });
  }

  dataTerminalEquipment(track) {
    const dte = vessel(track, 'dataTerminalAvail');
    switch (dte) {
      case true:
        return __('Available');
      case false:
        return __('Not available');
    }
    return this.noValue;
  }

  vesselHazard(track) {
    const type = vessel(track, 'shipAndCargoType');
    if (type === undefined) {
      return this.noValue;
    }
    const digit1 = Math.trunc(type / 10);
    if (digit1 === 3 || digit1 === 5) {
      return '';
    }
    const digit2 = type % 10;
    switch (digit2) {
      case 1:
        return __('Category X');
      case 2:
        return __('Category Y');
      case 3:
        return __('Category Z');
      case 4:
        return __('Category OS');
    }
    return '';
  }
}

const position = (track, name) => walk(`target.nmea.vdm.m1371.pos.${name}`, track);

const vessel = (track, name) => walk(`metadata.nmea.vdm.m1371.staticVoyage.${name}`, track);
