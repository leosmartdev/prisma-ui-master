/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Panel for displaying lists of incidents. A filter dropdown is available to filter the list based
 * on the incident states.
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
import IncidentList from 'components/incidents/IncidentList';

import {
  Avatar,
  Button,
  Chip,
  Typography,
} from '@material-ui/core';

// Icons
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import CallReceivedIcon from '@material-ui/icons/CallReceived';

// Actions & Helpers
import { listIncidents } from 'incident/incident';
import { filterIncidents } from './helpers';

class IncidentListPanel extends React.Component {
  static propTypes = {
    /** @private withRouter */
    history: PropTypes.object.isRequired,
    /** @private connect(mapStateToProps) */
    incidents: PropTypes.array,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    incidents: [],
  };

  static filterOptions = [
    { title: __('All'), id: 'none', icon: null },
    {
      title: __('Opened'),
      id: 'opened',
      icon: (
        <Avatar>
          <LockOpenIcon />
        </Avatar>
      ),
    },
    {
      title: __('Closed'),
      id: 'closed',
      icon: (
        <Avatar>
          <LockIcon />
        </Avatar>
      ),
    },
    {
      title: __('Received'),
      id: 'received',
      icon: (
        <Avatar>
          <CallReceivedIcon />
        </Avatar>
      ),
    },
  ];

  _isMounted = false;

  state = {
    filter: IncidentListPanel.filterOptions[1],
    incidents: [],
  };

  /**
   * When the component is mounting, we should dispatch the
   * list incidents to start loading the data.
   */
  componentDidMount() {
    this._isMounted = true;
    this.getIncidents();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => ({
      incidents: filterIncidents(newProps.incidents, prevState.filter.id),
    }));
  }

  async getIncidents() {
    const { createTransaction } = this.props;
    try {
      await createTransaction(listIncidents());
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          errorBannerText: error.message,
        });
      }
    }
  }

  /**
   * Callback handler for when an incident in the table is clicked.
   * We will open the `/incidents/detail/:id` route to show the details
   * of the incident.
   */
  onIncidentClick = incident => {
    const { history } = this.props;
    history.push({
      pathname: `/incidents/details/${incident.id}`,
      state: {
        incident,
      },
    });
  };

  createIncident = () => {
    const { history } = this.props;
    history.push('/incidents/create');
  };

  setFilter = filter => {
    this.setState((prevState, props) => ({
      filter,
      incidents: filterIncidents(props.incidents, filter.id),
    }));
  };

  getNullStateText = () => {
    const { filter } = this.state;
    switch (filter.id) {
      case 'closed': {
        return __('There are no closed incidents.');
      }
      case 'opened': {
        return __('There are currently no active incidents.');
      }
      case 'received': {
        return __('There are currently no transferred incidents awaiting assignment.');
      }
    }

    return __('There are no incidents in the system.');
  };

  // TODO: loader when the component is rendering, but the data hasn't finished
  // fetching yet.
  render() {
    const { classes } = this.props;

    const { incidents, filter, errorBannerText } = this.state;

    const nullStateText = this.getNullStateText();

    return (
      <div>
        <FlexContainer align="space-between">
          <DropDownButton
            label="Filter"
            options={IncidentListPanel.filterOptions}
            selected={filter}
            onChange={this.setFilter}
          >
            {__('Filter')}
          </DropDownButton>
          <Button variant="contained" onClick={this.createIncident}>
            {__('Create Incident')}
          </Button>
        </FlexContainer>
        {filter && filter.id !== 'none' && (
          <FlexContainer align="start center">
            <Chip
              avatar={filter.icon}
              label={filter.title}
              onDelete={() => this.setFilter(IncidentListPanel.filterOptions[0])}
            />
          </FlexContainer>
        )}
        <ErrorBanner message={errorBannerText} />
        {incidents.length === 0 ? (
          <Typography variant="subtitle1" className={classes.nullState}>
            {nullStateText}
          </Typography>
        ) : (
          <IncidentList onSelect={this.onIncidentClick} incidents={incidents} />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  incidents: state.incidents.incidents,
});

export default (IncidentListPanel = withStyles(theme => ({
  nullState: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}))(withTransaction(withRouter(connect(mapStateToProps)(IncidentListPanel)))));
