/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ----------------------
 * Note Details provides a detailed view of a single Note. Used when creating a note as well
 * The view is a SplitView, where the content is a create form or content of the note
 * The header contains some of the details of the note.
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';
import 'moment';

// Component Imports
import SplitView from 'components/layout/SplitView';
import FlexContainer from 'components/FlexContainer';
import Header from 'components/Header';
import ErrorDialog from 'components/error/ErrorDialog';
import ContentViewGroup from 'components/layout/ContentViewGroup';
import NoteDetailsAppBar from 'components/notes/NoteDetailsAppBar';
import AssignNoteDialog from 'components/notes/AssignNoteDialog';
import CreateNoteContentViewGroup from 'components/notes/CreateNoteContentViewGroup';
import EditNotePanel from 'components/notes/EditNotePanel';
import EditFilePanel from 'components/notes/EditFilePanel';

import {
  Typography,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Paper,
} from '@material-ui/core';

// Icons
import GoBack from 'components/icon/GoBack';
import WarningIcon from '@material-ui/icons/Warning';
import EditIcon from '@material-ui/icons/Edit';
import LinkOffIcon from '@material-ui/icons/LinkOff';

// Actions & Helpers
import * as actions from 'note/note';
import { types } from 'incident/log-entries';

/**
 * Style
 */
const styles = {
  container: {
    padding: '10px',
  },
  dialogText: {
    paddingLeft: '20px',
    paddingRight: '20px',
  }
}

/**
 * NoteDetails
 */
class NoteDetails extends React.Component {
  static propTypes = {
    /** @private withRouter() */
    match: PropTypes.object.isRequired,
    /** @private withRouter() */
    history: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,

    /** @private connect(mapStateToProps) */
    currentNote: PropTypes.object,
    /** @private connect(mapDispatchToProps) */
    initCurrentNote: PropTypes.func.isRequired,
  };

  static defaultProps = {

  };

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      // The Note's id passed along with the route
      noteId: null,

      // True if a note is an assigned one
      assigned: false,

      // True when you create a note
      isCreating: false,

      // True when the create note form is showing
      showNoteCreate: false,

      // Note type which you'd like to create
      noteToCreate: null,

      // Provided when the note load/update has a failure
      errorBannerText: null,

      // True when a request is loading
      noteIsLoading: false,

      /**
       * AssignIncidentDialog configuration
       * These props will be sent to the AssignIncidentDialog component.
       */
      assignDialogOpts: {
        open: false,
        errorBannerText: null,
        isLoading: false,
      },

      /**
       * Shows or hides the detach confirmation dialog.
       */
      showDetachDialog: false,

      /**
       * Shows or hides the error dialog.
       */
      showErrorDialog: false,

