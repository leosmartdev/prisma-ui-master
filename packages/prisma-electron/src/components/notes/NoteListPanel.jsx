/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Panel for displaying lists of notes. A filter dropdown is available to filter the list based
 * on the note states.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import ErrorBanner from 'components/error/ErrorBanner';
import FlexContainer from 'components/FlexContainer';
import DropDownButton from 'components/DropDownButton';
import NoteList from 'components/notes/NoteList';

import {
  Avatar,
  Button,
  Chip,
  Typography,
} from '@material-ui/core';

// Icons
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';

// Actions & Helpers
import { listNotes } from 'note/note';
import { filterNotes, isAssigned } from './helpers';

class NoteListPanel extends React.Component {
  static propTypes = {
    /** @private withRouter */
    history: PropTypes.object.isRequired,
    /** @private connect(mapStateToProps) */
    notes: PropTypes.array,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    notes: [],
  };

  static filterOptions = [
    { title: __('All'), id: 'none', icon: null },
    {
      title: __('Assigned'),
      id: 'assigned',
      icon: (
        <Avatar>
          <LinkIcon />
        </Avatar>
      ),
    },
    {
      title: __('Unassigned'),
      id: 'unassigned',
      icon: (
        <Avatar>
          <LinkOffIcon />
        </Avatar>
      ),
    },
  ];

  _isMounted = false;

  state = {
    filter: NoteListPanel.filterOptions[2],
    notes: [],
  };

  /**
   * When the component is mounting, we should dispatch the
   * list notes to start loading the data.
   */
  componentDidMount() {
    this._isMounted = true;
    this.getNotes();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => ({
      notes: filterNotes(newProps.notes, prevState.filter.id),
    }));
  }

  async getNotes() {
    const { createTransaction } = this.props;
    try {
      await createTransaction(listNotes());
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          errorBannerText: error.message,
        });
      }
    }
  }

  /**
   * Callback handler for when an note in the table is clicked.
   * We will open the `/notes/details/:id` route to show the details
   * of the note.
   */
  onNoteClick = note => {
    const { history } = this.props;
    let assigned = isAssigned(note);

    history.push({
      pathname: `/notes/details/${note.id}/${assigned.toString()}`,
      state: {
        note,
      },
    });
  };

  createNote = () => {
    const { history } = this.props;
    history.push('/notes/create');
  };

  setFilter = filter => {
    this.setState((prevState, props) => ({
      filter,
      notes: filterNotes(props.notes, filter.id),
    }));
  };

  getNullStateText = () => {
    const { filter } = this.state;
    switch (filter.id) {
      case 'assigned': {
        return __('There are no assigned notes.');
      }
      case 'unassigned': {
        return __('There are no unassigned notes.');
      }
    }

    return __('There are no notes in the system.');
  };

  render() {
    const { classes } = this.props;

    const { notes, filter, errorBannerText } = this.state;

    const nullStateText = this.getNullStateText();

    return (
      <div>
        <FlexContainer align="space-between">
          <DropDownButton
            label="Filter"
            options={NoteListPanel.filterOptions}
            selected={filter}
            onChange={this.setFilter}
          >
            {__('Filter')}
          </DropDownButton>
          <Button variant="contained" onClick={this.createNote}>
            {__('Create Note')}
          </Button>
        </FlexContainer>
        {filter && filter.id !== 'none' && (
          <FlexContainer align="start center">
            <Chip
              avatar={filter.icon}
              label={filter.title}
              onDelete={() => this.setFilter(NoteListPanel.filterOptions[0])}
            />
          </FlexContainer>
        )}
        <ErrorBanner message={errorBannerText} />
        {notes.length === 0 ? (
          <Typography variant="subtitle1" className={classes.nullState}>
            {nullStateText}
          </Typography>
        ) : (
          <NoteList onSelect={this.onNoteClick} notes={notes} />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  notes: state.notes.notes,
});

export default (NoteListPanel = withStyles(theme => ({
  nullState: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}))(withTransaction(withRouter(connect(mapStateToProps)(NoteListPanel)))));
