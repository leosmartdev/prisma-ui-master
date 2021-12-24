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

// Icons
import EditIcon from '@material-ui/icons/Edit';

// Helper & Actions
import * as actions from 'map/mapconfig';
import { round } from 'lodash';

const styles = theme => ({
  container: {
    overflow: 'auto',
  },
  button: {
    marginBottom: '5px',
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
});

class MapConfigList extends React.Component {
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

    this.noValue = '-';

    this.state = {
      trackTimeoutList: {},
      mapconfig: this.props.mapconfig
    };
  }

  editConfig = () => {
    const { history } = this.props;
    history.push('/mapconfig/edit');
  };

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

    const timeStrFromMin = (minutes) => {
      const hour = Math.floor((minutes / 60));
      const min = minutes % 60;
      let timeStr = `${hour > 0 ? `${hour}h`: ''} ${min > 0 ? `${min}m`: ''}`;
      return timeStr;
    };

    this.props.track_timeouts.forEach(elem => {
      trackTimeoutConfigList.push(
        <TableRow key={'track-delay-list-' + elem.type}>
          <TableCell padding="none">
            {elem.displayName}
          </TableCell>
          <TableCell padding="none">
            {trackTimeoutList[elem.type] ? timeStrFromMin(trackTimeoutList[elem.type]) : this.noValue}
          </TableCell>
        </TableRow>
      );
    });

    return (
      <div>
        {/* FILTER TOOLBAR */}
        <FlexContainer column align="start stretch" classes={{ root: classes.filter }}>
          <FlexContainer align="end center">
            <Button
              variant="contained"
              color="primary"
              onClick={this.editConfig}
              className={classes.button}
            >
              <EditIcon
                fontSize="small"
                className={classes.leftIcon}
              />
              {__('Edit Config')}
            </Button>
          </FlexContainer>
          <Table>
            <TableBody>
              {trackTimeoutConfigList}
            </TableBody>
          </Table>
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
        MapConfigList
      )
    )
  )
);