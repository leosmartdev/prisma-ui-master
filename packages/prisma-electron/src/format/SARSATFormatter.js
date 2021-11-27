import { __ } from 'lib/i18n';
import * as Country from 'lib/country';
import { expand } from 'lib/object';
import TrackFormatter from './TrackFormatter';

export default class SARSATFormatter extends TrackFormatter {
  /**
   * Returns the beacon from the track or null if no beacon information can be found.
   *
   * Checks if all the following exist and if so return
   * returns `track.target.sarmsg.sarsatAlert.beacon`
   *
   * @param {object} track The track object to check
   * @return {object} beacon from track or null if no beacon can be found.
   */
  getBeaconFromTrack(track) {
    if (
      track &&
      track.target &&
      track.target.sarmsg &&
      track.target.sarmsg.sarsatAlert &&
      track.target.sarmsg.sarsatAlert.beacon
    ) {
      return track.target.sarmsg.sarsatAlert.beacon;
    }

    return null;
  }

  /**
   * Returns true if the message is unknown.
   *
   * This happens when a corrupted message is injected into
   * the system. Instead of ignoring these messages, we need to still display them, but the user
   * will have to parse the message body by hand. We do this since no beacon alert should ever
   * be dropped, they always must reach the user.
   *
   * When true, the message body will be on `track.target.sarmsg.messageBody` and this should be
   * displayed to the user in some form.
   *
   * @param {object} track
   * @return {boolean} true when the message is unknown and we can't parse the data. False if the
   * message is a normal SARSAT alert that we can parse all the information from the original
   * message.
   */
  isUnknownMessage(track) {
    const beacon = this.getBeaconFromTrack(track);
    if (
      !beacon ||
      (track.target && track.target.sarmsg && track.target.sarmsg.messageType === 'UNKNOWN')
    ) {
      return true;
    }

    return false;
  }

  detectionTime(track) {
    return this.timeReceived(track);
  }

  beaconId(track) {
    const beacon = this.getBeaconFromTrack(track);
    if (beacon) {
      return beacon.hexId;
    }
  }

  label(track) {
    return this.beaconId(track);
  }

  sublabel(track) {
    return __('Cospas-Sarsat Beacon: {{type}}', { type: this.beaconType(track) });
  }

  /**
   * Returns the `track.target.sarmsg.messageBody` attribute when it is on the track. If the
   * property does not exist on the object then `Unknown` is returned.
   *
   * @param {object} track The track to parse
   * @return {string} The original sarmsg body or 'Unknown'
   */
  rawMessageBody(track) {
    if (track && track.target && track.target.sarmsg && track.target.sarmsg.messageBody) {
      return track.target.sarmsg.messageBody;
    }

    return __('Unknown');
  }

  siteId(track) {
    if (
      track &&
      track.target &&
      track.target.sarmsg &&
      track.target.sarmsg.sarsatAlert &&
      track.target.sarmsg.sarsatAlert.siteNumber
    ) {
      return track.target.sarmsg.sarsatAlert.siteNumber;
    }

    return __('Unknown');
  }

  coordinates(track) {
    if (track.target.positions) {
      const ps = track.target.positions;
      return `${this.f.latitude(ps[0].latitude)} / ${this.f.longitude(ps[0].longitude)}`;
    }
    if (track.target.position) {
      return `${this.f.latitude(track.target.position.latitude)} / ${this.f.longitude(
        track.target.position.longitude,
      )}`;
    }
    return this.noValue;
  }

  coordinates2(track) {
    if (track.target.positions) {
      const ps = track.target.positions;
      return `${this.f.latitude(ps[1].latitude)} / ${this.f.longitude(ps[1].longitude)}`;
    }
    return null;
  }

  country(track) {
    try {
      const mid = track.target.sarmsg.sarsatAlert.beacon.countryCode;
      return `${Country.fromMID(mid).name} (${mid})`;
    } catch (error) {
      return '-';
    }
  }

  countryCode(track) {
    try {
      const mid = track.target.sarmsg.sarsatAlert.beacon.countryCode;
      const iso2 = Country.fromMID(mid).iso2;
      return iso2;
    } catch (error) {
      return '-';
    }
  }

  flag(track) {
    try {
      const mid = track.target.sarmsg.sarsatAlert.beacon.countryCode;
      return Country.fromMID(mid).flag;
    } catch (error) {
      return '';
    }
  }

