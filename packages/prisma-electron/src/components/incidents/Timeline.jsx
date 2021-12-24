import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { __ } from 'lib/i18n';

// Component Imports
import FlexContainer from 'components/FlexContainer';
import LogEntryList from './log-entries/LogEntryList';
import ErrorBanner from 'components/error/ErrorBanner';
import InfoBanner from 'components/InfoBanner';
import ContentViewGroup from 'components/layout/ContentViewGroup';
import IncidentForwardProgress from 'components/incidents/IncidentForwardProgress';
import SearchObjectTimeline from 'components/incidents/SearchObjectTimeline';
import AddLogEntryContentViewGroup from 'components/incidents/log-entries/AddLogEntryContentViewGroup';
import DropDownButton from 'components/DropDownButton';

import 'date-fns';

import {
  Paper,
  Typography,
  Button,
  Avatar,
  Chip,
  TextField,
  Box,
  Grid,
  IconButton
} from '@material-ui/core';

import DateFnsUtils from '@date-io/date-fns';

import {
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from "@material-ui/lab";

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

// Icons
import MessageIcon from '@material-ui/icons/Message';
import FolderIcon from '@material-ui/icons/Folder';
import TargetIcon from '@material-ui/icons/LocationSearching';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import TextsmsIcon from '@material-ui/icons/Textsms';
import ImageIcon from '@material-ui/icons/Image';
import ClearIcon from "@material-ui/icons/Clear";

// Helpers & actions
import { types } from 'incident/log-entries';
import * as time from 'lib/time';
import { isClosed } from './helpers';

/**
 * Timeline
 */
class Timeline extends React.Component {
  static propTypes = {
    incident: PropTypes.object.isRequired,
    /**
     * Array of multicasts associated with this incident. Required
     * to be set, but not required to have multicasts.
     */
    multicasts: PropTypes.array.isRequired,
    groupBy: PropTypes.oneOf(['type', 'time']),
    /**
     * When not null an error banner will be displayed
     * with the message here displayed.
     */
    errorBannerText: PropTypes.string,
    /**
     * When not null an info banner will be displayed
     * with the message here displayed.
     */
    infoBannerText: PropTypes.string,

    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,

    classes: PropTypes.object.isRequired,

    onLogEntrySelected: PropTypes.func.isRequired,

    /** @private withIncident */
    onLogEntryAdd: PropTypes.func.isRequired,
    /** @private withIncident */
    onLogEntrySave: PropTypes.func.isRequired,
    /** @private withIncident */
    onLogEntryRemove: PropTypes.func.isRequired,
  };

  static defaultProps = {
    groupBy: 'time',
    infoBannerText: null,
    errorBannerText: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      showSpeedDial: false,
      errorBannerText: null,
      warningBannerText: null,
      groupBy: props.groupBy,
      noteTypeFilter: null,
      incidentLog: [],
      dateRange: {from: null, to: null}
    };
  }

  static noteTypeFilterOptions = [
    { title: __('All'), id: 'none', icon: null },
    {
      title: __('PDF'),
      id: 'pdf',
      icon: (
        <Avatar>
          <PictureAsPdfIcon />
        </Avatar>
      ),
    },
    {
      title: __('Image'),
      id: 'image',
      icon: (
        <Avatar>
          <ImageIcon />
        </Avatar>
      ),
    },
    {
      title: __('Text'),
      id: 'text',
      icon: (
        <Avatar>
          <TextsmsIcon />
        </Avatar>
      ),
    },
  ];

  componentDidMount() {
    this.setState({
      noteTypeFilter: Timeline.noteTypeFilterOptions[0],
      incidentLog: this.props.incident.log
    });
  }

  componentDidUpdate = prev => {
    if (JSON.stringify(this.props.incident) != JSON.stringify(prev.incident)) {
      const { noteTypeFilter, dateRange } = this.state;
      this.setState({
        incidentLog: this.filterIncidentLog(noteTypeFilter, dateRange)
      });
    }
  };

  componentWillReceiveProps(props) {
    this.setState({
      groupBy: props.groupBy,
    });
  }

  /** ********************************
   * Log Entry CRUD
   ********************************* */

  showNoteAdd = () => {
    this.setState({
      showLogEntryAdd: true,
      logEntryToAdd: 'note',
    });
  };

  showSearchObjectAdd = () => {
    this.setState({
      showLogEntryAdd: true,
      logEntryToAdd: 'searchObject',
    });
  };

  showFileAdd = () => {
    this.setState({
      showLogEntryAdd: true,
      logEntryToAdd: 'file',
    });
  };

  closeAdd = () => {
    this.setState({
      showLogEntryAdd: false,
      logEntryToAdd: null,
    });
  };

  addLogEntryNote = async (note, isTarget = false) => {
    this.setState({ logEntryErrorBannerText: null });

    const entry = {
      note,
      type: types.NOTE,
      target: isTarget,
    };

    try {
      await this.onLogEntryAdd(entry);
      this.setState({
        showLogEntryAdd: false,
        logEntryToAdd: null,
      });
    } catch (error) {
      this.setState({
        logEntryErrorBannerText: __('An error occured creating the note. Try again later.'),
      });
    }
  };

  addLogEntryFile = (files, failedFiles) => {
    this.setState({ logEntryErrorBannerText: null });
    // process the successful files
    const filePromises = [];

    files.map(file => {
      const entry = {
        attachment: file,
        type: types.FILE,
      };
      filePromises.push(this.onLogEntryAdd(entry));
    });

    // batches up all the log entry adds. Shows error if any fail.
    Promise.all(filePromises).then(
      () => {
        // leave the upload if one or more files failed to upload from the file upload
        // components so that shows the upload failure.
        if (!failedFiles || failedFiles.length === 0) {
          this.closeAdd();
        }
      },
      response => {
        this.setState({
          logEntryErrorBannerText:
            __('An error occurred while creating one or morelog entries: ') +
            (response.statusText || response.message),
        });
      },
    );
  };

  onLogEntryAdd = async logEntry => {
    this.setState({ logEntryErrorBannerText: null });
    try {
      return await this.props.onLogEntryAdd(logEntry);
    } catch (error) {
      this.setState({ logEntryErrorBannerText: error.message });
      throw error;
    }
  };

  onLogEntryRemoved = async logEntry => {
    this.setState({ logEntryErrorBannerText: null });
    try {
      await this.props.onLogEntryRemove(logEntry);
    } catch (error) {
      this.setState({ logEntryErrorBannerText: error.message });
    }
  };

  /**
   * Toggles speed dial actions being show when the speed dial is clicked.
   */
  onSpeedDialClick = () => {
    this.setState(prevState => ({ showSpeedDial: !prevState.showSpeedDial }));
  };

  showSpeedDialActions = () => {
    this.setState({ showSpeedDial: true });
  };

  hideSpeedDialActions = () => {
    this.setState({ showSpeedDial: false });
  };

  // Closes the details if the provided log entry match the opened
  // details panel
  closeDetails = logEntry => {
    if (this.props.location.pathname.includes(`logEntry/${logEntry.id}`)) {
      this.props.history.goBack();
    }
  };

  /** ********************************
   *
   * Sorting and Filtering
   *
   ********************************* */

  groupByType = () =>
    this.state.incidentLog.reduce((obj, entry) => {
      // Skip search objects
      if (entry.target === true) {
        return obj;
      }

      let type = entry.type;
      if (type.startsWith('ACTION')) {
        type = 'ACTION';
      }
      if (obj[type]) {
        obj[type].entries.push(entry);
      } else {
        obj[type] = { label: type, entries: [entry] };
      }

      return obj;
    }, {});

  /**
   * Group entitites by time. Time groups are.
   *  * Today.
   *  * Yesterday
   *  * This Week
   *  * This Month
   *  * Date
   */
  groupByTime = () =>
    this.state.incidentLog.reduce((obj, entry) => {
      // Skip search objects
      if (entry.target === true) {
        return obj;
      }

      const { label, order } = time.getDisplayTimeGroup(entry.timestamp.seconds * 1000);
      if (obj[order]) {
        obj[order].entries.push(entry);
      } else {
        obj[order] = { label, entries: [entry] };
      }

      return obj;
    }, {});

  filterIncidentLog = (noteTypeFilter, dateRange) => {
    // filter by note type
    let incidentLog = this.props.incident.log;
    if (noteTypeFilter.id === "none") {
      incidentLog = this.props.incident.log;
    }
    else {
      incidentLog = this.props.incident.log.filter((value) => {
        switch(noteTypeFilter.id) {
          case "image":
            return value.attachment && value.attachment.type.indexOf("image") > -1;
          case "text":
            return !value.attachment;
          case "pdf":
            return value.attachment && value.attachment.type.indexOf("pdf") > -1;
        }
      });
    }
    // filter by date range
    if (dateRange.from) {
      incidentLog = incidentLog.filter((value) => {
        const logTime = new Date(value.timestamp.seconds * 1000);
        return logTime > dateRange.from;
      });
    }
    if (dateRange.to) {
      incidentLog = incidentLog.filter((value) => {
        const logTime = new Date(value.timestamp.seconds * 1000 - 86400000);
        return logTime < dateRange.to;
      });
    }
    return incidentLog;
  };

  setNoteTypeFilter = filter => {
    this.setState({
      noteTypeFilter: filter,
      incidentLog: this.filterIncidentLog(filter, this.state.dateRange)
    });
  };

  setDateRange = value => {
    this.setState({
      dateRange: value,
      incidentLog: this.filterIncidentLog(this.state.noteTypeFilter, value)
    });
  };

  handleFromDateChange = value => {
    let dateRange = this.state.dateRange;
    if (value !== null) {
      dateRange.from = new Date(`${value.getFullYear()}-${value.getMonth()+1}-${value.getDate()}`);
      if (dateRange.to && dateRange.from > dateRange.to) {
        dateRange.to = dateRange.from;
      }
    } else {
      dateRange.from = null;
    }
    this.setState({
      dateRange,
      incidentLog: this.filterIncidentLog(this.state.noteTypeFilter, dateRange)
    });
  }

  handleToDateChange = value => {
    let dateRange = this.state.dateRange;
    if (value !== null) {
      dateRange.to = new Date(`${value.getFullYear()}-${value.getMonth()+1}-${value.getDate()}`);
      if (dateRange.from && dateRange.to < dateRange.from) {
        dateRange.from = dateRange.to;
      }
    } else {
      dateRange.to = null;
    }
    this.setState({
      dateRange,
      incidentLog: this.filterIncidentLog(this.state.noteTypeFilter, dateRange)
    });
  }

  clearAllFilters = () => {
    const dateRange = {from: null, to: null};
    const noteTypeFilter = Timeline.noteTypeFilterOptions[0];
    this.setState({
      dateRange: dateRange,
      noteTypeFilter: noteTypeFilter,
      incidentLog: this.filterIncidentLog(noteTypeFilter, dateRange)
    });
  };

  /** ********************************
   *
   *  Render
   *
   ********************************* */

  /**
   * Renders the null state of the log entry list
   */
  renderNullState() {
    const { classes, incident } = this.props;

    if (incident.log && incident.log.length > 1) {
      return null;
    }

    // Hide the null state when adding log entries.
    if (this.state.showLogEntryAdd) {
      switch (this.state.logEntryToAdd) {
        case 'note':
        case 'file': {
          return null;
        }
      }
    }
    return (
      <ContentViewGroup
        title={__('No Entries')}
        component={Paper}
        componentProps={{ elevation: 0 }}
      >
        <Paper elevation={2}>
          <FlexContainer column align="start stretch" padding="normal">
            <Typography variant="body2" align="center">
              {__('No entries for this Incident.')}
            </Typography>
            {!isClosed(incident) && (
              <React.Fragment>
                <Typography variant="body1" align="center">
                  {__('You can add a new entry by clicking one of the buttons below.')}
                </Typography>
                <FlexContainer align="center" className={classes.addButtonRow}>
                  <Button
                    variant="contained"
                    onClick={this.showNoteAdd}
                    className={classes.addButton}
                  >
                    {__('Create Note')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={this.showFileAdd}
                    className={classes.addButton}
                  >
                    {__('Upload File')}
                  </Button>
                </FlexContainer>
              </React.Fragment>
            )}
          </FlexContainer>
        </Paper>
      </ContentViewGroup>
    );
  }

  render() {
    const {
      incident,
      multicasts,
      classes,
      onLogEntrySelected,
      onLogEntrySave,
      infoBannerText,
      errorBannerText,
    } = this.props;

    const {
      groupBy,
      logEntryErrorBannerText,
      showSpeedDial,
      showLogEntryAdd,
      logEntryToAdd,
      noteTypeFilter,
      incidentLog,
      dateRange
    } = this.state;

    const searchObjects = incident.log ? incident.log.filter(entry => entry.target === true) : [];
    let groups = {};
    // console.log(noteTypeFilter, incidentLog);
    if (incident.log && incident.log.length !== 0) {
      switch (groupBy) {
        case 'type': {
          groups = this.groupByType();
          break;
        }
        case 'time': {
          groups = this.groupByTime();
          break;
        }
        default: {
          groups = {
            [__('Entities')]: { label: __('Entities'), entries: incidentLog },
          };
        }
      }
    }

    return (
      <FlexContainer column align="start center" classes={{ root: classes.entries }}>
        
        {/* Action Bar */}
        <FlexContainer align="end center" className={classes.contentActions}>
          <FlexContainer align="start center">
            <Typography variant="caption">
              Filter
            </Typography>
            <DropDownButton
              label="Type"
              options={Timeline.noteTypeFilterOptions}
              selected={noteTypeFilter}
              onChange={this.setNoteTypeFilter}
            >
              {__('Filter')}
            </DropDownButton>
          </FlexContainer>
          {noteTypeFilter && noteTypeFilter.id !== 'none' && (
            <FlexContainer align="start center">
              <Chip
                avatar={noteTypeFilter.icon}
                label={noteTypeFilter.title}
                onDelete={() => this.setNoteTypeFilter(Timeline.noteTypeFilterOptions[0])}
              />
            </FlexContainer>
          )}
          {/* Group By */}
          {groupBy === 'type' && (
            <Button onClick={() => this.setState({ groupBy: 'time' })}>
              {__('Group By Time')}
            </Button>
          )}
          {groupBy === 'time' && (
            <Button onClick={() => this.setState({ groupBy: 'type' })}>
              {__('Group By Type')}
            </Button>
          )}
        </FlexContainer>

        {/* Date Range Bar */}
        <div style={{ width: "100%" }}>
          {/* DateRange Picker */}
          <FlexContainer align="end center">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                clearable
                margin="normal"
                id="date-picker-dialog"
                label="From"
                format="MM/dd/yyyy"
                value={dateRange.from}
                onChange={this.handleFromDateChange}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={() => this.handleFromDateChange(null)}>
                      <ClearIcon />
                    </IconButton>
                  )
                }}
                InputAdornmentProps={{
                  position: "start"
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                style={{ width: "200px", marginTop: "0", marginBottom: "10px" , marginRight: "10px" }}
              />
              <KeyboardDatePicker
                clearable
                margin="normal"
                id="date-picker-dialog"
                label="To"
                format="MM/dd/yyyy"
                value={dateRange.to}
                onChange={this.handleToDateChange}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={() => this.handleToDateChange(null)}>
                      <ClearIcon />
                    </IconButton>
                  )
                }}
                InputAdornmentProps={{
                  position: "start"
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                style={{ width: "200px", marginTop: "0", marginBottom: "10px", marginRight: "10px" }}
              />
            </MuiPickersUtilsProvider>
          </FlexContainer>
        </div>

        <div style={{ width: "100%" }}>
          {((noteTypeFilter && noteTypeFilter.id !== 'none') || dateRange.from || dateRange.to) && (
            <FlexContainer align="end center">
              <Button onClick={this.clearAllFilters}>
                {__('Clear All Filters')}
              </Button>
            </FlexContainer>
          )}
        </div>

        {/* Error and info banners */}
        <ErrorBanner message={logEntryErrorBannerText} contentGroup />
        <ErrorBanner message={errorBannerText} contentGroup />
        <InfoBanner message={infoBannerText} contentGroup />

        {/* Multicast Progress */}
        {multicasts.length > 0 && (
          <ContentViewGroup>
            {multicasts.map(multicast => (
              <IncidentForwardProgress multicast={multicast} key={multicast.id} />
            ))}
          </ContentViewGroup>
        )}

        {/* Add Search Object Content */}
        <AddLogEntryContentViewGroup
          show={showLogEntryAdd && logEntryToAdd === 'searchObject'}
          entryType={logEntryToAdd}
          onNoteSave={this.addLogEntryNote}
          onClose={this.closeAdd}
        />

        {/* Search Objects. Only show when not adding a search object */}
        {!(showLogEntryAdd && logEntryToAdd === 'searchObject') && (
          <SearchObjectTimeline
            searchObjects={searchObjects}
            incident={incident}
            onRemove={this.onLogEntryRemoved}
            onSave={onLogEntrySave}
            onSelect={onLogEntrySelected}
            onCreateClicked={this.showSearchObjectAdd}
          />
        )}

        {/* Null State for Log Entries */}
        {this.renderNullState(groups)}

        {/* Add Log Entry Content */}
        <AddLogEntryContentViewGroup
          show={showLogEntryAdd && (logEntryToAdd === 'note' || logEntryToAdd == 'file')}
          entryType={logEntryToAdd}
          onNoteSave={this.addLogEntryNote}
          onUploadFinished={this.addLogEntryFile}
          onClose={this.closeAdd}
        />

        {/* Log Entry Groups */}
        {Object.keys(groups)
          .sort()
          .map(group => (
            <ContentViewGroup key={group} title={groups[group].label}>
              <LogEntryList
                onRemove={this.onLogEntryRemoved}
                onSave={onLogEntrySave}
                onSelect={onLogEntrySelected}
                incident={incident}
                entries={groups[group].entries}
              />
            </ContentViewGroup>
          ))}

        {/*
         * FAB
         */}
        {!isClosed(incident) && (
          <SpeedDial
            ariaLabel="Add Log Entries to Incident"
            className={classes.speedDial}
            icon={<SpeedDialIcon />}
            onBlur={this.hideSpeedDialActions}
            onClick={this.onSpeedDialClick}
            onClose={this.hideSpeedDialActions}
            onFocus={this.showSpeedDialActions}
            onMouseEnter={this.showSpeedDialActions}
            onMouseLeave={this.hideSpeedDialActions}
            open={showSpeedDial}
          >
            <SpeedDialAction
              icon={<TargetIcon />}
              tooltipTitle={__('Add Search Object')}
              onClick={this.showSearchObjectAdd}
            />
            <SpeedDialAction
              icon={<MessageIcon />}
              tooltipTitle={__('Add Note')}
              onClick={this.showNoteAdd}
            />
            <SpeedDialAction
              icon={<FolderIcon />}
              tooltipTitle={__('Upload File')}
              onClick={this.showFileAdd}
            />
          </SpeedDial>
        )}
      </FlexContainer>
    );
  }
}

export default withStyles(theme => ({
  entries: {
    overflowY: 'auto',
    width: '100%',
    // make space for FAB icon when scrolled all the way to the bottom.
    paddingBottom: '100px',
  },
  contentActions: {
    width: '100%',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  addButton: {
    margin: theme.spacing(2),
  },
  closeIcon: {
    position: 'absolute',
    paddingRight: theme.spacing(2),
    top: `-${theme.spacing(4)}px`,
    right: '0px',
  },
  speedDial: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: `calc(${theme.spacing(3)}px + ${theme.c2.drawers.right.width})`,
  },
}))(withRouter(Timeline));
