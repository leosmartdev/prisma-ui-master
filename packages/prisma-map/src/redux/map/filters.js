import { getType } from '@turf/turf';

/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *
 * Collection of pure functions for filtering features into a layer. These are the implementations
 * of the `state['@prisma/map'].layers[id].filters` filters.
 */

/**
 * Runs the feature against the filter provided on the layer and returns the result.
 * If the filter is an empty array, that will always match and return true. The array is the filter
 * funtion followed by parameters for that function. To run multiple filters, use the `all` or `any`
 * filters to run && or || comparisons.
 *
 * @param {object} feature the feature to check against the filters.
 * @param {array} filters List containing the filter function and params to run.
 * @return {boolean} The boolean result of the filter run.
 */
export function runLayerFilter(feature, filter) {
  // Empty filter matches everything
  if (filter.length < 1) {
    return true;
  }

  // Get filter function, it should always be the first thing.
  const [filterFunc, ...params] = filter;

  // return runFilterFunction(feature, filterFunc, ...params);
  switch (filterFunc) {
    case 'all': return allFilter(feature, ...params);
    case 'any': return anyFilter(feature, ...params);
    case 'featureProperty': return featureProperty(feature, ...params);
    case 'featureType': return featureType(feature, ...params);
    default: return false;
  }
}

/**
 * AND boolean operation between all the filters passed in. If any of the filters passed are false,
 * the function returns false.
 *
 * @param {object} feature The feature
 * @param {array(filters)} filters The additional filters to be and'ed together.
 * @return {boolean} true if all sub filters are true, false if any of the sub filters are false.
 */
function allFilter(feature, ...filters) {
  return filters.every(filter => runLayerFilter(feature, filter));
}

/**
 * OR boolean operation between all the filters passed in. If any of the filters passed are true,
 * the function returns true, if all are false, then returns false.
 *
 * @param {object} feature The feature
 * @param {array(filters)} filters The additional filters to be or'ed together.
 * @return {boolean} true if any sub filters are true, false if all of the sub filters are false.
 */
function anyFilter(feature, ...filters) {
  return filters.some(filter => runLayerFilter(feature, filter));
}

/**
 *
 * Eg:
 *   `feature.properties[property] == value`
 *   `feature.properties[property] < value`
 *
 * Note: == will use the underlying === for the comparison.
 *
 * @param {object} feature The feature the filter is being applied to.
 * @param {string} operator boolean operator, oneof '==', '!=', '<=', '>=', '<', '>'
 * @param {string} property The property name to retrieve from `feature.properties`
 * @param {any} value The value to compare the retrieved property value against.
 */
export function featureProperty(feature, operator, property, value) {
  if (!feature.properties) {
    return false;
  }

  const featureValue = feature.properties[property];
  switch (operator) {
    case '==': return featureValue === value;
    case '!=': return featureValue !== value;
    case '<': return featureValue < value;
    case '>': return featureValue > value;
    case '<=': return featureValue <= value;
    case '>=': return featureValue >= value;
    default:
      return false;
  }
}

/**
 * Takes the provided feature and returns if it is of the provided type. If invalid feature is
 * passed in, will return false.
 *
 * Eg:
 * ```
 * feature.geometry.type == 'Point'
 * featureType(feature, 'Point') === true
 * featureType(feature, 'Polygon') === false
 * ```
 *
 * @param {object} feature The feature the filter is being applied to.
 * @param {string} type GeoJSON type to compare the feature to.
 * @return {boolean} true if the feature type matches the provided type.
 */
export function featureType(feature, type) {
  try {
    return getType(feature) === type;
  } catch (e) {
    return false;
  }
}
