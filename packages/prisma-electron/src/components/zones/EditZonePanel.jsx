import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import loglevel from 'loglevel';
import ol from 'openlayers';
import { __ } from 'lib/i18n';
import { withStyles } from '@material-ui/styles';

// Components
import { FlexContainer } from 'components/layout/Container';
import DistanceSelector from 'components/measure/DistanceSelector';
import PolygonCoordinatesTable from './PolygonCoordinatesTable';
import AreaStylePreview from './AreaStylePreview';
import ColorPicker from './ColorPicker';
import PatternSelector from './PatternSelector';
import ExcludeVesselsDialog from './ExcludeVesselsDialog';

import {
  Select,
  Collapse,
  MenuItem,
  Input,
  Button,
  Typography,
  FormControl,
  FormControlLabel,
  TextField,
  Radio,
  RadioGroup,
} from '@material-ui/core';

// Helpers & Actions
import * as Protobuf from 'lib/protobuf';
import Projection from 'lib/geo';

import * as zonesActions from 'zones/zones';
import * as draw from 'draw/draw';

import { units } from '../../format/units';

const log = loglevel.getLogger('zones');
const radiusZeroDefault = 1500;
const maxRadius = 27999999;

const styles = {
  form: {
    paddingTop: '20px',
    paddingBottom: '20px',
  },
  editButtons: {
    textAlign: 'center',
  },
  editButton: {
    width: '100px',
  },
  stylePreview: {
    margin: '10px 0',
    width: '100%',
    textAlign: 'center',
  },
  controls: {
    margin: '10px 0 70px 0',
    width: '100%',
  },
  colorButton: {
    float: 'left',
    width: '25%',
  },
  patternButton: {
    float: 'left',
    width: '50%',
  },
  editRadius: {
    width: '100px',
  },
};

class EditZonePanel extends React.Component {
  constructor(props) {
    super(props);

    const excludedVessels =
      props.editing && Array.isArray(props.editing.excludedVessels)
        ? props.editing.excludedVessels
        : [];
    this.state = {
      excludedVessels,
      name: '',
      description: '',
      createAlertOn: 'none',
      mode: 'Polygon',
      enableAlertSelector: true,
      radioNone: true,
      radioEnter: true,
      radioExit: true,
      units: units.nauticalMiles,
      radiusNumber: 0,
      isOpenExcludeVesselsDialog: false,
    };
    this.areaObject = null;
    this.areaCenter = {
      longitude: 0,
      latitude: 0,
    };
    this.interaction = null;
    this.editRadius = null;
  }

  componentDidMount() {
    this.props.updateRadius(0);
    if (this.state.mode !== 'Area') {
      this.start();
    }
  }

  componentWillUnmount() {
    this.stop();
  }

  componentDidUpdate(prev, prevState) {
    if (prev.updating && !this.props.updating && !this.props.error) {
      this.close();
      return;
    }
    if (prev.updating && !this.props.updating && this.props.error) {
      log.error('ERROR', this.props.error);
      this.props.clearError();
    }
    if (this.props.fillColor !== prev.fillColor) {
      this.updateStyle();
    }
    if (this.props.fillPattern !== prev.fillPattern) {
      this.updateStyle();
    }
    if (this.props.strokeColor !== prev.strokeColor) {
      this.updateStyle();
    }
    if (this.state.mode !== prevState.mode) {
      this.updateMode();
    }
  }

  updateMode() {
    if (this.state.mode === 'Area') {
      this.setupInteraction();
      this.setupForArea();
    } else {
      this.unsetupInteraction();
      this.unsetupArea();
    }
    this.setState({
      createAlertOn: 'none',
    });
    this.start();
  }

  setupInteraction() {
    const selectionInteraction = new ol.interaction.Select({
      condition: ol.events.condition.click,
    });
    selectionInteraction.on('select', this.select);
    this.interaction = selectionInteraction;
  }

  unsetupInteraction() {
    this.interaction && this.interaction.un('select', this.select);
  }

  setupForArea() {
    this.setState({
      enableAlertSelector: false,
      radioExit: false,
      radioEnter: true,
      radioNone: true,
    });
  }

  unsetupArea() {
    this.areaObject = null;
    this.setState({
      enableAlertSelector: true,
      radioExit: true,
      radioEnter: true,
      radioNone: true,
    });
    this.updateRadius(0);
  }

