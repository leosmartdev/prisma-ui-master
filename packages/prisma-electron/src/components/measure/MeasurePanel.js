import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { __ } from 'lib/i18n';
import { withStyles } from '@material-ui/styles';

// Components
import DropDownButton from '@prisma/ui/DropDownButton';

import Container, { FlexContainer } from 'components/layout/Container';

import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@material-ui/core';

// Helpers & Actions
import * as draw from 'draw/draw';
import { units } from '../../format/units';
import DistanceSelector from './DistanceSelector';
import Formatter from '../../format/Formatter';

const styles = theme => ({
  buttons: {
    marginBottom: '15px',
    textAlign: 'center',
    width: '100%',
  },
  unit: {
    width: '200px',
    textAlign: 'right',
  },
  instructions: {
    margin: '20px',
    color: theme.palette.text.primary,
  },
});

class MeasurePanel extends React.Component {
  constructor(props) {
    super(props);

    this.tools = [
      {
        id: 'ruler',
        title: __('Ruler'),
        options: {
          type: 'LineString',
          style: 'checkered',
          measure: true,
        },
      },
      {
        id: 'compass',
        title: __('Compass'),
        options: {
          type: 'Circle',
          style: 'checkered',
          measure: true,
        },
      },
    ];

    this.state = {
      selectedTool: this.tools[0],
      units: units[props.defaultUnits],
    };
  }

  componentDidMount = () => {
    this.setState({ units: units[this.props.defaultUnits] });
    this.props.startDraw({
      ...this.state.selectedTool.options,
      activeDraw: true,
    });
  };

  componentWillUnmount() {
    this.props.stopDraw();
  }

  unitsChanged = units => {
    this.setState({ units });
    this.props.setMeasureUnits(units.id);
  };

  updateTool = tool => {
    this.setState({ selectedTool: tool });
    this.props.startDraw({
      ...tool.options,
      activeDraw: true,
    });
  };

  render = () => {
    const { selectedTool, units } = this.state;
    const format = new Formatter({ distance: this.props.measureUnits });
    return (
      <Container>
        <FlexContainer column align="space-between stretch">
          <div className={this.props.classes.buttons}>
            <DropDownButton
              selectedId={selectedTool.id}
              options={this.tools}
              onChange={this.updateTool}
            />
            <DistanceSelector unit={units} onSelect={this.unitsChanged} />
          </div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell>{__('Distance')}</TableCell>
                <TableCell className="distance" classes={{ root: this.props.classes.unit }}>
                  {format.meters(this.props.distance)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{__('Bearing')}</TableCell>
                <TableCell className="bearing" classes={{ root: this.props.classes.unit }}>
                  {format.angle(this.props.bearing)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </FlexContainer>
      </Container>
    );
  };
}

MeasurePanel.propTypes = {
  defaultUnits: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,

  measureUnits: PropTypes.string.isRequired,
  distance: PropTypes.number,
  bearing: PropTypes.number,

  startDraw: PropTypes.func.isRequired,
  stopDraw: PropTypes.func.isRequired,
  setMeasureUnits: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  defaultUnits: state.config.distance,
  measureUnits: state.draw.measureUnits,
  distance: state.draw.distance,
  bearing: state.draw.bearing,
});

const mapDispatchToProps = dispatch => ({
  startDraw: options => {
    dispatch(draw.enable(options));
  },
  stopDraw: () => {
    dispatch(draw.disable());
  },
  setMeasureUnits: units => {
    dispatch(draw.setMeasureUnits(units));
  },
});

export default (MeasurePanel = withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(MeasurePanel),
));
