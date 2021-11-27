import React from 'react';
import { __ } from 'lib/i18n';

// Routing
import { AnimatedPageRoute } from 'components/layout/Page';
import { RightDrawerRoute } from 'components/layout/RightDrawer';
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';

// Component Imports
import AuditLog from 'components/audit/AuditLog';
import IncidentListPanel from './IncidentListPanel';
import CreateIncidentPanel from './CreateIncidentPanel';
import EditIncidentPanel from './EditIncidentPanel';
import IncidentClose from './IncidentClose';
import IncidentDetails from './IncidentDetails';
import InfoPanel from 'components/info/InfoPanel';

/**
 * Incidents
 * Base component for Incidents containing all the Routes and components.
 */
class Incidents extends React.Component {
  render() {
    return [
      <LeftDrawerRoute
        key="incident-management-list-incidents"
        exact
        path="/incidents"
        component={IncidentListPanel}
        title={__('Incidents')}
        routeOnClose="/"
      />,
      <LeftDrawerRoute
        key="incident-management-create-incident"
        exact
        path="/incidents/create"
        component={CreateIncidentPanel}
        title={__('Create Incident')}
      />,
      <AnimatedPageRoute
        key="incident-management-incident-details"
        path="/incidents/details/:id"
      >
        <IncidentDetails />
      </AnimatedPageRoute>,
      <AnimatedPageRoute
        key="incident-management-close-incident"
        exact
        path="/incidents/details/:id/close"
      >
        <IncidentClose />
      </AnimatedPageRoute>,
      <RightDrawerRoute
        key="incident-management-edit-incident"
        exact
        path="/incidents/details/:id/edit"
        component={props => (<EditIncidentPanel incidentId={props.match.params.id} />)}
        title={__('Edit Incident')}
        backButton
      />,
      <RightDrawerRoute
        key="incident-management-incident-activity"
        exact
        path="/incidents/details/:id/auditLog"
        component={props => (<AuditLog path="/auth/audit/incident" params={{ limit: 20, objectId: props.match.params.id }} />)}
        title={__('Incident Activity')}
        backButton
      />,
      <RightDrawerRoute
        key="incident-management-log-entry-track"
        exact
        path="/incidents/details/:id/logEntry/:entryId/track/:trackId"
        component={props => (<InfoPanel trackId={props.match.params.trackId} />)}
      />,
      <RightDrawerRoute
        key="incident-management-log-entry-registry"
        exact
        path="/incidents/details/:id/logEntry/:entryId/registry/:registryId"
        component={props => (<InfoPanel registryId={props.match.params.registryId} />)}
      />,
      <RightDrawerRoute
        key="incident-management-log-entry-marker"
        exact
        path="/incidents/details/:id/logEntry/:entryId/marker/:markerId"
        component={props => (<InfoPanel markerId={props.match.params.markerId} />)}
      />,
      /*
            <RightDrawerRoute
                key="fleet-management-fleet-list"
                exact path="/fleet"
                component={FleetListPanel}
                title={__("Fleets")}
            />
            */
    ];
  }
}

export default Incidents;
