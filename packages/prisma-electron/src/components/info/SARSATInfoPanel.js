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
  Typography,
  Collapse,
  IconButton,
} from '@material-ui/core';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// Helpers
import SARSATFormatter from '../../format/SARSATFormatter';

class SARSATInfoPanel extends React.Component {
  state = {
    detailsExpanded: true,
  };

  toggleCollapse = () => {
    this.setState(prevState => ({ detailsExpanded: !prevState.detailsExpanded }));
  };

  toggleCollapseIcon = () => (this.state.detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  render = () => {
    const { track, classes } = this.props;
    const format = new SARSATFormatter(this.props.format);

    let field1 = null;
    let field2 = null;
    let ident = null;
    let homing = null;
    let rawMessageBody = null;

    if (format.idFieldName(track)) {
      field1 = (
        <TableRow>
          <TableCell padding="none">{format.idFieldName(track)}</TableCell>
          <TableCell padding="none">{format.idFieldValue(track)}</TableCell>
        </TableRow>
      );
    }
    if (format.idField2Name(track)) {
      field2 = (
        <TableRow>
          <TableCell padding="none">{format.idField2Name(track)}</TableCell>
          <TableCell padding="none">{format.idField2Value(track)}</TableCell>
        </TableRow>
      );
    }
    if (format.identification(track)) {
      ident = (
        <TableRow>
          <TableCell padding="none">{__('Identification')}</TableCell>
          <TableCell padding="none">{format.identification(track)}</TableCell>
        </TableRow>
      );
    }
    if (format.homingSignal(track)) {
      homing = (
        <TableRow>
          <TableCell padding="none">{__('Homing Signal')}</TableCell>
          <TableCell padding="none">{format.homingSignal(track)}</TableCell>
        </TableRow>
      );
    }

    /**
     * Section that shows the raw message body from the MCC for the SARSAT alert so the user
     * can get any relevant information they can out of the message since the system couldn't
     * parse the message. This ensures no beacon is lost, and any recoverable information from
     * the bad message is provided.
     */
    if (format.isUnknownMessage(track)) {
      rawMessageBody = (
        <React.Fragment>
          <Header variant="subtitle1" margin="normal">
            {__('Raw Message Body')}
          </Header>
          <Typography variant="caption">
            {__(
              'The SARSAT Message was not able to be parsed by the system. This is the raw message as received.',
            )}
          </Typography>
          <pre className={classes.pre}>{format.rawMessageBody(track)}</pre>
        </React.Fragment>
      );
    }

    return (
      <Container>
        <Header
          onClick={this.toggleCollapse}
          variant="h6"
          margin="normal"
          action={
            <IconButton onClick={this.toggleCollapse}>{this.toggleCollapseIcon()}</IconButton>
          }
        >
          {__('Beacon Information')}
        </Header>
        <Collapse in={this.state.detailsExpanded}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell padding="none">{__('Beacon ID')}</TableCell>
                <TableCell padding="none">{format.beaconId(track)}</TableCell>
              </TableRow>
              {ident}
              <TableRow>
                <TableCell padding="none">{__('User Class')}</TableCell>
                <TableCell padding="none">{format.userClass(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Country of Registration')}</TableCell>
                <TableCell padding="none">{format.country(track)}</TableCell>
              </TableRow>
              {field1}
              {field2}
              {homing}
              <TableRow>
                <TableCell padding="none">{__('Detection Time')}</TableCell>
                <TableCell padding="none">{format.detectionTime(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Detection Time (UTC)')}</TableCell>
                <TableCell padding="none">{format.timeReceivedUtc(track)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none">{__('Site ID')}</TableCell>
                <TableCell padding="none">{format.siteId(track)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {rawMessageBody}
        </Collapse>
      </Container>
    );
  };
}

SARSATInfoPanel.propTypes = {
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
  }))(SARSATInfoPanel),
);
