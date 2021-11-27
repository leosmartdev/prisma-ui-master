import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';
import ordinal from 'ordinal';

// Components
import { FlexContainer } from 'components/layout/Container';
import ErrorBanner from 'components/error/ErrorBanner';
import SplitView from 'components/layout/SplitView';
import GoBack from 'components/icon/GoBack';
import ContentViewGroup from 'components/layout/ContentViewGroup';

import {
  Typography,
  Paper,
  Divider,
  IconButton,
} from '@material-ui/core';

// Icons
import RetryIcon from '@material-ui/icons/Replay';
import DismissIcon from '@material-ui/icons/NotificationsOff';

// Actions
import * as actions from 'message/message';

const styles = {
  container: {
    overflow: 'auto',
  },
  paragraph: {
    whiteSpace: 'pre-line',
    padding: 15,
  },
  title: {
    padding: 15,
  },
};

class MessageDetails extends React.Component {
  static propTypes = {
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
    /** @private mapStateToProps */
    currentMessage: PropTypes.any,
  };

  static defaultProps = {
    currentMessage: null,
  };

  retryMessage = id => {
    const { createTransaction } = this.props;

    createTransaction(actions.retryMessage(id));
  };

  acknowledgeMessage = id => {
    const { createTransaction } = this.props;

    createTransaction(actions.acknowledgeMessage(id));
  };

  render() {
    const { classes, currentMessage } = this.props;

    if (!currentMessage) {
      return (
        <FlexContainer column align="start stretch" classes={{ root: classes.container }}>
          <ErrorBanner
            message={__(
              'Sorry the information for your selection could not be loaded at this time. Try again later or contact your system administrator.',
            )}
          />
        </FlexContainer>
      );
    }

    // Parse message header
    const header = currentMessage.MessageBody.split('\n')[0];
    const infos = header.split('/');

    let msgNum = parseInt(infos[1].split(' ')[0]);
    msgNum = ordinal(msgNum);

    let dateInfos = infos[3].split(' ');

    let dayOfYear = parseInt(dateInfos[1]);
    dayOfYear = ordinal(dayOfYear);

    let year = dateInfos[0];
    let curYear = new Date().getFullYear();
    if (year <= parseInt(curYear % 100)) {
      year = `${parseInt(curYear / 100)}${year}`;
    } else {
      year = `${parseInt(curYear / 100) - 1}${year}`;
    }

    let time = dateInfos[2];
    time = `${time.slice(0, 2)}:${time.slice(2, 4)}`;

    let cscode = '';
    if (currentMessage.Cscode || currentMessage.Csname) {
      cscode += `${currentMessage.Direction == 1 || currentMessage.Direction == 3 || currentMessage.Direction == 4 ? 'To' : 'From'} `;

      if (currentMessage.Cscode) {
        if (currentMessage.Csname) {
          cscode += `${currentMessage.Cscode} (${currentMessage.Csname})`;
        } else {
          cscode += `${currentMessage.Cscode}`;
        }
      } else if (currentMessage.Csname) {
        cscode += `${currentMessage.Csname}`;
      }
    }

    let action, status;
    switch (currentMessage.Direction) {
      case 1:
        action = status = 'Sent';
        break;
      case 2:
        action = status = 'Received';
        break;
      case 3:
        action = 'Pending to send';
        status = 'Pending';
        break;
      case 4:
        action = 'Failed to send';
        status = 'Failed';
        break;
    }

    let title = `${msgNum} Message, ${cscode}, ${action} at ${time} UTC on the ${dayOfYear} day of ${year}`;

    let firstLine = currentMessage.MessageBody.split("\n")[1];
    let secondaryText;
    if (currentMessage.SitNumber == 185) {
      secondaryText = `${firstLine.replace(/1\.|DISTRESS|COSPAS-SARSAT/g, '').trim()}`;
    } else if (currentMessage.SitNumber == 915) {
      secondaryText = `COMM LINK TYPE: ${currentMessage.CommLinkType.toUpperCase()}`;
    }

    return (
      <SplitView header={(
        <FlexContainer align="space-between center">
          <FlexContainer>
            <GoBack to="/message/list" />

            <FlexContainer column align="center start">
              <Typography variant="h6" align="left">
                {`${status} SIT ${currentMessage.SitNumber}`}
              </Typography>
              <Typography variant="subtitle1" align="left">
                {secondaryText}
              </Typography>
            </FlexContainer>
          </FlexContainer>
          {currentMessage.Direction == 4 && (
            <FlexContainer>
              <IconButton onClick={() => this.retryMessage(currentMessage.Id)}>
                <RetryIcon />
              </IconButton>
              {!currentMessage.Dismiss && (
                <IconButton onClick={() => this.acknowledgeMessage(currentMessage.Id)}>
                  <DismissIcon />
                </IconButton>
              )}
            </FlexContainer>
          )}
        </FlexContainer>
      )}>
        <FlexContainer column align="start center" classes={{ root: classes.container }}>
          {/* MESSAGE DETAILS */}
          <ContentViewGroup
            title={__('Message')}
            component={Paper}
            componentProps={{ elevation: 0 }}
          >
            <Paper elevation={2}>
              <Typography
                variant="h6"
                align="center"
                className={classes.title}
              >
                {title}
              </Typography>
              <Divider />
              <Typography
                variant="body1"
                className={classes.paragraph}
              >
                {currentMessage.MessageBody}
              </Typography>
            </Paper>
          </ContentViewGroup>

          {/* ERROR DETAIL */}
          {currentMessage.Direction == 4 && currentMessage.ErrorDetail && (
            <ContentViewGroup
              title={__('Error Detail')}
              component={Paper}
              componentProps={{ elevation: 0 }}
            >
              <Paper elevation={2}>
                <Typography
                  variant="body1"
                  className={classes.paragraph}
                >
                  {currentMessage.ErrorDetail}
                </Typography>
              </Paper>
            </ContentViewGroup>
          )}
        </FlexContainer>
      </SplitView>
    );
  };
}

const mapStateToProps = state => ({
  currentMessage: state.message.currentMessage,
});

export default withStyles(styles)(
  withTransaction(
    connect(mapStateToProps)(
      MessageDetails
    )
  )
);