  onExcludeVessel = vessel => {
    this.setState(prev => ({
      excludedVessels: [...prev.excludedVessels, vessel],
    }));
  };

  onIncludeVessel = vessel => {
    this.setState(prev => ({
      excludedVessels: prev.excludedVessels.filter(v => v.id !== vessel.id),
    }));
  };

  openExcludeDialog = () => {
    this.setState({
      isOpenExcludeVesselsDialog: true,
    });
  };

  closeExcludeDialog = () => {
    this.setState({
      isOpenExcludeVesselsDialog: false,
    });
  };

  close = () => {
    this.props.history.push('/zones');
  };

  unitsChanged = unit => {
    this.props.updateRadius(this.props.radius);
    this.setState(prevState => ({
      units: unit,
      radiusNumber: +prevState.units.to(prevState.radiusNumber, unit).toFixed(5),
    }));
  };

  getTypeByMode(mode) {
    const type = {
      Area: 'Circle',
      Polygon: 'Polygon',
    };
    return type[mode] || 'Polygon';
  }

  startDraw = ({ edit, area }) => {
    this.props.startDraw({
      type: this.getTypeByMode(this.state.mode),
      style: {
        fillColor: this.props.fillColor,
        fillPattern: this.props.fillPattern,
        strokeColor: this.props.strokeColor,
      },
      editable: this.state.mode !== 'Area',
      activeDraw: this.state.mode !== 'Area',
      interaction: this.interaction,
      edit,
      area,
    });
  };

  select = event => {
    const selected = event.target.getFeatures();
    if (selected.getLength() > 0) {
      const props = selected.item(0).getProperties();
      if ((props.registryId || props.trackId) && !this.areaObject && !this.props.drawn) {
        this.areaObject = props;
        [this.areaCenter.longitude, this.areaCenter.latitude] = ol.proj.transform(
          event.mapBrowserEvent.coordinate,
          'EPSG:3857',
          'EPSG:4326',
        );
        this.startDraw({
          area: {
            center: this.areaCenter,
            radius:
              +this.state.units.to(this.state.radiusNumber, units.meters) || radiusZeroDefault,
          },
        });
        this.editRadius.focus();
      }
    }
  };

  start() {
    log.trace('zones: start');
    // some shapes cannot be edited as a polygon, for that we use editable
    if (
      this.props.editing &&
      this.state.mode !== 'Area' &&
      this.props.editing.area &&
      this.props.editing.area.center
    ) {
      this.setState({
        mode: 'Area',
      });
      return;
    }
    this.startDraw({ edit: this.props.editing });
    if (this.props.editing) {
      let createAlertOn = 'none';
      if (this.props.editing.createAlertOnEnter) {
        createAlertOn = 'enter';
      }
      if (this.props.editing.createAlertOnExit) {
        createAlertOn = 'exit';
      }
      this.setState({
        name: this.props.editing.name,
        description: this.props.editing.description,
        createAlertOn,
      });
      this.setEditingRadius();
    }
  }

  stop() {
    this.props.stopDraw();
  }

  nameChanged = event => {
    this.setState({ name: event.target.value });
  };

  descriptionChanged = event => {
    this.setState({ description: event.target.value });
  };

  fillColorChanged = color => {
    this.props.changeFillColor(color.rgb);
  };

  updateRadius = radiusNumber => {
    radiusNumber = parseFloat(radiusNumber);
    const meters = this.state.units.to(radiusNumber, 'meters');
    if (meters > maxRadius) {
      radiusNumber = units.meters.to(maxRadius, this.state.units);
    } else if (radiusNumber < 0) {
      radiusNumber = 0;
    }
    this.setState({ radiusNumber });
    this.props.updateRadius(this.state.units.to(radiusNumber, 'meters'));
  };

  fillPatternChanged = pattern => {
    this.props.changeFillPattern(pattern);
  };

  strokeColorChanged = color => {
    this.props.changeStrokeColor(color.rgb);
  };

  createAlertSelected = event => {
    this.setState({ createAlertOn: event.target.value });
  };

  updateStyle = () => {
    this.props.updateStyle({
      fillColor: this.props.fillColor,
      fillPattern: this.props.fillPattern,
      strokeColor: this.props.strokeColor,
    });
  };

