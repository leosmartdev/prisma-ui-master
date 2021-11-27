import React from 'react';
import PropTypes from 'prop-types';
import loglevel from 'loglevel';
import { __ } from 'lib/i18n';
import { connect } from 'react-redux';
import { withTransaction } from 'server/transaction';

// Components
import ErrorBanner from 'components/error/ErrorBanner';
import { FlexContainer } from 'components/layout/Container';
import SearchBox from './SearchBox';
import SearchResultsList from './SearchResultsList';

// actions
import * as searchActions from 'search/search';
import * as mapActions from 'map/map';

const log = loglevel.getLogger('search');
const searchDelay = 500;

class Search extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.timer = null;
    this.state = {
      results: null,
      searchText: '',
      errorBannerMessage: null,
    };
  }

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  scheduleSearch = searchText => {
    this.setState({ searchText });
    if (this.timer != null) {
      clearTimeout(this.timer);
    }
    if (!searchText || searchText.trim().length === 0) {
      this.setState({ results: null });
      return;
    }
    this.timer = setTimeout(() => this.search(searchText), searchDelay);
  };

  search = searchText => {
    const { createTransaction } = this.props;
    // todo config the magic number
    this.setState({ errorBannerMessage: null });
    createTransaction(searchActions.searchRegistry(searchText, 50)).then(
      response => {
        if (this._isMounted) {
          this.setState({ results: response });
        }
      },
      response => {
        if (this._isMounted) {
          this.setState({
            errorBannerMessage: `${__('An error occurred getting search results.')} ${response.error
              .statusText || ''}`,
          });
        }
      },
    );
  };

  onResponse = response => {
    log.debug('search response', response);
  };

  onError = error => {
    const { showError } = this.props;
    showError({ error });
  };

  select = result => {
    const { flyTo } = this.props;
    // TODO re-enable flyto this.props.animator.flyTo(track, { select: true });
    flyTo(result.registryId, 'registry');
  };

  render = () => {
    const { errorBannerMessage, results } = this.state;
    return (
      <FlexContainer column align="start stretch">
        <ErrorBanner message={errorBannerMessage} />
        <SearchBox onChange={this.scheduleSearch} />
        <SearchResultsList results={results} onSelect={this.select} />
      </FlexContainer>
    );
  };
}

Search.propTypes = {
  // state to props
  config: PropTypes.object.isRequired,
  // dispatch to props
  showError: PropTypes.func.isRequired,
  flyTo: PropTypes.func.isRequired,
  // withTransaction
  createTransaction: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  config: state.config,
});

const mapDispatchToProps = dispatch => ({
  showError: message => {
    dispatch({ type: 'error/show', payload: message });
  },
  flyTo: (id, type) => {
    dispatch(mapActions.animate(id, type));
  },
});

export default (Search = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTransaction(Search)));
