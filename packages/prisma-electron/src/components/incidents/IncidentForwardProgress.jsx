/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *
 * Shows the current progress of an active Incident forward multicast.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";

// Icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import HelpIcon from '@material-ui/icons/Help';

const State = {
  Pending: 'Pending',
  Success: 'Success',
  Failure: 'Failure',
  Partial: 'Partial', // Partial success, some messages have failed.
  Retry: 'Retry', // Failed, but retrying again.
};

/**
 * Calculates the progress complete of a multicast. Also returns the successful transmissions and
 * failed transmissions.
 *
 * @param {object} multicast The multicast this progress split view is representing
 * @return {object} An object containing the progressPercentage:int, numTotal: int, completed:array
 *    packets, remaining:array packets, success:array packets, failed:array packets,
 *    transmissionErrorMessages:array string,
 */
function calculateMulticastProgress(multicast) {
  const transmissionProgress = {
    // Percentage complete of multicast transmission
    progressPercentage: 0,
    // Total number of packets in the multicast
    numTotal: 0,
    // List of all packets that are completed with failure or success
    completed: [],
    // List of all packets that are not in error or success state
    remaining: [],
    // List of all successful packets
    success: [],
    // List of all failed packets
    failed: [],
    // List of strings containing the transmission.status.message content
    transmissionErrorMessages: [],
  };

  const results = multicast.transmissions.reduce((stats, transmission) => {
    // Initially there are no packets
    if (!transmission.packets || transmission.packets.length === 0) {
      return stats;
    }

    // update total number of packets
    stats.numTotal += transmission.packets.length;

    // If the transmission has a status message add it to the transmissionErrorMessages
    if (`${transmission.state}` === State.Failure || `${transmission.state}` === State.Partial) {
      if (transmission.status && transmission.status.message) {
        stats.transmissionErrorMessages.push(transmission.status.message);
      }
    }

    // All packets are successful.
    if (`${transmission.state}` === State.Success) {
      stats.completed = stats.completed.concat(transmission.packets);
      stats.success = stats.success.concat(transmission.packets);
      return stats;
    }

    // All packets failed.
    if (`${transmission.state}` === State.Failure) {
      stats.completed = stats.completed.concat(transmission.packets);
      stats.failed = stats.failed.concat(transmission.packets);
      return stats;
    }

    // Pending or Partial so we must look at each packet to determine state
    const packetProgress = transmission.packets.reduce(
      (obj, packet) => {
        switch (packet.state) {
          case State.Success: {
            obj.success.push(packet);
            obj.completed.push(packet);
            break;
          }
          case State.Failure: {
            obj.failed.push(packet);
            obj.completed.push(packet);
            break;
          }
          case State.Retry:
          case State.Pending:
          default: {
            obj.remaining.push(packet);
          }
        }

        return obj;
      },
      {
        completed: [],
        failed: [],
        success: [],
        remaining: [],
      },
    );

    stats.completed = stats.completed.concat(packetProgress.completed);
    stats.success = stats.success.concat(packetProgress.success);
    stats.failed = stats.failed.concat(packetProgress.failed);
    stats.remaining = stats.remaining.concat(packetProgress.remaining);

    return stats;
  }, transmissionProgress);

  if (results.numTotal === 0) {
    // still waiting on packets to update
    results.progressPercentage = 25;
  } else {
    // we have packets so we can calculate an actual percentage.
    results.progressPercentage =
      25 +
      (65 / results.numTotal) * results.completed.length +
      (results.remaining.length === 0 ? 10 : 0);
  }

  return results;
}

IncidentForwardProgress.propTypes = {
  /**
   * The multicast for the incident foward.
   */
  multicast: PropTypes.object.isRequired,
  /** @private withStyles */
  classes: PropTypes.object.isRequired,
};

