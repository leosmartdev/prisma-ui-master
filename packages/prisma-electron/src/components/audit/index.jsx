import React from 'react';
import { __ } from 'lib/i18n';

// Components
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';
import AuditLog from 'components/audit/AuditLog';

class Audit extends React.Component {
  render() {
    return [
      <LeftDrawerRoute
        key="audit-list"
        path="/audit"
        component={() => <AuditLog path="/auth/audit" params={{ limit: 40 }} />}
        title={__('Activity')}
        routeOnClose="/users"
      />,
    ];
  }
}

export default Audit;
