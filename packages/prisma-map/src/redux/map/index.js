/**
 * Redux actions/reducers/selectors/etc... for handling the style object for the map.
 * The style object is passed into the `<Map>` component and describes all aspects of the map from
 * style to data sources and layers.
 *
 * The map style is based on the mapbox style, documentation for the style can be found here:
 *      https://www.mapbox.com/mapbox-gl-js/style-spec
 */
import * as actions from './actions';
import * as types from './types';
import epics from './epics';
import reducer from './reducers';

export default reducer;
export {
  actions,
  types,
  epics,
};
