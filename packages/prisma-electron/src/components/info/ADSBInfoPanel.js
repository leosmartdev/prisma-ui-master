import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { __ } from 'lib/i18n';
import { withStyles } from '@material-ui/styles';

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
import ADSBFormatter from '../../format/ADSBFormatter';

class ADSBInfoPanel extends React.Component {
  state = {
    detailsExpanded: true,
  };

  toggleCollapse = () => {
    this.setState(prevState => ({ detailsExpanded: !prevState.detailsExpanded }));
  };

  toggleCollapseIcon = () => (this.state.detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  render = () => {
    const { track, classes } = this.props;
    const format = new ADSBFormatter(this.props.format);

    return (
      <Container>
        <Header
          onClick={this.toggleCollapse}
          variant="h6"
          margin="normal"
          action={
            <IconButton onClick={this.toggleCollapse}>{this.toggleCollapseIcon()}</IconButton>
          }>
          {__('ADS-B')}
        </Header>
        <Collapse in={this.state.detailsExpanded}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell padding="none">{__('Date/Time')}</TableCell>
                <TableCell padding="none">{format.datetime(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Modes')}</TableCell>
                <TableCell padding="none">{format.modes(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Altitude')}</TableCell>
                <TableCell padding="none">{format.altitude(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Vertical Rate')}</TableCell>
                <TableCell padding="none">{format.verticalRate(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Air Speed')}</TableCell>
                <TableCell padding="none">{format.airSpeed(track)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Collapse>
      </Container>
    )
  }
}

ADSBInfoPanel.propTypes = {
  track: PropTypes.object.isRequired,
  format: PropTypes.object.isRequired,
  /**
   * Provided by withStyles()
   */
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  format: state.config,
});

export default connect(mapStateToProps)(
  withStyles(theme => ({
    /**
     * Formats the pre section as body2 typography element and ensures section is scrollable.
     * Overrides the font to monospace since this does display code.
     */
    pre: {
      ...theme.typography.body2,
      overflow: 'auto',
      fontFamily: 'monospace',
    },
  }))(ADSBInfoPanel),
);
