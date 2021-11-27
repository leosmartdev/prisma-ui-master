/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Timeline expansion panel for track type log entries.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';
import log from 'loglevel';

// Components
// can't import format directly or build with fail because format is in node modules
import LogEntryExpansionPanel from './LogEntryExpansionPanel';

import {
  Button,
} from '@material-ui/core';

// Icons
import MyLocationIcon from '@material-ui/icons/MyLocation';

// Helpers & Actions
import * as features from 'map/features';
import getFormatterForTrack from '../../../format/format';

class TrackListItem extends React.Component {
  static propTypes = {
    /**
     * The log entry object being displayed.
     */
    logEntry: PropTypes.object.isRequired,
    /**
     *  If true, no edits can be made.
     */
    locked: PropTypes.bool.isRequired,
    /**
     * Called when a user clicks on the entry.
     */
    onSelect: PropTypes.func,
    /**
     * Called when the user clicks to remove the entry.
     */
    onRemove: PropTypes.func.isRequired,
    /**
     * Callback when a note for the track has been saved.
     */
    onNoteSave: PropTypes.func.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private mapStateToProps */
    config: PropTypes.object.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    onSelect: () => { },
  };

  _isMounted = false;

  state = {
    // The track from the server.
    track: null,
  };

  componentDidMount() {
    this._isMounted = true;

    /**
     * Loads the track or registry entry from the server.
     */
    const id = this.props.logEntry.entity.id;
    const type = this.props.logEntry.entity.type;
    const action = features.getFeature(id, type);
    this.props.createTransaction(action).then(
      response => {
        if (this._isMounted) {
          this.setState({ track: response });
        }
      },
      response => {
        log.warn(`Failed to retrieve feature id: ${id} type: ${type}`, response);
        if (this._isMounted) {
          this.setState({
            errorBannerText: __('Failed to retrieve the data for this feature.'),
          });
        }
      },
    );
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  onItemSelected = () => {
    this.props.onSelect(this.props.logEntry);
  };

  render() {
    const { logEntry, locked, config, onRemove, onNoteSave } = this.props;

    const { track } = this.state;

    let primaryText = __('Unkown Location Entry');
    let secondaryText = null;
    if (track) {
      const formatter = getFormatterForTrack(track, config);
      primaryText = formatter.label(track);
      secondaryText = formatter.sublabel ? formatter.sublabel(track) : null;
    }

    return (
      <LogEntryExpansionPanel
        logEntry={logEntry}
        locked={locked}
        primary={primaryText}
        secondary={secondaryText}
        icon={<MyLocationIcon />}
        actions={<Button onClick={this.onItemSelected}>{__('View More Details')}</Button>}
        onRemove={onRemove}
        onNoteSave={onNoteSave}
      />
    );
  }
}

const mapStateToProps = state => ({
  config: state.config,
});

export default withStyles({
  iconButton: {
    width: 24,
    marginLeft: '3px',
  },
  secondaryText: {
    textAlign: 'right',
    paddingRight: '35px',
  },
})(connect(mapStateToProps)(withTransaction(TrackListItem)));
