/* **********************************************
 *
 * CrewColumn
 *
 * Displays the crew information in the expansion card.
 *
 ********************************************* */

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import shortid from 'shortid';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import Header from 'components/Header';
import CrewList from 'components/fleet/vessel/CrewList';
import CrewForm from 'components/fleet/form/CrewForm';

import {
  IconButton,
  Divider,
  Hidden,
} from '@material-ui/core';

// Icons
import AddIcon from '@material-ui/icons/Add';

// Actions and Helpers
import { PersonShape, DefaultPerson } from 'components/person';

const crewColumnPropTypes = {
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired, // withStyles
  /**
   *  Crew object being edited.
   */
  crew: PropTypes.arrayOf(PropTypes.shape(PersonShape)),
  /**
   * If true, will not make room and show border for owner information on left
   */
  noOwner: PropTypes.bool,
  /**
   * When true, editing mode is active
   */
  isEditing: PropTypes.bool,
  /**
   * Callback when the crew list is changed during editing mode.
   * One param, type list of crew that was changed: onChange(crew: array)
   */
  onChange: PropTypes.func.isRequired,
};

const crewColumnDefaultProps = {
  crew: null,
  noOwner: false,
  isEditing: false,
};

class CrewColumn extends React.Component {
  state = {
    crew: null,
    showCrewForm: false,
    person: null, // person to edit if in edit mode
    saveButtonText: __('Save'),
  };

  constructor(props) {
    super(props);

    this.state.crew = props.crew;
  }

  componentWillReceiveProps(props) {
    // We are about to stop editing
    if (!props.isEditing && this.props.isEditing) {
      this.setState({
        showCrewForm: false,
      });
    }

    // Set crew state if crew changed and we aren't editing.
    if (!props.isEditing && props.crew !== this.props.crew) {
      this.setState({ crew: [...props.crew] });
    }
  }

  onAddClicked = () => {
    this.setState({
      isAdding: true,
      person: { ...DefaultPerson },
      showCrewForm: true,
      saveButtonText: __('Add'),
    });
  };

  onEditClicked = person => {
    this.setState({
      isAdding: false,
      person,
      showCrewForm: true,
      saveButtonText: __('Save'),
    });
  };

  /**
   * Person form was saved.
   */
  onSave = person => {
    this.setState(prevState => {
      let crew = prevState.crew;
      if (prevState.isAdding) {
        // new crew member
        crew = [
          ...prevState.crew,
          {
            id: shortid(),
            ...person,
          },
        ];
      } else {
        // Editing existing
        const mapFunc = crewMember => (crewMember.id === person.id ? person : crewMember);
        crew = this.props.crew.map(mapFunc);
      }

      this.props.onChange('crew')(crew);

      return {
        crew,
        isAdding: false,
        showCrewForm: false,
      };
    });
  };

  /**
   * User clicked remove icon on the crew member row.
   * @param {Person} person The person to remove from the crew list.
   */
  onRemove = person => {
    this.setState(prevState => {
      const { onChange } = this.props;
      const crew = prevState.crew.filter(crewMember => crewMember.id !== person.id);
      onChange('crew')(crew);

      return { crew };
    });
  };

  onCancel = () => {
    this.setState({
      crew: [...this.props.crew],
      person: null,
      showCrewForm: false,
    });
  };

  render() {
    const { classes, noOwner, isEditing } = this.props;

    const { showCrewForm, person, crew, saveButtonText } = this.state;

    if (!crew) {
      return null;
    }

    return (
      <FlexContainer column className={noOwner ? null : classes.root}>
        <Hidden mdUp>
          <Divider className={classes.divider} />
        </Hidden>
        <Header
          variant="h6"
          noDivider
          margin="none"
          action={
            isEditing ? (
              <IconButton onClick={this.onAddClicked}>
                <AddIcon />
              </IconButton>
            ) : null
          }
        >
          {__('Crew')}
        </Header>
        <span className={classes.content}>
          {showCrewForm ? (
            <CrewForm
              person={person}
              onSave={this.onSave}
              onCancel={this.onCancel}
              saveButtonText={saveButtonText}
            />
          ) : (
            <CrewList
              crew={crew}
              disablePadding
              onRemove={this.onRemove}
              isEditing={isEditing}
              onEdit={this.onEditClicked}
            />
          )}
        </span>
      </FlexContainer>
    );
  }
}

CrewColumn.propTypes = crewColumnPropTypes;
CrewColumn.defaultProps = crewColumnDefaultProps;

export default (CrewColumn = withStyles(theme => ({
  content: {
    marginTop: '8px',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  root: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: '24px',
      borderLeft: `2px solid ${theme.palette.divider}`,
      flexBasis: '50%',
      flexGrow: '1',
      marginLeft: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      flexBasis: '100%',
    },
  },
}))(CrewColumn));
