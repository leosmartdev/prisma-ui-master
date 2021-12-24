/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';

import {
  FormControlLabel,
  Button,
  Checkbox,
  Typography,
  Select,
  Input,
  MenuItem,
  TextField,
} from '@material-ui/core';

// Helper & Actions
import * as actions from 'filter-tracks/filter-tracks';
// Helper & Actions
import * as mapconfigActions from 'map/mapconfig';

import * as AISHelper from "components/map/openlayers/layers/ais";
import * as OmnicomHelper from "components/map/openlayers/layers/omnicom";

const styles = {
  root: {
    paddingBottom: '20px',
    marginRight: '5px',
  },
  label: {
    width: '100%',
  },
  iconImage: {
    marginLeft: '15px',
  }
}

const iconWidth = 25;
const iconHeight = 25;
const canvasWidth = 140;
const canvasHeight = 25;

class FilterTracksPanel extends React.Component {
  static propTypes = {
    tracks: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      displayName: PropTypes.string,
      show: PropTypes.bool,
      timeout: PropTypes.number,
      children: PropTypes.arrayOf(PropTypes.string)
    })).isRequired,
    defaultIcons: PropTypes.array,
    customIcons: PropTypes.array,
    filter: PropTypes.func.isRequired,
    initFilter: PropTypes.func.isRequired,
    /** @private mapDispatchToProps */
    saveFilterTracks: PropTypes.func.isRequired,
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
    this.canvasList = [];

    this.delayTimeOptions = [
      {
        title: __('unlimited'),
        value: 1440 * 365 * 100,
      },
      {
        title: __('1 year'),
        value: 1440 * 365,
      },
      {
        title: __('3 months'),
        value: 1440 * 90,
      },
      {
        title: __('1 month'),
        value: 1440 * 30,
      },
      {
        title: __('2 weeks'),
        value: 1440 * 14,
      },
      {
        title: __('1 week'),
        value: 1440 * 7,
      },
      {
        title: __('3 days'),
        value: 1440 * 3,
      },
      {
        title: __('1 day'),
        value: 1440,
      },
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
      filterTracks: {}
    }
  }

  componentDidMount = () => {
    this._isMounted = true;
    this.getIconList();
    this.getListFilterTracks();
  };

  componentDidUpdate = prev => {
    if (JSON.stringify(this.props.defaultIcons) != JSON.stringify(prev.defaultIcons)) {
      this.getIconList();
    }
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  async getListFilterTracks() {
    const { createTransaction, user } = this.props;
    // console.log(user);
    try {
      await createTransaction(actions.getFilterTracks(user.userId));    // user filter track setting
      await createTransaction(mapconfigActions.listMapConfig());     // global setting
      let state = Object.assign(this.state);
      // console.log(this.props.tracks);
      this.props.tracks.forEach(elem => {
        const filterTrack = state.filterTracks[elem.type] || {};
        state.filterTracks[elem.type] = {
          ...filterTrack,
          show: elem.show,
          // timeout: elem.timeout
        };
      });
      this.props.globalTracks.forEach(elem => {
        const filterTrack = state.filterTracks[elem.type] || {};
        state.filterTracks[elem.type] = {
          ...filterTrack,
          timeout: elem.timeout
        };
      })
      this.setState(state);
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          errorBannerText: error.message,
        });
      }
    }
  }

  setTrackTimeout = (event, trackId) => {
    // console.log(event.target.value, trackId);
    let state = Object.assign(this.state);
    state.filterTracks[trackId].timeout = Number(event.target.value);
    this.setState(state);
  };

  onCancel = () => {
    const { history } = this.props;
    history.push('/');
  }

  getIconList = () => {
    const { tracks, defaultIcons, customIcons } = this.props;

    // clear canvas
    this.canvasList.forEach(canvas => {
      let ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    });

    tracks.forEach(elem => {
      let type = elem.type;
      let imgList = [];
      let customTrackSubTypes = [];
      let ctx = this.canvasList[type].getContext('2d');

      customIcons.forEach(icon => {
        if (!icon.deleted && type == icon.track_type) {
          if (icon.track_sub_type) {
            customTrackSubTypes.push(icon.track_sub_type);
          }

          this.drawImage(imgList, ctx, icon, true);
        }
      });

      defaultIcons.forEach(icon => {
        if (type == icon.track_type && customTrackSubTypes.indexOf(icon.track_sub_type) == -1) {
          this.drawImage(imgList, ctx, icon, false);
        }
      });
    });
  };

  // preview icon images
  drawImage = (imgList, ctx, icon, isCustom) => {
    let img = new Image();
    img.src = icon.url;
    img.onload = () => {
      let prevImageWidth = 0;
      imgList.forEach(elem => {
        prevImageWidth += elem.width;
      });

      let x = canvasWidth - 15 * imgList.length - prevImageWidth;
      let y = 0;
      let imgWidth = img.width;
      let imgHeight = img.height;
      let { displayWidth, displayHeight } = this.scaleImage(imgWidth, imgHeight);

      // only for stationary icon
      if (!isCustom && (
        icon.track_sub_type && icon.track_sub_type == AISHelper.aisStationary ||
        icon.track_sub_type && icon.track_sub_type == OmnicomHelper.omnicomStationary)) {
        displayWidth = 13;
        displayHeight = 13;
        y = (canvasHeight - displayHeight) / 2;
      }

      x -= displayWidth;
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight, x, y, displayWidth, displayHeight);

      if (!isCustom) {
        ctx.globalCompositeOperation = "source-atop";
        ctx.globalAlpha = icon.opacity;
        ctx.fillStyle = icon.color;
        ctx.fillRect(x, y, displayWidth, displayHeight);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

      img.width = displayWidth;
      img.height = displayHeight;
      imgList.push(img);
    };
  };

  confirmed = () => {
    this.props.saveFilterTracks(this.props.user.userId, this.state.filterTracks);
    const filterTrackTimeouts = {};
    for (let key in this.state.filterTracks) {
      filterTrackTimeouts[key] = this.state.filterTracks[key].timeout;
    }
    this.props.setTrackTimeouts(filterTrackTimeouts);
    this.props.initFilter(true);
  }

  handleCheckboxChange = type => event => {
    let state = Object.assign(this.state);
    state.filterTracks[type].show = event.target.checked;
    this.setState(state);
  }

  selectAll = () => {
    let state = Object.assign(this.state);
    for (let key in state.filterTracks) {
      state.filterTracks[key].show = true;
    }

    this.setState(state);
  }

  deselectAll = () => {
    let state = Object.assign(this.state);
    for (let key in state.filterTracks) {
      state.filterTracks[key].show = false;
    }

    this.setState(state);
  }

  scaleImage = (imgWidth, imgHeight) => {
    let width = iconWidth;
    let height = iconHeight;

    let displayWidth;
    let displayHeight;
    if (imgWidth == imgHeight) {
      displayWidth = width;
      displayHeight = height;
    } else if (imgHeight > imgWidth) {
      displayHeight = height;
      displayWidth = imgWidth * (height / imgHeight);
    } else if (imgHeight < imgWidth) {
      displayWidth = width;
      displayHeight = imgHeight * (width / imgWidth);
    }

    return {
      displayWidth,
      displayHeight,
    };
  }

  render = () => {
    const { classes, session, user } = this.props;
    // const { permissionMap } = session;
    // console.log(permissionMap);
    // const isAdmin = permissionMap["Administrator"] ? true : false;
    const isAdmin = user.roles.includes('Administrator');
    const {
      filterTracks
    } = this.state;

    let checkboxList = [];

    const getDisabled = val => {
      if (val) return { disabled: true };
      return {};
    };
    
    this.props.tracks.forEach(elem => {
      checkboxList.push(
        <FormControlLabel
          key={'track-filters-label-' + elem.type}
          classes={{
            root: classes.root,
            label: classes.label
          }}
          control={
            <Checkbox
              key={'track-filters-checkbox-' + elem.type}
              checked={Boolean((filterTracks[elem.type] && filterTracks[elem.type].show))}
              value={elem.type}
              color="secondary"
              onChange={this.handleCheckboxChange(elem.type)}
            />
          }
          label={
            <FlexContainer align="space-between center">
              <Typography variant="body1" style={{ minWidth: '100px' }}>
                {elem.displayName}
              </Typography>
              <FlexContainer style={{ minWidth: '100px' }}>
                <Select
                  value={(filterTracks[elem.type] && filterTracks[elem.type].timeout) || '-'}
                  onChange={(e) => this.setTrackTimeout(e, elem.type)}
                  input={<Input id="type" fullWidth />}
                  {...getDisabled(!isAdmin)}
                >
                  {this.delayTimeOptions.map(option => (
                    <MenuItem value={option.value} key={option.value}>
                      {option.title}
                    </MenuItem>
                  ))}
                </Select>
              </FlexContainer>
              <FlexContainer>
                <canvas
                  ref={ref => {
                    this.canvasList[elem.type] = ref;
                  }}
                  height={canvasHeight}
                  width={canvasWidth}
                />
              </FlexContainer>
            </FlexContainer>
          }
        />
      );
    });

    return (
      <FlexContainer column align='start stretch' id='container-filter-tracks'>
        <FlexContainer align="space-between" className={classes.control}>
          <Button id="btn-filter-tracks-select-all" onClick={this.selectAll}>
            {__('Select all')}
          </Button>
          <Button id="btn-filter-tracks-deselect-all" onClick={this.deselectAll}>
            {__('Deselect all')}
          </Button>
        </FlexContainer>

        {checkboxList}

        <Button id="btn-filter-tracks" variant="contained" color="primary" onClick={this.confirmed}>
          {__('Filter')}
        </Button>
      </FlexContainer>
    )
  };
}

const mapStateToProps = state => ({
  defaultIcons: state.icon.defaultIcons,
  customIcons: state.icon.customIcons,
  tracks: state.filterTracks.tracks,
  globalTracks: state.mapconfig.tracks,
  user: state.session.user || { userId: '', profile: {} },
  session: state.session,
});

const mapDispatchToProps = dispatch => ({
  filter: (trackList) => {
    dispatch(actions.filter(trackList));
  },
  initFilter: (init) => {
    dispatch(actions.initFilter(init));
  },
  saveFilterTracks: (userId, filterTracks) => {
    dispatch(actions.saveFilterTracks(userId, filterTracks));
  },
  setTrackTimeouts: (filterTrackTimeouts) => {
    dispatch(mapconfigActions.setTrackTimeouts(filterTrackTimeouts));
  },
});

export const PureFilterTracksPanel = FilterTracksPanel;
export default (FilterTracksPanel = withStyles(styles)(
  withRouter(
    withTransaction(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(
        FilterTracksPanel
      )
    )
  )
));