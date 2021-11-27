import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { __ } from 'lib/i18n';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';

// Components
import { FlexContainer } from 'components/layout/Container';
import Header from 'components/Header';

import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Collapse,
  Button,
  IconButton,
} from '@material-ui/core';

// Helpers
import MarkerFormatter from '../../format/MarkerFormatter';
import { unselect } from 'selection/selection';
import * as actions from 'marker/marker';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = {
  container: {
    marginTop: '15px'
  },
  link: {
    textDecoration: 'none',
    margin: '0 10px'
  },
  dialogText: {
    paddingLeft: '20px',
    paddingRight: '20px',
  },
}

class ManualInfoPanel extends React.Component {
  state = {
    detailsExpanded: true,
    showConfirmation: false,
  };

  componentWillUnmount = () => {
    this.props.unselect();
  };

  toggleCollapse = () => {
    this.setState(prevState => ({ detailsExpanded: !prevState.detailsExpanded }));
  };

  toggleCollapseIcon = () => (this.state.detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  show = () => {
    const { track, show } = this.props;

    show(track.id);
  };

  hide = () => {
    const { track, hide } = this.props;

    hide(track.id);
  };

  accept = () => {
    this.setState({ showConfirmation: true });
  }

  cancel = () => {
    this.setState({ showConfirmation: false });
  }

  confirmed = async () => {
    const { track, createTransaction } = this.props;

    this.setState({ showConfirmation: false });

    await createTransaction(actions.deleteMarker(track.id));
    this.props.history.push('/');
  }

  render = () => {
    const { track, listMarkers } = this.props;
    const { showConfirmation } = this.state;
    const format = new MarkerFormatter(this.props.format);
    const type = format.type(track);
    let isVisible = true;

    listMarkers.forEach(elem => {
      if (elem.properties.id === track.id && elem.properties.show === false) {
        isVisible = false;
      }
    });

    return (
      <FlexContainer column align="start stretch">
        <Header
          onClick={this.toggleCollapse}
          variant="h6"
          margin="normal"
          action={<IconButton>{this.toggleCollapseIcon()}</IconButton>}
        >
          {__('Marker')}
        </Header>
        <Collapse in={this.state.detailsExpanded}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell padding="none">{__('Type')}</TableCell>
                <TableCell padding="none">{type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Description')}</TableCell>
                <TableCell padding="none">{format.description(track)}</TableCell>
              </TableRow>
              {type == 'Shape' && (
                <React.Fragment>
                  <TableRow>
                    <TableCell padding="none">{__('Shape type')}</TableCell>
                    <TableCell padding="none">{format.shape(track)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell padding="none">{__('Color')}</TableCell>
                    <TableCell padding="none">{format.color(track)}</TableCell>
                  </TableRow>
                </React.Fragment>
              )}
              {type == 'Image' && (
                <React.Fragment>
                  <TableRow>
                    <TableCell padding="none">{__('Filename')}</TableCell>
                    <TableCell padding="none">{format.filename(track)}</TableCell>
                  </TableRow>
                </React.Fragment>
              )}
            </TableBody>
          </Table>
        </Collapse>
        <FlexContainer align="center space-between" style={styles.container}>
          {!isVisible ? (
            <Button variant="contained" onClick={this.show}>Show</Button>
          ) : (
            <Button variant="contained" onClick={this.hide}>Hide</Button>
          )}
          <Link to={`/marker/${this.props.track.markerId}/${this.props.track.target.position.latitude}/${this.props.track.target.position.longitude}`} style={styles.link}>
            <Button variant="contained">Edit</Button>
          </Link>
          <Button variant="contained" onClick={this.accept}>Delete</Button>
        </FlexContainer>
        <Dialog open={showConfirmation} onClose={this.cancel}>
          <DialogTitle>Marker</DialogTitle>
          <DialogContentText style={styles.dialogText}>
            {__(`Are you sure you want to delete this marker?`)}
          </DialogContentText>
          <DialogActions>
            <Button id="marker-cancel" onClick={this.cancel} color="primary">
              {__("Cancel")}
            </Button>
            <Button id="marker-delete" onClick={this.confirmed}>
              {__("Delete")}
            </Button>
          </DialogActions>
        </Dialog>
      </FlexContainer>
    )
  };
}

ManualInfoPanel.propTypes = {
  track: PropTypes.object.isRequired,
  format: PropTypes.object.isRequired,
  listMarkers: PropTypes.array,

  unselect: PropTypes.func.isRequired,
  show: PropTypes.func.isRequired,
  hide: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  format: state.config,
  listMarkers: state.marker.listMarkers,
});

const mapDispatchToProps = dispatch => ({
  unselect: () => {
    dispatch(unselect());
  },
  show: id => {
    dispatch(actions.show(id));
  },
  hide: id => {
    dispatch(actions.hide(id));
  },
});

export default withTransaction(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ManualInfoPanel)
  )
);
