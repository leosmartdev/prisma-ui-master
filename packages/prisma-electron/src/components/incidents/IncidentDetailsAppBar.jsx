/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * Provides the SplitView Header for IncidentDetails.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import GoBack from 'components/icon/GoBack';

import {
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@material-ui/core';

// Icons
import ShareIcon from '@material-ui/icons/Share';
import AssignmentIcon from '@material-ui/icons/Assignment';
import EditIcon from '@material-ui/icons/Edit';

// Helpers
import { getPhase, isClosed, getIncidentStateIcon } from 'components/incidents/helpers';

IncidentDetailsAppBar.propTypes = {
  /**
   * The incident being displayed.
   */
  incident: PropTypes.object.isRequired,
  /**
   * True if the incident is currently loading. Will show
   * a loading indicator.
   */
  isLoading: PropTypes.bool,
  /**
   * Callback when the share menu is clicked.
   *
   * ## Signature
   * `onShareMenuClick(event: Event) => null`
   */
  onShareMenuClick: PropTypes.func.isRequired,
  /**
   * Callback when the incident edit button is clicked.
   *
   * ## Signature
   * `onEditButtonClick(event: Event) => null`
   */
  onEditButtonClick: PropTypes.func.isRequired,
  /** @private withStyles */
  classes: PropTypes.object.isRequired,
};

IncidentDetailsAppBar.defaultProps = {
  isLoading: false,
};

export function IncidentDetailsAppBar({
  incident,
  isLoading,
  classes,
  onShareMenuClick,
  onEditButtonClick,
}) {
  return (
    <FlexContainer align="space-between center">
      <FlexContainer>
        <GoBack to="/incidents" />
        <FlexContainer column align="center start">
          <Typography variant="h6" align="left">
            {incident.incidentId}
          </Typography>
          <Typography variant="subtitle1" align="left">
            {incident.name}
          </Typography>
        </FlexContainer>
        <FlexContainer column align="center start" classes={{ root: classes.phaseType }}>
          <Typography variant="body1" align="left">
            {getPhase(incident)}
          </Typography>
          <Typography variant="body1" align="left">
            {incident.type}
          </Typography>
        </FlexContainer>
        {isLoading && <CircularProgress variant="indeterminate" color="primary" size={24} />}
      </FlexContainer>
      <FlexContainer>
        <Tooltip title={__('Share or Transfer Incident Information')}>
          <IconButton onClick={onShareMenuClick}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
        <Link to={`/incidents/details/${incident.id}/auditLog`}>
          <Tooltip title={__('Incident Activity')}>
            <IconButton>
              <AssignmentIcon />
            </IconButton>
          </Tooltip>
        </Link>
        {!isClosed(incident) && (
          <Tooltip title={__('Edit Incident')}>
            <IconButton onClick={onEditButtonClick}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        <Link
          to={`/incidents/details/${incident.id}/close`}
          onClick={event => {
            if (isClosed(incident)) event.preventDefault();
          }}
        >
          <Tooltip title={isClosed(incident) ? __('Incident is closed') : __('Close Incident')}>
            <IconButton style={{ display: 'flex' }}>{getIncidentStateIcon(incident)}</IconButton>
          </Tooltip>
        </Link>
      </FlexContainer>
    </FlexContainer>
  );
}

export default withStyles({
  phaseType: {
    marginLeft: '30px',
  },
})(IncidentDetailsAppBar);
