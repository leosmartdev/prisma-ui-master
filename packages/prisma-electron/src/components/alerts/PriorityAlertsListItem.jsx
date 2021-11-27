/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { makeStyles } from '@material-ui/styles';

// Components
import {
  Chip,
  Typography,
  TableRow,
  TableCell,
} from "@material-ui/core";

// Helpers
import getAlertFormatter from '../../format/AlertFormatter';

const useStyles = makeStyles(theme => ({
  cell: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  row: {
    rowHeight: '50px',
    cursor: 'pointer',
  },
}));

PriorityAlertsListItem.propTypes = {
  notice: PropTypes.object.isRequired,
  openInfoPanel: PropTypes.func.isRequired,
  acknowledgeNotice: PropTypes.func.isRequired,
};

function convertToFormattedTime(time) {
  let timeInput = time;
  if (typeof time === 'object') {
    timeInput = time.seconds * 1000;
  }
  const formatTime = moment(timeInput).format('LTS');

  return formatTime;
}

export default function PriorityAlertsListItem({ notice, openInfoPanel }) {
  const format = getAlertFormatter(notice.target.type);
  const formattedTime = convertToFormattedTime(notice.updatedTime);
  const classes = useStyles();

  return (
    <TableRow className={classes.row} onClick={() => openInfoPanel(notice)}>
      <TableCell padding="none">
        <Chip
          label={format.chip(notice)}
          style={format.chipStyle(notice)}
          color="primary"
          className={classes.cell}
        />
      </TableCell>
      <TableCell padding="none">
        <Typography variant="subtitle1" className={classes.cell}>
          {format.label(notice)}
        </Typography>
      </TableCell>
      <TableCell padding="none">
        <Typography variant="caption" className={classes.cell}>
          {format.sublabel(notice)}
        </Typography>
      </TableCell>
      <TableCell padding="none">
        <Typography variant="caption" className={classes.cell}>
          {formattedTime}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
