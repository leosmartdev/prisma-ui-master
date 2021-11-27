import React from 'react';
import PropTypes from 'prop-types';

// Components
import RemoteSiteListItem from 'components/remotesite-config/RemoteSiteListItem';

import {
  List,
} from '@material-ui/core';

RemoteSiteList.propTypes = {
  /**
   * The lists of remote sites to display
   */
  remoteSites: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  /**
   * Callback function to handle when an remote site is selected
   */
  onSelect: PropTypes.func,
};

RemoteSiteList.defaultProps = {
  onSelect: () => { },
};

export default function RemoteSiteList({ remoteSites, onSelect }) {
  if (remoteSites.length === 0) {
    return null;
  }

  return (
    <List>
      {remoteSites.map(remoteSite => (
        <RemoteSiteListItem
          remoteSite={remoteSite}
          key={remoteSite.id}
          onSelect={onSelect}
        />
      ))}
    </List>
  );
}
