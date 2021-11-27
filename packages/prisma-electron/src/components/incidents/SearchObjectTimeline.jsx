/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Displays the search objects for the <Timeline> component. Displays a <ContentViewGroup> of the
 * search objects, or a null state of adding search objects.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import ContentViewGroup from 'components/layout/ContentViewGroup';
import LogEntryList from './log-entries/LogEntryList';
import FlexContainer from 'components/FlexContainer';

import {
  Paper,
  Typography,
  Button,
} from '@material-ui/core';

// Helpers
import { isClosed } from './helpers';

SearchObjectTimeline.propTypes = {
  /**
   * List of search objects. If null and incident is opened, then content group with a button to
   * create a search object will be displayed.
   */
  searchObjects: PropTypes.array,
  /**
   * The incident containing the search objects
   */
  incident: PropTypes.object.isRequired,
  /**
   * Callback when a search object is removed.
   */
  onRemove: PropTypes.func,
  /**
   * Callback when a search object is updated.
   */
  onSave: PropTypes.func,
  /**
   * Callback when a search object is selected.
   */
  onSelect: PropTypes.func,
  /**
   * Callback when create button is clicked.
   */
  onCreateClicked: PropTypes.func,
};

SearchObjectTimeline.defaultProps = {
  searchObjects: null,
};

export default function SearchObjectTimeline({
  searchObjects,
  incident,
  onRemove,
  onSave,
  onSelect,
  onCreateClicked,
}) {
  if (!searchObjects || searchObjects.length === 0) {
    return <SearchObjectNullState onCreateClicked={onCreateClicked} incident={incident} />;
  }

  return (
    <ContentViewGroup title={__('Search Object')}>
      <LogEntryList
        onRemove={onRemove}
        onSave={onSave}
        onSelect={onSelect}
        incident={incident}
        entries={searchObjects}
      />
    </ContentViewGroup>
  );
}

SearchObjectNullState.propTypes = {
  /** callback when create is clicked. */
  onCreateClicked: PropTypes.func.isRequired,
  /**
   * The incident containing the search objects
   */
  incident: PropTypes.object.isRequired,
};

function SearchObjectNullState({ onCreateClicked, incident }) {
  return (
    <ContentViewGroup
      title={__('Search Object')}
      component={Paper}
      componentProps={{ elevation: 2 }}
    >
      <Paper elevation={0}>
        <FlexContainer column align="start stretch" padding="normal">
          <Typography variant="body2" align="center" gutterBottom={!isClosed(incident)}>
            {__('No search object has been added to this incident.')}
          </Typography>
          {!isClosed(incident) && (
            <FlexContainer align="center" padding="dense">
              <Button variant="contained" onClick={onCreateClicked}>
                {__('Create Search Object')}
              </Button>
            </FlexContainer>
          )}
        </FlexContainer>
      </Paper>
    </ContentViewGroup>
  );
}
