import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { __ } from 'lib/i18n';

// Component Imports
import ErrorBanner from 'components/error/ErrorBanner';
import InfoBanner from 'components/InfoBanner';
import { FlexContainer } from 'components/layout/Container';
import IncidentForm from './IncidentForm';

import {
  Button,
  Divider,
  Slide,
} from '@material-ui/core';

// Actions & Helpers
import { areIncidentsEqual } from 'components/incidents/helpers';

/**
 * EditIncidentPanel
 */
class EditIncidentPanel extends React.Component {
  static propTypes = {
    // TODO mark required and have this only handle the positive case. A branch hoc should
    // handle the empty incident case.That will remove null case from this component
    incident: PropTypes.object,

    /**
     * Callback when save is clicked.
     */
    onSave: PropTypes.func.isRequired,

    /**
     * Callback when cancel is clicked or the form is complete and can be closed.
     */
    onClose: PropTypes.func.isRequired,

    /** @private withStyles */
    classes: PropTypes.object.isRequired, // withStyles
  };

  static defaultProps = {
    incident: null,
  };

  constructor(props) {
    super(props);

    let incident = null;

    if (props.incident) {
      incident = { ...props.incident };
    }

    this.state = {
      incident,
      infoBannerText: null,
      errorBannerText: null,
      fieldErrors: {},
    };
  }

  componentWillReceiveProps(newProps) {
    // Only check for equality if there is already and existing incident on
    // current props and they aren't equal
    if (this.props.incident && !areIncidentsEqual(newProps.incident, this.props.incident)) {
      this.setState({
        infoBannerText: __(
          'Incident has been updated by another user. Your edits may override changes.',
        ),
      });
    }
  }

  saveIncident = async () => {
    try {
      const incident = await this.props.onSave(this.state.incident);
      this.props.onClose(incident);
    } catch (error) {
      const newState = {
        fieldErrors: error.fieldErrors || {},
      };

      if (!error.fieldErrors) {
        newState.errorBannerText = error.message;
      }

      this.setState(newState);
    }
  };

  onChange = incident => {
    this.setState({ incident });
  };

  nullState = () => (
    <FlexContainer column align="start stretch">
      <ErrorBanner message={this.state.errorBannerText} compact />
      <Button
        variant="contained"
        className={this.props.classes.button}
        onClick={this.onCancel}
        style={{ marginTop: '50px' }}
      >
        {__('Back')}
      </Button>
    </FlexContainer>
  );

  render() {
    if (!this.state.incident) {
      return this.nullState();
    }

    const { onClose, classes } = this.props;

    const { incident, errorBannerText, infoBannerText, fieldErrors } = this.state;

    return (
      <FlexContainer column align="start stretch">
        <Slide in={infoBannerText !== null} direction="up">
          <InfoBanner compact />
        </Slide>
        <ErrorBanner message={errorBannerText} compact />

        {/* Form */}
        <IncidentForm
          incident={incident}
          onChange={this.onChange}
          fieldErrors={fieldErrors}
          showId
          column
        />

        <Divider className={classes.divider} />

        {/* Actions: Save and Cancel */}
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.saveIncident}
        >
          {__('Save')}
        </Button>
        <Button variant="contained" className={classes.button} onClick={onClose}>
          {__('Cancel')}
        </Button>
      </FlexContainer>
    );
  }
}

export default (EditIncidentPanel = withStyles({
  divider: {
    marginBottom: '20px',
    marginTop: '15px',
  },
  button: {
    marginBottom: '10px',
  },
})(withRouter(EditIncidentPanel)));
