/**
 * Shows the list of fleets passed into the component.
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

const propTypes = {
  /**
   * List of fleets to display.
   */
  fleets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  })),
  /**
   * Callback when the fleet is selected. Passes the fleet object.
   *
   * ## Signature
   * `onClick(fleet: object) => void`
   */
  onClick: PropTypes.func, // Handler for when a fleet row is selected
  /**
   * Style for the list. Will be passed directly to `<List />`
   */
  className: PropTypes.string,
};

const defaultProps = {
  className: null,
};

function FleetList({ fleets, onClick, className }) {
  if (!fleets) {
    return null;
  }

  return (
    <List disablePadding className={className}>
      {fleets.map(fleet => (
        <ListItem
          key={fleet.id}
          divider
          button
          onClick={() => { onClick(fleet); }}
        >
          <ListItemText primary={fleet.name || fleet.id} />
        </ListItem>
      ))}
    </List>
  );
}

FleetList.propTypes = propTypes;
FleetList.defaultProps = defaultProps;

export default FleetList;
