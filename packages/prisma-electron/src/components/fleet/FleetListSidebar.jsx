import React from 'react';
import PropTypes from 'prop-types';
import { withTransaction } from 'server/transaction';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import Infinite from 'react-infinite';
import { AutoSizer } from 'react-virtualized';

import FlexContainer from 'components/FlexContainer';
import Header from 'components/Header';
import ErrorBanner from 'components/error/ErrorBanner';

import {
  CircularProgress,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

// Icons
import AddIcon from '@material-ui/icons/Add';
import { FleetShape } from 'fleet';

/**
 * Component to display a loading indicator when fleets are loading.
 */
const FleetsLoading = () => (
  <FlexContainer column align="center center" style={{ height: '100px' }}>
    <CircularProgress size={36} />
  </FlexContainer>
);

/**
 * Component to denote no fleets and provide a button to create a new fleet.
 */
const noFleetPropTypes = {
  /**
   * Callback when the create fleet button is clicked.
   */
  onCreateClicked: PropTypes.func.isRequired,
};

const NoFleets = ({ onCreateClicked }) => (
  <FlexContainer padding="normal" column align="start stretch">
    <Button variant="contained" color="primary" onClick={onCreateClicked}>
      {__('Create a Fleet')}
    </Button>
  </FlexContainer>
);

NoFleets.propTypes = noFleetPropTypes;

const propTypes = {
  fleets: PropTypes.arrayOf(PropTypes.shape(FleetShape)),
  errorBannerText: PropTypes.string,
  isLoading: PropTypes.bool,
  /**
   * Callback to inform the parent of an action that should be performed.
   * Used to propogate actions that child components don't know how to handle,
   * but will propogate up the stack until a component can handle it.
   */
  onAction: PropTypes.func.isRequired,
  /**
   * @private withRouter
   */
  history: PropTypes.object.isRequired,
  /**
   * @private withTransaction
   */
  createTransaction: PropTypes.func.isRequired,
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
  /**
   * Callback to get fleets, undefined if not an option
   */
  next: PropTypes.func,
};

const defaultProps = {
  fleets: null,
  errorBannerText: null,
  isLoading: false,
};

const styles = {
  root: {
    height: '100%',
  },
};

const rowHeight = 49;

class FleetListSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fleets: [],
    };
  }

  /**
   * Callback when a fleet is selected in the sidebar.
   */
  fleetSelected = fleet => {
    this.props.history.push(`/fleet/${fleet.id}`);
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !nextState.isLoading;
  }

  onCreateFleetClicked = () => {
    this.props.onAction('fleet/CREATE');
  };

  render() {
    const { classes, fleets, isLoading } = this.props;
    const actionIcon = (
      <IconButton onClick={this.onCreateFleetClicked}>
        <AddIcon />
      </IconButton>
    );
    return (
      <FlexContainer className={classes.root} column align="start stretch">
        <Header margin="normal" variant="h4" action={actionIcon}>
          {__('Fleets')}
        </Header>
        <ErrorBanner message={this.props.errorBannerText} compact />
        {(!fleets || fleets.length === 0) && (
          <NoFleets onCreateClicked={this.onCreateFleetClicked} />
        )}
        {fleets && fleets.length > 0 && (
          <List disablePadding className={classes.root}>
            <AutoSizer disableWidth>
              {/* eslint-disable no-unused-vars,implicit-arrow-linebreak */
                ({ width, height }) =>
                  height > 0 && (
                    <Infinite
                      containerHeight={height}
                      elementHeight={rowHeight}
                      infiniteLoadBeginEdgeOffset={100}
                      onInfiniteLoad={this.props.next}
                      isInfiniteLoading={isLoading}
                      loadingSpinnerDelegate={isLoading && FleetsLoading()}
                    >
                      {fleets.map(
                        fleet =>
                          fleet && (
                            <ListItem
                              key={fleet.id}
                              divider
                              button
                              onClick={() => {
                                this.fleetSelected(fleet);
                              }}
                            >
                              <ListItemText primary={fleet.name || fleet.id} />
                            </ListItem>
                          ),
                      )}
                    </Infinite>
                  )}
            </AutoSizer>
          </List>
        )}
      </FlexContainer>
    );
  }
}

FleetListSidebar.propTypes = propTypes;
FleetListSidebar.defaultProps = defaultProps;

export default withStyles(styles)(withRouter(withTransaction(FleetListSidebar)));
