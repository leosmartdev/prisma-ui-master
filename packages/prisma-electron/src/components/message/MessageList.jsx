import React from 'react';
import PropTypes from 'prop-types';

// Components
import MessageListItem from 'components/message/MessageListItem';

import {
  List,
} from '@material-ui/core';

class MessageList extends React.Component {
  static propTypes = {
    messages: PropTypes.any,
    onSelect: PropTypes.func.isRequired,
  };

  static defaultProps = {
    messages: [],
  };

  render() {
    const { messages, onSelect } = this.props;

    if (messages.length === 0) {
      return null;
    }

    return (
      <List>
        {messages.map((message, idx) => (
          <MessageListItem
            key={idx}
            message={message}
            onSelect={onSelect}
          />
        ))}
      </List>
    );
  };
}

export default MessageList;