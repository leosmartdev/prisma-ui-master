import React from 'react';
import { __ } from 'lib/i18n';

// Routing
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';

// Component Imports
import RemoteSiteListPanel from './RemoteSiteListPanel';
import RemoteSiteConfigList from './RemoteSiteConfigList';
import RemoteSiteConfigEdit from './RemoteSiteConfigEdit';

/**
 * Remote Site Config
 * Base component for Remote Site Config containing all the Routes and components.
 */
class RemoteSiteConfig extends React.Component {
  render() {
    return [
      <LeftDrawerRoute
        key="remotesite-config-management-list"
        exact
        path="/remotesite-config/list"
        component={() => <RemoteSiteListPanel configType={'remotesite'} />}
        title={__('Remote Site Config')}
        routeOnClose="/"
      />,
      <LeftDrawerRoute
        key="remotesite-config-management-show"
        exact
        path="/remotesite-config/show"
        component={() => <RemoteSiteConfigList configType={'remotesite'} />}
        title={__('Remote Site Config')}
        routeOnClose="/remotesite-config/list"
      />,
      <LeftDrawerRoute
        key="remotesite-config-management-edit"
        exact
        path="/remotesite-config/edit"
        component={RemoteSiteConfigEdit}
        title={__('Edit Remote Site Config')}
        routeOnClose="/remotesite-config/list"
      />,
    ];
  }
}

export default RemoteSiteConfig;
