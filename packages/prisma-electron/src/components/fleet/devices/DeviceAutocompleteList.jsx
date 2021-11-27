/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * DeviceAutocompleteList
 * Is used to show list of devices
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';

// Components
import Autocomplete from '../../Autocomplete';

// Helpers
import { search } from 'search/search';
import { bindActionCreators } from 'redux';

class DeviceAutocompleteList extends React.Component {
  static propTypes = {
    /** onSearch is used to search devices */
    onSearch: PropTypes.func.isRequired,
    /** classes is provided by withStyles */
    classes: PropTypes.object.isRequired,
    /** label is used to show text of autocompletion */
    label: PropTypes.string,
    /** type of device */
    type: PropTypes.string,
    /** id of this component */
    id: PropTypes.string,
    /** name of this component */
    name: PropTypes.string,
    /** required is used to point out it should be filled */
    required: PropTypes.bool,
    /** value is current value */
    value: PropTypes.string,
    /** isError is used to provide error to an input */
    error: PropTypes.bool,
    /** HelperText is used to show some information for a client */
    helperText: PropTypes.string,
    /** onSelect is for invoking when a suggestion was pick */
    onSelect: PropTypes.func,
    /** onChange is for invoking when changing an input */
    onChange: PropTypes.func,
    /** onBlur is called on blurring an input */
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    label: '',
    id: '',
    type: '',
    name: '',
    required: false,
    value: '',
    error: false,
    helperText: '',
    onSelect: () => { },
    onChange: () => { },
    onBlur: () => { },
  };

  _isMounted = false;

  state = {
    suggestions: [],
  };

  getLabel({ deviceid, networks }) {
    let iridium = __('N/A');
    if (networks) {
      for (const network of networks) {
        if (network.providerid === 'iridium') {
          iridium = network.subscriberid;
          break;
        }
      }
    }
    const localizedSubscriber = __('Subscriber');
    return `ID: ${deviceid}. ${localizedSubscriber}: ${iridium}`;
  }

  getDevices() {
    const { type, onSearch } = this.props;
    const callback = devices => {
      if (this._isMounted) {
        this.setState({
          suggestions: devices.map(deviceInfo => ({
            label: this.getLabel(deviceInfo),
            value: deviceInfo.deviceid,
          })),
        });
      }
    };

    onSearch('devices', null, 0, { vessel_info: null, type }).then(callback);
  }

  componentDidMount() {
    this._isMounted = true;
    this.getDevices();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
    if (this.props.type !== prevProps.type) {
      this.getDevices();
    }
  }

  onChange = (_, { newValue }) => {
    this.props.onChange(this.props.id, newValue);
  };

  onBlur = () => {
    this.props.onBlur(this.props.id);
  };

  render() {
    const { value, name, id, label, classes, onSelect, error, helperText, required } = this.props;
    return (
      <Autocomplete
        suggestions={this.state.suggestions}
        name={name}
        label={label}
        fullWidth
        classes={classes}
        margin="normal"
        onSelect={onSelect}
        value={value}
        onChange={this.onChange}
        onBlur={this.onBlur}
        inputProps={{
          helperText,
          error,
          required,
          id,
        }}
      />
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      onSearch: search,
    },
    dispatch,
  );
}

export default withStyles(() => ({
  suggestionsContainerOpen: {
    overflowY: 'scroll',
    height: '20vh',
  },
}))(
  connect(
    null,
    mapDispatchToProps,
  )(DeviceAutocompleteList),
);
