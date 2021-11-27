import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';

// Components
import OpenLayersMap from './openlayers/OpenLayersMap';
import FabPanel from './FabPanel';

const styles = theme => ({
  map: {
    left: theme.c2.mainContent.offsetX,
    top: theme.c2.mainContent.offsetY,
    backgroundColor: theme.c2.map.backgroundColor,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

export class MapPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: 0,
      longitude: 0,
      showCoords: false,
      totalFeatures: 0,
      visibleFeatures: 0,
    };
  }

  render() {
    const { active, classes } = this.props;
    if (!active) {
      return null;
    }
    return (
      <div className={classes.map}>
        <OpenLayersMap />
        <FabPanel />
      </div>
    );
  }

  pop = () => { };
}

MapPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  active: state.session.state === 'activated',
});

export default connect(mapStateToProps)(withStyles(styles)(MapPanel));
