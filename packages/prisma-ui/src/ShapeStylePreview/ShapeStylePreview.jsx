import React from 'react';
import PropTypes from 'prop-types';
import color from 'color';
import { getRendererForPattern } from './build-patterns';

/*
import * as Color from 'lib/color';
import * as Patterns from 'lib/patterns';
*/

export default class ShapeStylePreview extends React.Component {
  static propTypes = {
    /**
     * Width of the preview. In pixels. Default 64px;
     */
    width: PropTypes.number,
    /**
     * Height of the preview. In pixels. Default 64px;
     */
    height: PropTypes.number,
    /**
     * Pattern to fill the polygon with. Defaults to solid color;
     */
    fillPattern: PropTypes.oneOf([
      'solid',
      'horizontalLines',
      'verticalLines',
      'slashes',
      'backslashes',
      'crosses',
      'diagonalCrosses',
    ]),
    /**
     * Color to fill the polygon. Accepts string or object.
     *
     * Eg:
     *  - "rgba(134, 249, 12, 0.5)"
     *  - "#FF9B34"
     *  - { r: 255, g: 255, b: 255 }
     */
    fillColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    /**
     * Color of the stroke for the polygon outline. Accepts string or object.
     *
     * Eg:
     *  - "rgba(134, 249, 12, 0.5)"
     *  - "#FF9B34"
     *  - { r: 255, g: 255, b: 255 }
     */
    strokeColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    /**
     * When present, outline of the polygon will be hidden.
     */
    hideOutline: PropTypes.bool,
    /**
     * Shape of the style to preview. Renders square or circle.
     */
    shape: PropTypes.oneOf(['polygon', 'circle']),
  }

  static defaultProps = {
    width: 64,
    height: 64,
    fillPattern: 'solid',
    fillColor: '#000000',
    strokeColor: '#000000',
    hideOutline: false,
    shape: 'polygon',
  }

  componentDidMount = () => {
    this.updateCanvas();
  }

  componentDidUpdate = (prevProps) => {
    if (
      this.props.fillColor !== prevProps.fillColor
      || this.props.strokeColor !== prevProps.strokeColor
      || this.props.fillPattern !== prevProps.fillPattern
      || this.props.shape !== prevProps.shape
      || this.props.hideOutline !== prevProps.hideOutline
      || this.props.width !== prevProps.width
      || this.props.height !== prevProps.height
    ) {
      this.updateCanvas();
    }
  }

  setCanvasReference = (canvas) => {
    this.canvas = canvas;
  }


  updateCanvas = () => {
    const {
      width,
      height,
      fillPattern,
      hideOutline,
      shape,
    } = this.props;

    // Guard against canvas ref not being set. Mostly will only see this during testing.
    if (!this.canvas) {
      return;
    }

    const context = this.canvas.getContext('2d');
    const fillColor = color(this.props.fillColor).string();
    const strokeColor = color(this.props.strokeColor).string();

    context.clearRect(0, 0, width, height);
    context.lineWidth = 4;
    context.fillStyle = getRendererForPattern(fillPattern).renderer({
      fill: fillColor,
      stroke: strokeColor,
    });

    if (shape === 'circle') {
      // Draw Circle
      const radius = (width / 2) - 2;
      context.beginPath();
      context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, false);
      context.fill();

      if (!hideOutline) {
        context.strokeStyle = strokeColor;
        context.stroke();
      }
    } else {
      // Draw Rectangle
      context.fillRect(0, 0, width, height);
      if (!hideOutline) {
        context.strokeStyle = strokeColor;
        context.strokeRect(0, 0, width, height);
      }
    }
  }

  render = () => (
    <canvas
      ref={this.setCanvasReference}
      style={{ verticalAlign: 'middle' }}
      width={this.props.width}
      height={this.props.height}
    />
  )
}
