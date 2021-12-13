import React from 'react';
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
});

class MapConfigPanel extends React.Component {
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

    // let trackTimeoutList = {};
    // console.log(this.props.track_timeouts);
    // this.props.track_timeouts.forEach(elem => {
    //   trackTimeoutList[elem.type] = elem.timeout;
    // })

    this.state = {
      // sarsatDelay: 0,
      // omnicomDelay: 1,
      trackTimeoutList: {},
      mapconfig: this.props.mapconfig
    };
  }

  setSarsatDelay = event => {
    this.setState({
      sarsatDelay: event.target.value,
    }, () => {

    });
  };

  setOmnicomDelay = event => {
    this.setState({
      omnicomDelay: event.target.value,
    }, () => {
      
    });
  };

  setTrackTimeout = (event, trackId) => {
    // console.log(event.target.value, trackId);
    let state = Object.assign(this.state);
    state.trackTimeoutList[trackId] = event.target.value;
    this.setState(state);
  };

  save = () => {
    this.props.setTrackTimeouts(this.state.trackTimeoutList);
    const { history } = this.props;
    history.push('/');
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
      // sarsatDelay,
      // omnicomDelay,
      trackTimeoutList
    } = this.state;

    let trackTimeoutConfigList = [];

    this.props.track_timeouts.forEach(elem => {
      trackTimeoutConfigList.push(
        <TableRow key={'track-delay-list-' + elem.type}>
          <TableCell padding="none">
            {elem.displayName}
          </TableCell>
          <TableCell padding="none">
            <Select
              value={trackTimeoutList[elem.type] || 720}
              onChange={(e) => this.setTrackTimeout(e, elem.type)}
              input={<Input id="type" fullWidth />}
            >
              {this.delayTimeOptions.map(option => (
                <MenuItem value={option.value} key={option.value}>
                  {option.title}
                </MenuItem>
              ))}
            </Select>
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
              
              {/* <TableRow>
                <TableCell padding="none">
                  {__('SARSAT')}
                </TableCell>
                <TableCell padding="none">
                  <Select
                    value={sarsatDelay}
                    onChange={this.setSarsatDelay}
                    input={<Input id="type" fullWidth />}
                  >
                    {this.delayTimeOptions.map(option => (
                      <MenuItem value={option.value} key={option.value}>
                        {option.title}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">
                  {__('Omnicom')}
                </TableCell>
                <TableCell padding="none">
                  <Select
                    value={omnicomDelay}
                    onChange={this.setOmnicomDelay}
                    input={<Input id="type" fullWidth />}
                  >
                    {this.delayTimeOptions.map(option => (
                      <MenuItem value={option.value} key={option.value}>
                        {option.title}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow> */}
            </TableBody>
          </Table>
        </FlexContainer>

        <FlexContainer column align="start end">
          <Button color="primary" variant="contained" onClick={this.save}>
            {__('Save')}
          </Button>
        </FlexContainer>

      </div>
    );
  };
}

const mapStateToProps = state => ({
  track_timeouts: state.mapconfig.track_timeouts,
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
        MapConfigPanel
      )
    )
  )
);