import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Component Imports
import FlexContainer from 'components/FlexContainer';
import LogEntryExpansionPanel from './LogEntryExpansionPanel';

import {
  Typography,
} from '@material-ui/core';

// Icons
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import CallMadeIcon from '@material-ui/icons/CallMade';
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';

// Helpers
import { types } from 'incident/log-entries';

ActionExpansionPanel.propTypes = {
  logEntry: PropTypes.object.isRequired,
  incident: PropTypes.object.isRequired,
  /** @private withStyles  */
  classes: PropTypes.object.isRequired,
};

function ActionExpansionPanel({ logEntry, classes, incident }) {
  let title = logEntry.type;
  let hasDetails = false;
  let icon = null;
  let details = null;
  switch (logEntry.type) {
    case types.ACTION_CLOSE: {
      title = __('Incident Closed');
      icon = <LockIcon />;
      // Only show details if there is a synopsis or outcome.
      // TODO: the outcome and synopsis should be moved to the entity since we can open and close
      // incidents multiple times now due to the transfer of incidents.
      if (incident.synopsis || incident.outcome) {
        hasDetails = true;
        details = (
          <FlexContainer column>
            <FlexContainer align="start center">
              <Typography variant="body2" classes={{ body1: classes.detailsHeader }}>
                {__('Outcome:')}
              </Typography>
              <Typography variant="body1">{incident.outcome}</Typography>
            </FlexContainer>
            <FlexContainer align="start center">
              <Typography variant="body2" classes={{ body1: classes.detailsHeader }}>
                {__('Close Synopsis:')}
              </Typography>
              <Typography variant="body1">{incident.synopsis}</Typography>
            </FlexContainer>
          </FlexContainer>
        );
      }
      break;
    }
    case types.ACTION_REOPEN: {
      title = __('Incident Re-Opened');
      icon = <LockOpenIcon />;
      break;
    }
    case types.ACTION_OPEN: {
      title = __('Incident Opened');
      icon = <LockOpenIcon />;
      break;
    }
    case types.ACTION_TRANSFER_SEND: {
      title = __('Incident Transferred');
      icon = <CallMadeIcon />;
      break;
    }
    case types.ACTION_TRANSFER_RECEIVE: {
      title = __('Incident Received');
      icon = <CallReceivedIcon />;
      break;
    }
    case types.ACTION_TRANSFER_FAIL: {
      title = __('Incident Transfer Failed');
      icon = <ReportProblemIcon />;
      break;
    }
  }

  return (
    <LogEntryExpansionPanel logEntry={logEntry} locked icon={icon} primary={title}>
      {!hasDetails ? null : (
        <FlexContainer align="start center" classes={{ root: classes.details }}>
          {details}
        </FlexContainer>
      )}
    </LogEntryExpansionPanel>
  );
}

export default withStyles({
  details: {
    padding: '10px 20px',
  },
  detailsHeader: {
    marginRight: '20px',
  },
})(ActionExpansionPanel);
