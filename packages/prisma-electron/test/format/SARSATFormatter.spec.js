import SARSATFormatter from '../../src/format/SARSATFormatter';

describe('format/SARSATFormatter', () => {
  let formatter;
  beforeEach(function() {
    formatter = new SARSATFormatter({
      distance: 'nauticalMiles',
      shortDistance: 'meters',
      speed: 'knots',
      coordinates: 'degreesMinutes',
      timeZone: 'UTC',
    });
  });

  describe('getBeaconFromTrack()', () => {
    it('Returns beacon when present', function() {
      const track = { target: { sarmsg: { sarsatAlert: { beacon: { id: 'foo' } } } } };

      expect(formatter.getBeaconFromTrack(track)).toEqual({ id: 'foo' });
    });

    it('Returns null when not present', function() {
      const track = { target: { sarmsg: { sarsatAlert: {} } } };

      expect(formatter.getBeaconFromTrack(track)).toBeNull();
    });

    it('Returns null when sarsatAlert is not present', function() {
      const track = { target: { sarmsg: {} } };

      expect(formatter.getBeaconFromTrack(track)).toBeNull();
    });

    it('Returns null when sarmsg is not present', function() {
      const track = { target: {} };

      expect(formatter.getBeaconFromTrack(track)).toBeNull();
    });

    it('Returns null when target is not present', function() {
      const track = {};

      expect(formatter.getBeaconFromTrack(track)).toBeNull();
    });

    it('Returns null when track is not passed in', function() {
      expect(formatter.getBeaconFromTrack()).toBeNull();
    });

    it('Returns null when target is not present', function() {
      const track = {};

      expect(formatter.getBeaconFromTrack(track)).toBeNull();
    });
  });

  describe('isUnknownMessage()', () => {
    it("returns true when message type is 'UNKNOWN'", () => {
      const track = {
        target: {
          sarmsg: {
            messageType: 'UNKNOWN',
            sarsatAlert: {
              beacon: {},
            },
          },
        },
      };

      expect(formatter.isUnknownMessage(track)).toBe(true);
    });

    it('returns true when beacon object is not found', () => {
      const track = {
        target: {
          sarmsg: {
            messageType: 'BAR',
            sarsatAlert: {},
          },
        },
      };

      expect(formatter.isUnknownMessage(track)).toBe(true);
    });

    it('returns true when track is empty', () => {
      const track = {};

      expect(formatter.isUnknownMessage(track)).toBe(true);
    });

    it("returns false when message type is not 'UNKNOWN'", () => {
      const track = {
        target: {
          sarmsg: {
            messageType: 'BAR',
            sarsatAlert: {
              beacon: {},
            },
          },
        },
      };

      expect(formatter.isUnknownMessage(track)).toBe(false);
    });
  });

  describe('rawMessageBody()', () => {
    it('Returns message when present', function() {
      const track = { target: { sarmsg: { messageBody: 'FOO' } } };

      expect(formatter.rawMessageBody(track)).toEqual('FOO');
    });

    it("Returns 'Unknown' when not present", function() {
      const track = { target: { sarmsg: {} } };

      expect(formatter.rawMessageBody(track)).toEqual('Unknown');
    });

    it("Returns 'Unknown' when target is not present", function() {
      const track = {};

      expect(formatter.rawMessageBody(track)).toEqual('Unknown');
    });

    it("Returns 'Unknown' when no track is passed", function() {
      expect(formatter.rawMessageBody()).toEqual('Unknown');
    });
  });

  describe('idFieldValue()', () => {
    describe('aircraftAddress', () => {
      it('returns aircraft address', () => {
        const track = {
          target: {
            sarmsg: {
              sarsatAlert: {
                beacon: {
                  serialUser: {
                    beaconType: '3',
                    aircraftAddress: 4641434,
                  },
                },
              },
            },
          },
        };

        const value = formatter.idFieldValue(track);
        expect(value).toEqual('46D29A');
      });

      it('returns aircraft address (aviation standard location)', () => {
        const track = {
          target: {
            sarmsg: {
              sarsatAlert: {
                beacon: {
                  aviationStandardLocation: {
                    aircraftAddress: 6878653,
                  },
                },
              },
            },
          },
        };

        const value = formatter.idFieldValue(track);
        expect(value).toEqual('68F5BD');
      });
    });
  });

  describe('identification()', () => {
    describe('aircraftAddress', () => {
      it('returns aircraft address and specificEltNumber', () => {
        const track = {
          target: {
            sarmsg: {
              sarsatAlert: {
                beacon: {
                  serialUser: {
                    beaconType: '3',
                    aircraftAddress: 4641434,
                    specificEltNumber: 45,
                  },
                },
              },
            },
          },
        };

        const value = formatter.identification(track);
        expect(value).toEqual('46D29A/45');
      });

      it('returns aircraft address with default spcificEltNumber', () => {
        const track = {
          target: {
            sarmsg: {
              sarsatAlert: {
                beacon: {
                  serialUser: {
                    beaconType: '3',
                    aircraftAddress: 4641434,
                  },
                },
              },
            },
          },
        };

        const value = formatter.identification(track);
        expect(value).toEqual('46D29A/0');
      });

      it('returns aircraft address (aviation standard location)', () => {
        const track = {
          target: {
            sarmsg: {
              sarsatAlert: {
                beacon: {
                  aviationStandardLocation: {
                    aircraftAddress: 6878653,
                  },
                },
              },
            },
          },
        };

        const value = formatter.identification(track);
        expect(value).toEqual('68F5BD');
      });
    });
  });
});
