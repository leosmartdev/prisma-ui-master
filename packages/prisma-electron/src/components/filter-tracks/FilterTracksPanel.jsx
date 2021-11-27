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
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';

import {
  FormControlLabel,
  Button,
  Checkbox,
  Typography,
} from '@material-ui/core';

// Helper & Actions
import * as actions from 'filter-tracks/filter-tracks';

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
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.canvasList = [];
    let tracks = [];
    this.props.tracks.forEach(elem => {
      tracks[elem.type] = elem.show;
    })

    this.state = {
      tracks,
    }
  }

  componentDidMount = () => {
    this._isMounted = true;
    this.getIconList();
  };

  componentDidUpdate = prev => {
    if (JSON.stringify(this.props.defaultIcons) != JSON.stringify(prev.defaultIcons)) {
      this.getIconList();
    }
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

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
    this.props.filter(this.state.tracks);
    this.props.initFilter(true);
  }

  handleCheckboxChange = type => event => {
    let state = Object.assign(this.state);
    state.tracks[type] = event.target.checked;
    this.setState(state);
  }

  selectAll = () => {
    let state = Object.assign(this.state);
    for (let key in state.tracks) {
      state.tracks[key] = true;
    }

    this.setState(state);
  }

  deselectAll = () => {
    let state = Object.assign(this.state);
    for (let key in state.tracks) {
      state.tracks[key] = false;
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
    const { classes } = this.props;

    let checkboxList = [];

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
              checked={this.state.tracks[elem.type]}
              value={elem.type}
              color="secondary"
              onChange={this.handleCheckboxChange(elem.type)}
            />
          }
          label={
            <FlexContainer align="space-between center">
              <Typography variant="body1">
                {elem.displayName}
              </Typography>
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

FilterTracksPanel.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    displayName: PropTypes.string,
    show: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,
  defaultIcons: PropTypes.array,
  customIcons: PropTypes.array,
  classes: PropTypes.object.isRequired,

  filter: PropTypes.func.isRequired,
  initFilter: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  tracks: state.filterTracks.tracks,
  defaultIcons: state.icon.defaultIcons,
  customIcons: state.icon.customIcons,
});

const mapDispatchToProps = dispatch => ({
  filter: (trackList) => {
    dispatch(actions.filter(trackList));
  },
  initFilter: (init) => {
    dispatch(actions.initFilter(init));
  },
});

export const PureFilterTracksPanel = FilterTracksPanel;
export default (FilterTracksPanel = withStyles(styles)(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps,
    )(FilterTracksPanel)
  )
));