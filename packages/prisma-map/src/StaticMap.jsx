import React from 'react';
import PropTypes from 'prop-types';

import Map from './Map';

StaticMap.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  zoom: PropTypes.number,
};

StaticMap.defaultProps = {
  width: 600,
  height: 400,
  latitude: 0,
  longitude: 0,
  zoom: 4,
};

/**
 * Static version of the map
 */
export default function StaticMap(props) {
  return <Map static {...props} />;
}
