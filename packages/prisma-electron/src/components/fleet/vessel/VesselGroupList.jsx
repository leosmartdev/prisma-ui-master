/**
 * Provides a list of vessels grouped by fleet.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';
import { withTransaction } from 'server/transaction';

// Component Imports
import FlexContainer from 'components/FlexContainer';
import ContentViewGroup from 'components/layout/ContentViewGroup';
import VesselExpansionPanel from 'components/fleet/vessel/VesselExpansionPanel';

import {
  Button,
  Fab,
  MobileStepper,
} from '@material-ui/core';

// Icons
import AddIcon from '@material-ui/icons/Add';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';

// Actions and Helpers
import { VesselShape } from './propTypes';

/*
 * Unassigned Fleet
 */
const UNASSIGNED_FLEET = {
  vessels: [],
  fleet: {
    id: 'unassigned',
    name: __('Unassigned'),
  },
};

/* **********************************************
 *
 * VesselGroupList
 *
 ********************************************* */
/**
 * Props
 */
const propTypes = {
  vessels: PropTypes.arrayOf(PropTypes.shape(VesselShape)),
  // When true, vessels will be grouped by fleet. When false, all vessels will just be displayed
  // on a single sheet of paper.
  groupVessels: PropTypes.bool,
  createTransaction: PropTypes.func.isRequired, // withTransaction
  /**
   * Callback to get vessels, undefined if not an option
   */
  next: PropTypes.func,
  previous: PropTypes.func,
  /**
   * Callback when add button to add vessel is clicked.
   */
  onAddClicked: PropTypes.func.isRequired,
  /**
   * Function to call when an action has occured that the parent page needs to handle.
   * @see `components.fleet.FleetManagement.onAction()`
   */
  onAction: PropTypes.func,
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
};

const defaultProps = {
  vessels: [],
  groupVessels: true,
};

/*
 * Component
 */
class VesselGroupList extends React.Component {
  constructor(props) {
    super(props);
    const vesselGroups = this.groupVesselsByFleet(props);
    this.state = {
      vessels: props.vessels || [],
      vesselGroups,
      activeStep: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    const vesselGroups = this.groupVesselsByFleet(nextProps);
    this.setState({
      vessels: nextProps.vessels || [],
      vesselGroups,
    });
  }

  /**
   * Goes through all vessels and groups the vessels by fleet.
   */
  groupVesselsByFleet = props => {
    if (!props.vessels) {
      return [];
    }

    if (!props.groupVessels) {
      return [
        {
          vessels: props.vessels,
        },
      ];
    }

    const vesselGroups = [];
    props.vessels.map(vessel => {
      const lastIndex = vesselGroups.length - 1;
      const lastGroup = vesselGroups[lastIndex];

      if (vessel.fleet && vessel.fleet.id) {
        if (lastGroup && lastGroup.fleet.id === vessel.fleet.id) {
          vesselGroups[lastIndex].vessels.push(vessel);
        } else {
          // this fleet doesnt have a group yet, create it.
          vesselGroups.push({
            fleet: vessel.fleet,
            vessels: [vessel],
          });
        }
        // No fleet, mark vessel "Unassigned"
      } else if (!lastGroup || lastGroup.fleet.id !== UNASSIGNED_FLEET.fleet.id) {
        // Add new unassigned fleet group
        vesselGroups.push({
          ...UNASSIGNED_FLEET,
          vessels: [vessel],
        });
      } else {
        vesselGroups[lastIndex].vessels.push(vessel);
      }
    });

    return vesselGroups;
  };

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
    this.props.next();
  };

  handlePrevious = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1,
    }));
    this.props.previous();
  };

  render() {
    const { classes, onAction, onAddClicked, next, previous } = this.props;
    const { vesselGroups, activeStep } = this.state;

    const nextButton = (
      <Button size="small" onClick={this.handleNext} disabled={!next}>
        {__('Next')}
        <KeyboardArrowRight />
      </Button>
    );

    const backButton = (
      <Button size="small" onClick={this.handlePrevious} disabled={!previous}>
        <KeyboardArrowLeft />
        {__('Back')}
      </Button>
    );

    return (
      <FlexContainer className={classes.root} column align="start center">
        {Object.entries(vesselGroups).map(entry => (
          <VesselGroup key={entry[0]} group={entry[1]} onAction={onAction} />
        ))}
        <Fab color="primary" className={classes.fab} onClick={onAddClicked}>
          <AddIcon />
        </Fab>
        {(next || previous) && (
          <MobileStepper
            position="static"
            variant="text"
            steps={6}
            activeStep={activeStep}
            className={classes.stepper}
            nextButton={nextButton}
            backButton={backButton}
          />
        )}
      </FlexContainer>
    );
  }
}

VesselGroupList.propTypes = propTypes;
VesselGroupList.defaultProps = defaultProps;

export default withStyles(theme => ({
  root: {
    height: '100%',
    width: '100%',
  },
  container: {
    position: 'relative',
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: `calc(${theme.spacing(4)}px + ${theme.c2.drawers.right.width})`,
  },
  stepper: {
    position: 'fixed',
    bottom: theme.spacing(3),
    left: `calc(${theme.spacing(10)}px)`,
  },
}))(withTransaction(VesselGroupList));

/* **********************************************
 *
 * Vessel Group
 * Displays an array of vessel expansion cards
 * in a group.
 *
 ********************************************* */

const propTypesVesselGroup = {
  /**
   * Vessel group being displayed.
   */
  group: PropTypes.shape({
    name: PropTypes.string,
    vessels: PropTypes.arrayOf(PropTypes.shape(VesselShape)).isRequired,
  }).isRequired,
  /**
   * Function to call when an action has occured that the parent page needs to handle.
   * @see `components.fleet.FleetManagement.onAction()`
   */
  onAction: PropTypes.func,
};

const VesselGroup = function VesselGroup({ group, onAction }) {
  return (
    <ContentViewGroup title={group.fleet && group.fleet.name}>
      {group.vessels.map(vessel => (
        <VesselExpansionPanel vessel={vessel} key={vessel.id} onAction={onAction} />
      ))}
    </ContentViewGroup>
  );
};

VesselGroup.propTypes = propTypesVesselGroup;
