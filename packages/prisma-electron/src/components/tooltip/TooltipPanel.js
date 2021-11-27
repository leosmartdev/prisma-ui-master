import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import color from 'color';
import moment from 'moment';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';

import {
  Paper,
  Typography,
} from '@material-ui/core';

// Formatters
// can't import format directly or build with fail because format is in node modules
import getFormatterForTrack from '../../format/format';

// colors
import { yellow } from '@material-ui/core/colors';

const styles = theme => {
  const successColor = theme.palette.success[theme.palette.type === 'dark' ? 'light' : 'dark'];
  const errorColor = theme.palette.error[theme.palette.type === 'dark' ? 'light' : 'dark'];

  return {
    box: {
      minHeight: '50px',
    },
    paper: {
      minWidth: '235px',
    },
    status: {
      width: '10px',
    },
    content: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    new: {
      backgroundColor: successColor,
    },
    old: {
      backgroundColor: theme.palette.grey['500'],
    },
    adolescent: {
      backgroundColor: yellow[500],
    },
    ok: {
      backgroundColor: successColor,
    },
    bad: {
      backgroundColor: errorColor,
    },
    unknown: {
      backgroundColor: yellow[500],
    },
    zone: {
      backgroundColor: props => {
        if (props.info && props.info.fill_color) {
          const fill = props.info.fill_color;
          const rgb = {
            r: fill.r || 0,
            g: fill.g || 0,
            b: fill.b || 0,
          };
          return color(rgb)
            .alpha(0.5)
            .string();
        }
        return 'transparent';
      },
    },
    line: {
      whiteSpace: 'nowrap',
    }
  };
};

class TooltipPanel extends React.Component {
  getAge = () => {
    const formatter = getFormatterForTrack(this.props.info, this.props.format);
    if (!formatter) return 'zone';
    const age = formatter.age(this.props.info);
    if (age === null) {
      return age;
    }
    if (age <= -1 || age >= 900) {
      return 'old';
    }
    if (age >= 0 && age < 300) {
      return 'new';
    }

    return 'adolescent';
  };

  getConnectionStatus = () => {
    const formatter = getFormatterForTrack(this.props.info, this.props.format);
    if (!formatter) {
      return 'zone';
    }
    const connectionStatus = formatter.getConnectionStatus(this.props.info);
    switch (connectionStatus) {
      case 'ok':
      case 'bad':
      case 'unknown':
        return connectionStatus;
    }
    return null;
  };

  render() {
    if (!this.props.info || !this.props.id) {
      return null;
    }
    const format = getFormatterForTrack(this.props.info, this.props.format);
    const track = this.props.info;
    const age = this.getAge();
    const connectionStatus = this.getConnectionStatus();
    const coloring = connectionStatus || age;
    let isSARSAT = false;
    if (this.props.info.target) {
      isSARSAT = this.props.info.target.sarmsg;
    }

    let incidents = this.props.info.incidents;
    let note, incidentTimestamp, noteTimestamp, firstReportedTimestamp;
    // Add a teaser using the last incident note found. Always assume that
    // the first incident is used
    if (incidents && incidents.length > 0) {
      let incident = incidents[0];
      if (incident.log) {
        for (let item of incident.log) {
          if (item.type === 'ACTION_OPEN') {
            let ts = moment(item.timestamp.seconds * 1000);
            incidentTimestamp = moment(ts).format('YYYY-MM-DD HH:mm:ss z');
          }
          if (item.type === 'NOTE') {
            note = item.note;
            if (note.length > 50) {
              note = note.substring(0, 50) + '...';
            }
            let ts = moment(item.timestamp.seconds * 1000);
            noteTimestamp = moment(ts).format('YYYY-MM-DD HH:mm:ss z');
          }
        }
      }
    }
    if (this.props.info.firstReportedTime) {
      firstReportedTimestamp = moment(this.props.info.firstReportedTime).format('YYYY-MM-DD HH:mm:ss z')
    }
    return (
      <Paper elevation={2} className={[this.props.classes.paper, this.props.classes.box].join(' ')}>
        <FlexContainer align="start stretch">
          <span
            className={[
              this.props.classes[coloring],
              this.props.classes.box,
              this.props.classes.status,
            ].join(' ')}
          />
          {format && !(track.target.type == 'Marker' && track.target.marker && track.target.marker.description) ? (
            <FlexContainer
              column
              align="center start"
              classes={{ root: this.props.classes.content }}
            >
              {/* Tracks */}
              <Typography variant="subtitle1">{format.label(track)}</Typography>
              <Typography variant="body1">
                {/*format.country && <Flag margin="right" countryCode={format.countryCode(track)} />*/}
                {format.sublabel && format.sublabel(track)}
              </Typography>
              {incidentTimestamp ? (
                <Typography variant="body1" className={this.props.classes.line}>
                  {__('Incident opened at')} {incidentTimestamp}
                </Typography>
              ) : ""}
              {firstReportedTimestamp ? (
                <Typography variant="body1" className={this.props.classes.line}>
                  {__('First reported at')} {firstReportedTimestamp}
                </Typography>
              ) : ""}
              {isSARSAT ? (
                <Typography variant="body1" className={this.props.classes.line}>
                  {format.latitude(track)} {format.longitude(track)}
                </Typography>
              ) : ""}
              {noteTimestamp ? (
                <Typography variant="body1" className={this.props.classes.line}>
                  {__('Last note on')} {noteTimestamp}
                </Typography>
              ) : ""}
              {note ? (
                <Typography variant="body1" className={this.props.classes.line}>
                  {note}
                </Typography>
              ) : ""}
            </FlexContainer>
          ) : (
            <FlexContainer
              column
              align="center start"
              classes={{ root: this.props.classes.content }}
            >
              {/*Zone*/}
              {track && (<Typography variant="subtitle1">{track.name}</Typography>)}

              {/*Marker*/}
              {track.target.type == 'Marker' && (
                <React.Fragment>
                  <Typography variant="subtitle1">
                    {track.target.marker.description}
                  </Typography>
                  <Typography variant="body1" className={this.props.classes.line}>
                    {__('Marker')}
                  </Typography>
                </React.Fragment>
              )}
            </FlexContainer>
          )}
        </FlexContainer>
      </Paper>
    );
  }
}

TooltipPanel.propTypes = {
  id: PropTypes.string,
  info: PropTypes.object,
  format: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  id: state.tooltip.id,
  info: state.tooltip.info,
  format: state.config,
});

export default connect(mapStateToProps)(withStyles(styles)(TooltipPanel));
