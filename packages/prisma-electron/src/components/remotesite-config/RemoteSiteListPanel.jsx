import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import ErrorBanner from 'components/error/ErrorBanner';
import FlexContainer from 'components/FlexContainer';
import DropDownButton from 'components/DropDownButton';
import RemoteSiteList from 'components/remotesite-config/RemoteSiteList';

import {
  Avatar,
  Button,
  Chip,
  Typography,
} from '@material-ui/core';

// Icons
import MccIcon from '@material-ui/icons/Apartment';
import RccIcon from '@material-ui/icons/Computer';

// Actions & Helpers
import { listRemoteSiteConfigs, getRemoteSiteConfig } from 'remotesite-config/remotesite-config';
import { filterRemoteSites } from './helpers';

class RemoteSiteListPanel extends React.Component {
  static propTypes = {
    /** @private withRouter */
    history: PropTypes.object.isRequired,
    /** @private connect(mapStateToProps) */
    remoteSites: PropTypes.array,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    remoteSites: [],
  };

  static filterOptions = [
    { title: __('All'), id: 'None', icon: null },
    {
      title: __('MCC'),
      id: 'MCC',
      icon: (
        <Avatar>
          <MccIcon />
        </Avatar>
      ),
    },
    {
      title: __('RCC'),
      id: 'RCC',
      icon: (
        <Avatar>
          <RccIcon />
        </Avatar>
      ),
    },
  ];

  _isMounted = false;

  state = {
    filter: RemoteSiteListPanel.filterOptions[0],
    remoteSites: [],
  };

  /**
   * When the component is mounting, we should dispatch the
   * list remote sites to start loading the data.
   */
  componentDidMount() {
    this._isMounted = true;
    this.getRemoteSites();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => ({
      remoteSites: filterRemoteSites(newProps.remoteSites, prevState.filter.id),
    }));
  }

  async getRemoteSites() {
    const { createTransaction } = this.props;
    try {
      await createTransaction(listRemoteSiteConfigs());
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          errorBannerText: error.message,
        });
      }
    }
  }

  /**
   * Callback handler for when an remote site in the table is clicked.
   */
  onRemoteSiteClick = async remoteSite => {
    const {
      history,
      createTransaction,
    } = this.props;
    const id = remoteSite.id;

    await createTransaction(getRemoteSiteConfig(id));

    history.push({
      pathname: `/remotesite-config/show`,
    });
  };

  createRemoteSite = () => {
    const { history } = this.props;

    history.push('/remotesite-config/edit');
  };

  setFilter = filter => {
    this.setState((prevState, props) => ({
      filter,
      remoteSites: filterRemoteSites(props.remoteSites, filter.id),
    }));
  };

  getNullStateText = () => {
    const { filter } = this.state;
    switch (filter.id) {
      case 'MCC': {
        return __('There are no MCCs.');
      }
      case 'RCC': {
        return __('There are no RCCs.');
      }
    }

    return __('There are no remote sites in the system.');
  };

  render() {
    const { classes } = this.props;

    const { remoteSites, filter, errorBannerText } = this.state;

    const nullStateText = this.getNullStateText();

    return (
      <div>
        <FlexContainer align="space-between">
          <DropDownButton
            label="Filter"
            options={RemoteSiteListPanel.filterOptions}
            selected={filter}
            onChange={this.setFilter}
          >
            {__('Filter')}
          </DropDownButton>
          <Button 
            color="primary"
            variant="contained" 
            onClick={this.createRemoteSite}
          >
            {__('Create Remote Site')}
          </Button>
        </FlexContainer>
        {filter && filter.id !== 'None' && (
          <FlexContainer align="start center">
            <Chip
              avatar={filter.icon}
              label={filter.title}
              onDelete={() => this.setFilter(RemoteSiteListPanel.filterOptions[0])}
            />
          </FlexContainer>
        )}
        <ErrorBanner message={errorBannerText} />
        {remoteSites.length === 0 ? (
          <Typography variant="subtitle1" className={classes.nullState}>
            {nullStateText}
          </Typography>
        ) : (
          <RemoteSiteList onSelect={this.onRemoteSiteClick} remoteSites={remoteSites} />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  remoteSites: state.remoteSiteConfig.remoteSiteConfigs,
});

export default (RemoteSiteListPanel = withStyles(theme => ({
  nullState: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}))(
  withTransaction(
    withRouter(
      connect(
        mapStateToProps
      )(
        RemoteSiteListPanel
      )
    )
  )
));