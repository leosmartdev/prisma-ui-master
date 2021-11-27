/**
 * CrewList
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import PersonListItem from 'components/person/PersonListItem';

import {
  List,
} from '@material-ui/core';

// Icons

// Actions and Helpers
import { PersonShape } from 'components/person';

// Component Props

const propTypes = {
  /**
   * The list of crew to display.
   */
  crew: PropTypes.arrayOf(PropTypes.shape(PersonShape)).isRequired,
  /**
   * Remove list padding when true. Passed to Material UI <List />
   */
  disablePadding: PropTypes.bool,
  /**
   * If true, list will be displayed in dense mode. Passed to Material UI <List />
   */
  dense: PropTypes.bool,
  /**
   * When true, edit buttons should be shown on the list.
   */
  isEditing: PropTypes.bool,
  /**
   * Callback when edit button is clicked on a crew row.
   */
  onEdit: PropTypes.func,
  /**
   * Callback when remove button is clicked on a crew row.
   */
  onRemove: PropTypes.func,
};

const defaultProps = {
  isEditing: true,
  disablePadding: false,
  dense: false,
  onEdit: () => { },
  onRemove: () => { },
};

/*
 * Component
 */
function CrewList({
  crew,
  disablePadding,
  dense,
  isEditing,
  onEdit,
  onRemove,
}) {
  return (
    <List disablePadding={disablePadding} dense={dense}>
      {crew.map(person => (
        <PersonListItem
          person={person}
          key={person.id}
          isEditing={isEditing}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </List>
  );
}

CrewList.propTypes = propTypes;
CrewList.defaultProps = defaultProps;

export default CrewList;