function IncidentForwardProgress({ multicast, classes }) {
  let site = null;
  if (multicast.destinations.length > 0 && multicast.destinations[0].name) {
    site = multicast.destinations[0];
  }

  const {
    progressPercentage,
    numTotal,
    completed,
    success,
    failed,
    remaining,
    transmissionErrorMessages,
  } = calculateMulticastProgress(multicast);

  // If we have less than 4 "items" being transferred, just show indeterminate.
  const variant = numTotal < 1 ? 'indeterminate' : 'determinate';
  const showProgress = progressPercentage < 100;
  const isDone = completed.length === numTotal;
  const didSucceed = success.length === numTotal;
  const didFail = failed.length > 0;

  return (
    <Accordion>
      {showProgress && (
        <LinearProgress
          variant={variant}
          className={classes.linearProgress}
          value={progressPercentage}
        />
      )}
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <FlexContainer align="space-between center" className={classes.summary}>
          {isDone ? (
            <Typography>
              {didSucceed
                ? __('Incident Successfully Transferred')
                : __('Incident Failed to Transfer')}
            </Typography>
          ) : (
            <Typography>
              {site !== null
                ? __('Transferring Incident to site {{site}}', { site: site.name })
                : __('Transferring Incident')}
            </Typography>
          )}
          {didFail && <ErrorIcon className={classes.failure} />}
        </FlexContainer>
      </AccordionSummary>
      <AccordionDetails>
        <FlexContainer column align="start stretch">
          {isDone && didFail && (
            <React.Fragment>
              <Typography variant="body1" gutterBottom={transmissionErrorMessages.length === 0}>
                {__('Parts or all of the incident failed to transfer to the destination.')}
              </Typography>
              <FlexContainer column align="start stretch" padding="dense">
                {transmissionErrorMessages.map(message => (
                  <Typography key={message} variant="caption" className={classes.failure}>
                    {message}
                  </Typography>
                ))}
              </FlexContainer>
            </React.Fragment>
          )}
          <Typography variant="body1">
            {isDone
              ? __('The resulting status for each of the items transferred are listed below.')
              : __('Items being transferred are listed below with their current status.')}
          </Typography>
          <List>
            {completed.map(packet => (
              <PacketStatusListItem
                key={packet.messageId || packet.name}
                packet={packet}
                classes={classes}
                completed
              />
            ))}
            {remaining.map(packet => (
              <PacketStatusListItem
                key={packet.messageId || packet.name}
                packet={packet}
                classes={classes}
              />
            ))}
          </List>
        </FlexContainer>
      </AccordionDetails>
    </Accordion>
  );
}

export default withStyles(theme => ({
  summary: {
    width: '100%',
  },
  circularProgress: {
    fontSize: 10,
  },
  linearProgress: {
    width: '100%',
    position: 'absolute',
    top: '0px',
    backgroundColor: 'transparent',
  },
  progress: {
    color: theme.palette.primary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
  success: {
    color: theme.palette.success[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
  failure: {
    color: theme.palette.error[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
}))(IncidentForwardProgress);

/* ******************************************************************
 *
 * PacketStatusListItem
 *
 * Displays a single packet and it's status. If the packet is in error,
 * then message describing the failure will be shown as secondary item
 * text.
 *
 ****************************************************************** */

PacketStatusListItem.propTypes = {
  /**
   * Packet to display status of.
   */
  packet: PropTypes.object.isRequired,
  /**
   * When true, the packet has completed. Will show icon displaying status, and if the packet
   * failed, then a message decribing the failure will be shown.
   */
  completed: PropTypes.bool,
  /**
   * Set the styles of the icons on success and failure.
   * Example:
   * ```
   *   <PacketStatusListItem classes={{ success: className: string }} />
   */
  classes: PropTypes.object,
};

PacketStatusListItem.defaultProps = {
  completed: false,
  classes: {
    success: '',
    failure: '',
    progress: '',
  },
};

function PacketStatusListItem({ packet, completed, classes }) {
  let icon = null;
  let primaryText = packet.name;
  let secondaryText = null;
  if (completed) {
    switch (`${packet.state}`) {
      case State.Success: {
        icon = <DoneIcon className={classes.success} />;
        break;
      }
      case State.Failure: {
        icon = <ErrorIcon className={classes.failure} />;
        secondaryText = packet.status.message || __('Failed to send. Reason unknown.');
        break;
      }
      default: {
        icon = <HelpIcon />;
        secondaryText = __('Transmission completed but packet status unknown.');
      }
    }
  }

  if (primaryText === 'log') {
    primaryText = __('Incident Details');
  }

  return (
    <ListItem dense>
      <ListItemIcon>
        {completed ? (
          icon
        ) : (
          <CircularProgress
            variant="indeterminate"
            size={24}
            classes={{ root: classes.progress }}
          />
        )}
      </ListItemIcon>
      <ListItemText primary={primaryText} secondary={secondaryText} />
    </ListItem>
  );
}
