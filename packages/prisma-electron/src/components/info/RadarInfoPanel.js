import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { __ } from 'lib/i18n';

// Components
import Header from 'components/Header';
import Container from 'components/layout/Container';

import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  IconButton,
} from '@material-ui/core';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// Helpers
import RadarFormatter from '../../format/RadarFormatter';

class RadarInfoPanel extends React.Component {
  state = {
    detailsExpanded: true,
  };

  toggleCollapse = () => {
    this.setState(prevState => ({ detailsExpanded: !prevState.detailsExpanded }));
  };

  toggleCollapseIcon = () => (this.state.detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  render = () => {
    const { track } = this.props;
    const format = new RadarFormatter(this.props.format);

    let trackMMSI, quality;
    if (track.target.vtsRadar) {
      if (track.target.vtsRadar.TrackMMSI) {
        trackMMSI = (
          <TableRow>
            <TableCell padding="none">{__('MMSI')}</TableCell>
            <TableCell padding="none">{track.target.vtsRadar.TrackMMSI}</TableCell>
          </TableRow>
        )
      }
      if (track.target.vtsRadar.Quality) {
        quality = (
          <TableRow>
            <TableCell padding="none">{__('Quality')}</TableCell>
            <TableCell padding="none">{track.target.vtsRadar.Quality}</TableCell>
          </TableRow>
        )
      }
    }

    return (
      <Container>
        <Header
          onClick={this.toggleCollapse}
          variant="h6"
          margin="normal"
          action={<IconButton>{this.toggleCollapseIcon()}</IconButton>}
        >
          {__('Radar')}
        </Header>
        <Collapse in={this.state.detailsExpanded}>
          <Table>
            <TableBody>
              {trackMMSI}
              <TableRow>
                <TableCell padding="none">{__('Distance')}</TableCell>
                <TableCell padding="none">{format.distance(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Closest point of approach')}</TableCell>
                <TableCell padding="none">{format.cpaDistance(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Closest point in')}</TableCell>
                <TableCell padding="none">{format.cpaTime(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Acquisition Type')}</TableCell>
                <TableCell padding="none">{format.acquisitionType(track)}</TableCell>
              </TableRow>
              {quality}
            </TableBody>
          </Table>
        </Collapse>
      </Container>
    );
  };
}

RadarInfoPanel.propTypes = {
  track: PropTypes.object.isRequired,
  format: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  format: state.config,
});

export default connect(mapStateToProps)(RadarInfoPanel);