  accept = () => {
    const geom = Projection.geomToLonLat(this.props.drawn);
    const name = this.state.name.trim().length > 0 ? this.state.name.trim() : __('Zone');

    const radius = (typeof geom.getRadius === 'function' && geom.getRadius()) || 0;
    const poly =
      (typeof geom.getCoordinates === 'function' && Protobuf.fromPolygon(geom.getCoordinates())) ||
      Protobuf.fromPolygon([]);
    const area = {
      radius,
      track_id: this.areaObject && this.areaObject.trackId,
      registry_id: this.areaObject && this.areaObject.registryId,
      center: this.areaCenter,
    };
    const zone = {
      name,
      description: this.state.description,
      poly,
      fill_color: this.props.fillColor,
      fill_pattern: this.props.fillPattern,
      stroke_color: this.props.strokeColor,
      excludedVessels: this.state.excludedVessels,
      create_alert_on_enter: this.state.createAlertOn === 'enter',
      create_alert_on_exit: this.state.createAlertOn === 'exit',
    };
    if (this.props.editing) {
      zone.database_id = this.props.editing.databaseId;
      if (this.props.editing.area) {
        area.center = this.props.editing.area.center;
        area.track_id = this.props.editing.area.trackId;
        area.registry_id = this.props.editing.area.registryId;
      }
    }
    if (this.state.mode === 'Area' && area.center) {
      zone.area = area;
    }
    this.props.sendUpsert(zone);
  };

  setEditingRadius = () => {
    const meters =
      this.props.editing &&
      this.props.editing.area &&
      (this.props.editing.area.radius * 20037508.34) / 180;
    this.setState(prevState => ({
      radiusNumber: (meters && +units.meters.to(meters, prevState.units).toFixed(5)) || 0,
    }));
  };

  reset = () => {
    if (this.state.mode === 'Area') {
      this.unsetupArea();
      this.setupForArea();
    }
    this.props.reset();
    if (this.props.editing) {
      this.props.changeFillColor(this.props.editing.fillColor);
      this.props.changeFillPattern(this.props.editing.fillPattern);
      this.props.changeStrokeColor(this.props.editing.strokeColor);
    }
  };

  renderAreaRadiusTextField() {
    let textField = null;
    if (this.state.mode === 'Area') {
      textField = (
        <React.Fragment>
          <TextField
            onChange={e => this.updateRadius(e.target.value)}
            style={styles.editRadius}
            value={Number.isNaN(this.state.radiusNumber) ? '' : this.state.radiusNumber}
            type="number"
            inputRef={inp => {
              this.editRadius = inp;
            }}
            label={__('Radius')}
          />
          <DistanceSelector unit={this.state.units} onSelect={this.unitsChanged} />
        </React.Fragment>
      );
    }
    return <Collapse in={this.state.mode === 'Area'}>{textField}</Collapse>;
  }

