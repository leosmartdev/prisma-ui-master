import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';

// Component Imports
import FlexContainer from 'components/FlexContainer';
import PriorityAlertsListItem from './PriorityAlertsListItem';

import {
  Collapse,
  Button,
  Paper,
  Table,
  TableBody,
} from "@material-ui/core";

// Icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

// Helpers
import * as noticeActions from 'notices/notices';
import { getLookup } from 'map/lookup';

const useStyles = makeStyles(theme => ({
  container: {
    top: 0,
    zIndex: 8999, // Login page is 9001
    overflowY: 'hidden',
    [theme.breakpoints.up('sm')]: {
      width: '600px',
      transform: 'translateX(calc(50vw - 300px))',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100vw',
      transform: 'translateX(50px)',
    },
    transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
  },
  opened: {
    transform: 'translateY(0px)',
    [theme.breakpoints.up('sm')]: {
      width: '600px',
      transform: 'translateX(calc(50vw - 300px))',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100vw',
      transform: 'translateX(50px)',
    },
  },
  closed: {
    transform: 'translateY(-200px)',
    display: 'none',
  },
  row: {
    height: `${theme.c2.drawers.top.rowHeight}px`,
    cursor: 'pointer',
  },
  table: {
    overflowY: 'auto',
    minHeight: '50px',
    maxHeight: '100px',
  },
}));

PriorityAlertsList.propTypes = {
  history: PropTypes.object.isRequired, // withRouter
  // state to props
  notices: PropTypes.array.isRequired,
  // dispatch to props
  acknowledgeNotice: PropTypes.func.isRequired,
};

/**
 * PriorityAlertsList
 * List of priority alerts, generally displayed at the top of the app.
 */
export function PriorityAlertsList({ notices, acknowledgeNotice, history }) {
  function openInfoPanel(notice) {
    const { id, type } = getLookup(notice.target);
    history.push(`/info/${type}/${id}`);
  }

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const classes = useStyles({ notices });
  const heightClass = classes[notices.length > 0 ? 'opened' : 'closed'];
  const classNames = `${classes.container} ${heightClass}`;

  return (
    <Paper elevation={2} className={classNames}>
      <FlexContainer column align="start stretch">
        <Collapse in={!isCollapsed}>
          <div className={classes.table}>
            <Table>
              <TableBody>
                {notices.map(notice => (
                  <PriorityAlertsListItem
                    key={notice.databaseId}
                    notice={notice}
                    openInfoPanel={openInfoPanel}
                    acknowledgeNotice={acknowledgeNotice}
                    classes={classes}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </Collapse>
        <Button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </Button>
      </FlexContainer>
    </Paper>
  );
}

const mapStateToProps = state => ({
  notices: state.notifications.highPriorityNotices,
});

const mapDispatchToProps = dispatch => ({
  acknowledgeNotice: notice => {
    dispatch(noticeActions.acknowledge(notice));
  },
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(PriorityAlertsList),
);
