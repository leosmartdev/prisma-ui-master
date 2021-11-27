import React from 'react';
import PropTypes from 'prop-types';
import log from 'loglevel';
import { withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { connect } from 'react-redux';
import { __ } from 'lib/i18n';

// Component Imports
import ErrorBanner from 'components/error/ErrorBanner';
import { FlexContainer } from 'components/layout/Container';
import IncidentForm from './IncidentForm';

import {
  Divider,
  Button,
} from '@material-ui/core';

// Actions & Helpers
import { acknowledgeForTarget } from 'notices/notices';
import { createIncident } from 'incident/incident';
import { types } from 'incident/log-entries';
import { PHASE } from './helpers';

/**
 * CreateIncidentPanel
 */
class CreateIncidentPanel extends React.Component {
  static propTypes = {
    /** @private withRouter */
    history: PropTypes.object.isRequired,
    /** @private withRouter */
    location: PropTypes.object.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private mapDispatchToProps */
    acknowledgeNoticeForTarget: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this._isMounted = false;

    let log = null;
    const params = new URLSearchParams(props.location.search);
    if (params.has('trackId')) {
      log = [
        { type: types.TRACK, entity: { id: params.get('trackId'), type: params.get('type') } },
      ];
    }
    if (params.has('markerId')) {
      log = [
        { type: types.MARKER, entity: { id: params.get('markerId'), type: params.get('type') } },
      ];
    }
    this.state = {
      incident: {
        phase: params.has('trackId') ? PHASE.DISTRESS : PHASE.UNCERTAINTY,
        type: '',
        log: log || [],
      },
      errorBannerText: null,
      fieldErrors: {},
      saveClicked: false,
      params,
    };
  }

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  formUpdated = incident => {
    this.setState({ incident });
  };

  cancelClicked = () => {
    this.props.history.goBack();
  };

  saveClicked = async () => {
    try {
      this.setState({ fieldErrors: {} });
      const action = createIncident(this.state.incident);
      const incident = await this.props.createTransaction(action);

      // ack alert if needed
      if (this.state.params.has('trackId')) {
        this.props.acknowledgeNoticeForTarget(this.state.params.get('trackId'));
      }

      // Navigate to the details page.
      this.props.history.push(`/incidents/details/${incident.id}`);
    } catch (error) {
      if (error.fieldErrors) {
        if (this._isMounted) {
          this.setState({ fieldErrors: error.fieldErrors });
        }
      } else {
        log.error('Error saving incident', error);
        if (this._isMounted) {
          this.setState({ errorBannerText: __('An error occured creating incident.') });
        }
      }
    }
  };

  render() {
    const { classes } = this.props;

    const {
      incident,

      errorBannerText,
      fieldErrors,
    } = this.state;

    return (
      <FlexContainer column align="start stretch">
        <ErrorBanner message={errorBannerText} compact />

        {/* Form */}
        <IncidentForm
          incident={incident}
          fieldErrors={fieldErrors}
          onChange={this.formUpdated}
          showId
          column
        />

        <Divider className={classes.divider} />

        {/* Actions: Save and Cancel */}
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.saveClicked}
        >
          {__('Create Incident')}
        </Button>
        <Button variant="contained" className={classes.button} onClick={this.cancelClicked}>
          {__('Cancel')}
        </Button>
      </FlexContainer>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  acknowledgeNoticeForTarget: target => {
    dispatch(acknowledgeForTarget(target)).catch(error => {
      log.warn('Could not acknowlege notice when target added to incident', error);
    });
  },
});

export default (CreateIncidentPanel = withStyles(theme => ({
  button: {
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
}))(
  withRouter(
    connect(
      null,
      mapDispatchToProps,
    )(withTransaction(CreateIncidentPanel)),
  ),
));
