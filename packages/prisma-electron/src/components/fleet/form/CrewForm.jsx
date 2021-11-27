/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Form for editing and creating Crew.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import PrimaryButton from 'components/PrimaryButton';
import FlexContainer from 'components/FlexContainer';
import PersonForm from 'components/person/PersonForm';

import {
  Button,
} from '@material-ui/core';

// Helpers
import { DefaultPerson, PersonShape } from 'components/person';

export default class CrewForm extends React.Component {
  static propTypes = {
    /**
     * Initial value for person if the form is used for editing.
     */
    person: PropTypes.shape(PersonShape),
    /**
     * Callback when the save button is clicked.
     * onSave(person: object);
     */
    onSave: PropTypes.func.isRequired,
    /**
     * Callback when the cancel button is clicked.
     */
    onCancel: PropTypes.func.isRequired,
    /**
     * Allows for override of save button text. Defaults to Save
     */
    saveButtonText: PropTypes.string,
  };

  static defaultProps = {
    person: DefaultPerson,
    saveButtonText: __('Save'),
  };

  state = {
    person: { ...DefaultPerson },
  };

  constructor(props) {
    super(props);

    if (props.person) {
      this.state.person = { ...props.person };
    }
  }

  onChange = propName => value => {
    this.setState(prevState => ({
      person: {
        ...prevState.person,
        [propName]: value,
      },
    }));
  };

  onSave = () => {
    this.props.onSave(this.state.person);
  };

  render() {
    const { onCancel, saveButtonText } = this.props;

    const { person } = this.state;

    return (
      <FlexContainer column align="start stretch">
        <PersonForm person={person} onChange={this.onChange} />
        <FlexContainer align="end center">
          <Button onClick={onCancel}>{__('Cancel')}</Button>
          <PrimaryButton onClick={this.onSave}>{saveButtonText}</PrimaryButton>
        </FlexContainer>
      </FlexContainer>
    );
  }
}
