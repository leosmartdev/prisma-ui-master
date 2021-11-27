import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
} from '@material-ui/core';

// Helpers
import { getRemoteSiteIcon } from 'components/remotesite-config/helpers';

RemoteSiteListItem.propTypes = {
  /**
   * The provided remote site to display.
   */
  remoteSite: PropTypes.object.isRequired,
  /**
   * Callback when the item is clicked. Passes the remote site as the only param to the callback.
   *
   * ## Signature
   * `onSelect(remoteSite: object) => void`
   */
  onSelect: PropTypes.func,
};

RemoteSiteListItem.defaultProps = {
  onSelect: () => { },
};

// css style for the secondary text
var secondaryStyle = {
  whiteSpace: "nowrap",
  overflow: "hidden",
};

export default function RemoteSiteListItem({ onSelect, remoteSite }) {
  /* Previous list item secondary....secondary={this.times.compact.lastModified} */
  let primary = (
    <FlexContainer align="space-between center">
      <Typography variant="caption">
        {remoteSite.cscode}
      </Typography>
      <Typography variant="caption">
        {remoteSite.type}
      </Typography>
    </FlexContainer>
  );

  return (
    <ListItem button onClick={() => onSelect(remoteSite)}>
      <ListItemIcon>
        {getRemoteSiteIcon(remoteSite)}
      </ListItemIcon>
      <ListItemText
        style={secondaryStyle}
        title={remoteSite.csname}
        primary={primary}
        secondary={remoteSite.csname}
      />
    </ListItem>
  );
}