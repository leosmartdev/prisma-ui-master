/*
 *
 *  COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * NoteEdit
 * Textfield and save/create button for editing and creating a note.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withStyles } from '@material-ui/styles';

// Component Imports
import FlexContainer from 'components/FlexContainer';
import PrimaryButton from 'components/PrimaryButton';
import ErrorBanner from 'components/error/ErrorBanner';
import InfoBanner from 'components/InfoBanner';

import {
  TextField,
  Button,
} from '@material-ui/core';

class NoteEdit extends React.Component {
  MAX_CHARS = 2000;

  MIN_CHARS = 3;

  static propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    saveButtonText: PropTypes.string,
    cancelButtonText: PropTypes.string,
    note: PropTypes.string,
    /**
     * Number of rows to display in the text area. Default 3
     */
    rows: PropTypes.number,
    /**
     * When true, will use the full width available.
     */
    fullWidth: PropTypes.bool,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    saveButtonText: `${__('Save')}`,
    cancelButtonText: `${__('Cancel')}`,
    rows: 3,
    fullWidth: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      note: props.note || '',
      infoBannerText: null,
    };
  }

  onChange = event => {
    const newState = {
      note: event.target.value,
      errorBannerText: null,
    };

    if (this.isTooLong(event.target.value)) {
      newState.errorBannerText = __(
        'Note is over the maximum number of characters allowed. Please shorten the note to save.',
      );
    }

    this.setState(newState);
  };

  onSave = () => {
    if (this.isTooLong()) {
      return;
    }

    if (this.isTooShort()) {
      this.setState({
        errorBannerText: __(`Note must be at least ${this.MIN_CHARS} characters.`),
      });
      return;
    }

    this.props.onSave(this.state.note);
  };

  isTooLong = value => {
    const numChars = this.getLengthOfNote(value);
    if (numChars > this.MAX_CHARS) {
      return true;
    }
    return false;
  };

  isTooShort = value => {
    const numChars = this.getLengthOfNote(value);
    if (numChars < this.MIN_CHARS) {
      return true;
    }
    return false;
  };

  getLengthOfNote = value => {
    if (value === undefined && this.state.note) {
      return this.state.note.length;
    }

    if (value !== undefined) {
      return value.length;
    }

    return 0;
  };

  getHelperText = () => {
    const numChars = this.getLengthOfNote();
    return `${numChars}/${this.MAX_CHARS}`;
  };

  render() {
    const {
      fullWidth,
      rows,
      onCancel,
      cancelButtonText,
      saveButtonText,
      classes,
    } = this.props;

    const { note, errorBannerText, infoBannerText } = this.state;

    let placeholder = __('Add note here');

    return (
      <FlexContainer column align="start stretch" className={fullWidth ? classes.fullWidth : null}>
        <InfoBanner compact message={infoBannerText} />
        <ErrorBanner compact message={errorBannerText} />
        <TextField
          multiline
          rows={rows}
          margin="normal"
          placeholder={placeholder}
          onChange={this.onChange}
          value={note}
          helperText={this.getHelperText()}
          error={this.isTooLong()}
        />
        <FlexContainer align="end center">
          {onCancel && <Button onClick={onCancel}>{cancelButtonText}</Button>}
          <PrimaryButton onClick={this.onSave} disabled={this.isTooShort()}>
            {saveButtonText}
          </PrimaryButton>
        </FlexContainer>
      </FlexContainer>
    );
  }
}

export default withStyles({
  fullWidth: {
    width: '100%',
  },
})(NoteEdit);
