import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import {
  TextField,
} from '@material-ui/core';

import {
  Autocomplete,
} from '@material-ui/lab';

// Helpers & Actions
import { codes } from 'iso-country-codes';

const style = theme => ({
  option: {
    '& > span': {
      marginRight: 10,
      fontSize: 12,
    },
  },
});

class CountrySelector extends React.Component {
  static propTypes = {
    country: PropTypes.any,
    onChange: PropTypes.func.isRequired,

    /** @private withStyles */
    classes: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    let country = null;

    codes.forEach(elem => {
      if (elem.alpha3 == props.country) {
        country = elem;
      }
    });

    this.state = {
      country,
    };
  }

  onChange = (event, newValue) => {
    if (newValue) {
      this.setState({
        country: newValue,
      });
      
      this.props.onChange(newValue.alpha3);
    }
  };

  render() {
    const { classes } = this.props;
    const { country } = this.state;

    return (
      <Autocomplete
        value={country}
        options={codes}
        classes={{ option: classes.option }}
        getOptionLabel={option => option.alpha3}
        renderOption={option => (
          <React.Fragment>
            <span>{option.alpha3}</span> {option.altName ? option.altName : option.name}
          </React.Fragment>
        )}
        renderInput={params => (
          <TextField
            {...params}
            label="Country"
            inputProps={{
              ...params.inputProps,
              // disable autofill
              autoComplete: 'new-password',
            }}
          />
        )}
        onChange={this.onChange}
      >
      </Autocomplete>
    );
  };
}

export default withStyles(style)(CountrySelector);