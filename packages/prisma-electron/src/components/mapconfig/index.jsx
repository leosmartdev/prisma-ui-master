import React from 'react';
import { __ } from 'lib/i18n';

// Routing
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';

// Component Imports
import MapConfigList from './MapConfigList';
import MapConfigEdit from './MapConfigEdit';

/**
 * Map Config
 * Base component for Map Config containing all the Routes and components.
 */
class MapConfig extends React.Component {
  render() {
    return [
      <LeftDrawerRoute
        key="mapconfig-management-list"
        exact
        path="/mapconfig/list"
        component={MapConfigList}
        title={__('Track Display Timeout')}
        routeOnClose="/"
      />,
      <LeftDrawerRoute
        key="mapconfig-management-edit"
        exact
        path="/mapconfig/edit"
        component={MapConfigEdit}
        title={__('Edit Track Display Timeout')}
        routeOnClose="/mapconfig/list"
      />,
    ];
  }
}

export default MapConfig;
