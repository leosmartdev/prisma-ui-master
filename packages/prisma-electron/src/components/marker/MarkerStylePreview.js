import React from 'react';
import PropTypes from 'prop-types';

// Helpers
import { rgb2hex } from 'components/marker/helpers'

const styles = {
  canvas: {
    verticalAlign: 'middle',
    margin: '10px 0'
  },
};

const resources = `${__dirname}/../../resources/markers`;

export default class MarkerStylePreview extends React.Component {
  componentDidMount = () => {
    this.updateCanvas();
  };

  componentDidUpdate = prev => {
    const { color, type, shape, image } = this.props;
    if (color !== prev.color) {
      this.updateCanvas();
    } else if (type != prev.type) {
      this.updateCanvas();
    } else if (shape !== prev.shape) {
      this.updateCanvas();
    } else if (image !== prev.image) {
      this.updateCanvas();
    }
  };

  // Draw SVG icon on the preview canvas
  drawSvg = (canvas, color, dir) => {
    const { width, height } = this.props;

    let hexColor = rgb2hex(color);
    let opacity = color.a;

    let img = new Image();

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", dir, false);
    rawFile.onreadystatechange = () => {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          let allText = rawFile.responseText;
          let doc = new DOMParser().parseFromString(allText, "text/xml");
          let elem = doc.firstChild;
          elem.setAttribute('fill', hexColor);
          elem.setAttribute('opacity', opacity);

          let xmlStr = new XMLSerializer().serializeToString(elem);
          img.src = `data:image/svg+xml;base64, ${btoa(xmlStr)}`;

          img.onload = () => {
            canvas.clearRect(0, 0, width, height);
            canvas.drawImage(img, 0, 0);
          };
        }
      }
    };
    rawFile.send(null);
  };

  // Draw selected/uploaded image on the preview canvas
  drawImage = (canvas, url) => {
    const { width, height } = this.props;

    let img = new Image();

    img.src = url;

    img.onload = () => {
      canvas.clearRect(0, 0, width, height);
      canvas.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
    };
  };

  updateCanvas = async () => {
    const g = this.canvas.getContext('2d');
    const { type, color, shape, width, height, image } = this.props;

    if (type == 'Shape' && shape) {
      let dir = `${resources}/${shape}.svg`;

      this.drawSvg(g, color, dir);
    } else if (type == 'Image') {
      if (image) {
        let url = await this.props.loadImage(image.metadata.id);

        this.drawImage(g, url);
      } else {
        // If there is no image then display image not found icon
        let dir = `${resources}/image-not-found.svg`;

        this.drawSvg(g, color, dir);
      }
    }
  };

  render = () => {
    const { width, height } = this.props;

    return (
      <canvas
        ref={ref => {
          this.canvas = ref;
        }}
        width={width}
        height={height}
        style={styles.canvas}
      />
    );
  };
}

MarkerStylePreview.propTypes = {
  type: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  color: PropTypes.object.isRequired,
  shape: PropTypes.string,
  image: PropTypes.any,
  loadImage: PropTypes.func.isRequired,
};