      /**
       * Options for error dialog.
       *
       * {function} onClose Callback when the dialog closes.
       */
      errorDialogOptions: { title: '', message: null, complete: false },
    };
  }

  /**
   * When the component is mounting, we should dispatch the
   * get a note to start loading the data.
   */
  componentDidMount() {
    this._isMounted = true;

    let noteId = this.props.match.params.id;
    let assigned = (this.props.match.params.assigned === 'true');
    this.setState({
      noteId,
      assigned,
    });

    if (noteId == undefined && assigned == false) {
      this.setState({ isCreating: true });
      return;
    }
    // Start load
    this.setState({ noteIsLoading: true });
    this.getNoteInfo(noteId, assigned);
  }

  /**
   * When the component is unmounting, initialize the Redux currentNote state
   */
  componentWillUnmount = () => {
    this._isMounted = false;
    this.props.initCurrentNote();
  };

  async getNoteInfo(noteId, assigned) {
    const { createTransaction } = this.props;
    try {
      await createTransaction(actions.getNote(noteId, assigned));
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          errorBannerText: error.message,
        });
      }
    }

    // Stop load      
    if (this._isMounted) {
      this.setState({ noteIsLoading: false });
    }
  }

  /**
   * Methods
   */

  /**
   * When you click "ASSIGN TO INCIDENT" button
   */
  onAssign = () => {
    const { isCreating } = this.state;

    if (isCreating === true) {
      this.setState({
        showErrorDialog: true,
        errorDialogOptions: {
          title: __('Assign Error'),
          message: __(
            'Before assigning current note to an incident, you should save it.',
          ),
          onClose: () => {
            this.setState({
              showErrorDialog: false,
              errorDialogOptions: { title: '', message: '' },
            });
          },
        },
      });

      return;
    }

    this.showAssignNoteDialog();
  }

  /**
   * Opens the assign note dialog so the user can assign note to an incident.
   */
  showAssignNoteDialog = () => {
    let title = __('Assign Note');
    let message = __(
      'Select an incident from the list below, or use the search box to find the incident.',
    );
    const okButtonText = __('Assign');

    this.setState(prevState => ({
      assignDialogOpts: {
        ...prevState.assignDialogOpts,
        title,
        message,
        okButtonText,
        open: true,
      },
    }));
  };

  /**
   * Called when the user hits ok or cancel on the assign note dialog.
   * If the user hit cancel the dialog is closed. If the user hits ok, then assign the note
   * and when successful response from the server, close the modal, otherwise, show an error.
   *
   * @param {boolean} okClicked Did the user hit ok or cancel.
   * @param {string} noteId Current Note ID.
   * @param {string} incidentId Incident ID that is selected to assign the note to.
   * @return {boolean} True if the assign was successful. False if an error occured and the
   * dialog will remain open.
   */
  onAssignDialogClose = async (okClicked, noteId, incidentId) => {
    const { createTransaction } = this.props;

    // If the user hit cancel, just close the modal and return.
    if (!okClicked) {
      if (this._isMounted) {
        this.setState(prevState => ({
          assignDialogOpts: {
            ...prevState.assignDialogOpts,
            open: false,
          },
        }));
      }

      return true;
    }

    // User hit ok
    try {
      await createTransaction(actions.assignNote(noteId, incidentId));
      if (this._isMounted) {
        this.setState(prevState => ({
          assignDialogOpts: {
            ...prevState.assignDialogOpts,
            errorBannerText: null,
            open: false,
          },
          assigned: true,
        }));
      }
    } catch (error) {
      if (this._isMounted) {
        this.setState(prevState => ({
          assignDialogOpts: {
            ...prevState.assignDialogOpts,
            errorBannerText: error.message,
          },
        }));
      }

      return false;
    }

    return true;
  };

  /** 
   * Called when the user hits the Detach Note button
   * Shows the Detach Confirmation Dialog
   * */
  onDetachDialogAccept = () => {
    this.setState({ showDetachDialog: true });
  };

  /** Called when the user hits the Detach Confirmation Dialog's cancel button */
  onDetachDialogCancel = () => {
    this.setState({ showDetachDialog: false });
  };

  /** Called when the user hits the Detach Confirmation Dialog's detach button */
  onDetachDialogConfirmed = async () => {
    const { createTransaction, currentNote } = this.props;

    this.setState({ showDetachDialog: false });

    let incidentId = currentNote.incident.id;
    let noteId = currentNote.note.id;

    try {
      await createTransaction(actions.detachNote(incidentId, noteId));
      if (this._isMounted) {
        this.setState({ assigned: false });
      }
    } catch (error) {
      this.onError(error, 'Detach Error', 'Sorry, we encountered a problem detaching the note from the incident. Please try again later.');
    }
  };

  /** Called when the user hits the Create Note button */
  showNoteCreate = () => {
    this.setState({
      showNoteCreate: true,
      noteToCreate: 'note',
    });
  };

  /** Called when the user hits the Create File button */
  showFileCreate = () => {
    this.setState({
      showNoteCreate: true,
      noteToCreate: 'file',
    });
  };

  /** Called when the user hits the Cancel button */
  closeCreate = () => {
    this.setState({
      showNoteCreate: false,
      noteToCreate: null,
    });
  };

  /** Craate Note */
  createNote = async note => {
    const payload = {
      note,
      type: types.NOTE,
    };

    await this.onCreate(payload);
    this.setState({
      showNoteCreate: false,
      noteToCreate: null,
    });
  };

  /** Upload File */
  uploadFile = (files, failedFiles) => {
    const filePromises = [];

    files.map(file => {
      const payload = {
        attachment: file,
        type: types.FILE,
      };
      filePromises.push(this.onCreate(payload));
    });

    // batches up all the file uploads. Shows error if any fail.
    Promise.all(filePromises).then(
      () => {
        // leave the upload if one or more files failed to upload from the file upload
        // components so that shows the upload failure.
        if (!failedFiles || failedFiles.length === 0) {
          this.closeCreate();
        }
      },
    );
  };

  /** Create a standalone note */
  onCreate = async note => {
    const { createTransaction } = this.props;

    try {
      await createTransaction(actions.createNote(note));
      if (this._isMounted) {
        this.setState({ isCreating: false });
      }
    } catch (error) {
      this.onError(error, 'Create Error', 'Sorry, we encountered a problem creating a new note. Please try again later.');
    }
  }

  /** Update the note */
  onUpdate = async note => {
    const { createTransaction, currentNote } = this.props;
    const { assigned } = this.state;
    let incidentId = null;
    if (assigned === true) {
      incidentId = currentNote.incident.id;
    }

    try {
      let newNote = await createTransaction(actions.updateNote(assigned, incidentId, note));
      if (this._isMounted) {
        this.setState({
          noteId: newNote.id,
        });
      }
    } catch (error) {
      this.onError(error, 'Update Error', 'Sorry, we encountered a problem updating the note. Please try again later.');
    }
  };

  /** Show error dialog */
  onError = (error, title, defaultMsg) => {
    let errorMsg;
    switch (error.status) {
      case 401:
      case 403: {
        errorMsg = __(
          'Your account does not have the correct permissions to access this page. Contact your administrator.',
        );
        break;
      }
      default: {
        errorMsg = __(
          defaultMsg,
        );
      }
    }

    if (this._isMounted) {
      this.setState({
        showErrorDialog: true,
        errorDialogOptions: {
          title: __(title),
          message: __(
            errorMsg,
          ),
          onClose: () => {
            this.setState({
              showErrorDialog: false,
              errorDialogOptions: { title: '', message: '' },
            });
          },
        },
      });
    }
  };

  /**
   * Child Components
   */

  // The component render for when no data is found
  nullCase = noteId => {
    const header = (
      <FlexContainer align="space-between center">
        <FlexContainer align="start center">
          <GoBack to="/notes" />
          <Typography variant="h4">{__('Not Found')}</Typography>
        </FlexContainer>
        <WarningIcon />
      </FlexContainer>
    );
    return (
      <SplitView header={header}>
        <FlexContainer align="center start">
          <Typography variant="h6">
            {`${__('Sorry, we could not find a Note')} ${noteId &&
              ` with the ID ${noteId}`}`}
          </Typography>
        </FlexContainer>
      </SplitView>
    );
  };

  loadingCase = () => {
    const header = (
      <FlexContainer align="space-between center">
        <FlexContainer align="start center">
          <GoBack to="/notes" />
          <Typography variant="h4">{__('Loading')}</Typography>
        </FlexContainer>
        <CircularProgress variant="indeterminate" color="primary" size={64} />
      </FlexContainer>
    );
    return <SplitView header={header} />;
  };

  // Renders the Assigned Incident sidebar
  renderSidebar = note => {
    let content;
    let { classes } = this.props;
    if (note && note.incident) {
      content = <List>
        <ListItem divider>
          <ListItemText primary={note.incident.incidentId} secondary={note.incident.name} />
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={this.showAssignNoteDialog}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" onClick={this.onDetachDialogAccept}>
              <LinkOffIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>;
    } else {
      content = <FlexContainer column align='start stretch'>
        <Typography variant="body2" className={classes.nullState}>
          {__('Not currently assigned to any Incidents.')}
        </Typography>

        <Button variant="contained" color="primary" onClick={this.onAssign}>
          {__('Assign to incident')}
        </Button>
      </FlexContainer>;
    }

    return <FlexContainer column style={styles.container}>
      <Header variant="h6" margin="normal">
        {__('Assigned Incident')}
      </Header>
      {content}
    </FlexContainer>;
  };

  // Renders the Create Panel when creating a new note  
  renderCreatePanel() {
    const { classes } = this.props;

    // Hide when creating note or uploading file.
    if (this.state.showNoteCreate) {
      switch (this.state.noteToCreate) {
        case 'note':
        case 'file': {
          return null;
        }
      }
    }

    return (
      <ContentViewGroup
        title={__('')}
        component={Paper}
        componentProps={{ elevation: 0 }}
      >
        <Paper elevation={2}>
          <FlexContainer column align="start stretch" padding="normal">
            <Typography variant="body1" align="center">
              {__('Create a new note')}
            </Typography>
            <React.Fragment>
              <Typography variant="body1" align="center">
                {__('You can add a new note by clicking one of the buttons below.')}
              </Typography>
              <FlexContainer align="center" className={classes.addButtonRow}>
                <Button
                  variant="contained"
                  onClick={this.showNoteCreate}
                  className={classes.addButton}
                >
                  {__('Create Note')}
                </Button>
                <Button
                  variant="contained"
                  onClick={this.showFileCreate}
                  className={classes.addButton}
                >
                  {__('Upload File')}
                </Button>
              </FlexContainer>
            </React.Fragment>
          </FlexContainer>
        </Paper>
      </ContentViewGroup>
    );
  }

  // Renders the edit panel
  renderEditPanel = (note) => {
    switch (note.type) {
      case types.FILE:
        return <EditFilePanel
          currentNote={note}
          onNoteSave={this.onUpdate}
        />
      default:
        return <EditNotePanel
          currentNote={note}
          onNoteSave={this.onUpdate}
        />;
    }
  }

  render() {
    const {
      noteId,
      noteIsLoading,
      isCreating,
      showErrorDialog,
      assignDialogOpts,
      errorDialogOptions,
      assigned,
      showDetachDialog,
      showNoteCreate,
      noteToCreate,
    } = this.state;

    const {
      currentNote,
      classes,
    } = this.props;

    // If transaction loaded, but the note isn't found, show error case.
    if (!isCreating && !currentNote) {
      if (noteIsLoading) {
        return this.loadingCase();
      }
      return this.nullCase(noteId);
    }

    const noteDetailsHeader = (
      <NoteDetailsAppBar
        assigned={assigned}
        note={currentNote}
        isCreating={isCreating}
      />
    );

    return (
      <SplitView
        header={noteDetailsHeader}
        sidebar={this.renderSidebar(currentNote)}
      >
        <FlexContainer>
          {/* ASSIGN DIALOG */}
          <AssignNoteDialog onClose={this.onAssignDialogClose} {...assignDialogOpts} />

          {/* DETACH CONFIRMATION DIALOG */}
          <Dialog open={showDetachDialog} onClose={this.onDetachDialogCancel}>
            <DialogTitle>Detach Note</DialogTitle>
            <DialogContentText style={styles.dialogText}>
              {__("Are you sure you want to detach this note from incident?")}
            </DialogContentText>
            <DialogActions>
              <Button id="note-remove-cancel" onClick={this.onDetachDialogCancel} color="primary">
                {__("Cancel")}
              </Button>
              <Button id="note-remove-confirm" onClick={this.onDetachDialogConfirmed}>
                {__("Detach")}
              </Button>
            </DialogActions>
          </Dialog>

          {/* ERROR DIALOG */}
          <ErrorDialog open={showErrorDialog} {...errorDialogOptions} />

          {/* CONTENT */}
          <FlexContainer column align="start center" classes={{ root: classes.note }}>
            {/* FOR CREATING NEW NOTE */}
            {isCreating && this.renderCreatePanel()}

            <CreateNoteContentViewGroup
              show={showNoteCreate && (noteToCreate === 'note' || noteToCreate == 'file')}
              noteType={noteToCreate}
              onNoteSave={this.createNote}
              onUploadFinished={this.uploadFile}
              onClose={this.closeCreate}
            />

            {/* FOR EDITING THE NOTE */}
            {!isCreating &&
              <ContentViewGroup>
                <FlexContainer column align="start stretch">
                  {this.renderEditPanel(currentNote.note)}
                </FlexContainer>
              </ContentViewGroup>
            }
          </FlexContainer>
        </FlexContainer>
      </SplitView>
    );
  }
}

const mapStateToProps = state => ({
  currentNote: state.notes.currentNote,
});

const mapDispatchToProps = dispatch => ({
  initCurrentNote: () => {
    dispatch(actions.initCurrentNote());
  },
});

export default (
  NoteDetails = withStyles(theme => ({
    nullState: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    addButton: {
      margin: theme.spacing(2),
    },
    note: {
      overflowY: 'auto',
      width: '100%',
      // make space for FAB icon when scrolled all the way to the bottom.
      paddingBottom: '100px',
    },
  }))(withTransaction(
    withRouter(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(NoteDetails)
    )
  )));
