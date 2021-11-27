import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { __ } from 'lib/i18n';

// Components
import Container from 'components/layout/Container';
import Header from 'components/Header';

import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  IconButton,
} from '@material-ui/core';

// Helpers
import AISFormatter from '../../format/AISFormatter';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

class AISInfoPanel extends React.Component {
  state = {
    detailsExpanded: true,
  };

  toggleAis = () => {
    this.setState(prevState => ({ detailsExpanded: !prevState.detailsExpanded }));
  };

  toggleAisIcon = () => (this.state.detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  render = () => {
    const { track } = this.props;
    const format = new AISFormatter(this.props.format);
    return (
      <Container>
        <Header
          onClick={this.toggleAis}
          variant="h6"
          margin="normal"
          action={<IconButton>{this.toggleAisIcon()}</IconButton>}
        >
          {__('AIS')}
        </Header>
        <Collapse in={this.state.detailsExpanded}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell padding="none">{__('MMSI')}</TableCell>
                <TableCell padding="none">{format.mmsi(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('IMO')}</TableCell>
                <TableCell padding="none">{format.imo(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Callsign')}</TableCell>
                <TableCell padding="none">{format.callsign(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Vessel Type')}</TableCell>
                <TableCell padding="none">{format.vesselType(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Destination')}</TableCell>
                <TableCell padding="none">{format.destination(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('ETA')}</TableCell>
                <TableCell padding="none">{format.eta(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Rate of Turn')}</TableCell>
                <TableCell padding="none">{format.rateOfTurn(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Navigational Status')}</TableCell>
                <TableCell padding="none">{format.navigationalStatus(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Special Maneuver')}</TableCell>
                <TableCell padding="none">{format.specialManeuver(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Length')}</TableCell>
                <TableCell padding="none">{format.length(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Breadth')}</TableCell>
                <TableCell padding="none">{format.breadth(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Draft')}</TableCell>
                <TableCell padding="none">{format.draft(track)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Collapse>
      </Container>
    );
  };
}

AISInfoPanel.propTypes = {
  track: PropTypes.object.isRequired,
  format: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  format: state.config,
});

export default connect(mapStateToProps)(AISInfoPanel);