  beaconType(track) {
    const beacon = this.getBeaconFromTrack(track);
    if (!beacon) {
      return __('Unknown');
    }

    if (beacon.maritimeUser) {
      return __('EPIRB');
    }

    if (beacon.radioCallSignUser) {
      return __('EPIRB');
    }

    if (beacon.aviationUser) {
      return __('ELT');
    }

    if (beacon.serialUser) {
      switch (beacon.serialUser.beaconType) {
        case undefined:
        case 0:
          return __('ELT'); // 0b000 with serial identifiation number
        case '1':
        case 1:
          return __('ELT'); // 0b001 with aircraft operator desingator & serial number
        case '2':
        case 2:
          return __('EPIRB'); // 0b010 float free EPRIBs with serial identification number
        case '3':
        case 3:
          return __('ELT'); // 0b011 ELTs with aircraft 24-bit address
        case '4':
        case 4:
          return __('EPIRB'); // 0b100 non float free EPRIBs with serial number
        case '6':
        case 6:
          return __('PLB'); // 0b110 PLBs with serial identificatoin number
      }
    } else if (beacon.nationalUser) {
      return __('National Use');
    } else if (beacon.maritimeStandardLocation) {
      return __('EPIRB');
    } else if (beacon.aviationStandardLocation) {
      return __('ELT');
    } else if (beacon.serialStandardLocation) {
      switch (beacon.serialStandardLocation.beaconType) {
        case '4':
        case 4:
          return __('ELT'); // 0b0100 ELT - serial
        case '5':
        case 5:
          return __('ELT'); // 0b0101 ELT - aircraft operator designator
        case '6':
        case 6:
          return __('EPIRB'); // 0b0110 EPRIB - serial
        case '7':
        case 7:
          return __('PLB'); // 0b0111 PLB - serial
      }
    } else if (beacon.shipSecurityLocation) {
      return __('SSAS');
    } else if (beacon.nationalLocation) {
      switch (beacon.nationalLocation.beaconType) {
        case '8':
        case 8:
          return __('ELT'); // 0b1000
        case '10':
        case 10:
          return __('EPIRB'); // 0b1010
        case '11':
        case 11:
          return __('PLB'); // 0b1011
        }
      } else if (beacon.rlsLocation) {
        if (!beacon.rlsLocation.isMmsi) {
          switch (beacon.rlsLocation.beaconType) {
            case undefined:
            case '0':
            case 0:
              return __('ELT'); // 0b00
            case '1':
            case 1:
              return __('EPIRB'); // 0b01
            case '2':
            case 2:
              return __('PLB'); // 0b10
            case '3':
            case 3:
              return __('Test'); // 0b11
          }
        } else {
          switch (beacon.rlsLocation.beaconType) {
            case undefined:
            case '0':
            case 0:
              return __('First EPIRB'); // 0b00
            case '1':
            case 1:
              return __('Second EPIRB'); // 0b01
            case '2':
            case 2:
              return __('PLB'); // 0b10
            case '3':
            case 3:
              return __('Test'); // 0b11
          }
        }
      }
    return __('Unknown');
  }

