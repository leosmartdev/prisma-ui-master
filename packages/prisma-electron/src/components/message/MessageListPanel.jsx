import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';
import moment from 'moment-timezone';

// Components
import ErrorBanner from 'components/error/ErrorBanner';
import FlexContainer from 'components/FlexContainer';
import MessageList from 'components/message/MessageList';
import Header from 'components/Header';

import {
  Collapse,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Select,
  Input,
  MenuItem,
} from '@material-ui/core';

import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// Actions & Helpers
import { listMessages, setCurrentMessage } from 'message/message';

const styles = theme => ({
  nullState: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  filter: {
    marginBottom: 20,
  },
  dateTimePicker: {
    width: '100%',
  },
});

class MessageListPanel extends React.Component {
  static propTypes = {
    /** @priate mapStateToProps */
    messages: PropTypes.any,
    /** @private mapDispatchToProps */
    setCurrentMessage: PropTypes.func.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private withRouter */
    history: PropTypes.object.isRequired,
  };

  static defaultProps = {
    messages: [],
  };

  constructor(props) {
    super(props);

    this._isMounted = false;

    this.sitNumberOptions = [
      {
        title: __('All'),
        value: 0,
      },
      {
        title: __('SIT 915'),
        value: 915,
      },
      {
        title: __('SIT 185'),
        value: 185,
      },
    ];

    this.directionOptions = [
      {
        title: __('All'),
        value: 0,
      },
      {
        title: __('Sent'),
        value: 1,
      },
      {
        title: __('Pending'),
        value: 3,
      },
      {
        title: __('Received'),
        value: 2,
      },
      {
        title: __('Failed'),
        value: 4,
      },
    ];

    let dateFormatString = 'MMM DD, YYYY hh:mm A';
    let startDateTime = moment().subtract(1, 'day').format(dateFormatString);
    let endDateTime = moment().format(dateFormatString);

    this.state = {
      filterExpanded: true,
      sitNumber: 0,
      direction: 0,
      startDateTime,
      endDateTime,
      errorBannerText: null,
    };
  }

  componentDidMount = () => {
    this._isMounted = true;

    this.getMessages();
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  getMessages = () => {
    const { createTransaction } = this.props;
    const {
      sitNumber,
      direction,
      startDateTime,
      endDateTime,
    } = this.state;

    try {
      createTransaction(listMessages(sitNumber, direction, this.getSecondsFromDate(startDateTime), this.getSecondsFromDate(endDateTime, true)));
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          errorBannerText: error.message,
        });
      }
    }
  };

  toggleFilter = () => {
    this.setState(prevState => ({ filterExpanded: !prevState.filterExpanded }));
  };

  toggleFilterIcon = () => (this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  onMessageSelect = message => {
    const { setCurrentMessage, history } = this.props;

    setCurrentMessage(message);

    history.push('/message/show');
  };

  setSitNumber = event => {
    this.setState({
      sitNumber: event.target.value,
    }, () => {
      this.getMessages();
    });
  };

  setDirection = event => {
    this.setState({
      direction: event.target.value,
    }, () => {
      this.getMessages();
    });
  };

  handleStartDateTimeChange = value => {
    this.setState({
      startDateTime: value,
    }, () => {
      this.getMessages();
    });
  };

  handleEndDateTimeChange = value => {
    this.setState({
      endDateTime: value,
    }, () => {
      this.getMessages();
    });
  };

  getSecondsFromDate = (date, isEndDate = false) => {
    let timestamp = moment(date);
    let datetime = new Date(timestamp);

    return parseInt((datetime - datetime.getTimezoneOffset() * 60 * 1000 + (isEndDate ? 60 * 1000 : 0)) / 1000);
  };

  createSit915Msg = () => {
    const { history } = this.props;

    history.push('/sit915-msg/edit');
  };

  render() {
    const {
      classes,
      messages,
    } = this.props;

    const {
      filterExpanded,
      sitNumber,
      direction,
      startDateTime,
      endDateTime,
      errorBannerText,
    } = this.state;

    return (
      <div>
        {/* FILTER TOOLBAR */}
        <FlexContainer column align="start stretch" classes={{ root: classes.filter }}>
          <Header
            onClick={this.toggleFilter}
            variant="h6"
            margin="none"
            action={<IconButton>{this.toggleFilterIcon()}</IconButton>}
          >
            {__('Filter Options')}
          </Header>
          <Collapse in={filterExpanded}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell padding="none">
                    {__('SIT Number')}
                  </TableCell>
                  <TableCell padding="none">
                    <Select
                      value={sitNumber}
                      onChange={this.setSitNumber}
                      input={<Input id="type" fullWidth />}
                    >
                      {this.sitNumberOptions.map(option => (
                        <MenuItem value={option.value} key={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="none">
                    {__('Direction')}
                  </TableCell>
                  <TableCell padding="none">
                    <Select
                      value={direction}
                      onChange={this.setDirection}
                      input={<Input id="type" fullWidth />}
                    >
                      {this.directionOptions.map(option => (
                        <MenuItem value={option.value} key={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="none">
                    {__('Start Date')}
                  </TableCell>
                  <TableCell padding="none">
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <DateTimePicker
                        value={startDateTime}
                        onChange={this.handleStartDateTimeChange}
                        showTodayButton
                        classes={{ root: classes.dateTimePicker }}
                        format="MMM dd, yyyy HH:mm a"
                      />
                    </MuiPickersUtilsProvider>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="none">
                    {__('End Date')}
                  </TableCell>
                  <TableCell padding="none">
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <DateTimePicker
                        value={endDateTime}
                        onChange={this.handleEndDateTimeChange}
                        showTodayButton
                        classes={{ root: classes.dateTimePicker }}
                        format="MMM dd, yyyy HH:mm a"
                      />
                    </MuiPickersUtilsProvider>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </FlexContainer>

        <FlexContainer column align="start end">
          <Button color="primary" variant="contained" onClick={this.createSit915Msg}>
            {__('Create Message')}
          </Button>
        </FlexContainer>

        {/* ERROR BANNER */}
        <ErrorBanner message={errorBannerText} />

        {/* LIST OF MESSAGES */}
        {messages.length === 0 ? (
          <Typography variant="subtitle1" className={classes.nullState}>
            {`There are no SIT 915 and 185 messages.`}
          </Typography>
        ) : (
          <MessageList onSelect={this.onMessageSelect} messages={messages} />
        )}

      </div>
    );
  };
}

const mapStateToProps = state => ({
  messages: state.message.messages,
});

const mapDispatchToProps = dispatch => ({
  setCurrentMessage: message => {
    dispatch(setCurrentMessage(message));
  }
});

export default withStyles(styles)(
  withRouter(
    withTransaction(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(
        MessageListPanel
      )
    )
  )
);