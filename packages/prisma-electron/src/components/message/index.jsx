import React from 'react';
import { __ } from 'lib/i18n';

// Routing
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';
import { AnimatedPageRoute } from 'components/layout/Page';

// Components
import MessageListPanel from 'components/message/MessageListPanel';
import MessageDetails from 'components/message/MessageDetails';
import Sit915MsgEdit from 'components/message/Sit915MsgEdit';

class Message extends React.Component {
  render() {
    return [
      <LeftDrawerRoute
        key="message-management-list-messages"
        exact
        path="/message/list"
        component={MessageListPanel}
        title={__('Messages')}
        routeOnClose="/"
      />,
      <LeftDrawerRoute
        key="sit915-msg-management-edit"
        exact
        path="/sit915-msg/edit"
        component={Sit915MsgEdit}
        title={__('Send SIT 915 Message')}
        routeOnClose="/message/list"
      />,
      <AnimatedPageRoute
        key="message-management-show-message"
        exact
        path="/message/show"
      >
        <MessageDetails />
      </AnimatedPageRoute>,
    ];
  };
}

export default Message;