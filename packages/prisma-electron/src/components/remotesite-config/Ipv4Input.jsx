import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/styles";

// Components
import {
  TextField,
  FormHelperText,
  InputLabel,
} from '@material-ui/core';

// Actions & Helpers
import { getRange, isValidIPItemValue } from './helpers';

const styles = theme => ({
  textField: {
    width: "24%",
    "& *": { textAlign: "center !important" }
  },
  i: {
    paddingTop: 13,
    display: "inline-block"
  },
});

class Ipv4Input extends React.Component {
  static propTypes = {
    defaultValue: PropTypes.string || PropTypes.array,
    label: PropTypes.string,
    helperText: PropTypes.string,
    hasError: PropTypes.bool,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    label: "IP Address",
    helperText: "Invalid IP Address",
    hasError: false,
    defaultValue: '...',
    onChange: () => { },
  };

  constructor(props) {
    super(props);

    this.state = {
      value: [],
      isFocus: false,
    };
  }

  componentDidMount = () => {
    let { defaultValue: value } = this.props;

    if (value === '') {
      value = '...';
    }

    if (!Array.isArray(value)) {
      value = value.split('.');
    }

    this.setState({ value });
  }

  handleChange = (e, i) => {
    let val = parseInt(e.target.value);

    if (isNaN(e.target.value)) {
      return e.preventDefault();
    }

    if (e.target.value !== '' && !isValidIPItemValue(val)) {
      val = 255;
    }

    let value = this.state.value;

    value[i] = val;
    this.setState({ value }, () => this.onPropsChange());

    if (!isNaN(val) && String(val).length === 3 && i < 3) {
      this[`input-${i + 1}`].focus();
    }
  }

  handleKeyDown = (e, i) => {
    let domId = i;

    if ((e.key === 'ArrowLeft' || e.key === 'Backspace') && getRange(e.target).end === 0 && i > 0) {
      domId = i - 1;
    }

    if (e.key === 'ArrowRight' && getRange(e.target).end === e.target.value.length && i < 3) {
      domId = i + 1;
    }

    if (e.key === '.') {
      e.preventDefault();

      if (i < 3) {
        domId = i + 1;
      }
    }

    this[`input-${domId}`].focus();
  }

  handlePaste = (e, i) => {
    if (!e.clipboardData || !e.clipboardData.getData) {
      return;
    }

    const pasteData = e.clipboardData.getData('text/plain');
    if (!pasteData) {
      return;
    }

    const value = pasteData.split('.').map(v => parseInt(v));
    if (value.length !== 4 - i) {
      return;
    }

    if (!value.every(isValidIPItemValue)) {
      return;
    }

    const { value: oldValue } = this.state;
    value.forEach((val, j) => {
      oldValue[i + j] = val;
    });

    this.setState({ value: oldValue }, () => this.onPropsChange());

    return e.preventDefault();
  }

  handleFocus = () => {
    this.setState({
      isFocus: true,
    });
  }

  handleBlur = () => {
    this.setState({
      isFocus: false,
    });
  }

  onPropsChange = () => {
    const { value } = this.state;
    const ip = value.map(val => isNaN(val) ? '' : val).join('.');

    return this.props.onChange(ip);
  }

  render() {
    const { value, isFocus } = this.state;
    const { classes, label, helperText, hasError } = this.props;

    return (
      <div>
        <InputLabel
          shrink={true}
          focused={isFocus}
          error={hasError}
        >
          {label}
        </InputLabel>
        {value.map((val, i) => (
          <React.Fragment key={i}>
            <TextField
              classes={{ root: classes.textField }}
              inputRef={(el) => (this[`input-${i}`] = el)}
              value={isNaN(val) ? '' : val}
              onChange={e => this.handleChange(e, i)}
              onKeyDown={e => this.handleKeyDown(e, i)}
              onPaste={e => this.handlePaste(e, i)}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
            />
            {i !== 3 ? <i className={classes.i}>.</i> : false}
          </React.Fragment>
        ))}
        {hasError && (
          <FormHelperText error={true}>
            {helperText}
          </FormHelperText>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(Ipv4Input);