  userClass = track => {
    const beacon = this.getBeaconFromTrack(track);
    if (!beacon) {
      return __('Unknown');
    }
    if (beacon.orbitographyProtocol) {
      return __('Orbitography Protocol')
    }
    if (beacon.maritimeUser) {
      return __('User - EPIRB User');
    }
    if (beacon.radioCallSignUser) {
      return __('User - EPIRB User');
    }
    if (beacon.aviationUser) {
      return __('User - ELT User');
    }
    if (beacon.serialUser) {
      switch (beacon.serialUser.beaconType) {
        // 0b000 with serial identifiation number
        case undefined:
          return __('Serial User - ELT');
        // 0b001 with aircraft operator desingator & serial number
        case '1':
          return __('Serial User - ELT');
        // 0b010 float free EPRIBs with serial identification number
        case '2':
          return __('Serial User - EPIRB (Float Free)');
        // 0b011 ELTs with aircraft 24-bit address
        case '3':
          return __('Serial User - ELT');
        // 0b100 non float free EPRIBs with serial number
        case '4':
          return __('Serial User - EPIRB (Non-Float Free)');
        // 0b110 PLBs with serial identificatoin number
        case '6':
          return __('Serial User - PLB');
      }
    } else if (beacon.nationalUser) {
      return __('National Use');
    } else if (beacon.maritimeStandardLocation) {
      return __('Standard Location - EPIRB User');
    } else if (beacon.aviationStandardLocation) {
      return __('Standard Location - ELT User');
    } else if (beacon.serialStandardLocation) {
      switch (beacon.serialStandardLocation.beaconType) {
        // 0b0100 ELT - serial
        case '4':
          return __('Standard Location - ELT');
        // 0b0101 ELT - aircraft operator designator
        case '5':
          return __('Standard Location - ELT');
        // 0b0110 EPRIB - serial
        case '6':
          return __('Standard Location - EPRIB');
        // 0b0111 PLB - serial
        case '7':
          return __('Standard Location - PLB');
      }
    } else if (beacon.shipSecurityLocation) {
      return __('Standard Location - Ship Security');
    } else if (beacon.nationalLocation) {
      switch (beacon.nationalLocation.beaconType) {
        case '8':
          return __('National Location - ELT'); // 0b1000
        case '10':
          return __('National Location - EPRIB'); // 0b1010
        case '11':
          return __('National Location - PLB'); // 0b1011
      }
    } else if (beacon.rlsLocation) {
      if (!beacon.rlsLocation.isMmsi) {
        switch (beacon.rlsLocation.beaconType) {
          case undefined:
          case '0':
          case 0:
            return __('RLS - ELT'); // 0b00
          case '1':
          case 1:
            return __('RLS - EPIRB'); // 0b01
          case '2':
          case 2:
            return __('RLS - PLB'); // 0b10
          case '3':
          case 3:
            return __('RLS - Test'); // 0b11
        }
      } else {
        switch (beacon.rlsLocation.beaconType) {
          case undefined:
          case '0':
          case 0:
            return __('RLS - First EPIRB'); // 0b00
          case '1':
          case 1:
            return __('RLS - Second EPIRB'); // 0b01
          case '2':
          case 2:
            return __('RLS - PLB'); // 0b10
          case '3':
          case 3:
            return __('RLS - Test'); // 0b11
        }
      }
    }
    return __('Unknown');
  };

  idFieldName(track) {
    const beacon = this.getBeaconFromTrack(track);
    if (!beacon) {
      return '';
    }
    if (beacon.maritimeUser) {
      if (beacon.maritimeUser.callSign) {
        return __('Radio Call Sign');
      }
      return __('MMSI');
    }
    if (beacon.radioCallSignUser) {
      return __('Radio Call Sign');
    }
    if (beacon.aviationUser) {
      return __('Aircraft Registration');
    }
    if (beacon.serialUser) {
      switch (beacon.serialUser.beaconType) {
        // 0b000 with serial identifiation number
        case undefined:
          return __('Aircraft Serial Number');
        // 0b001 with aircraft operator desingator & serial number
        case '1':
          return __('Aircraft Operator Designator');
        // 0b010 float free EPRIBs with serial identification number
        case '2':
          return __('Serial Number');
        // 0b011 ELTs with aircraft 24-bit address
        case '3':
          return __('Aircraft 24-Bit Address');
        // 0b100 non float free EPRIBs with serial number
        case '4':
          return __('Serial Number');
        // 0b110 PLBs with serial identificatoin number
        case '6':
          return __('Serial Number');
      }
    } else if (beacon.nationalUser) {
      return '';
    } else if (beacon.maritimeStandardLocation) {
      return __('MMSI');
    } else if (beacon.aviationStandardLocation) {
      return __('Aircraft 24-Bit Address');
    } else if (beacon.serialStandardLocation) {
      switch (beacon.serialStandardLocation.beaconType) {
        // 0b0100 ELT - serial
        case '4':
          return __('Aircraft Serial Number');
        // 0b0101 ELT - aircraft operator designator
        case '5':
          return __('Aircraft Operator Designator');
        // 0b0110 EPRIB - serial
        case '6':
          return __('Serial Number');
        // 0b0111 PLB - serial
        case '7':
          return __('Serial Number');
      }
    } else if (beacon.shipSecurityLocation) {
      return __('MMSI');
    } else if (beacon.nationalLocation) {
      switch (beacon.nationalLocation.beaconType) {
        case '8':
          return __('Serial Number'); // 0b1000
        case '10':
          return __('Serial Number'); // 0b1010
        case '11':
          return __('Serial Number'); // 0b1011
      }
    } else if (beacon.rlsLocation) {
      if (beacon.rlsLocation.hasMmsi) {
        return __('MMSI (last 6)')
      }
      if (beacon.rlsLocation.nationalRlsNumber) {
        return __('National RLS Number')
      }
      return __('TAC Number')
    }
    return '';
  }

