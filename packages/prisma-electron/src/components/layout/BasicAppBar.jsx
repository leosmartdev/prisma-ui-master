import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// components
import FlexContainer from 'components/FlexContainer';
import GoBack from 'components/icon/GoBack';

import {
  Typography,
  TextField,
  InputAdornment,
} from '@material-ui/core';

// Icons
import SearchIcon from '@material-ui/icons/Search';

const propTypes = {
  /**
   * Title string to display.
   */
  title: PropTypes.string.isRequired,
  /**
   * String route location to use as the `path` for the
   * back button. Will be used as the `to` prop in `<GoBack />`
   * component.
   */
  goBackTo: PropTypes.string.isRequired,
  /**
   * When true, a search box will be displayed in the center of the title.
   */
  search: PropTypes.bool,
  /**
   * When search is true, this is the callback when the query string changes.
   * Passes the string from the input or null if the input has no query string.
   * Callback `onSearch(query: string)`
   */
  onSearch: PropTypes.func,
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
};

const defaultProps = {
  search: false,
};

class BasicAppBar extends React.Component {
  state = {
    query: '',
  };

  /**
   * Called when the search input is updated. Will call the callback passed
   * in on the `onSearch` prop with the query string, or null if the search
   * is empty.
   *
   * TODO: Ideally this should be debounced, or configured to debounce through
   * a prop integer. This is probably calling a server to get results based on
   * the query, so debounce will keep things from getting overloaded. RxJS
   * would fit well here (since it can cancel requests too).
   */
  onSearchChange = event => {
    const query = event.target.value;
    this.setState({ query });

    if (query === '') {
      // If the query is empty, send null to the callback to
      // easily let them know there's no search.
      this.props.onSearch(null);
    } else {
      this.props.onSearch(query);
    }
  };

  render() {
    const { title, goBackTo, classes, search } = this.props;

    const { query } = this.state;

    return (
      <FlexContainer align="start center">
        <GoBack to={goBackTo} />
        <Typography variant="h4" noWrap className={classes.title}>
          {title}
        </Typography>
        {search && (
          <TextField
            className={classes.searchInput}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start" className={classes.adornment}>
                  <SearchIcon />
                </InputAdornment>
              ),
              placeholder: __('Search'),
            }}
            value={query}
            onChange={this.onSearchChange}
          />
        )}
      </FlexContainer>
    );
  }
}

BasicAppBar.propTypes = propTypes;
BasicAppBar.defaultProps = defaultProps;

export default withStyles(theme => ({
  title: {
    maxWidth: '50%',
  },
  adornment: {
    position: 'relative',
  },
  searchInput: {
    height: `calc(100% - ${theme.spacing(2)}px)`,
    margin: `${theme.spacing(1)}px ${theme.spacing(2)}px ${theme.spacing(1)}px 100px`,
    borderRadius: 2,
    backgroundColor: theme.palette.grey[500],
    fontSize: 16,
    padding: `0px ${theme.spacing(3)}px`,
    width: '33%',
    [theme.breakpoints.down('sm')]: {
      width: 'calc(50% - 24px)',
    },
    '&:hover, &:focus': {
      backgroundColor:
        theme.palette.type === 'dark' ? theme.palette.grey[400] : theme.palette.gray[600],
    },
  },
}))(BasicAppBar);
