import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import FlexContainer from 'components/FlexContainer';
import LogEntryExpansionPanel from './LogEntryExpansionPanel';
import FileExpansionPanel from './FileExpansionPanel';
import TrackExpansionPanel from './TrackExpansionPanel';
import MarkerExpansionPanel from './MarkerExpansionPanel';
import ActionExpansionPanel from './ActionExpansionPanel';

// Actions & Helpers
import * as IncidentHelpers from 'components/incidents/helpers';
import { types } from 'incident/log-entries';
import { hashObject } from 'lib/object';

const nanoConv = 10 ** 9;

/** ************************************
 *
 *  Log Entry List
 *
 ************************************ */
export default class LogEntryList extends Component {
  static propTypes = {
    // Callbacks
    onRemove: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onSelect: PropTypes.func,

    // The incident containing the log entries.
    // incident.log will be used if entries isn't provided
    incident: PropTypes.object.isRequired,

    // Provide a set of entries to display only.
    entries: PropTypes.array,

    // Allow sorting and what type of sort to default to
    sortable: PropTypes.bool,
    sort: PropTypes.oneOf(['time', '-time', 'name', 'type']),

    // Allow filtering and what type of filter to default to.
    filterable: PropTypes.bool,
  };

  static defaultProps = {
    sort: 'time', // default sort to by time
    sortable: false,
    filterable: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      sort: props.sort,
    };
  }

  componentWillReceiveProps(props) {
    if (props.sort) {
      this.setState({
        sort: props.sort,
      });
    }
  }

  onSort = sort => {
    this.setState({ sort });
  };

/* compareTimestamp defines the sort order. If omitted, the array elements are converted to strings, 
then sorted according to each character's Unicode code point value.*/
  compareTimestamp = (reverse = false) => (a, b) => {
    let t1 = a.timestamp.seconds + a.timestamp.nanos / nanoConv;
    let t2 = b.timestamp.seconds + b.timestamp.nanos / nanoConv;
    if (reverse) {
      return t1 - t2
    }
    return t2 - t1
  };

  compareType = (a, b) => {
    const typeA = a.type.toUpperCase();
    const typeB = b.type.toUpperCase();
    if (typeA < typeB) {
      return -1;
    }

    if (typeA > typeB) {
      return 1;
    }

    return 0;
  };

  render() {
    const { sort, entries, incident, onRemove, onSelect, onSave } = this.props;

    const sortedEntries = entries ? [...entries] : [...incident.log];

    if (sortedEntries) {
      switch (sort) {
        case 'time': {
          sortedEntries.sort(this.compareTimestamp());
          break;
        }
        case '-time': {
          sortedEntries.sort(this.compareTimestamp(true));
          break;
        }
        case 'type': {
          sortedEntries.sort(this.compareType);
          break;
        }
      }
    }

    return (
      <FlexContainer column align="start stretch">
        {sortedEntries &&
          sortedEntries.map(entry => (
            <LogEntryListItem
              locked={IncidentHelpers.isClosed(incident)}
              key={entry.id || hashObject(entry)}
              logEntry={entry}
              onSelect={onSelect}
              onRemove={onRemove}
              onNoteSave={onSave}
              incident={incident}
            />
          ))}
      </FlexContainer>
    );
  }
}

/** ************************************
 *
 *  Log Entry List Item
 *
 * Basic log entry item. Just returns the proper log entry based on
 * the type of entry. eg. Note, file, track.
 ************************************ */
LogEntryListItem.propTypes = {
  locked: PropTypes.bool,
  logEntry: PropTypes.object.isRequired,
  incident: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  onNoteSave: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

LogEntryListItem.defaultProps = {
  locked: false,
};

function LogEntryListItem({ logEntry, ...rest }) {
  // Dont show deleted entries.
  if (logEntry.deleted) {
    return null;
  }

  switch (logEntry.type) {
    case types.FILE: {
      return <FileExpansionPanel logEntry={logEntry} {...rest} />;
    }
    case types.TRACK: {
      return <TrackExpansionPanel logEntry={logEntry} {...rest} />;
    }
    case types.MARKER: {
      return <MarkerExpansionPanel logEntry={logEntry} {...rest} />
    }
    case types.ACTION_TRANSFER_FAIL:
    case types.ACTION_TRANSFER_RECEIVE:
    case types.ACTION_TRANSFER_SEND:
    case types.ACTION_CLOSE:
    case types.ACTION_OPEN:
    case types.ACTION_REOPEN: {
      return <ActionExpansionPanel logEntry={logEntry} {...rest} />;
    }
    default: {
      return <LogEntryExpansionPanel logEntry={logEntry} enableNoteDetaching={true} {...rest} />;
    }
  }
}