  idFieldValue(track) {
    const beacon = this.getBeaconFromTrack(track);
    if (!beacon) {
      return '';
    }
    if (beacon.maritimeUser) {
      if (beacon.maritimeUser.callSign) {
        return beacon.maritimeUser.callSign;
      }
      return beacon.maritimeUser.mmsi;
    }
    if (beacon.radioCallSignUser) {
      return beacon.radioCallSignUser.callSign;
    }
    if (beacon.aviationUser) {
      return beacon.aviationUser.aircraftRegistrationMarking;
    }
    if (beacon.serialUser) {
      const u = beacon.serialUser;
      switch (beacon.serialUser.beaconType) {
        // 0b000 with serial identifiation number
        case undefined:
          return u.serialNumber;
        // 0b001 with aircraft operator desingator & serial number
        case '1':
          return u.aircraftOperatorDesignator;
        // 0b010 float free EPRIBs with serial identification number
        case '2':
          return u.serialNumber;
        // 0b011 ELTs with aircraft 24-bit address
        case '3':
          // return sprintf('%06X', parseInt(u.aircraftAddress, 10));
          return parseInt(u.aircraftAddress, 10)
            .toString(16)
            .toUpperCase();
        // 0b100 non float free EPRIBs with serial number
        case '4':
          return u.serialNumber;
        // 0b110 PLBs with serial identificatoin number
        case '6':
          return u.serialNumber;
      }
    } else if (beacon.nationalUser) {
      return '';
    } else if (beacon.maritimeStandardLocation) {
      return beacon.maritimeStandardLocation.mmsi;
    } else if (beacon.aviationStandardLocation) {
      // return sprintf('%06X', parseInt(beacon.aviationStandardLocation.aircraftAddress, 10));
      return parseInt(beacon.aviationStandardLocation.aircraftAddress, 10)
        .toString(16)
        .toUpperCase();
    } else if (beacon.serialStandardLocation) {
      const u = beacon.serialStandardLocation;
      switch (beacon.serialStandardLocation.beaconType) {
        // 0b0100 ELT - serial
        case '4':
          return u.serialNumber;
        // 0b0101 ELT - aircraft operator designator
        case '5':
          return u.aircraftOperatorDesignator;
        // 0b0110 EPRIB - serial
        case '6':
          return u.serialNumber;
        // 0b0111 PLB - serial
        case '7':
          return u.serialNumber;
      }
    } else if (beacon.shipSecurityLocation) {
      return beacon.shipSecurityLocation.mmsi;
    } else if (beacon.nationalLocation) {
      switch (beacon.nationalLocation.beaconType) {
        case '8':
          return beacon.nationalLocation.serialNumber; // 0b1000
        case '10':
          return beacon.nationalLocation.serialNumber; // 0b1010
        case '11':
          return beacon.nationalLocation.serialNumber; // 0b1011
      }
    } else if (beacon.rlsLocation) {
      if (beacon.rlsLocation.hasMmsi) {
        return beacon.rlsLocation.mmsiSuffix
      }
      if (beacon.rlsLocation.nationalRlsNumber) {
       return beacon.rlsLocation.nationalRlsNumber
      }
      return beacon.rlsLocation.tacNumber
    }
    return '';
  }

