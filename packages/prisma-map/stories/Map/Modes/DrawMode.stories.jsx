/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
// import { select } from '@storybook/addon-knobs';
import { randomPolygon } from '@turf/turf';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Map from '../../../src/Map';
import MapCard from '../../../src/MapCard';

const mapStories = storiesOf('Components/Map/Modes/Draw', module);

class CustomButtons extends React.Component {
  startSelection = () => {
    this.props.draw.changeMode('simple_select');
  };

  startPointMode = () => {
    this.deleteAll();
    this.props.draw.changeMode('draw_point');
  };

  startLineStringMode = () => {
    this.deleteAll();
    this.props.draw.changeMode('draw_line_string');
  };

  startPolygonMode = () => {
    this.deleteAll();
    this.props.draw.changeMode('draw_polygon');
  };

  deleteAll = () => {
    this.props.draw.deleteAll();
  };

  render() {
    return (
      <CardContent>
        <Typography>Change Draw Modes</Typography>
        <Button onClick={this.startSelection}>Select</Button>
        <Button onClick={this.startPointMode}>Create Point</Button>
        <Button onClick={this.startLineStringMode}>Create Line String</Button>
        <Button onClick={this.startPolygonMode}>Create Polygon</Button>
        <Button onClick={this.deleteAll}>Delete All</Button>
      </CardContent>
    );
  }
}

CustomButtons.propTypes = {
  draw: PropTypes.object.isRequired,
};

mapStories.add('Custom Buttons using DrawMode', () => (
  <Map mode="draw" modeOptions={{ draw: { displayControlsDefault: false } }}>
    <Map.DrawMode>
      {(map, draw) => (
        <MapCard anchor="top-left">
          <CustomButtons draw={draw} />
        </MapCard>
      )}
    </Map.DrawMode>
  </Map>
));

class CustomButtonsWithMapProps extends React.Component {
  state = {
    drawTool: 'select',
    feature: null,
  };

  onDrawToolChange = newTool => {
    this.setState({ drawTool: newTool });
  };

  onDrawCreate = feature => {
    this.setState({ feature });
  };

  onDrawUpdate = feature => {
    this.setState({ feature });
  };

  startSelection = () => {
    this.setState({ drawTool: 'select' });
  };

  startPointMode = () => {
    this.setState({ drawTool: 'point', feature: null });
  };

  startLineStringMode = () => {
    this.setState({ drawTool: 'line', feature: null });
  };

  startPolygonMode = () => {
    this.setState({ drawTool: 'polygon', feature: null });
  };

  insertFeature = () => {
    const collection = randomPolygon(1, { bbox: [10, -10, -10, 10] });
    this.setState({
      feature: null,
      incomingFeature: collection.features[0],
    });
  };

  render() {
    const { drawTool, feature, incomingFeature } = this.state;
    return (
      <div style={{ position: 'relative', width: 800, height: 500 }}>
        <Map
          mode="draw"
          modeOptions={{ draw: { displayControlsDefault: false } }}
          drawTool={drawTool}
          drawFeature={incomingFeature}
          onDrawToolChange={this.onDrawToolChange}
          onDrawCreate={this.onDrawCreate}
          onDrawUpdate={this.onDrawUpdate}
        />
        <MapCard anchor="top-left">
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography>Change Draw Modes</Typography>
              <Button onClick={this.startSelection}>Select</Button>
              <Button onClick={this.startPointMode}>Create Point</Button>
              <Button onClick={this.startLineStringMode}>Create Line String</Button>
              <Button onClick={this.startPolygonMode}>Create Polygon</Button>
              <Button onClick={this.insertFeature}>Create Random Feature</Button>
              {feature && (
                <React.Fragment>
                  <Typography>Feature {feature.geometry.type}</Typography>
                </React.Fragment>
              )}
            </div>
          </CardContent>
        </MapCard>
      </div>
    );
  }
}

mapStories.add('Custom Buttons using drawTool Prop', () => <CustomButtonsWithMapProps />);
