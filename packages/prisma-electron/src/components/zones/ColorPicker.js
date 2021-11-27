import React from 'react';
import PropTypes from 'prop-types';

// Components
import { ChromePicker } from 'react-color';

import {
  Button,
} from '@material-ui/core';

const styles = {
  popover: {
    position: 'absolute',
    zIndex: '2',
  },
  cover: {
    position: 'fixed',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
  },
};

export default class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
    };
  }

  toggleDisplay = () => {
    this.setState(prevState => ({ display: !prevState.display }));
  };

  handleClose = () => {
    this.setState({ display: false });
  };

  handleChange = color => {
    const { onChange } = this.props;
    onChange(color);
  };

  render = () => {
    const { color, label } = this.props;
    const { display } = this.state;
    const picker = (
      <div style={styles.popover}>
        <div
          aria-hidden
          style={styles.cover}
          onClick={this.handleClose}
          role="button"
          onKeyPress={this.handleKeyPress}
        />
        <ChromePicker color={color} onChange={this.handleChange} />
      </div>
    );

    return (
      <div>
        <Button variant="contained" onClick={this.toggleDisplay}>
          {label}
        </Button>
        {display ? picker : null}
      </div>
    );
  };
}

ColorPicker.propTypes = {
  label: PropTypes.string,
  color: PropTypes.object,
  onChange: PropTypes.func,
};