  idField2Name(track) {
    const beacon = this.getBeaconFromTrack(track);
    if (!beacon) {
      return '';
    }
    if (beacon.maritimeUser) {
      return '';
    }
    if (beacon.radioCallSignUser) {
      return '';
    }
    if (beacon.aviationUser) {
      return '';
    }
    if (beacon.serialUser) {
      switch (beacon.serialUser.beaconType) {
        // 0b000 with serial identifiation number
        case undefined:
          return '';
        // 0b001 with aircraft operator desingator & serial number
        case '1':
          return __('Serial Number');
        // 0b010 float free EPRIBs with serial identification number
        case '2':
          return '';
        // 0b011 ELTs with aircraft 24-bit address
        case '3':
          return '';
        // 0b100 non float free EPRIBs with serial number
        case '4':
          return '';
        // 0b110 PLBs with serial identificatoin number
        case '6':
          return '';
      }
    } else if (beacon.nationalUser) {
      return '';
    } else if (beacon.maritimeStandardLocation) {
      return '';
    } else if (beacon.aviationStandardLocation) {
      return '';
    } else if (beacon.serialStandardLocation) {
      switch (beacon.serialStandardLocation.beaconType) {
        // 0b0100 ELT - serial
        case '4':
          return '';
        // 0b0101 ELT - aircraft operator designator
        case '5':
          return __('Serial Number');
        // 0b0110 EPRIB - serial
        case '6':
          return '';
        // 0b0111 PLB - serial
        case '7':
          return '';
      }
    } else if (beacon.shipSecurityLocation) {
      return '';
    } else if (beacon.nationalLocation) {
      switch (beacon.nationalLocation.beaconType) {
        case '8':
          return __(''); // 0b1000
        case '10':
          return __(''); // 0b1010
        case '11':
          return __(''); // 0b1011
      }
    } else if (beacon.rlsLocation) {
      if (beacon.rlsLocation.serialNumber) {
        return __('Serial Number')
      }
    }
    return '';
  }

  idField2Value(track) {
    const beacon = this.getBeaconFromTrack(track);
    if (!beacon) {
      return '';
    }
    if (beacon.maritimeUser) {
      return '';
    }
    if (beacon.radioCallSignUser) {
      return '';
    }
    if (beacon.aviationUser) {
      return '';
    }
    if (beacon.serialUser) {
      switch (beacon.serialUser.beaconType) {
        // 0b000 with serial identifiation number
        case undefined:
          return '';
        // 0b001 with aircraft operator desingator & serial number
        case '1':
          return beacon.serialUser.serialNumber;
        // 0b010 float free EPRIBs with serial identification number
        case '2':
          return '';
        // 0b011 ELTs with aircraft 24-bit address
        case '3':
          return '';
        // 0b100 non float free EPRIBs with serial number
        case '4':
          return '';
        // 0b110 PLBs with serial identificatoin number
        case '6':
          return '';
      }
    } else if (beacon.nationalUser) {
      return '';
    } else if (beacon.maritimeStandardLocation) {
      return '';
    } else if (beacon.aviationStandardLocation) {
      return '';
    } else if (beacon.serialStandardLocation) {
      switch (beacon.serialStandardLocation.beaconType) {
        // 0b0100 ELT - serial
        case '4':
          return '';
        // 0b0101 ELT - aircraft operator designator
        case '5':
          return beacon.serialStandardLocation.serialNumber;
        // 0b0110 EPRIB - serial
        case '6':
          return '';
        // 0b0111 PLB - serial
        case '7':
          return '';
      }
    } else if (beacon.shipSecurityLocation) {
      return '';
    } else if (beacon.nationalLocation) {
      switch (beacon.nationalLocation.beaconType) {
        case '8':
          return __(''); // 0b1000
        case '10':
          return __(''); // 0b1010
        case '11':
          return __(''); // 0b1011
      }
    } else if (beacon.rlsLocation) {
      if (beacon.rlsLocation.serialNumber) {
        return beacon.rlsLocation.serialNumber
      }
    }
    return '';
  }

