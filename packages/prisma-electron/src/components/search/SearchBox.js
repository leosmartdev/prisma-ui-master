import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import {
  IconButton,
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
} from '@material-ui/core';

// Icons
import SearchIcon from '@material-ui/icons/Search';

export default class SearchBox extends React.Component {
  state = {
    query: '',
  };

  handleChange = event => {
    const { onChange } = this.props;
    let value = event.target.value;
    if (!event.target.value) {
      value = '';
    }
    this.setState({ query: value });
    onChange(value);
  };

  render = () => {
    const { query } = this.state;

    const endAdornment = (
      <InputAdornment position="end">
        <IconButton onClick={this.handleChange}>
          <SearchIcon />
        </IconButton>
      </InputAdornment>
    );

    return (
      <FormControl fullWidth>
        <InputLabel htmlFor="search">{__('Search')}</InputLabel>
        <Input value={query} onChange={this.handleChange} endAdornment={endAdornment} />
      </FormControl>
    );
  };
}

SearchBox.propTypes = {
  onChange: PropTypes.func.isRequired,
};
