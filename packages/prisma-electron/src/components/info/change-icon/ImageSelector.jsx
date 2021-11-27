import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from "@material-ui/core/Divider";

export default class ImageSelector extends React.Component {
  static propTypes = {
    listImage: PropTypes.array,
    image: PropTypes.any,
    onImageSelected: PropTypes.func.isRequired,
    isCustom: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
  }

  onImageSelected = event => {
    this.props.onImageSelected(event.target.value);
  }

  render() {
    const { listImage, image, isCustom } = this.props;

    let listItem = [(
      <MenuItem key={-1} value={-1}>{__('Default Icon')}</MenuItem>
    )];
    let value = -1;

    if (image && listImage.length > 0) {
      let subHeader = (
        <Divider key="divider" style={{margin: '5px'}} />
      );
      let listCustomItems = listImage.map(elem => {
        if (isCustom && elem.id == image.id) {
          value = elem.id;
        }

        let displayName = elem.metadata.name;
        displayName = displayName.split(".")[0];
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        return (
          <MenuItem key={elem.id} value={elem.id}>{displayName}</MenuItem>
        );
      });

      listItem = listItem.concat([subHeader], listCustomItems);
    }

    return (
      <Select
        value={value}
        onChange={this.onImageSelected}
      >
        {listItem}
      </Select>
    )
  };
}