import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { __ } from 'lib/i18n';

// Components
import { Link } from 'react-router-dom';

import Header from 'components/Header';
import { FlexContainer } from 'components/layout/Container';

import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  IconButton,
  Button,
} from '@material-ui/core';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// Helpers & Actions
import { unselect } from 'selection/selection';

const styles = {
  buttonContainer: {
    marginLeft: '100px'
  },
  button: {
    marginTop: '15px',
    backgroundColor: 'rgb(131, 132, 133)',
    textDecoration: 'none'
  }
}

class ManualInfoPanel extends React.Component {
  state = {
    detailsExpanded: true,
  };

  toggleCollapse = () => {
    this.setState(prevState => ({ detailsExpanded: !prevState.detailsExpanded }));
  };

  toggleCollapseIcon = () => (this.state.detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  update = () => {
    this.props.unselect();
  }

  render = () => {
    /* The following was removed
        <Header
          onClick={this.toggleCollapse}
          variant="h6"
          margin="normal"
          action={<IconButton>{this.toggleCollapseIcon()}</IconButton>}
        >
          {__('Placemark')}
        </Header>
        <Collapse in={this.state.detailsExpanded}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell padding="none">{__('Something')}</TableCell>
                <TableCell padding="none">Foobar</TableCell>
              </TableRow>
            </TableBody>
          </Table>
    */
    return (
      <FlexContainer column align="start stretch">
        <div style={styles.buttonContainer}>
          <Link to={"/manual-track/" + this.props.track.registryId + "/" + this.props.track.metadata.name + "/" + this.props.track.target.position.latitude + "/" + this.props.track.target.position.longitude} style={styles.button}>
            <Button style={styles.button} onClick={this.update}>Update Track</Button>
          </Link>
        </div>
      </FlexContainer>
    )
  };
}

ManualInfoPanel.propTypes = {
  track: PropTypes.object.isRequired,
  format: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  format: state.config,
});

const mapDispatchToProps = dispatch => ({
  unselect: () => {
    dispatch(unselect());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ManualInfoPanel);
