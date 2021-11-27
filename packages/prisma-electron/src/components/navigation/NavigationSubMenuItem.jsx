import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withRouter } from 'react-router-dom';

// Components
import {
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';

class NavigationSubMenuItem extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,

    /** @private withRouter() */
    history: PropTypes.object.isRequired,
  };

  static defaultProps = {
    from: '/',
  };

  constructor(props) {
    super(props);
  }

  onClick = () => {
    const { history, to, from } = this.props;

    if (history.location.pathname === to) {
      history.push(from);
    } else {
      history.push(to);
    }
  };

  render() {
    const {
      title,
      children,
    } = this.props;

    return (
      <MenuItem onClick={this.onClick}>
        <ListItemIcon>
          {children}
        </ListItemIcon>
        <ListItemText primary={title} />
      </MenuItem>
    );
  };
}

export default withRouter(NavigationSubMenuItem);