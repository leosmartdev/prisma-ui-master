import React from 'react';
import { __ } from 'lib/i18n';

// Routing
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';

// Component Imports
import CommunicationConfigEdit from 'components/communication-config/CommunicationConfigEdit';
import RemoteSiteListPanel from 'components/remotesite-config/RemoteSiteListPanel';
import RemoteSiteConfigList from 'components/remotesite-config/RemoteSiteConfigList';

/**
 * Communication Config
 * Base component for Communication Config containing all the Routes and components.
 */
class CommunicationConfig extends React.Component {
  render() {
    return [
      <LeftDrawerRoute
        key="communication-config-management-list"
        exact
        path="/communication-config/list"
        component={() => <RemoteSiteListPanel configType={'communication'} />}
        title={__('Communication Config')}
        routeOnClose="/"
      />,
      <LeftDrawerRoute
        key="communication-config-management-show"
        exact
        path="/communication-config/show"
        component={() => <RemoteSiteConfigList configType={'communication'} />}
        title={__('Communication Config')}
        routeOnClose="/communication-config/list"
      />,
      <LeftDrawerRoute
        key="communication-config-management-edit"
        exact
        path="/communication-config/edit"
        component={CommunicationConfigEdit}
        title={__('Edit Config')}
        routeOnClose="/communication-config/show"
      />,
    ];
  }
}

export default CommunicationConfig;
