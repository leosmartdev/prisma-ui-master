import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  Select,
  MenuItem,
} from '@material-ui/core';

export default class ImageSelector extends React.Component {
  imageSelected = event => {
    const { onSelect } = this.props;
    onSelect(event.target.value);
  };

  render = () => {
    const { selected, images } = this.props;

    let items = images.map(image => {
      return <MenuItem key={image.metadata.id} value={image.metadata.id}>{image.metadata.name}</MenuItem>
    });

    if (images.length == 0) {
      items = <MenuItem value={-100}>None</MenuItem>
    }

    return <Select
      value={selected}
      onChange={this.imageSelected}
    >
      {items}
    </Select>;
  };
}

ImageSelector.propTypes = {
  selected: PropTypes.any,
  onSelect: PropTypes.func,
  images: PropTypes.array,
};
