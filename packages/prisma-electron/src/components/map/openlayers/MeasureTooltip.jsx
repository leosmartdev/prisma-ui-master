/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * The hover tooltip when using the measure tool.
 *
 * -------------------------
 * |  Distance    Bearing  |
 * -------------------------
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import ol from 'openlayers';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  Paper,
  Typography,
} from '@material-ui/core';

// Helpers & Actions
import Formatter from '../../../format/Formatter';

class MeasureTooltip extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,

    enabled: PropTypes.bool.isRequired,
    mousePoint: PropTypes.arrayOf(Number).isRequired,
    distance: PropTypes.number,
    bearing: PropTypes.number,
    getOlMap: PropTypes.func.isRequired,

    units: PropTypes.string.isRequired,
  };

  static defaultProps = {
    distance: 0,
    bearing: 0,
  };

  constructor(props) {
    super(props);
    this.element = null;
    this.overlay = null;
  }

  componentDidUpdate = prev => {
    if (!prev.enabled && this.props.enabled) {
      this.start();
    }
    if (prev.enabled && !this.props.enabled) {
      this.stop();
    }
    if (
      prev.mousePoint[0] !== this.props.mousePoint[0] ||
      prev.mousePoint[1] !== this.props.mousePoint[1]
    ) {
      this.updateTooltip();
    }
  };

  componentWillUnmount = () => {
    this.stop();
  };

  start = () => {
    this.overlay = new ol.Overlay({
      element: this.element,
      offset: [0, -15],
      positioning: 'bottom-center',
    });
    this.props.getOlMap().map.addOverlay(this.overlay);
  };

  stop = () => {
    if (this.overlay) {
      this.props.getOlMap().map.removeOverlay(this.overlay);
      this.overlay = null;
    }
  };

  updateTooltip = () => {
    if (this.overlay) {
      this.overlay.setPosition(this.props.mousePoint);
    }
  };

  render = () => {
    if (!this.props.enabled) {
      return null;
    }
    const format = new Formatter({ distance: this.props.units });
    return (
      <span>
        {' '}
        {/* Span must be here to prevent issues when open layers removes the div using the ref. */}
        <div
          className={this.props.classes.tooltip}
          ref={element => {
            this.element = element;
          }}
        >
          <Paper elevation={2}>
            <FlexContainer
              align="space-between center"
              padding="dense"
              className={this.props.classes.content}
            >
              <Typography variant="body1">{format.meters(this.props.distance)}</Typography>
              <Typography variant="body1">{format.angle(this.props.bearing)}</Typography>
            </FlexContainer>
          </Paper>
        </div>
      </span>
    );
  };
}

const mapStateToProps = state => ({
  units: state.draw.measureUnits,
});

export default withStyles({
  tooltip: {
    position: 'absolute',
  },
  content: {
    width: '125px',
  },
})(connect(mapStateToProps)(MeasureTooltip));
