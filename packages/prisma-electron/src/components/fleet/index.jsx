import React from 'react';

// Routing
import { AnimatedPageRoute } from 'components/layout/Page';

// Component Imports
import FleetManagement from 'components/fleet/FleetManagement';
import FleetDetailsPage from 'components/fleet/FleetDetailsPage';

/**
 * Fleets
 * Base component for Fleets containing all the Routes and components.
 */
function Fleets() {
  return [
    <AnimatedPageRoute key="fleet-management" path="/fleet" direction="right">
      <FleetManagement />
    </AnimatedPageRoute>,
    <AnimatedPageRoute key="fleet-management-details" path="/fleet/:fleetId" direction="right">
      <FleetDetailsPage />
    </AnimatedPageRoute>,
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

export default Fleets;