  identification(track) {
    const beacon = this.getBeaconFromTrack(track);
    if (!beacon) {
      return '';
    }
    if (beacon.maritimeUser) {
      const u = beacon.maritimeUser;
      if (u.callSign) {
        return `${u.callSign}/${u.specificBeaconNumber || '0'}`;
      }
      return `${mmsi6(u.mmsi)}/${u.specificBeaconNumber || '0'}`;
    }
    if (beacon.radioCallSignUser) {
      const u = beacon.radioCallSignUser;
      return `${u.callSign}/${u.specificBeaconNumber || '0'}`;
    }
    if (beacon.aviationUser) {
      const u = beacon.aviationUser;
      return `${u.aircraftRegistrationMarking}/${u.specificBeaconNumber || '0'}`;
    }
    if (beacon.serialUser) {
      const u = beacon.serialUser;
      switch (beacon.serialUser.beaconType) {
        // 0b000 with serial identifiation number
        case undefined:
          return u.serialNumber;
        // 0b001 with aircraft operator desingator & serial number
        case '1':
          return `${u.aircraftOperatorDesignator}/${u.serialNumber || 0}`;
        // 0b010 float free EPRIBs with serial identification number
        case '2':
          return u.serialNumber;
        // 0b011 ELTs with aircraft 24-bit address
        case '3':
          return `${parseInt(u.aircraftAddress, 10)
            .toString(16)
            .toUpperCase()}/${u.specificEltNumber || 0}`;
        // 0b100 non float free EPRIBs with serial number
        case '4':
          return u.serialNumber;
        // 0b110 PLBs with serial identificatoin number
        case '6':
          return u.serialNumber;
      }
    } else if (beacon.nationalUser) {
      return '';
    } else if (beacon.maritimeStandardLocation) {
      const u = beacon.maritimeStandardLocation;
      return `${mmsi6(u.mmsi)}/${u.specificBeaconNumber || 0}`;
    } else if (beacon.aviationStandardLocation) {
      return parseInt(beacon.aviationStandardLocation.aircraftAddress, 10)
        .toString(16)
        .toUpperCase();
    } else if (beacon.serialStandardLocation) {
      const u = beacon.serialStandardLocation;
      switch (beacon.serialStandardLocation.beaconType) {
        // 0b0100 ELT - serial
        case '4':
          return `${u.certificateNumber}/${u.serialNumber}`;
        // 0b0101 ELT - aircraft operator designator
        case '5':
          return `${u.aircraftOperatorDesignator}/${u.serialNumber}`;
        // 0b0110 EPRIB - serial
        case '6':
          return `${u.certificateNumber}/${u.serialNumber}`;
        // 0b0111 PLB - serial
        case '7':
          return `${u.certificateNumber}/${u.serialNumber}`;
      }
    } else if (beacon.shipSecurityLocation) {
      return mmsi6(beacon.shipSecurityLocation.mmsi);
    } else if (beacon.nationalLocation) {
      switch (beacon.nationalLocation.beaconType) {
        case '8':
          return beacon.nationalLocation.serialNumber; // 0b1000
        case '10':
          return beacon.nationalLocation.serialNumber; // 0b1010
        case '11':
          return beacon.nationalLocation.serialNumber; // 0b1011
      }
    }
    return '';
  }

  homingSignal(track) {
    let home = null;
    const beacon = this.getBeaconFromTrack(track);
    if (!beacon) {
      return '';
    }

    if (beacon.maritimeUser) {
      home = beacon.maritimeUser.auxiliaryRadioLocatingDevice;
    }
    if (beacon.radioCallSignUser) {
      home = beacon.radioCallSignUser.auxiliaryRadioLocatingDevice;
    }
    if (beacon.aviationUser) {
      home = beacon.aviationUser.auxiliaryRadioLocatingDevice;
    }
    if (beacon.serialUser) {
      home = beacon.serialUser.auxiliaryRadioLocatingDevice;
    }
    switch (home) {
      case null:
        return '';
      case '0':
        return __('None');
      case '1':
        return __('121.5 MHz');
      case '2':
        return __('9 GHz');
      case '3':
        return __('Other');
    }
    return '';
  }
}

const mmsi6 = mmsi => {
  if (!mmsi) {
    return mmsi;
  }
  if (mmsi.length <= 6) {
    return mmsi;
  }
  return mmsi.substring(mmsi.length - 6);
};

/* eslint-disable implicit-arrow-linebreak */
export class SARSATAlertFormatter {
  constructor() {
    this.f = new SARSATFormatter();
  }

  label = alert =>
    this.f.beaconId(
      expand({
        'target.sarmsg.sarsatAlert.beacon': alert.target.sarsatBeacon,
      }),
    );

  sublabel = alert =>
    this.f.sublabel(
      expand({
        'target.sarmsg.sarsatAlert.beacon': alert.target.sarsatBeacon,
      }),
    );

  chip = () => __('SARSAT');

  chipStyle = () => ({
    backgroundColor: '#a00',
    color: '#fff',
    cursor: 'pointer',
  });
}
/* eslint-enable implicit-arrow-linebreak */
