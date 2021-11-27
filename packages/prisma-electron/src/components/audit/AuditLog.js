import React, { Component } from 'react';
import { __ } from 'lib/i18n';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
const fs = require('fs');
const { dialog } = require('electron').remote;

// Components
import Infinite from 'react-infinite';
import { AutoSizer } from 'react-virtualized';

import FlexContainer from 'components/FlexContainer';

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
  CircularProgress,
} from "@material-ui/core";

// Icons
import AddIcon from '@material-ui/icons/Add';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import ReadIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import SyncIcon from '@material-ui/icons/Sync';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import AssignmentIcon from '@material-ui/icons/Assignment';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import GetAppIcon from '@material-ui/icons/GetApp';
import SearchIcon from '@material-ui/icons/Search';
import LinkOffIcon from '@material-ui/icons/LinkOff';

// Helpers
import * as actions from 'auth/user';

const styles = theme => ({
  root: {
    height: '100%',
  },
  list: {
    height: 'calc(100% - 20px)',
  },
  button: {
    marginBottom: '5px',
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  searchField: {
    marginBottom: '5px',
  },
  progress: {
    paddingTop: '30px',
  }
});

const searchDelay = 500;

class AuditLog extends Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this._isMounted = false;
    this.state = {
      loading: false,
      records: [],
      requestPrevious: null,
      // for the search input value
      query: '',
      // set with actual request query
      actualQuery: '',
    };
  }

  componentDidMount = () => {
    this._isMounted = true;
    this.fetchRecords(this.props.path, { params: this.props.params });
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  fetchRecords = (path, opts) => {
    const { query } = this.state;

    if (path && opts) {
      this.setState({
        loading: true,
      });
      let url;

      if (query != "") {
        opts = {
          ...opts,
          params: {
            ...opts.params,
            query,
          }
        }
      }

      if (opts.requestPrevious) {
        if (opts.params) {
          url = this.props.server.buildPaginationUrl(path, opts.requestPrevious, opts.params);
        } else {
          url = this.props.server.buildPaginationUrl(path, opts.requestPrevious);
        }
      } else {
        url = this.props.server.buildHttpUrl(path, opts);
      }
      this.props.server.paginate(url).then(response => {
        if (this._isMounted) {
          this.setState(prevState => {
            let records = prevState.records.concat(response.json);
            if (query != prevState.actualQuery) {
              records = response.json;
            }

            return {
              records,
              requestPrevious: response.prev,
              loading: false,
              actualQuery: query,
            }
          });
        }
      });
    }
  };

  // Export as JSON
  export = async () => {
    let totalRecords = [];
    const { query } = this.state;
    const { createTransaction, path, params } = this.props;

    let queryParams = {
      ...params,
      query,
    };

    totalRecords = await createTransaction(actions.readAuditLog(path, queryParams, true));

    let curDate = (new Date()).toISOString().substring(0, 19);
    curDate = curDate.replace(/T|:/g, '-');

    let fileName = `${__('Activities')}-${curDate} UTC.csv`;
    if (path.indexOf('incident') != -1) {
      fileName = `Incidents ${fileName}`;
    }

    let filePath = dialog.showSaveDialog({
      title: __('Export activities'),
      buttonLabel: __('Export'),
      filters: [
        { name: __('Comma-Separated Values'), extensions: ['csv'] }
      ],
      defaultPath: fileName,
    });

    if (!filePath) {
      return;
    }
    try {
      totalRecords.forEach(elem => {
        if (elem.description == "") {
          elem.description = `${AuditLog.getActionText(elem.action, elem)}`;
        } else {
          elem.description = `${AuditLog.getActionText(elem.action, elem)} (${elem.description})`;
        }
      });

      let csvContent = " ";
      if (totalRecords.length > 0) {
        let headerList = Object.keys(totalRecords[0]);
        let header = headerList.map(elem => elem.toUpperCase());
        header = header.join(",");
        csvContent += header + "\n";

        totalRecords.forEach(elem => {
          let row = [];

          headerList.forEach(key => {
            row[key] = elem[key];

            // to keep the csv format with commas inside column
            if (elem[key] && elem[key].indexOf(",") != -1) {
              row[key] = `"${elem[key].replace(/\"/g, "\'")}"`;
            }
          });
          row = Object.values(row).join(",");
          csvContent += row + "\n";
        });
      }

      fs.writeFileSync(filePath, csvContent, 'utf8');
    } catch (err) {
      dialog.showErrorBox(__('Error'), `${__('Unable to export')}: ${err}`)
    }
  };

  // call when the search input is changed
  handleChange = event => {
    let value = ``;
    let params = this.props.params;

    if (!event.target.value) {
      value = '';
    } else {
      value = event.target.value;
    }

    this.setState({
      query: value,
    });

    if (this.timer != null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.fetchRecords(this.props.path, {
        params
      });
    }, searchDelay);
  };

  render() {
    const { classes } = this.props;
    const {
      records,
      requestPrevious,
      query,
      actualQuery,
      loading
    } = this.state;
    let opts;
    if (requestPrevious != null) {
      opts = { requestPrevious };
    }

    const endAdornment = (
      <InputAdornment position="end">
        <IconButton onClick={this.handleChange}>
          <SearchIcon />
        </IconButton>
      </InputAdornment>
    );

    return (
      <FlexContainer column align="start stretch" className={classes.root}>
        <FormControl fullWidth className={classes.searchField}>
          <InputLabel htmlFor="search">{__('Search')}</InputLabel>
          <Input value={query} onChange={this.handleChange} endAdornment={endAdornment} />
        </FormControl>
        <FlexContainer column align="center flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={this.export}
            className={classes.button}
          >
            <GetAppIcon fontSize="small" className={classes.leftIcon} />
            {__('Export')}
          </Button>
        </FlexContainer>
        {
          (loading === true && query !== actualQuery) ? (
            <FlexContainer column align="center center" className={classes.progress}>
              <CircularProgress variant="indeterminate" color="primary" size={64} />
            </FlexContainer>
          ) : (
            <List dense disablePadding className={classes.list}>
              <AutoSizer disableWidth>
                {// eslint-disable-next-line no-unused-vars
                  ({ width, height }) =>
                    height > 0 && (
                      <Infinite
                        containerHeight={height}
                        elementHeight={74}
                        infiniteLoadBeginEdgeOffset={200}
                        onInfiniteLoad={() => this.fetchRecords('/auth/pagination', opts)}
                        isInfiniteLoading={loading}
                      >
                        {records.length === 0 ? (
                          <ListItem>
                            <ListItemText primary={__('No results')} />
                          </ListItem>
                        ) : (
                          records.map(record => {
                            let primaryContext = AuditLog.getActionText(record.action, record);
                            let actionIcon = AuditLog.getActionIcon(record.action);

                            if (record.description != "") {
                              primaryContext = (
                                <React.Fragment>
                                  <div>
                                    {primaryContext}
                                  </div>
                                  <div>
                                    {record.description}
                                  </div>
                                </React.Fragment>
                              );
                            }

                            return (
                              <ListItem key={record.id} divider>
                                {actionIcon}
                                <ListItemText
                                  inset={actionIcon ? false : true}
                                  primary={primaryContext}
                                  secondary={`by ${record.userId} ${record.created}`}
                                />
                              </ListItem>
                            );
                          }))}
                      </Infinite>
                    )}
              </AutoSizer>
            </List>
          )
        }
      </FlexContainer>
    );
  }

  static getActionText(action, record) {
    switch (action) {
      case 'GET':
        return `Get ${record.classId}`;
      case 'CREATE':
        return `Created ${AuditLog.getArticle(record.classId)} ${record.classId}`;
      case 'UPDATE':
        return `Edited ${AuditLog.getArticle(record.classId)} ${record.classId}`;
      case 'READ':
        return 'Read';
      case 'DELETE':
        return `Closed ${AuditLog.getArticle(record.classId)} ${record.classId}`;
      case 'OPEN':
        return `Opened ${AuditLog.getArticle(record.classId)} ${record.classId}`;
      case 'CLOSE':
        return `Closed ${AuditLog.getArticle(record.classId)} ${record.classId}`;
      case 'ADD_NOTE':
      case 'ADD_NOTE_ENTITY':
        return `Assigned note to incident`;
      case 'ADD_NOTE_FILE':
        return `Assigned file to incident`;
      case 'DELETE_NOTE':
      case 'DELETE_NOTE_ENTITY':
        return `Unassigned note from incident`;
      case 'DELETE_NOTE_FILE':
        return `Unassigned file from incident`;
      case 'DETACH_NOTE':
        return `Detached note from incident`;
      case 'ADD_VESSEL':
        return `Assigned vessel to fleet`;
      case 'REMOVE_VESSEL':
        return `Unassigned vessel from fleet`;
      case 'ASSIGN':
        return `Assigned to ${record.payload}`;
      case 'UNASSIGN':
        return 'Unassigned';
      case 'TERMINATE':
        return `Ended ${AuditLog.getArticle(record.classId)} ${record.classId}`;
      case 'AUTHENTICATE':
        return 'Authenticated';
      case 'ACK_ALL':
        return `Acknowledged all notices`;
      case 'ACK':
        return `Acknowledged ${AuditLog.getArticle(record.classId)} ${record.classId}`;
      default:
        return record.action;
    }
  }

  static startsWithVowel(word) {
    var vowels = ("aeiouAEIOU");
    return vowels.indexOf(word[0]) !== -1;
  }

  static getArticle(word) {
    return AuditLog.startsWithVowel(word) ? 'an' : 'a';
  }

  static getActionIcon(action) {
    switch (action) {
      case 'CREATE':
        return (
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
        );
      case 'UPDATE':
        return (
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
        );
      case 'READ':
        return (
          <ListItemIcon>
            <ReadIcon />
          </ListItemIcon>
        );
      case 'DELETE':
      case 'DELETE_NOTE':
      case 'DELETE_NOTE_FILE':
      case 'DELETE_NOTE_ENTITY':
        return (
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
        );
      case 'DETACH_NOTE':
        return (
          <ListItemIcon>
            <LinkOffIcon />
          </ListItemIcon>
        );
      case 'ASSIGN':
        return (
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
        );
      case 'AUTHENTICATE':
        return (
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
        );
      case 'ADD_NOTE':
      case 'ADD_NOTE_FILE':
      case 'ADD_NOTE_ENTITY':
        return (
          <ListItemIcon>
            <NoteAddIcon />
          </ListItemIcon>
        );
      case 'GET':
      case 'PUT':
      case 'POST':
        return (
          <ListItemIcon>
            <SyncIcon />
          </ListItemIcon>
        );
      case 'OPEN':
        return (
          <ListItemIcon>
            <LockOpenIcon />
          </ListItemIcon>
        );
      case 'CLOSE':
        return (
          <ListItemIcon>
            <LockIcon />
          </ListItemIcon>
        );
    }
  }
}

AuditLog.propTypes = {
  server: PropTypes.object.isRequired,
  path: PropTypes.string,
  params: PropTypes.object,
  classes: PropTypes.object.isRequired, // withStyles
  createTransaction: PropTypes.func.isRequired, // withTransaction
};

AuditLog.defaultProps = {
  path: '/auth/audit?',
};

const mapStateToProps = state => ({
  server: state.server,
});

export default withStyles(styles)(
  withTransaction(
    connect(mapStateToProps)(AuditLog)
  )
);
