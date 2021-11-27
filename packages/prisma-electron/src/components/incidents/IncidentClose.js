import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Component Imports
import { FlexContainer } from 'components/layout/Container';
import ErrorBanner from 'components/error/ErrorBanner';
import InfoBanner from 'components/InfoBanner';

import {
  IconButton,
  Typography,
  TextField,
  FormControl,
  FormHelperText,
  Input,
  Select,
  InputLabel,
  MenuItem,
  Button,
  Slide,
} from '@material-ui/core';

// Icons
import CloseIcon from '@material-ui/icons/Close';

// Actions & Helpers
import * as incidentActions from 'incident/incident';
import { getHelperTextForField } from 'lib/form';
import * as IncidentHelpers from './helpers';

const styles = {
  content: {
    width: '100%',
    height: '100%',
  },
  header: {
    width: '100%',
  },
  errorBanner: {
    margin: '20px',
  },
  form: {
    width: '40%',
    '& > h2': {
      marginBottom: '25px',
    },
    '& > button': {
      marginTop: '25px',
    },
  },
};

/**
 * IncidentClose
 * Form for closing an Incident.
 */
class IncidentClose extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.transactionId = null;
    this.state = {
      incidentId: this.props.incidentId || this.props.match.params.id,
      incident: {},
      synopsis: '',
      outcome: '',
      errorBannerText: '',
      fieldErrors: {},
      infoBannerText: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.getIncident();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(props) {
    // Only check for equality if there is already and existing incident on
    // current props.
    if (props.incident && props.incident.state === IncidentHelpers.STATE.CLOSED) {
      this.setState({
        infoBannerText: __('This incident has already been closed.'),
      });
    }
  }

  async getIncident() {
    const action = incidentActions.getIncident(this.state.incidentId);
    try {
      const incident = await this.props.createTransaction(action);
      if (this._isMounted) {
        this.setState({ incident });
      }
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          errorBannerText: __(
            'An error occurred retrieving incident details. Please try again later or contact your system administrator.',
          ),
        });
      }
    }
  }

  save = () => {
    const incident = {
      ...this.state.incident,
      state: IncidentHelpers.STATE.CLOSED,
      synopsis: this.state.synopsis,
      outcome: this.state.outcome,
    };
    const action = incidentActions.updateIncident(incident);

    this.props.createTransaction(action).then(
      () => {
        // Save successful, go back to details page.
        this.props.history.push(`/incidents/details/${this.state.incident.id}`);
      },
      response => {
        // Save failed, set the field errors or error banner.
        if (this._isMounted) {
          if (response.fieldErrors) {
            this.setState({
              fieldErrors: response.fieldErrors,
            });
          } else {
            this.setState({ errorBannerText: `Failed to close Incident. ${response.statusText}` });
          }
        }
      },
    );
  };

  onChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const SlideContent = React.forwardRef((props, ref) => (
      <InfoBanner ref={ref} {...props} message={this.state.infoBannerText} compact />
    ));

    return (
      <FlexContainer column align="start center">
        <FlexContainer align="end start" className={this.props.classes.header}>
          <IconButton onClick={() => this.props.history.goBack()}>
            <CloseIcon />
          </IconButton>
        </FlexContainer>
        <FlexContainer column align="space-between stretch" className={this.props.classes.form}>
          <Slide in={this.state.infoBannerText !== null} direction="up">
            <SlideContent />
          </Slide>
          <ErrorBanner message={this.state.errorBannerText} />
          <Typography variant="h5" align="center">
            {`${__('Close Incident')} #${this.state.incident.incidentId}: ${this.state.incident.name
              }`}
          </Typography>
          <TextField
            id="synopsis"
            label={__('Close Synopsis')}
            margin="normal"
            value={this.state.synopsis}
            onChange={this.onChange('synopsis')}
            error={this.state.fieldErrors.synopsis !== undefined}
            helperText={getHelperTextForField('synopsis', this.state.fieldErrors)}
            required
            multiline
          />
          <FormControl
            margin="normal"
            // classes={{root: this.props.classes.formControlRoot}}
            error={this.state.fieldErrors.outcome !== undefined}
          >
            <InputLabel htmlFor="type">{__('Incident Outcome')}</InputLabel>
            <Select
              value={this.state.outcome}
              onChange={this.onChange('outcome')}
              input={<Input id="outcome" fullWidth required />}
            >
              {IncidentHelpers.getIncidentOutcomes().map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {getHelperTextForField('outcome', this.state.fieldErrors)}
            </FormHelperText>
          </FormControl>

          <Button color="primary" variant="contained" onClick={this.save}>
            {__('Close Incident')}
          </Button>
        </FlexContainer>
      </FlexContainer>
    );
  }
}

IncidentClose.propTypes = {
  incidentId: PropTypes.string,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,

  // state to props
  incident: PropTypes.object.isRequired,

  // withTransaction
  createTransaction: PropTypes.func.isRequired,
  /**
   * @private withRouter
   */
  match: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  incident:
    state.incidents.incidents.find(i => {
      if (ownProps.incidentId) {
        return i.id === ownProps.incidentId;
      }
      if (ownProps.match && ownProps.match.params) {
        return i.id === ownProps.match.params.id;
      }
    }) || {},
});

export default connect(mapStateToProps)(
  withRouter(withStyles(styles)(withTransaction(IncidentClose))),
);
