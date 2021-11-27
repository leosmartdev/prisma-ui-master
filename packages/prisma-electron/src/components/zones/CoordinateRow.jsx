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
 * CoordinateRow
 * Show the row of a coordinate and actions for it
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

// Components
import {
  TextField,
  TableRow,
  TableCell,
  IconButton,
} from '@material-ui/core';

// Icons
import Remove from '@material-ui/icons/Remove';

CoordinateRow.propTypes = {
  /** change longitude */
  onChangeLongitude: PropTypes.func,
  /** change latitude */
  onChangeLatitude: PropTypes.func,
  /** remove this record */
  onRemove: PropTypes.func,
  /** the latitude of a point */
  latitude: PropTypes.string,
  /** the longitude of a point */
  longitude: PropTypes.string,
  /** using for styling */
  classes: PropTypes.object.isRequired,
};

CoordinateRow.defaultProps = {
  latitude: '',
  longitude: '',
  onChangeLongitude: () => { },
  onChangeLatitude: () => { },
  onRemove: () => { },
};

function CoordinateRow({
  latitude,
  longitude,
  onChangeLongitude,
  onChangeLatitude,
  onRemove,
  classes,
}) {
  return (
    <TableRow>
      <TableCell classes={{ sizeSmall: classes.sizeSmall }} size="small">
        <TextField
          className={classes.text}
          value={latitude}
          type="number"
          onChange={onChangeLatitude}
        />
      </TableCell>
      <TableCell classes={{ sizeSmall: classes.sizeSmall }} size="small">
        <TextField
          className={classes.text}
          value={longitude}
          type="number"
          onChange={onChangeLongitude}
        />
      </TableCell>
      <TableCell classes={{ sizeSmall: classes.sizeSmall }} size="small">
        <IconButton onClick={onRemove}>
          <Remove />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default withStyles(() => ({
  text: {
    width: '70px',
  },
  sizeSmall: {},
}))(CoordinateRow);
