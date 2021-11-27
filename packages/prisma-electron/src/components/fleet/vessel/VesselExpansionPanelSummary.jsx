/**
 * Provides the summary row for the Vessel Expansion Panel.
 *
 * Takes edit prop, that lets the expansion panel switch between two modes, editing and viewing.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';
import ErrorBanner from 'components/error/ErrorBanner';

import {
  Typography,
  IconButton,
  Grow,
} from '@material-ui/core';

// Icons
import MoreVertIcon from '@material-ui/icons/MoreVert';
import EditIcon from '@material-ui/icons/Edit';

// Actions and Helpers
import { VesselShape } from './propTypes';

import loglevel from 'loglevel';

const log = loglevel.getLogger('fleet');

/* **********************************************
 *
 * VesselExpansionPanel
 * Display a single vessel expansion Panel
 *
 ********************************************* */

const propTypes = {
  /**
   * @private Provided by withStyles
   */
  classes: PropTypes.object.isRequired,
  /**
   * The vessel object being displayed
   */
  vessel: PropTypes.shape(VesselShape).isRequired,
  /**
   * If true, the expansion card is in edit mode.
   */
  isEditing: PropTypes.bool,
  /**
   * If true, the expansion card is expanded.
   */
  isExpanded: PropTypes.bool,
  /**
   * If true, the user is hovering the mouse over the card.
   */
  isHovering: PropTypes.bool,
  /**
   * Callback when one of the action buttons is clicked. This allows
   * the summary component to propogate the action up the chain.
   * The function takes two parameters, a string detailing the action
   * and the event object from the action itself (eg event for onClick())
   *
   * Actions:
   *  - 'edit' Edit button clicked
   *  - 'more' More details button was clicked.
   */
  onAction: PropTypes.func,
  /**
   * When not null, this string will be printed in an <ErrorBanner /> to denote the expansion
   * panel is in an error state. To clear the banner, null the property.
   */
  errorBannerMessage: PropTypes.string,
  /**
   * Override for the title of the expansion card when in editing mode. If not set default is
   * "Edit Vessel".
   */
  editTitle: PropTypes.string,
};

const defaultProps = {
  editTitle: __('Edit Vessel'),
  isEditing: false,
  isExpanded: false,
  isHovering: false,
  errorBannerMessage: null,
  onAction: action => {
    log.warn(
      `onAction property was not passed to VesselExpansionPanelSummary but an action occured. Action: ${action}. Please pass a function handler to handle this action.`,
    );
  },
};

function VesselExpansionPanelSummary({
  vessel,
  classes,
  isExpanded,
  isEditing,
  isHovering,
  errorBannerMessage,
  editTitle,
  onAction,
}) {
  const onActionClick = action => event => {
    // Prevent the collapse action
    event.stopPropagation();
    onAction(action, event);
  };

  let title = vessel.name;
  let type = vessel.type || '';
  let lastUpdate = '';

  if (isEditing) {
    title = editTitle;
    type = '';
    lastUpdate = '';
  }

  return (
    <FlexContainer align="start center" className={classes.expansionSummary}>
      <FlexContainer align="start center" className={classes.expansionSummaryColumn}>
        <Typography variant="subtitle1" className={classes.heading}>
          {title}
        </Typography>
      </FlexContainer>
      <ErrorBanner message={errorBannerMessage} />
      <div className={classes.expansionSummaryTypeColumn}>
        <Typography>{type}</Typography>
      </div>
      <div className={classes.expansionSummaryUpdateColumn}>
        <Typography variant="caption">{lastUpdate}</Typography>
      </div>
      <FlexContainer align="end" className={classes.expansionActionsColumn}>
        <Grow in={isExpanded && !isEditing}>
          <IconButton onClick={onActionClick('edit')} className={classes.iconButton}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Grow>
        <IconButton onClick={onActionClick('more')} className={classes.iconButton}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </FlexContainer>
    </FlexContainer>
  );
}

VesselExpansionPanelSummary.propTypes = propTypes;
VesselExpansionPanelSummary.defaultProps = defaultProps;

export default withStyles(theme => ({
  heading: {
    paddingRight: '10px',
  },
  expansionSummary: {
    minHeight: '44px', // make room tfor the action icons
    width: '100%',
    // removes dead space on right of expansion panel since we arent using expansion icon
    paddingRight: '0px !important',
  },
  expansionSummaryColumn: {
    flexBasis: '25%',
  },
  expansionSummaryTypeColumn: {
    flexBasis: '25%',
  },
  expansionSummaryUpdateColumn: {
    flexGrow: '1',
  },
  expansionActionsColumn: {},
  iconButton: {
    //   width: '20px',
    //   height: '20px',
    marginLeft: -theme.spacing(1),
  },
}))(VesselExpansionPanelSummary);
