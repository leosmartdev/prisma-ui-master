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
  TableFooter,
  Collapse,
  Button,
  IconButton,
  CircularProgress,
} from '@material-ui/core';

// Helpers
import OmnicomFormatter from '../../format/OmnicomFormatter';
import { withOmniComDevice } from 'device';
import { requestLastPositionReport } from 'device/omnicom';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RefreshIcon from '@material-ui/icons/Refresh';

const styles = {
  button: {
    width: '100%',
  },
};

class OmnicomInfoPanel extends React.Component {
  state = {
    detailsExpanded: true,
  };

  toggleCollapse = () => {
    this.setState(prevState => ({ detailsExpanded: !prevState.detailsExpanded }));
  };

  renderToggleCollapseIcon = () => {
    const { detailsExpanded } = this.state;

    if (detailsExpanded) {
      return <ExpandLessIcon />;
    }
    return <ExpandMoreIcon />;
  };

  requestLastPositionReport = () => {
    const { requestLastPositionReport, device } = this.props;
    return requestLastPositionReport(device);
  };

  render = () => {
    const { device, format, track, lastPositionReportIsLoading, classes } = this.props;
    const { detailsExpanded } = this.state;
    const omnicomFormatter = new OmnicomFormatter(format);
    let td;
    let id;
    if (track.target && track.target.imei) {
      td = __('IMEI');
      id = omnicomFormatter.imei(track);
    } else if (track.target && track.target.nodeid) {
      td = __('NODEID');
      id = omnicomFormatter.nodeid(track);
    }

    return (
      <Container>
        <Header
          onClick={this.toggleCollapse}
          variant="h6"
          margin="normal"
          action={<IconButton>{this.renderToggleCollapseIcon()}</IconButton>}
        >
          {__('OmniCom')}
        </Header>
        <Collapse in={detailsExpanded}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell padding="none">{td}</TableCell>
                <TableCell size="small">{id}</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              {device && device.id && (
                <TableRow>
                  <TableCell padding="none" colSpan="2">
                    <Button
                      variant="text"
                      color="default"
                      className={classes.button}
                      disabled={lastPositionReportIsLoading}
                      onClick={this.requestLastPositionReport}
                    >
                      {__('Request current position')}
                      {lastPositionReportIsLoading ? (
                        <CircularProgress variant="indeterminate" size={24} />
                      ) : (
                        <RefreshIcon />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableFooter>
          </Table>
        </Collapse>
      </Container>
    );
  };
}

OmnicomInfoPanel.propTypes = {
  track: PropTypes.object.isRequired,
  format: PropTypes.object.isRequired,
  device: PropTypes.object,
  lastPositionReportIsLoading: PropTypes.bool,
  requestLastPositionReport: PropTypes.func,
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  format: state.config,
});

const mapDispatchToProps = dispatch => ({
  requestLastPositionReport: device => {
    if (device) {
      dispatch(requestLastPositionReport(device.id));
    }
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withOmniComDevice(withStyles(styles)(OmnicomInfoPanel)));
