import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';
const macaddress = require('macaddress');

// Components
import Header from 'components/Header';
import { FlexContainer } from 'components/layout/Container';
import ImageSelector from 'components/info/change-icon/ImageSelector';
import ImagePreviewer from 'components/info/change-icon/ImagePreviewer';

import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from "@material-ui/core/FormControlLabel";

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AutorenewIcon from '@material-ui/icons/Autorenew';

// Helpers
import { downloadFile } from 'file/download';
import { uploadFile } from 'file/upload';
import * as actions from 'icon/icon';

import { getTrackGroup } from 'components/map/openlayers/Dispatcher';
import * as AISHelper from "components/map/openlayers/layers/ais";
import * as OmnicomHelper from "components/map/openlayers/layers/omnicom";
import * as SARTHelper from "components/map/openlayers/layers/sart";

// Styles
const styles = theme => ({
  toolbar: {
    marginBottom: '5px',
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  stylePreview: {
    margin: '10px 0 5px',
  },
  uploadButton: {
    marginTop: '10px'
  }
});

class ChangeIconPanel extends React.Component {
  static propTypes = {
    // info of the selected track
    info: PropTypes.object.isRequired,
    // type of the selected track
    trackType: PropTypes.string.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private mapStateToProps */
    defaultIcons: PropTypes.array,
    customIcons: PropTypes.array,
    tracks: PropTypes.array.isRequired,
  };

  static defaultProps = {
    defaultIcons: [],
    customIcons: [],
  };

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.mac_address = '';
    this.state = {
      // true: the collapse will be expanded
      expanded: false,
      // true: able to select custom icon
      isCustom: false,
      /**
       * current set image
       * if default icon, this will store img path
       * if custom icon, this will store img metadata
       */
      currentImage: null,
      // list of uploaded images
      listCustomImage: [],
      // matching track group
      trackGroup: null,
      // store current previewing image url
      url: '',
    };
  }

  componentDidMount = () => {
    const { tracks, trackType } = this.props;

    this._isMounted = true;

    let trackGroup = getTrackGroup(tracks, trackType);

    // get client's MAC address
    macaddress.one(async (err, mac) => {
      this.mac_address = mac;
      await this.getListCustomImage();
      this.update(trackGroup);
    });

  };

  componentDidUpdate = prev => {
    const { info, defaultIcons, tracks, trackType } = this.props;

    let trackGroup = getTrackGroup(tracks, trackType);

    let isCurStationary = false;
    let isPrevStationary = false;
    if (trackGroup == 'ais' || trackGroup == 'omnicom') {
      let speed = info.target.speed || 0;
      if (speed < 0.2) {
        isCurStationary = true;
      }

      speed = prev.info.target.speed || 0;
      if (speed < 0.2) {
        isPrevStationary = true;
      }
    }

    if (info.id != prev.info.id ||
      JSON.stringify(defaultIcons) != JSON.stringify(prev.defaultIcons) ||
      isCurStationary != isPrevStationary) {
      this.update(trackGroup);
    }
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  update = trackGroup => {
    // check if the selected track was set with custom icon latest time
    let isCustom = this.checkIfCustom(trackGroup);

    if (this._isMounted) {
      this.setState({
        isCustom,
        trackGroup,
      }, () => {
        this.previewImage();
      });
    }
  };

  checkIfCustom = trackGroup => {
    const { customIcons } = this.props;
    const { trackSubType } = this.getIconByType();
    let isCustom = false;

    customIcons.forEach(elem => {
      if (!elem.deleted && elem.track_type == trackGroup && (
        !trackSubType ||
        (trackSubType && elem.track_sub_type == trackSubType)
      )) {
        isCustom = true;
      }
    });

    return isCustom;
  };

  // Get all uploaded images
  getListCustomImage = async () => {
    const { createTransaction } = this.props;

    let listCustomImage = await createTransaction(actions.getIconImage(this.mac_address));

    if (this._isMounted) {
      this.setState({
        listCustomImage,
      });
    }
  };

  // Handle Collapse
  toggleCollapse = () => {
    this.setState(prevState => ({
      expanded: !prevState.expanded,
    }));
  };

  toggleCollapseIcon = () => {
    return this.state.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />;
  };

  // Called when the image selector is changed
  handleImageSelectorChange = id => {
    const { listCustomImage } = this.state;
    let selectedImage = null;
    let isCustom = false;

    listCustomImage.forEach(elem => {
      if (elem.id == id) {
        isCustom = true;
        selectedImage = elem;
      }
    });

    this.setState({
      isCustom,
    }, () => {
      if (!isCustom) {
        let { icon } = this.getIconByType();

        selectedImage = icon;
      }
  
      this.setState({
        url: '',
        currentImage: selectedImage,
      });
    });    
  };

  // Preview Image
  previewImage = () => {
    let { icon } = this.getIconByType();

    if (this._isMounted) {
      this.setState({
        url: '',
        currentImage: icon,
      });
    }
  };

  getIconByType = () => {
    const { isCustom, listCustomImage, trackGroup } = this.state;
    const { info, defaultIcons, customIcons } = this.props;

    /** Some track types have several kind of icons */
    let trackSubType;
    let icon;
    if (trackGroup == 'ais') {
      trackSubType = AISHelper.aisOther;

      if (info.metadata && info.metadata.nmea && info.metadata.nmea.vdm && info.metadata.nmea.vdm.m1371 && info.metadata.nmea.vdm.m1371.staticVoyage && info.metadata.nmea.vdm.m1371.staticVoyage.shipAndCargoType) {
        trackSubType = AISHelper.vesselType(info.metadata.nmea.vdm.m1371.staticVoyage.shipAndCargoType);
      }

      const speed = info.target.speed || 0;
      if (speed < 0.2) {
        trackSubType = AISHelper.aisStationary;
      }
    } else if (trackGroup == 'omnicom') {
      trackSubType = OmnicomHelper.omnicomNormal;

      const speed = info.target.speed || 0;
      if (speed < 0.2) {
        trackSubType = OmnicomHelper.omnicomStationary;
      }
    } else if (trackGroup == 'sart') {
      trackSubType = SARTHelper.vesselType(info.target.mmsi);
    }

    if (isCustom) {
      let currentIcon;
      customIcons.forEach(elem => {
        if (!elem.deleted && elem.track_type == trackGroup && (
          !trackSubType ||
          (trackSubType && elem.track_sub_type == trackSubType)
        )) {
          currentIcon = elem;
        }
      });

      if (currentIcon) {
        listCustomImage.forEach(elem => {
          if (elem.metadata.id == currentIcon.metadata.id) {
            icon = elem;
          }
        });
      }

      if (!icon && listCustomImage.length > 0) {
        icon = listCustomImage[0];
      }
    } else {
      defaultIcons.forEach(elem => {
        if (elem.track_type == trackGroup && (
          !trackSubType ||
          (trackSubType && elem.track_sub_type == trackSubType)
        )) {
          icon = elem
        }
      });
    }

    return {
      trackSubType,
      icon,
    };
  }

  // Load custom image from server to preview
  loadImage = async fileId => {
    const { createTransaction } = this.props;

    let url = await createTransaction(downloadFile(fileId))
      .then(async response => await response.blob())
      .then(blob => URL.createObjectURL(blob));

    if (this._isMounted) {
      this.setState({ url });
    }

    return url;
  };

  // Upload custom image
  uploadImage = async event => {
    const { createTransaction } = this.props;

    let file = event.target.files[0];
    let metadata = await createTransaction(uploadFile(file));

    this.createIconImage(metadata);
  };

  createIconImage = async metadata => {
    const { createTransaction } = this.props;

    let iconImage = await createTransaction(actions.createIconImage(this.mac_address, metadata));

    if (this._isMounted) {
      this.setState(prevState => {
        let listCustomImage = prevState.listCustomImage;
        listCustomImage.push(iconImage);

        return {
          isCustom: true,
          currentImage: iconImage,
          listCustomImage,
        };
      });
    }
  }

  // Called when Apply is clicked on
  onApply = () => {
    const { isCustom, currentImage, trackGroup, url } = this.state;
    const { customIcons, createTransaction } = this.props;

    const { trackSubType } = this.getIconByType();
    let icon;

    customIcons.forEach(elem => {
      if (elem.track_type == trackGroup && (
        !trackSubType ||
        (trackSubType && elem.track_sub_type == trackSubType)
      )) {
        icon = elem;
      }
    });

    if (isCustom == false) {
      if (icon && !icon.deleted) {
        createTransaction(actions.deleteIcon(icon.id));
      }
    } else {
      let newIcon = {
        track_type: trackGroup,
        track_sub_type: trackSubType,
        mac_address: this.mac_address,
        metadata: currentImage.metadata,
      }

      if (!icon) {
        createTransaction(actions.createIcon(newIcon, url));
      } else if (icon.metadata.id != currentImage.metadata.id || icon.deleted) {
        createTransaction(actions.updateIcon(icon.id, newIcon, url));
      }
    }
  };

  render() {
    const {
      classes,
    } = this.props;

    const {
      expanded,
      isCustom,
      currentImage,
      listCustomImage,
      url,
    } = this.state;

    return (
      <FlexContainer column align="start stretch">
        <Header
          onClick={this.toggleCollapse}
          variant="h6"
          margin="normal"
          action={<IconButton>{this.toggleCollapseIcon()}</IconButton>}
        >
          {__('Change Icon')}
        </Header>
        <Collapse in={expanded}>
          <FlexContainer align="end center" className={classes.toolbar}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.onApply}
              disabled={!currentImage || (isCustom && !url)}
            >
              <AutorenewIcon fontSize="small" className={classes.leftIcon} />
              {__('Apply')}
            </Button>
          </FlexContainer>
          <FlexContainer column align="start stretch">
            <ImageSelector
              listImage={listCustomImage}
              image={currentImage}
              isCustom={isCustom}
              onImageSelected={this.handleImageSelectorChange}
            />
          </FlexContainer>
          <FlexContainer align="center center" className={classes.stylePreview}>
            <ImagePreviewer
              width={100}
              height={100}
              isCustom={isCustom}
              image={currentImage}
              loadImage={this.loadImage}
            />
          </FlexContainer>
          <FlexContainer column align="start stretch">
            <Button
              style={styles.uploadButton}
              variant="contained"
              component="label"
            >
              Upload New Icon
              <input
                type="file"
                accept="image/*"
                onChange={this.uploadImage}
                hidden
              />
            </Button>
          </FlexContainer>
        </Collapse>
      </FlexContainer>
    );
  };
}

const mapStateToProps = store => ({
  defaultIcons: store.icon.defaultIcons,
  customIcons: store.icon.customIcons,
  tracks: store.filterTracks.tracks,
});

export default withStyles(styles)(
  withTransaction(
    connect(
      mapStateToProps,
    )(ChangeIconPanel)
  )
);