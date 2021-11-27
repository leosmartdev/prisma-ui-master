import { __ } from 'lib/i18n';

const n__ = __.n;

export const feet = 'feet';
export const kilometers = 'kilometers';
export const meters = 'meters';
export const miles = 'miles';
export const nauticalMiles = 'nauticalMiles';
export const kilometersPerHour = 'kilometersPerHour';
export const knots = 'knots';
export const milesPerHour = 'milesPerHour';
export const metersPerSecond = 'metersPerSecond';

export class Unit {
  constructor(id, spec) {
    this.id = id;
    this.spec = spec;
  }

  get name() {
    return this.spec.name();
  }

  get title() {
    return this.spec.title();
  }

  names = count => this.spec.names(count);

  get symbol() {
    return this.spec.symbol();
  }

  toString = () => this.symbol();

  to = (value, target) => {
    if (!target.id) {
      target = units[target];
    }
    const conversion = this.spec.conversions[target.id];
    if (!conversion) {
      throw new Error(`No conversion from ${this.id.toString()} to ${target.id.toString()}`);
    }
    return conversion(value);
  };
}

export const units = {
  feet: new Unit(feet, {
    // L10n: Unit of measure
    name: () => __('foot'),
    title: () => __('Foot'),
    names: count => n__('foot', 'feet', count),
    // L10n: Symbol for unit of measure: foot
    symbol: () => __('ft'),
    conversions: {
      feet: v => v,
      kilometers: v => v * 0.0003048,
      meters: v => v * 0.3048,
      miles: v => v * 0.000189394,
      nauticalMiles: v => v * 0.000164579,
    },
  }),
  kilometers: new Unit(kilometers, {
    name: () => __('kilometer'),
    title: () => __('Kilometer'),
    names: count => n__('kilometer', 'kilometers', count),
    // L10n: Symbol for unit of measure: kilometer
    symbol: () => __('km'),
    conversions: {
      feet: v => v * 3280.84,
      kilometers: v => v,
      meters: v => v * 1000,
      miles: v => v * 0.621371,
      nauticalMiles: v => v * 0.539957,
    },
  }),
  meters: new Unit(meters, {
    // L10n: Unit of measure
    name: () => __('meter'),
    title: () => __('Meter'),
    names: count => n__('meter', 'meters', count),
    // L10n: Symbol for unit of measure: meter
    symbol: () => __('m'),
    conversions: {
      feet: v => v * 3.28084,
      kilometers: v => v * 0.001,
      meters: v => v,
      miles: v => v * 0.000621371,
      nauticalMiles: v => v * 0.000539957,
    },
  }),
  miles: new Unit(miles, {
    name: () => __('mile'),
    title: () => __('Mile'),
    names: count => n__('mile', 'miles', count),
    // L10n: Symbol for unit of measure: mile
    symbol: () => __('mi'),
    conversions: {
      feet: v => v * 5280,
      kilometers: v => v * 1.60934,
      meters: v => v * 1609.34,
      miles: v => v,
      nauticalMiles: v => v * 0.868976,
    },
  }),
  nauticalMiles: new Unit(nauticalMiles, {
    name: () => __('nautical mile'),
    title: () => __('Nautical Mile'),
    names: count => n__('nautical mile', 'nautical miles', count),
    // L10n: Symbol for unit of measure, nautical mile
    symbol: () => __('NM'),
    conversions: {
      feet: v => v * 6076.12,
      kilometers: v => v * 1.852,
      meters: v => v * 1852,
      miles: v => v * 1.15078,
      nauticalMiles: v => v,
    },
  }),
  kilometersPerHour: new Unit(kilometersPerHour, {
    name: () => __('kilometer per hour'),
    title: () => __('Kilometer per hour'),
    names: count => n__('kilometer per hour', 'kilometers per hour', count),
    // L10n: Symbol for unit of measure: kilometers per hour
    symbol: () => __('km/h'),
    conversions: {
      kilometersPerHour: v => v,
      knots: v => v * 0.539957,
      milesPerHour: v => v * 0.621371,
    },
  }),
  knots: new Unit(knots, {
    // L10n: Unit of measure
    name: () => __('knot'),
    title: () => __('Knot'),
    names: count => n__('knot', 'knots', count),
    // L10n: Symbol for unit of measure: knot
    symbol: () => __('kn'),
    conversions: {
      kilometersPerHour: v => v * 1.852,
      knots: v => v,
      milesPerHour: v => v * 1.15078,
    },
  }),
  milesPerHour: new Unit(milesPerHour, {
    name: () => __('mile per hour'),
    title: () => __('Mile per hour'),
    names: count => n__('mile per hour', 'miles per hour', count),
    // L10n: Symbol for unit of measure: miles per hour
    symbol: () => __('mph'),
    conversions: {
      kilometersPerHour: v => v * 1.852,
      knots: v => v,
      milesPerHour: v => v * 1.15078,
    },
  }),
  metersPerSecond: new Unit(metersPerSecond, {
    name: () => __('meters per second'),
    title: () => __('Mile per second'),
    names: count => n__('meters per second', 'meters per second', count),
    // L10n: Symbol for unit of measure: meters per hour
    symbol: () => __('m/s'),
    conversions: {
      metersPerSecond: v => v,
    },
  }),
};
