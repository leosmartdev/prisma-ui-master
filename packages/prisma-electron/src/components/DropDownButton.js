import React from 'react';
import PropTypes from 'prop-types';

// Component Imports
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@material-ui/core';

// Icons
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

/**
 * DropDownButton
 * Button Dropdown menu for easy use until Material UI adds a dropdown component.
 */
class DropDownButton extends React.Component {
  constructor(props) {
    super(props);

    let selected;
    if (props.selected) {
      selected = props.selected;
    } else {
      selected = props.options[0];
    }

    this.state = {
      open: false,
      anchorEl: undefined,
      selected,
    };
  }

  componentWillReceiveProps(props) {
    if (props.selected) {
      this.setState({ selected: props.selected });
    }
  }

  openMenu = event => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  closeMenu = (event, selectedOption) => {
    if (selectedOption) {
      this.setState({
        open: false,
        anchorEl: undefined,
        selected: selectedOption,
      });
    } else {
      this.setState({
        open: false,
        anchorEl: undefined,
      });
    }
  };

  handleMenuChange = (event, option) => {
    const { onChange } = this.props;
    this.closeMenu(event, option);
    onChange(option);
  };

  render() {
    const { variant, color, label, options } = this.props;
    const { selected, anchorEl, open } = this.state;
    return (
      <span>
        <Button variant={variant} color={color} onClick={this.openMenu}>
          {label || selected.title || selected.name || selected.id}
          <ArrowDropDownIcon />
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={this.closeMenu}>
          {options.map(option => (
            <MenuItem
              key={option.id}
              onClick={event => this.handleMenuChange(event, option)}
              selected={selected.id === option.id}
            >
              {option.showIcon && (
                <ListItemIcon>
                  {option.icon}
                </ListItemIcon>
              )}
              {option.component || option.title || option.name || option.id}
            </MenuItem>
          ))}
        </Menu>
      </span>
    );
  }
}

DropDownButton.propTypes = {
  // Selected value
  selected: PropTypes.any,
  // Option must be an array of objects which has an string: id, string: title
  // id is used for uniqueness, title is used as the title of menu option and
  // button title when selected
  // name can be used instead of title if needed.
  options: PropTypes.array.isRequired,
  // Callback when a new option is selected
  onChange: PropTypes.func.isRequired,
  // Sets the variant of the button. See material-ui/Button documentation.
  variant: PropTypes.string,
  // If provided, label will be shown instead of the value of the selction on the button
  label: PropTypes.string,
  // Color of the button
  color: PropTypes.string,
};

DropDownButton.defaultProps = {
  variant: 'text',
  color: 'default',
};

export default DropDownButton;
