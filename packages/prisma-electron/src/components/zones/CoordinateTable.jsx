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
 * CoordinateTable
 * Show coordinates and actions for them as a table
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import ManageCoordinateRow from './ManageCoordinateRow';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@material-ui/core';

CoordinateTable.propTypes = {
  /** list of coordinates */
  coordinates: PropTypes.array.isRequired,
  /** change a coordinate */
  onChange: PropTypes.func.isRequired,
  /** remove a coordinate */
  onRemove: PropTypes.func.isRequired,
  /** using for styling */
  classes: PropTypes.object.isRequired,
};

function CoordinateTable({ coordinates, onChange, onRemove, classes }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell classes={{ sizeSmall: classes.sizeSmall }} size="small">
            {__('Latitude')}
          </TableCell>
          <TableCell classes={{ sizeSmall: classes.sizeSmall }} size="small">
            {__('Longitude')}
          </TableCell>
          <TableCell classes={{ sizeSmall: classes.sizeSmall }} size="small" />
        </TableRow>
      </TableHead>
      <TableBody>
        {coordinates.map(c => (
          <ManageCoordinateRow
            key={c.id}
            id={c.id}
            longitude={c.longitude}
            latitude={c.latitude}
            onChange={onChange}
            onRemove={onRemove}
            classes={classes}
          />
        ))}
      </TableBody>
    </Table>
  );
}

export default withStyles(theme => ({
  sizeSmall: {
    paddingRight: theme.spacing(1),
  },
}))(CoordinateTable);
