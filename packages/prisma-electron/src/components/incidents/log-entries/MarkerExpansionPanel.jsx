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
import { __ } from 'lib/i18n';
import log from 'loglevel';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';

// Components
import LogEntryExpansionPanel from './LogEntryExpansionPanel';

import {
  Button,
} from '@material-ui/core';

// Icons
import CategoryIcon from '@material-ui/icons/Category';

// Helpers & Actions
import getFormatterForTrack from '../../../format/format';
import * as features from 'map/features';

class MarkerExpansionPanel extends React.Component {
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
     * Callback when a note for the marker has been saved.
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
    // The marker from the server.
    marker: null,
  };

  componentDidMount() {
    this._isMounted = true;

    /**
     * Loads the marker from the server.
     */
    const id = this.props.logEntry.entity.id;
    const type = this.props.logEntry.entity.type;
    const action = features.getFeature(id, type);
    this.props.createTransaction(action).then(
      response => {
        if (this._isMounted) {
          this.setState({ marker: response });
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

    const { marker } = this.state;

    let primaryText = __('Unkown Location Entry');
    let secondaryText = null;
    if (marker) {
      const formatter = getFormatterForTrack(marker, config);
      primaryText = formatter.label(marker);
      secondaryText = formatter.sublabel ? formatter.sublabel(marker) : null;
    }

    return (
      <LogEntryExpansionPanel
        logEntry={logEntry}
        locked={locked}
        primary={primaryText}
        secondary={secondaryText}
        icon={<CategoryIcon />}
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
})(connect(mapStateToProps)(withTransaction(MarkerExpansionPanel)));
