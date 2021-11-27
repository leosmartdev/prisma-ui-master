import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';
import { Link } from 'react-router-dom';

// Components
import { FlexContainer } from 'components/layout/Container';

import {
  Fab,
  Tooltip,
} from '@material-ui/core';

// Icons
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ZoneIcon from '@material-ui/icons/CropDin';
import RulerIcon from 'resources/svg/Ruler';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import FlightIcon from '@material-ui/icons/Flight';
import AirplanemodeInactiveIcon from '@material-ui/icons/AirplanemodeInactive';
import PlaceIcon from '@material-ui/icons/Place';
import LayersIcon from '@material-ui/icons/Layers';
import CategoryIcon from '@material-ui/icons/Category';

// Actions
import * as mapActions from 'map/map';
import * as noticeActions from 'notices/notices';

const styles = {
  panel: {
    position: 'absolute',
    bottom: '50px',
    right: '25px',
  },
  button: {
    margin: '5px',
  },
  tooltip: {
    maxWidth: '300px',
  },
};

class FabPanel extends React.Component {
  state = {
    spidertracksVisible: false,
  };

  newWindow = () => {
    this.props.newWindow();
  };

  clearAllHistories = () => {
    this.props.clearAllHistories();
  };

  toggleNoticeSound = () => {
    if (this.props.noticeSoundOff) {
      this.props.turnNoticeSoundOn();
    } else {
      this.props.turnNoticeSoundOff();
    }
  };

  toggleSpidertracks = () => {
    if (window.spidertracks && window.spidertracks.layer) {
      window.spidertracks.layer.setVisible(!this.isSpidertracksVisible());
      this.setState({ spidertracksVisible: window.spidertracks.layer.getVisible() });
    }
  };

  isSpidertracksVisible = () => {
    if (window.spidertracks && window.spidertracks.layer) {
      return window.spidertracks.layer.getVisible();
    }
    return true;
  };

  render() {
    const showClearAllHistories = this.props.histories.size > 0;
    return (
      <FlexContainer column align="center stretch" className={this.props.classes.panel}>
        {this.props.showSpidertracksLayerHide && (
          <Tooltip title={__('Show Hide Spidertracks')} className={this.props.classes.tooltip}>
            <Fab className={this.props.classes.button} onClick={this.toggleSpidertracks}>
              {this.isSpidertracksVisible() ? <FlightIcon /> : <AirplanemodeInactiveIcon />}
            </Fab>
          </Tooltip>
        )}
        {this.props.showNoticeSoundIndicator && (
          <Tooltip title={__('Alert Sound On/OFF')} className={this.props.classes.tooltip}>
            <Fab className={this.props.classes.button} onClick={this.toggleNoticeSound}>
              {this.props.noticeSoundOff ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </Fab>
          </Tooltip>
        )}
        {showClearAllHistories && (
          <Tooltip title={__('Clear Track History')} className={this.props.classes.tooltip}>
            <Fab className={this.props.classes.button} onClick={this.clearAllHistories}>
              <LayersClearIcon />
            </Fab>
          </Tooltip>
        )}
        <Tooltip title={__('Open new Map Window')} className={this.props.classes.tooltip}>
          <Fab className={this.props.classes.button} onClick={this.newWindow}>
            <OpenInNewIcon />
          </Fab>
        </Tooltip>
        <Link to="/zones" title={__('Zones')}>
          <Tooltip title={__('Zones')} className={this.props.classes.tooltip}>
            <Fab className={this.props.classes.button}>
              <ZoneIcon />
            </Fab>
          </Tooltip>
        </Link>
        <Link to="/manual-track" title={__('Manual Track')}>
          <Tooltip title={__('Manual Track')} className={this.props.classes.tooltip}>
            <Fab className={this.props.classes.button}>
              <PlaceIcon />
            </Fab>
          </Tooltip>
        </Link>
        <Link to="/marker" title={__('Marker')}>
          <Tooltip title={__('Marker')} className={this.props.classes.tooltip}>
            <Fab className={this.props.classes.button}>
              <CategoryIcon />
            </Fab>
          </Tooltip>
        </Link>
        <Link to="/measure" title={__('Measure')}>
          <Tooltip title={__('Measure Tool')} className={this.props.classes.tooltip}>
            <Fab className={this.props.classes.button}>
              <RulerIcon />
            </Fab>
          </Tooltip>
        </Link>
        <Link to="/filter-tracks" title={__('Filter Tracks')}>
          <Tooltip title={__('Filter Tracks')} className={this.props.classes.tooltip}>
            <Fab className={this.props.classes.button}>
              <LayersIcon />
            </Fab>
          </Tooltip>
        </Link>
      </FlexContainer>
    );
  }
}

FabPanel.propTypes = {
  classes: PropTypes.object.isRequired,

  newWindow: PropTypes.func.isRequired,
  clearAllHistories: PropTypes.func.isRequired,
  turnNoticeSoundOn: PropTypes.func.isRequired,
  turnNoticeSoundOff: PropTypes.func.isRequired,

  histories: PropTypes.object.isRequired,
  noticeSoundOff: PropTypes.bool.isRequired,
  showNoticeSoundIndicator: PropTypes.bool.isRequired,
  showSpidertracksLayerHide: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  histories: state.map.histories,
  noticeSoundOff: state.notifications.soundOff,
  showNoticeSoundIndicator:
    state.session.state === 'activated' &&
    state.notifications.highPriorityNotices.length > 0 &&
    state.config.mainWindow,
  showSpidertracksLayerHide: state.config.showSpidertracksLayerHide || false,
});

const mapDispatchToProps = dispatch => ({
  newWindow: () => {
    dispatch(mapActions.newWindow());
  },
  clearAllHistories: () => {
    dispatch(mapActions.clearAllHistories());
  },
  turnNoticeSoundOn: () => {
    dispatch(noticeActions.turnNoticeSoundOn());
  },
  turnNoticeSoundOff: () => {
    dispatch(noticeActions.turnNoticeSoundOff());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(FabPanel));
