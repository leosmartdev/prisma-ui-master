import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { __ } from 'lib/i18n';
import { withStyles } from '@material-ui/styles';

// Components
import {
  Input,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
} from '@material-ui/core';

// Helpers & Actions
import { getLookup } from 'map/lookup';
import * as mapActions from 'map/map';

const styles = {
  select: {
    marginTop: '20px',
  },
};

class TrackHistorySelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: 0,
    };
  }

  componentDidMount = () => {
    const { id } = getLookup(this.props.track);
    this.setState({ duration: this.props.histories.get(id) || 0 });
  };

  componentWillReceiveProps = next => {
    const { id } = getLookup(next.track);
    if (next.track != this.props.track || next.histories[id] !== this.state.duration) {
      this.setState({ duration: next.histories.get(id) || 0 });
    }
  };

  handleChange = event => {
    const { id } = getLookup(this.props.track);
    const request = {
      id,
      trackId: this.props.track.trackId,
      registryId: this.props.track.registryId,
      duration: event.target.value,
    };
    this.props.history(request);
  };

  render = () => (
    <FormControl
      className={!this.props.dense ? this.props.classes.select : null}
      style={this.props.fullWidth ? { width: '100%' } : null}
    >
      <InputLabel htmlFor="history-select">{__('Show History')}</InputLabel>
      <Select
        value={this.state.duration}
        onChange={this.handleChange}
        input={<Input fullWidth={this.props.fullWidth} />}
      >
        <MenuItem value={0}>{__('No History')}</MenuItem>
        <MenuItem value={60 * 60}>{__('Last hour')}</MenuItem>
        <MenuItem value={2 * 60 * 60}>{__('Last {{count}} hours', { count: 2 })}</MenuItem>
        <MenuItem value={3 * 60 * 60}>{__('Last {{count}} hours', { count: 3 })}</MenuItem>
        <MenuItem value={12 * 60 * 60}>{__('Last day')}</MenuItem>
        <MenuItem value={7 * 12 * 60 * 60}>{__('Last {{count}} days', { count: 7 })}</MenuItem>
      </Select>
    </FormControl>
  );
}

TrackHistorySelect.propTypes = {
  classes: PropTypes.object.isRequired,

  // margin and sizing
  fullWidth: PropTypes.bool,
  dense: PropTypes.bool,

  track: PropTypes.object.isRequired,
  history: PropTypes.func.isRequired,
  histories: PropTypes.object.isRequired,
};

TrackHistorySelect.defaultProps = {
  fullWidth: false,
  dense: false,
};

const mapStateToProps = state => ({
  histories: state.map.histories,
});

const mapDispatchToProps = dispatch => ({
  history: payload => {
    dispatch(mapActions.historyRequest(payload));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(TrackHistorySelect));
