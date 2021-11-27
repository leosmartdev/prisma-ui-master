/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 */
import React from 'react';
import PropTypes from 'prop-types';

// Component Imports
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

/**
 * DropDownButton
 * Button Dropdown menu for easy use until Material UI adds a dropdown component.
 */
export default class DropDownButton extends React.Component {
  static propTypes = {
    // ID of the Selected value
    selectedId: PropTypes.string,
    // Option must be an array of objects which has an string: id, string: title
    // id is used for uniqueness, title is used as the title of menu option and
    // button title when selected
    // name can be used instead of title if needed.
    options: PropTypes.array.isRequired,
    /**
     * Callback when a new option is selected. Passes the entire option
     * object, not just the ID
     *
     * ## Signature
     * `onChange(selection: object) => void`
     */
    onChange: PropTypes.func.isRequired,
    // Sets the variant of the button. See material-ui/Button documentation.
    variant: PropTypes.string,
    // If provided, label will be shown instead of the value of the selction on the button
    label: PropTypes.string,
    // Color of the button
    color: PropTypes.string,
  };

  static defaultProps = {
    selectedId: null,
    label: null,
    variant: 'text',
    color: 'default',
  };

  state = {
    open: false,
    anchorEl: undefined,
  };

  openMenu = event => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  closeMenu = () => {
    this.setState({
      open: false,
      anchorEl: undefined,
    });
  };

  handleMenuChange = (event, option) => {
    const { onChange } = this.props;
    this.closeMenu(event, option);
    if (option && typeof option !== 'string') {
      onChange(option);
    }
  };

  render() {
    const { selectedId, variant, color, label, options, ...props } = this.props;
    const { anchorEl, open } = this.state;

    let selected = options.find(selection => selectedId === selection.id);
    if (!selected) {
      [selected] = options;
    }

    let buttonLabel = label;
    if (!buttonLabel && selected) {
      buttonLabel = selected.title || selected.name || selected.id;
    }

    return (
      <span>
        <Button variant={variant} color={color} onClick={this.openMenu} {...props}>
          {buttonLabel}
          <ArrowDropDownIcon />
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={this.closeMenu}>
          {options.map(option => (
            <MenuItem
              key={option.id}
              onClick={event => this.handleMenuChange(event, option)}
              selected={selected.id === option.id}
            >
              {option.component || option.title || option.name || option.id}
            </MenuItem>
          ))}
        </Menu>
      </span>
    );
  }
}
