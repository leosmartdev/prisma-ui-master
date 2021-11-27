/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 *
 * zone
 * Contains different HOC to implement common useful features
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Helpers & Actions
import { reset, enable, setDrawnGeometry } from 'draw/draw';

/** withPolygonMode provides component when mode is Polygon */
export function withPolygonMode(Component) {
  class Wrapper extends React.Component {
    static propTypes = {
      /** mode is current mode */
      mode: PropTypes.string.isRequired,
    };

    render() {
      const { mode } = this.props;
      if (mode.toLowerCase() === 'polygon') {
        return <Component {...this.props} />;
      }
      return null;
    }
  }
  Wrapper.displayName = `withPolygonMode(${Component})`;
  function mapStateToProps(state) {
    return {
      updated: state.draw.updatedByClient,
      geometry: state.draw.drawnGeometry,
    };
  }

  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        onSetDrawnGeometry: setDrawnGeometry,
        onEnableDraw: enable,
      },
      dispatch,
    );
  }
  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Wrapper);
}

/** withEmptyDraw provides a function to start draw empty polygon */
export function withEmptyDraw(Component) {
  class Wrapper extends React.Component {
    static propTypes = {
      /** onResetDraw  resets draw to update view */
      onResetDraw: PropTypes.func,
      /** onStartDraw starts to draw polygon */
      onStartDraw: PropTypes.func,
    };

    static defaultProps = {
      onStartDraw: () => {},
      onResetDraw: () => {},
    };

    onStartDraw = poly => {
      const { onStartDraw, onResetDraw } = this.props;
      onStartDraw({
        edit: { poly },
      });
      onResetDraw();
    };

    render() {
      return <Component {...this.props} onStartDraw={this.onStartDraw} />;
    }
  }
  Wrapper.displayName = `withEmptyDraw(${Component})`;

  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        onResetDraw: reset,
      },
      dispatch,
    );
  }

  return connect(
    null,
    mapDispatchToProps,
  )(Wrapper);
}
