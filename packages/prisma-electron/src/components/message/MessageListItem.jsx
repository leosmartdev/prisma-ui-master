import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  Typography,
  ListItem,
  ListItemText,
  IconButton,
  ListItemSecondaryAction,
} from '@material-ui/core';

// Icons
import RetryIcon from '@material-ui/icons/Replay';
import DismissIcon from '@material-ui/icons/NotificationsOff';

// Helpers & Actions
import { formatTime } from 'components/message/helpers';

import { retryMessage, acknowledgeMessage } from 'message/message';

class MessageListItem extends React.Component {
  static propTypes = {
    message: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    /**@private withStyles */
    classes: PropTypes.object.isRequired,
    /**@private withTransaction */
    createTransaction: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
  }

  retryMessage = id => {
    const { createTransaction } = this.props;

    createTransaction(retryMessage(id));
  };

  acknowledgeMessage = id => {
    const { createTransaction } = this.props;

    createTransaction(acknowledgeMessage(id));
  };

  render() {
    const { message, onSelect, classes } = this.props;

    let time = formatTime(message.Time.seconds * 1000, 'lll z');
    let primaryText = '';
    if (message.Cscode || message.Csname) {
      switch (message.Direction) {
        case 1:
          primaryText = 'Sent to';
          break;
        case 2:
          primaryText = 'Received from';
          break;
        case 3:
          primaryText = 'Pending to';
          break;
        case 4:
          primaryText = 'Failed to';
          break;
      }

      if (message.Cscode) {
        if (message.Csname) {
          primaryText += ` ${message.Csname} (${message.Cscode}) `;
        } else {
          primaryText += ` ${message.Cscode} `;
        }
      } else if (message.Csname) {
        primaryText += ` ${message.Csname} `;
      }
    }

    primaryText += `over ${message.CommLinkType.toUpperCase()}`;

    let secondaryText = time;
    if (message.SitNumber == 185) {
      let firstLine = message.MessageBody.split("\n")[1];

      secondaryText += `\n${firstLine.replace(/1\.|DISTRESS|COSPAS-SARSAT/g, '').trim()}`;
    }

    return (
      <ListItem
        classes={{ secondaryAction: classes.item }}
        button
        onClick={() => onSelect(message)}
      >
        <ListItemText
          classes={{ secondary: classes.secondary }}
          primary={(
            <FlexContainer align="space-between center">
              <Typography variant="body2">{primaryText}</Typography>
              <Typography variant="caption">{`SIT ${message.SitNumber}`}</Typography>
            </FlexContainer>
          )}
          secondary={secondaryText}
        />
        {message.Direction == 4 && (
          <ListItemSecondaryAction classes={{ root: classes.action }}>
            <React.Fragment>
              <IconButton onClick={() => this.retryMessage(message.Id)}>
                <RetryIcon />
              </IconButton>
              {message.Dismiss == false && (
                <IconButton onClick={() => this.acknowledgeMessage(message.Id)}>
                  <DismissIcon />
                </IconButton>
              )}
            </React.Fragment>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    );
  }
}

export default withStyles({
  secondary: {
    whiteSpace: 'pre-line',
  },
  item: {
    paddingRight: 16,
  },
  action: {
    right: 5,
    top: '75%',
  },
})(
  withTransaction(MessageListItem)
);
