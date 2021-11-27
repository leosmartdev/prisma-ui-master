/**
 * PersonListItem
 *
 * Displays a person as a list item. Person can have as few props as a name or contain devices
 * including phone, email, etc...
 * if user ID is found, then person details will be pulled from that users information
 */
import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';

// Icons
import EditIcon from '@material-ui/icons/Edit';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

// Actions and helper imports
import { PersonShape } from 'components/person';

// Component Props
const propTypes = {
  /**
   * Person to display.
   */
  person: PropTypes.shape(PersonShape).isRequired,
  /**
   * When true, divider will be shown between list item rows
   */
  divider: PropTypes.bool,
  /**
   * When true, edit button will be showed as an action item icon.
   */
  isEditing: PropTypes.bool,
  /**
   * Callback when edit button is clicked on a person row. Required when isEditing is true
   */
  onEdit: PropTypes.func,
  /**
   * Callback when remove button is clicked on a person row. Required when isEditing is true.
   */
  onRemove: PropTypes.func,
};

const defaultProps = {
  divider: false,
  isEditing: false,
  onEdit: () => { },
  onRemove: () => { },
};

/*
 * Component
 */
function PersonListItem({ person, divider, onEdit, onRemove, isEditing }) {
  return (
    <ListItem divider={divider}>
      <ListItemText primary={person.name} secondary={person.userId || null} />
      {isEditing && (
        <ListItemSecondaryAction>
          <IconButton edge="end" onClick={() => onEdit(person)}>
            <EditIcon />
          </IconButton>
          <IconButton edge="end" onClick={() => onRemove(person)}>
            <RemoveCircleIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}

PersonListItem.propTypes = propTypes;
PersonListItem.defaultProps = defaultProps;

export default PersonListItem;
