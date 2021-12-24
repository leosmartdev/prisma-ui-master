import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';
import moment from 'moment-timezone';

// Components
import FlexContainer from 'components/FlexContainer';
import Header from 'components/Header';

import {
  Collapse,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Select,
  Input,
  MenuItem,
  TextField,
  Grid
} from '@material-ui/core';

// Helper & Actions
import * as actions from 'map/mapconfig';

const styles = theme => ({
  nullState: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  filter: {
    marginBottom: 20,
  },
  dateTimePicker: {
    width: '100%',
  },
  button: {
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
});

class MapConfigEdit extends React.Component {
  static propTypes = {
    track_timeouts: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      displayName: PropTypes.string,
      timeout: PropTypes.number
    })).isRequired,
    /** @private mapDispatchToProps */
    setTrackTimeouts: PropTypes.func.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private withRouter */
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this._isMounted = false;

    this.delayTimeOptions = [
      {
        title: __('12h'),
        value: 720,
      },
      {
        title: __('6h'),
        value: 360,
      },
      {
        title: __('2h'),
        value: 120,
      },
      {
        title: __('1h'),
        value: 60,
      },
      {
        title: __('30m'),
        value: 30,
      },
      {
        title: __('15m'),
        value: 15,
      },
    ];

    this.state = {
      trackTimeoutList: {},
      mapconfig: this.props.mapconfig
    };
  };

  setTrackTimeout = (event, trackId) => {
    // console.log(event.target.value, trackId);
    let state = Object.assign(this.state);
    state.trackTimeoutList[trackId] = Number(event.target.value);
    this.setState(state);
  };

  save = () => {
    this.props.setTrackTimeouts(this.state.trackTimeoutList);
    const { history } = this.props;
    history.push('/mapconfig/list');
  }

  onCancel = () => {
    const { history } = this.props;
    history.push('/mapconfig/list');
  }

  componentDidMount = () => {
    this._isMounted = true;
    this.getListMapConfig();
  };

  async getListMapConfig() {
    const { createTransaction } = this.props;
    try {
      await createTransaction(actions.listMapConfig());
      let state = Object.assign(this.state);
      // console.log(this.props.track_timeouts);
      this.props.track_timeouts.forEach(elem => {
        state.trackTimeoutList[elem.type] = elem.timeout;
      })
      state.mapconfig = this.props.mapconfig;
      this.setState(state);
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          errorBannerText: error.message,
        });
      }
    }
  }

  render() {
    const {
      classes,
    } = this.props;

    const {
      trackTimeoutList
    } = this.state;

    let trackTimeoutConfigList = [];

    this.props.track_timeouts.forEach(elem => {
      trackTimeoutConfigList.push(
        <TableRow key={'track-delay-list-' + elem.type}>
          <TableCell padding="none">
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography>
                  {elem.displayName}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Select
                  value={trackTimeoutList[elem.type] || '-'}
                  onChange={(e) => this.setTrackTimeout(e, elem.type)}
                  input={<Input id="type" fullWidth />}
                >
                  {this.delayTimeOptions.map(option => (
                    <MenuItem value={option.value} key={option.value}>
                      {option.title}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  // label={elem.displayName}
                  type="number"
                  value={trackTimeoutList[elem.type] || 1}
                  onChange={(e) => this.setTrackTimeout(e, elem.type)}
                />
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>
      );
    });

    return (
      <div>
        {/* FILTER TOOLBAR */}
        <FlexContainer column align="start stretch" classes={{ root: classes.filter }}>
          <Table>
            <TableBody>
              {trackTimeoutConfigList}
            </TableBody>
          </Table>
        </FlexContainer>

        <FlexContainer column align="start stretch">
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={this.save}
          >
            {__('Save Changes')}
          </Button>
          <Button
            variant="contained"
            className={classes.button}
            onClick={this.onCancel}>
            {__('Cancel')}
          </Button>
        </FlexContainer>

      </div>
    );
  };
}

const mapStateToProps = state => ({
  track_timeouts: state.mapconfig.tracks,
  mapconfig: state.mapconfig.mapconfiglist
});

const mapDispatchToProps = dispatch => ({
  setTrackTimeouts: (timeoutList) => {
    dispatch(actions.setTrackTimeouts(timeoutList));
  },
});

export default withStyles(styles)(
  withRouter(
    withTransaction(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(
        MapConfigEdit
      )
    )
  )
);