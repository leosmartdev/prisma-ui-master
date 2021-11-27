import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// Components
import FlexContainer from '../FlexContainer';

import {
  Typography,
  IconButton,
} from '@material-ui/core';

class NavigationBarItem extends React.Component {
  static propTypes = {
    elemKey: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
    onClick: PropTypes.func.isRequired,
    /** @private mapStateToProps */
    navExpanded: PropTypes.bool.isRequired,
  };

  onClick = event => {
    const { elemKey, onClick } = this.props;

    onClick(elemKey, event.currentTarget);
  };

  render = () => {
    const { children, title, navExpanded } = this.props;

    return (
      <FlexContainer align="start center">
        <IconButton
          title={title}
          onClick={this.onClick}
        >
          {children}
        </IconButton>
        {navExpanded && (
          <Typography
            ariant="subtitle1"
            style={{ paddingLeft: '10px' }}
          >
            {title}
          </Typography>
        )}
      </FlexContainer>
    );
  };
}

const mapStateToProps = state => ({
  navExpanded: state.navigationBar.expanded,
});

export default connect(mapStateToProps)(NavigationBarItem);
