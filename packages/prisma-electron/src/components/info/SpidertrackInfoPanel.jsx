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

// Helpers
import SpidertrackFormatter from '../../format/SpidertrackFormatter';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

class SpidertrackInfoPanel extends React.Component {
  state = {
    detailsExpanded: true,
  };

  toggleCollapse = () => {
    this.setState(prevState => ({ detailsExpanded: !prevState.detailsExpanded }));
  };

  toggleCollapseIcon = () => (this.state.detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  render = () => {
    const { track } = this.props;
    const format = new SpidertrackFormatter(this.props.format);

    let td;
    let id;
    if (track.target && track.target.imei) {
      td = __('IMEI');
      id = format.imei(track);
    } else if (track.target && track.target.nodeid) {
      td = __('NODEID');
      id = format.nodeid(track);
    }

    return (
      <Container>
        <Header
          onClick={this.toggleCollapse}
          variant="h6"
          margin="normal"
          action={<IconButton>{this.toggleCollapseIcon()}</IconButton>}
        >
          {__('Spidertrack')}
        </Header>
        <Collapse in={this.state.detailsExpanded}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell padding="none">{td}</TableCell>
                <TableCell size="small">{id}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Collapse>
      </Container>
    );
  };
}

SpidertrackInfoPanel.propTypes = {
  track: PropTypes.object.isRequired,
  format: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  format: state.config,
});

export default connect(mapStateToProps)(SpidertrackInfoPanel);
