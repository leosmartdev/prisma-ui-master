import React from 'react';
import { __ } from 'lib/i18n';

// Routing
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';

// Component Imports
import ConfigList from './ConfigList';
import ConfigEdit from './ConfigEdit';

/**
 * Site Config
 * Base component for Site Config containing all the Routes and components.
 */
class Config extends React.Component {
  render() {
    return [
      <LeftDrawerRoute
        key="config-management-list"
        exact
        path="/config/list"
        component={ConfigList}
        title={__('Local Site Config')}
        routeOnClose="/"
      />,
      <LeftDrawerRoute
        key="config-management-edit"
        exact
        path="/config/edit"
        component={ConfigEdit}
        title={__('Edit Local Site Config')}
        routeOnClose="/config/list"
      />,
    ];
  }
}

export default Config;
