import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  canvas: {
    verticalAlign: 'middle',
    margin: '10px 0'
  },
};

const resources = `${__dirname}/../../../resources/markers`;

export default class ImagePreview extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    image: PropTypes.any,
    isCustom: PropTypes.bool.isRequired,
    loadImage: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    this.updateCanvas();
  };

  componentDidUpdate = prev => {
    const { image } = this.props;

    if (JSON.stringify(prev.image) != JSON.stringify(image)) {
      this.updateCanvas();
    }
  };

  // Draw SVG icon on the preview canvas
  drawSvg = (canvas, dir) => {
    const { width, height } = this.props;

    let img = new Image();

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", dir, false);
    rawFile.onreadystatechange = () => {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          let allText = rawFile.responseText;
          let doc = new DOMParser().parseFromString(allText, "text/xml");
          let elem = doc.firstChild;
          elem.setAttribute('fill', '#8C8C8C');

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

  // Draw default icon on the preview canvas
  drawDefaultImage = (canvas, image) => {
    const { width, height } = this.props;

    let img = new Image();

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", image.url, true);
    rawFile.responseType = 'blob';
    rawFile.onreadystatechange = () => {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          let blob = rawFile.response;
          blob = URL.createObjectURL(blob);

          img.src = blob;

          img.onload = () => {
            canvas.clearRect(0, 0, width, height);            
            
            const imgWidth = img.width;
            const imgHeight = img.height;
            const { x, y, displayWitdh, displayHeight } = this.scaleImage(imgWidth, imgHeight);          
            canvas.drawImage(img, 0, 0, imgWidth, imgHeight, x, y, displayWitdh, displayHeight);            

            // change color
            canvas.globalCompositeOperation = "source-atop";
            canvas.globalAlpha = image.opacity;
            canvas.fillStyle = image.color;
            canvas.fillRect(0, 0, width, height);
            canvas.globalCompositeOperation = "source-over";
            canvas.globalAlpha = 1;
          };
        }
      }
    };
    rawFile.send(null);
  };

  // Draw custom icon on the preview canvas
  drawCustomImage = (canvas, url) => {
    const { width, height } = this.props;

    let img = new Image();

    img.src = url;

    img.onload = () => {
      canvas.clearRect(0, 0, width, height);

      const imgWidth = img.width;
      const imgHeight = img.height;
      const { x, y, displayWitdh, displayHeight } = this.scaleImage(imgWidth, imgHeight);
      canvas.drawImage(img, 0, 0, imgWidth, imgHeight, x, y, displayWitdh, displayHeight);
    };
  };

  scaleImage = (imgWidth, imgHeight) => {
    const { width, height } = this.props;

    let x = 0;
    let y = 0;
    let displayWitdh;
    let displayHeight;
    if (imgWidth == imgHeight) {
      displayWitdh = width * 3 / 4;
      displayHeight = height * 3 / 4;

      x = (width - displayWitdh) / 2;
      y = (height - displayHeight) / 2;
    } else if (imgHeight > imgWidth) {
      displayHeight = height;
      displayWitdh = imgWidth * (height / imgHeight);

      x = (width - displayWitdh) / 2;
    } else if (imgHeight < imgWidth) {
      displayWitdh = width;
      displayHeight = imgHeight * (width / imgWidth);

      y = (height - displayHeight) / 2;
    }

    return {
      x,
      y,
      displayWitdh,
      displayHeight,
    };
  }

  updateCanvas = async () => {
    const g = this.canvas.getContext('2d');
    const { image, isCustom } = this.props;

    if (image) {
      let url;
      if (isCustom == true) {
        url = await this.props.loadImage(image.metadata.id);
        this.drawCustomImage(g, url);
      } else {
        this.drawDefaultImage(g, image);
      }
    } else {
      // If there is no image then display image not found icon
      let dir = `${resources}/image-not-found.svg`;

      this.drawSvg(g, dir);
    }
  }

  render() {
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
  }
}