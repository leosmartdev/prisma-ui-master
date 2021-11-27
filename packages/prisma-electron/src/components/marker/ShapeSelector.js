import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  Select,
  MenuItem,
} from '@material-ui/core';

// Helpers & Actions
import * as Shapes from 'marker/shapes';

export default class ShapeSelector extends React.Component {
  shapeSelected = event => {
    const { onSelect } = this.props;
    onSelect(event.target.value);
  };

  render = () => {
    const { selected } = this.props;
    const shapes = Shapes.shapes;

    let items = shapes.map(shape => {
      return <MenuItem key={shape.id} value={shape.id}>{shape.name}</MenuItem>
    });

    if (shapes.length == 0) {
      items = <MenuItem value={null}>None</MenuItem>
    }

    return <Select
      value={selected.id}
      onChange={this.shapeSelected}
    >
      {items}
    </Select>;
  };
}

ShapeSelector.propTypes = {
  selected: PropTypes.object,
  onSelect: PropTypes.func,
};
