import React from 'react';
import PropTypes from 'prop-types';

// Helpers
import * as Color from 'lib/color';
import * as Patterns from 'lib/patterns';

const styles = {
  canvas: {
    verticalAlign: 'middle',
  },
};

const lineWidth = 2;

export default class AreaStylePreview extends React.Component {
  componentDidMount = () => {
    this.updateCanvas();
  };

  componentDidUpdate = prev => {
    if (this.fillColor !== prev.fillColor) {
      this.updateCanvas();
    } else if (this.strokeColor !== prev.strokeColor) {
      this.updateCanvas();
    } else if (this.fillStyle !== prev.fillStyle) {
      this.updateCanvas();
    }
  };

  updateCanvas = () => {
    const g = this.canvas.getContext('2d');
    const { width, height, fillPattern, fillColor, strokeColor } = this.props;

    const fillColorNormalized = Color.toString(fillColor);
    const strokeColorNormalized = Color.toString(strokeColor);

    g.clearRect(0, 0, width, height);
    g.fillStyle = Patterns.byId(fillPattern).renderer({
      fill: fillColorNormalized,
      stroke: strokeColorNormalized,
    });
    g.fillRect(0, 0, width, height);
    g.strokeStyle = strokeColorNormalized;
    g.lineWidth = lineWidth;
    g.strokeRect(0, 0, width, height);
  };

  render = () => {
    const { width, height } = this.props;

    return (
      <canvas
        ref={ref => {
          this.canvas = ref;
        }}
        style={styles.canvas}
        width={width}
        height={height}
      />
    );
  };
}

AreaStylePreview.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  fillPattern: PropTypes.string.isRequired,
  fillColor: PropTypes.object.isRequired,
  strokeColor: PropTypes.object.isRequired,
};
