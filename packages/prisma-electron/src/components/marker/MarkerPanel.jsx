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
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';
import ColorPicker from 'components/marker/ColorPicker';
import ShapeSelector from 'components/marker/ShapeSelector';
import ImageSelector from 'components/marker/ImageSelector';
import MarkerStylePreview from 'components/marker/MarkerStylePreview';

import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Typography,
  Select,
  MenuItem,
} from '@material-ui/core';

// Helpers & Actions
import * as Shapes from 'marker/shapes';
import { uploadFile } from 'file/upload';
import { downloadFile } from 'file/download';
import * as actions from 'marker/marker';

const styles = {
  control: {
    paddingBottom: '20px'
  },
  dialogText: {
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  stylePreview: {
    margin: '10px 0 5px',
    width: '100%',
    textAlign: 'center',
  },
  addButton: {
    marginTop: '20px'
  },
  header: {
    margin: '20px 0 10px'
  },
  uploadButton: {
    marginTop: '10px'
  }
}

class MarkerPanel extends React.Component {

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      latError: false,
      lonError: false,
      description: "",
      // selected shape
      shape: Shapes.shapes[0],
      // selected color
      color: {
        r: 255,
        g: 100,
        b: 0,
        a: 0.8,
      },
      editingCoords: false,
      showConfirmation: false,
      // type: Shape/Image
      type: "Shape",
      // list of uploaded images
      imageList: [],
      // selected image
      image: null,
    };
  }

  componentDidMount = async () => {
    this._isMounted = true;

    this.props.enable();
    await this.listMarkerImages();
    this.refresh({});
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  // load the list of images and set the first image as default item
  listMarkerImages = async () => {
    const { createTransaction } = this.props;

    let res = await createTransaction(actions.listMarkerImages());
    let firstImage = null;

    if (res.length != 0) {
      firstImage = res[0];
    }

    if (this._isMounted) {
      this.setState({
        imageList: res,
        image: firstImage,
      });
    }
  };

  // get updating marker info
  getMarker = async id => {
    const { createTransaction } = this.props;

    let res = await createTransaction(actions.getMarker(id));

    if (res.target.marker) {
      let marker = res.target.marker;

      switch (marker.type) {
        case 'Image': {
          let image = new Object();
          image.metadata = { ...marker.imageMetadata };

          if (this._isMounted) {
            this.setState({
              description: marker.description,
              type: "Image",
              image,
            });
          }
          break;
        }
        case 'Shape': {
          let shape, color;

          Shapes.shapes.forEach(elem => {
            if (elem.id == marker.shape) {
              shape = elem;
            }
          });

          color = {
            r: !('r' in marker.color) ? 0 : marker.color.r,
            g: !('g' in marker.color) ? 0 : marker.color.g,
            b: !('b' in marker.color) ? 0 : marker.color.b,
            a: !('a' in marker.color) ? 0 : marker.color.a,
          };

          if (this._isMounted) {
            this.setState({
              description: marker.description,
              shape,
              color,
              type: "Shape",
            });
          }
          break;
        }
      }
    }
  };

  refresh = (prev) => {
    if (this.props.previousLatitude !== prev.previousLatitude) {
      this.props.setLatitude(this.props.previousLatitude)
    }
    if (this.props.previousLongitude !== prev.previousLongitude) {
      this.props.setLongitude(this.props.previousLongitude)
    }
    if (this.props.markerId !== prev.markerId) {
      this.getMarker(this.props.markerId);
    }
  }

  componentWillUnmount = () => {
    this.props.disable();
  }

  componentDidUpdate = (prevProps) => {
    if (!this.state.editingCoords) {
      if (prevProps.latitude !== this.props.latitude ||
        prevProps.longitude !== this.props.longitude) {
        this.validateCoordinates();
      }
    }
  }

  latitudeChanged = (event) => {
    this.setState({ latError: false, editingCoords: true });
    this.props.setLatitude(event.target.value);
  }

  longitudeChanged = (event) => {
    this.setState({ lonError: false, editingCoords: true });
    this.props.setLongitude(event.target.value);
  }

  descriptionChanged = event => {
    this.setState({ description: event.target.value });
  };

  // When style type is changed
  typeChanged = event => {
    this.setState({ type: event.target.value });
  };

  shapeChanged = shapeId => {
    Shapes.shapes.forEach(elem => {
      if (elem.id === shapeId) {
        this.setState({ shape: elem });
      }
    });
  };

  // If user select one item of the image list, preview it
  selecteFileChanged = id => {
    const { imageList } = this.state;
    let selectedImage = null;

    imageList.forEach(elem => {
      if (elem.metadata.id == id) {
        selectedImage = elem;
      }
    });

    this.setState({ image: selectedImage });
  };

  // Upload file
  uploadFileChanged = async event => {
    const { createTransaction } = this.props;

    let file = event.target.files[0];
    let metadata = await createTransaction(uploadFile(file));

    this.createMarkerImage(metadata);
  };

  colorChanged = color => {
    this.setState({ color: color.rgb });
  };

  createMarkerImage = async metadata => {
    const { createTransaction } = this.props;
    const { imageList } = this.state;

    let markerImage = await createTransaction(actions.createMarkerImage({ metadata }));

    let newImageList = Object.assign(imageList);
    newImageList.push(markerImage);
    if (this._isMounted) {
      this.setState({
        imageList: newImageList,
        image: markerImage
      });
    }
  };

  /**
   * Load image from server using file API 
   * Parse it to show on the preview panel
   */
  loadMarkerImage = async fileId => {
    const { createTransaction } = this.props;

    let url = await createTransaction(downloadFile(fileId))
      .then(async response => await response.blob())
      .then(blob => URL.createObjectURL(blob));

    return url;
  };

  validateCoordinates = doneEditing => {
    let lon = +this.props.longitude;
    let lat = +this.props.latitude;
    let lonError = Number.isNaN(lon) || lon > 180 || lon < -180
    let latError = Number.isNaN(lat) || lat > 90 || lat < -90
    let editingCoords = this.state.editingCoords
    if (doneEditing) {
      editingCoords = false
    }
    this.setState({ lonError, latError, editingCoords })
  }

  isValid = () => {
    const { latError, lonError, type, shape, image } = this.state;
    return !latError && !lonError && ((type == 'Shape' && shape) || (type == 'Image' && image));
  }

  accept = () => {
    this.setState({ showConfirmation: true });
  }

  cancel = () => {
    this.setState({ showConfirmation: false });
  }

  confirmed = async () => {
    const {
      markerId,
      createTransaction,
      latitude,
      longitude,
    } = this.props;
    const {
      type,
      shape,
      color,
      description,
      image,
    } = this.state;
    let id = markerId;

    this.setState({ showConfirmation: false });
    let req;

    if (type == 'Shape') {
      req = {
        type,
        shape: shape.id,
        color,
        description,
        position: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      }
    } else if (type == 'Image') {
      image.metadata['size'] = parseInt(image.metadata['size']);

      req = {
        type,
        image_metadata: image.metadata,
        description,
        position: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      };
    }

    if (markerId) {
      await createTransaction(actions.updateMarker(markerId, req));
    } else {
      let response = await createTransaction(actions.createMarker(req));
      id = response.id;
    }

    let path = {
      pathname: `/info/marker/${id}`,
    };

    this.props.history.push(path);
  }

  render = () => {
    const {
      latitude,
      longitude,
      markerId,
    } = this.props;

    const {
      latError,
      lonError,
      description,
      color,
      shape,
      showConfirmation,
      type,
      image,
      imageList,
    } = this.state;

    return (
      <FlexContainer column align='start stretch' id='marker-panel'>
        {/* Lat/Lon & Description */}
        <FlexContainer column align="space-around stretch">
          <TextField
            id='marker-latitude'
            style={styles.control}
            value={latitude}
            onChange={this.latitudeChanged}
            onBlur={() => this.validateCoordinates(true)}
            error={latError}
            helperText={latError && __('Invalid latitude')}
            label={__('Latitude')}
          />
          <TextField
            id='marker-longitude'
            style={styles.control}
            value={longitude}
            onChange={this.longitudeChanged}
            onBlur={() => this.validateCoordinates(true)}
            error={lonError}
            helperText={lonError && __('Invalid longitude')}
            label={__('Longitude')}
          />
          <TextField
            id="marker-description"
            style={styles.control}
            value={description}
            onChange={this.descriptionChanged}
            label={__('Description')}
            multiline
            rows={4}
          />
        </FlexContainer>

        {/* Shapes & Color */}
        <Typography variant="h6" style={styles.header}>{__('Style')}</Typography>

        <FlexContainer column align="start stretch">
          <Select
            value={type}
            onChange={this.typeChanged}
          >
            <MenuItem value="Shape">Shape</MenuItem>
            <MenuItem value="Image">Image</MenuItem>
          </Select>
        </FlexContainer>

        <div style={styles.stylePreview}>
          <MarkerStylePreview
            type={type}
            width={100}
            height={100}
            color={color}
            shape={shape.id}
            image={image}
            loadImage={this.loadMarkerImage}
          />
        </div>

        {/* For Shapes */}
        {type == 'Shape' && <FlexContainer align="center space-between">
          <ShapeSelector
            selected={shape}
            onSelect={this.shapeChanged}
          />
          <ColorPicker
            label={__('Marker Color')}
            color={color}
            onChange={this.colorChanged}
          />
        </FlexContainer>}

        {/* For Images */}
        {type == 'Image' && <FlexContainer column align="center space-between">
          <ImageSelector
            images={imageList}
            selected={image ? image.metadata.id : -100}
            onSelect={this.selecteFileChanged}
          />
          <Button
            style={styles.uploadButton}
            variant="contained"
            component="label"
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={this.uploadFileChanged}
              hidden
            />
          </Button>
        </FlexContainer>}

        <Button style={styles.addButton} variant="contained" color="primary" onClick={this.accept} disabled={!this.isValid()}>
          {markerId ? __('Update Marker') : __('Add Marker')}
        </Button>
        <Dialog open={showConfirmation} onClose={this.cancel}>
          <DialogTitle>Marker</DialogTitle>
          <DialogContentText style={styles.dialogText}>
            {__(`Are you sure you want to ${markerId ? __("update this marker") : __("add this marker to the map")}?`)}
          </DialogContentText>
          <DialogActions>
            <Button id="marker-cancel" onClick={this.cancel} color="primary">
              {__("Cancel")}
            </Button>
            <Button id="marker-create" onClick={this.confirmed}>
              {markerId ? __("Update") : __("Add")}
            </Button>
          </DialogActions>
        </Dialog>
      </FlexContainer>
    )
  };
}

MarkerPanel.propTypes = {
  markerId: PropTypes.string,
  previousLatitude: PropTypes.string,
  previousLongitude: PropTypes.string,
  latitude: PropTypes.string.isRequired,
  longitude: PropTypes.string.isRequired,

  enable: PropTypes.func.isRequired,
  disable: PropTypes.func.isRequired,
  setLatitude: PropTypes.func.isRequired,
  setLongitude: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  latitude: state.marker.latitude,
  longitude: state.marker.longitude,
});

const mapDispatchToProps = dispatch => ({
  enable: () => {
    dispatch(actions.enable());
  },
  disable: () => {
    dispatch(actions.disable());
  },
  setLatitude: (lat) => {
    dispatch(actions.setLatitude(lat));
  },
  setLongitude: (lon) => {
    dispatch(actions.setLongitude(lon));
  },
});

export default (MarkerPanel = withTransaction(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps,
    )(MarkerPanel)
  )
));