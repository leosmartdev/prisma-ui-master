/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 *
 * ListZonesPanel
 * Shows list of zones and provides some actions for zones.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import loglevel from 'loglevel';

// Components
import HeadListPanel from 'components/zones/HeadListPanel';
import Container from 'components/layout/Container';
import AreaStylePreview from './AreaStylePreview';

import {
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  CheckBox,
} from '@material-ui/core';

// Icons
import EditIcon from '@material-ui/icons/Edit';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';

// Helpers & Actions
import { save, importZones } from 'zones/io';
import * as zonesActions from 'zones/zones';

const log = loglevel.getLogger('zones');

class ListZonesPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isActiveSelect: false,
      checkedZones: {},
    };
  }

  componentDidUpdate = prev => {
    if (prev.updating && !this.props.updating && this.props.error) {
      log.error('ERROR', this.props.error);
      this.props.clearError();
    }
  };

  exportZones = () => {
    const zonesToExport = Object.keys(this.state.checkedZones)
      .map(key => this.state.checkedZones[key])
      .filter(item => !!item);
    if (zonesToExport.length === 0) {
      return;
    }
    setTimeout(() => save(zonesToExport, 0));
    this.setState({
      isActiveSelect: false,
      checkedZones: {},
    });
  };

  onActiveSelect = () => {
    this.setState({
      isActiveSelect: true,
    });
  };

  onDeactivateSelect = () => {
    this.setState({
      isActiveSelect: false,
    });
  };

  onCreate = () => {
    this.props.createZone();
    // This a right side panel....
    this.props.history.push('/zones/create');
  };

  onCheckZone = (item, checked) => {
    this.setState(prevState => {
      const checkedZones = { ...prevState.checkedZones };
      if (!checked) {
        delete checkedZones[item.databaseId];
      } else {
        checkedZones[item.databaseId] = item;
      }

      return { checkedZones };
    });
  };

  edit = zone => {
    log.trace('zone edit', zone);
    this.props.editZone(zone);
    this.props.history.push('/zones/edit');
  };

  remove = zone => {
    log.trace('zone remove', zone);
    this.props.sendDeleteZone(zone.databaseId);
  };

  onImport = () => {
    importZones(this.props.sendUpsert);
  };

  render = () => {
    const items = [];
    this.props.zones.forEach(item => {
      items.push(
        <ZoneListItem
          key={item.databaseId}
          item={item}
          onEdit={this.edit}
          onRemove={this.remove}
          isActiveSelect={this.state.isActiveSelect}
          onCheckZone={this.onCheckZone}
        />,
      );
    });

    return (
      <Container>
        <HeadListPanel
          isActiveSelect={this.state.isActiveSelect}
          onCancel={this.onDeactivateSelect}
          onCreate={this.onCreate}
          onImportZones={this.onImport}
          isSelected={Object.keys(this.state.checkedZones).length !== 0}
          onExportZones={this.exportZones}
          onSelect={this.onActiveSelect}
        />
        <Table>
          <TableBody>{items}</TableBody>
        </Table>
      </Container>
    );
  };
}

ListZonesPanel.propTypes = {
  zones: PropTypes.array,
  updating: PropTypes.bool.isRequired,
  error: PropTypes.object,

  createZone: PropTypes.func.isRequired,
  editZone: PropTypes.func.isRequired,
  sendUpsert: PropTypes.func.isRequired,
  sendDeleteZone: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  zones: state.zones.zones,
  updating: state.zones.updating,
  error: state.zones.error,
});

const mapDispatchToProps = dispatch => ({
  createZone: () => {
    dispatch(zonesActions.createZone());
  },
  sendUpsert: zone => {
    dispatch(zonesActions.sendUpsert(zone));
  },
  editZone: feature => {
    dispatch(zonesActions.editZone(feature));
  },
  sendDeleteZone: id => {
    dispatch(zonesActions.sendDelete(id));
  },
  clearError: () => {
    dispatch(zonesActions.clearError());
  },
});

export default (ListZonesPanel = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ListZonesPanel),
));

export class ZoneListItem extends React.Component {
  static propTypes = {
    isActiveSelect: PropTypes.bool,
    onCheckZone: PropTypes.func,
    item: PropTypes.object,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
  };

  remove = () => {
    this.props.onRemove(this.props.item);
  };

  edit = () => {
    this.props.onEdit(this.props.item);
  };

  render = () => {
    const { item } = this.props;
    const { fillPattern, fillColor, strokeColor } = item;
    const it = (
      <TableRow key={item.databaseId}>
        {this.props.isActiveSelect && (
          <TableCell padding="checkbox">
            <CheckBox
              id={item.databaseId}
              onChange={e => this.props.onCheckZone(item, e.target.checked)}
            />
          </TableCell>
        )}
        <TableCell className="color-box" padding="none">
          <AreaStylePreview
            width={32}
            height={32}
            fillPattern={fillPattern}
            fillColor={fillColor}
            strokeColor={strokeColor}
          />
        </TableCell>
        <TableCell style={{ wordBreak: 'break-all', paddingLeft: '10px', paddingRight: '10px' }}>
          {item.name}
        </TableCell>
        {!this.props.isActiveSelect && (
          <TableCell style={{ minWidth: '96px', paddingLeft: '0px', paddingRight: '0px' }}>
            <IconButton onClick={this.remove}>
              <RemoveCircleOutlineIcon />
            </IconButton>
            <IconButton onClick={this.edit}>
              <EditIcon />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    );
    return it;
  };
}
