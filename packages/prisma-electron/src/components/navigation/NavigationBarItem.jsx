import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

// Components
import FlexContainer from '../FlexContainer';

import {
  Typography,
  IconButton,
  Badge,
} from '@material-ui/core';

class NavigationBarItem extends React.Component {
  onClick = () => {
    const { history, to, from } = this.props;
    // If we are already on the expected location, then go back to
    // the from location (eg. close the open panel)
    if (history.location.pathname === to) {
      history.push(from);
    } else {
      history.push(to);
    }
  };

  render = () => {
    const { children, title, navExpanded, badge, badgeCount, className } = this.props;
    let icon = children;
    if (badge && badgeCount > 0) {
      icon = (
        <Badge badgeContent={badgeCount} color="secondary">
          {children}
        </Badge>
      );
    }

    return (
      <FlexContainer align="start center" onClick={this.onClick}>
        <IconButton title={title} className={className}>
          {icon}
        </IconButton>
        {navExpanded && (
          <Typography variant="subtitle1" style={{ paddingLeft: '10px' }}>
            {title}
          </Typography>
        )}
      </FlexContainer>
    );
  };
}

NavigationBarItem.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  to: PropTypes.string.isRequired,
  from: PropTypes.string, // where to go back to when link is clicked again (aka close)
  badge: PropTypes.bool,
  badgeCount: PropTypes.number,
  className: PropTypes.string,
  history: PropTypes.object.isRequired,
  // state to props
  navExpanded: PropTypes.bool.isRequired,
};

NavigationBarItem.defaultProps = {
  from: '/',
  className: '',
};

const mapNavItemStateToProps = state => ({
  navExpanded: state.navigationBar.expanded,
});

export default withRouter(connect(mapNavItemStateToProps)(NavigationBarItem));
