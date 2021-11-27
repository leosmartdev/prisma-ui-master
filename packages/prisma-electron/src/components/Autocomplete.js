import React from 'react';
import PropTypes from 'prop-types';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { withStyles } from '@material-ui/styles';

// Component Imports
import Autosuggest from 'react-autosuggest';

import {
  Paper,
  TextField,
  Typography,
  MenuItem,
} from '@material-ui/core';

const styles = theme => ({
  highlight: {
    color: theme.palette.secondary['500'],
  },
  container: {
    position: 'relative',
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    left: 0,
    zIndex: 1500,
  },
});

/**
 * Autocomplete
 */
class Autocomplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      value: props.value || '',
    };

    // Tells onBlur that a selection has already been handled, and don't do
    // autoselect.
    this.preventBlur = false;
  }

  componentWillReceiveProps(props) {
    if (props.value) {
      this.setState({ value: props.value });
    }
  }

  getSuggestions = value => {
    const { strictCompare, suggestions } = this.props;
    const inputValue = value ? value.trim().toLowerCase() : '';
    const inputLength = inputValue.length;

    if (strictCompare) {
      if (inputLength === 0) {
        return [...suggestions];
      }
      return suggestions.filter(
        ({ label }) => label && label.toLowerCase().slice(0, inputLength) === inputValue,
      );
    }
    return inputLength === 0
      ? [...suggestions]
      : suggestions.filter(({ label }) => label && label.toLowerCase().indexOf(inputValue) !== -1);
  };

  getSuggestionValue = suggestion => suggestion.value;

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
  };

  onSuggestionSelected = (event, { suggestionValue }) => {
    this.preventBlur = true;
    this.props.onSelect(suggestionValue);
  };

  onBlur = event => {
    this.props.onBlur();
    // autoselect the first one here, If we are asked to
    if (this.preventBlur !== true) {
      const value = event.target.value;
      if (this.props.suggestions.find(suggestion => suggestion.label === value)) {
        if (this.state.suggestions.length > 0 && this.props.autoselectFirstOption) {
          this.props.onSelect(this.state.suggestions[0].label);
        } else {
          // Pass the value through, let the handler deal with if its
          // valid or not
          this.props.onSelect(value);
        }
      }
    }

    this.preventBlur = false;
  };

  onChange = (event, params) => {
    this.setState({
      value: params.newValue,
    });
    this.props.onChange(event, params);
  };

  renderSuggestionsContainer(options) {
    const { containerProps, children } = options;

    return (
      <Paper elevation={2} {...containerProps} square>
        {children}
      </Paper>
    );
  }

  renderInput(props) {
    const { label, margin, value, ref, inputProps, ...other } = props;
    const { error, helperText, disabled, required, id } = inputProps;

    return (
      <TextField
        label={label}
        fullWidth
        id={id}
        margin={margin || 'none'}
        value={value}
        inputRef={ref}
        required={required}
        error={error}
        helperText={helperText}
        disabled={disabled}
        InputProps={{
          ...other,
        }}
      />
    );
  }

  renderSuggestion = (suggestion, { query, isHighlighted }) => {
    const matches = match(suggestion.label, query);
    const parts = parse(suggestion.label, matches);
    return (
      <MenuItem selected={isHighlighted} component="div">
        <Typography variant="body1">
          {parts.map(part => {
            if (part.highlight) {
              return (
                <span key={part.text} className={this.props.classes.highlight}>
                  {part.text}
                </span>
              );
            }

            return part.text;
          })}
        </Typography>
      </MenuItem>
    );
  };

  render() {
    return (
      <Autosuggest
        theme={{
          container: this.props.classes.container,
          suggestionsContainerOpen: this.props.classes.suggestionsContainerOpen,
          suggestionsList: this.props.classes.suggestionsList,
          suggestion: this.props.classes.suggestion,
        }}
        focusInputOnSuggestionClick={false}
        renderInputComponent={this.renderInput}
        renderSuggestionsContainer={this.renderSuggestionsContainer}
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        onSuggestionSelected={this.onSuggestionSelected}
        shouldRenderSuggestions={() => true}
        highlightFirstSuggestion
        renderSuggestion={this.renderSuggestion}
        inputProps={{
          label: this.props.label,
          value: this.state.value,
          onChange: this.onChange,
          onBlur: this.onBlur,
          margin: this.props.margin,
          inputProps: this.props.inputProps,
        }}
      />
    );
  }
}

Autocomplete.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  margin: PropTypes.string,
  id: PropTypes.string,
  onChange: PropTypes.func,
  suggestions: PropTypes.array.isRequired,
  autoselectFirstOption: PropTypes.bool,
  strictCompare: PropTypes.bool,
  renderSelectionsWithNoMaps: PropTypes.bool,
  inputProps: PropTypes.object,

  // Callbacks
  onBlur: PropTypes.func,
  onSelect: PropTypes.func.isRequired,
};

Autocomplete.defaultProps = {
  autoselectFirstOption: false,
  inputProps: {},
  id: '',
  strictCompare: false,
  onChange: () => { },
  onBlur: () => { },
};

export default withStyles(styles)(Autocomplete);