  render = () => {
    const valid = this.props.drawn && (this.state.mode !== 'Area' || this.state.radiusNumber);
    return (
      <FlexContainer column align="start stretch" id="edit-zone">
        <FlexContainer align="space-between center">
          <Button variant="contained" onClick={this.reset}>
            {__('Reset')}
          </Button>
          <Select
            value={this.state.mode}
            onChange={e => this.setState({ mode: e.target.value })}
            input={<Input id="selection-type" />}
            disabled={!!this.props.editing}
          >
            <MenuItem value="Polygon">Scope</MenuItem>
            <MenuItem value="Area">Area</MenuItem>
          </Select>
          <Button variant="contained" color="primary" onClick={this.accept} disabled={!valid}>
            {__('Accept')}
          </Button>
        </FlexContainer>
        <PolygonCoordinatesTable onStartDraw={this.startDraw} mode={this.state.mode} />

        <FlexContainer
          style={styles.editPanel}
          column
          align="space-around stretch"
          className={this.props.classes.form}
        >
          <TextField
            id="name"
            value={this.state.name}
            onChange={this.nameChanged}
            maxLength={20}
            label={__('Zone Name')}
          />
          <TextField
            id="description"
            value={this.state.description}
            onChange={this.descriptionChanged}
            label={__('Description')}
            multiline
            rows={4}
          />
          {this.renderAreaRadiusTextField()}
        </FlexContainer>
        <Typography variant="h6">{__('Style')}</Typography>

        <div style={styles.stylePreview}>
          <AreaStylePreview
            width={128}
            height={64}
            fillPattern={this.props.fillPattern}
            fillColor={this.props.fillColor}
            strokeColor={this.props.strokeColor}
          />
        </div>

        <FlexContainer align="center space-between">
          <ColorPicker
            label={__('Fill Color')}
            color={this.props.fillColor}
            onChange={this.fillColorChanged}
          />
          <ColorPicker
            label={__('Line Color')}
            color={this.props.strokeColor}
            onChange={this.strokeColorChanged}
          />
          <PatternSelector selected={this.props.fillPattern} onSelect={this.fillPatternChanged} />
        </FlexContainer>
        <div style={styles.controls}>
          <div style={styles.colorButton} />
          <div style={styles.colorButton} />
          <div style={styles.patternButton} />
        </div>
        <Typography variant="h6">{__('Alerts')}</Typography>
        <FormControl component="fieldset" required>
          <RadioGroup
            value={this.state.createAlertOn}
            onChange={this.createAlertSelected}
            name="alerts"
            aria-label="alerts"
          >
            <FormControlLabel value="none" control={<Radio />} label={__('None')} />
            <FormControlLabel
              value="enter"
              control={<Radio />}
              label={__('When entering the zone')}
            />
            <FormControlLabel
              value="exit"
              control={<Radio />}
              label={__('When leaving the zone')}
            />
          </RadioGroup>
        </FormControl>
        <Button onClick={this.openExcludeDialog} variant="contained">
          {__('Exclude vessels')}
        </Button>
        <ExcludeVesselsDialog
          onIncludeVessel={this.onIncludeVessel}
          selectedVessels={this.state.excludedVessels}
          onExcludeVessel={this.onExcludeVessel}
          onClose={this.closeExcludeDialog}
          isOpen={this.state.isOpenExcludeVesselsDialog}
        />
      </FlexContainer>
    );
  };
}

EditZonePanel.propTypes = {
  drawn: PropTypes.object,
  editing: PropTypes.object,
  fillColor: PropTypes.object,
  fillPattern: PropTypes.string,
  strokeColor: PropTypes.object,
  updating: PropTypes.bool.isRequired,
  error: PropTypes.object,
  radius: PropTypes.number,

  history: PropTypes.object.isRequired,
  classes: PropTypes.object,

  // Dispatch props
  startDraw: PropTypes.func.isRequired,
  stopDraw: PropTypes.func.isRequired,
  changeFillColor: PropTypes.func.isRequired,
  changeFillPattern: PropTypes.func.isRequired,
  changeStrokeColor: PropTypes.func.isRequired,
  updateStyle: PropTypes.func.isRequired,
  sendUpsert: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  updateRadius: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  drawn: state.draw.drawnGeometry,
  radius: state.draw.radius,
  editing: state.zones.editing,
  fillColor: state.zones.fillColor,
  fillPattern: state.zones.fillPattern,
  strokeColor: state.zones.strokeColor,
  updating: state.zones.updating,
  error: state.zones.error,
});

const mapDispatchToProps = dispatch => ({
  startDraw: options => {
    dispatch(draw.enable(options));
  },
  stopDraw: () => {
    dispatch(draw.disable());
  },
  changeFillColor: color => {
    dispatch(zonesActions.changeFillColor(color));
  },
  changeFillPattern: pattern => {
    dispatch(zonesActions.changeFillPattern(pattern));
  },
  changeStrokeColor: color => {
    dispatch(zonesActions.changeStrokeColor(color));
  },
  updateStyle: options => {
    dispatch(draw.updateStyle(options));
  },
  sendUpsert: zone => {
    dispatch(zonesActions.sendUpsert(zone));
  },
  clearError: () => {
    dispatch(zonesActions.clearError());
  },
  reset: () => {
    dispatch(draw.reset());
  },
  updateRadius: r => {
    dispatch(draw.updateRadius(r));
  },
});

export const PureEditZonePanel = EditZonePanel;
export default (EditZonePanel = withStyles(styles)(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps,
    )(EditZonePanel),
  ),
));
