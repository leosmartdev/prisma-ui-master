/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 *
 * HeadListPanel
 * Manage components in the header of the list of zones
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';

import {
  Button,
} from '@material-ui/core';

// Icons
import AddIcon from '@material-ui/icons/Add';

class HeadListPanel extends React.Component {
  static propTypes = {
    /** Selection mode */
    isActiveSelect: PropTypes.bool,
    /** A result from invoked withStyles */
    classes: PropTypes.object.isRequired,

    /** Action for selection zones */
    onSelect: PropTypes.func.isRequired,
    /** Action for creating a zone */
    onCreate: PropTypes.func.isRequired,
    /** Actions for importing zones */
    onImportZones: PropTypes.func.isRequired,

    /** Actions for exporting zones */
    onExportZones: PropTypes.func.isRequired,
    /** Actions for cancel button */
    onCancel: PropTypes.func.isRequired,
    /** Is selected some zones */
    isSelected: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    isActiveSelect: false,
  };

  render() {
    const { isActiveSelect } = this.props;
    return (
      <FlexContainer align="space-between">
        {isActiveSelect ? (
          <SelectedComponentsPanel {...this.props} />
        ) : (
          <ComponentsPanel {...this.props} />
        )}
      </FlexContainer>
    );
  }
}

/**
 * ComponentsPanel is used to show common actions to do for zones
 */
ComponentsPanel.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onImportZones: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

function ComponentsPanel({ onSelect, onCreate, onImportZones, classes }) {
  return (
    <FlexContainer className={classes.components} column>
      <FlexContainer align="space-between">
        <Button className={classes.newButton} onClick={onSelect}>
          {__('Select')}
        </Button>
        <Button className={classes.newButton} onClick={onImportZones}>
          {__('Import')}
        </Button>
      </FlexContainer>
      <Button variant="contained" className={classes.newButton} onClick={onCreate}>
        <AddIcon />
        {__('New Zone')}
      </Button>
    </FlexContainer>
  );
}

/**
 * SelectedComponentsPanel is used to show actions that can be invoked for selection
 */
SelectedComponentsPanel.propTypes = {
  onExportZones: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

function SelectedComponentsPanel({ isSelected, onExportZones, onCancel, classes }) {
  return (
    <div>
      <Button disabled={!isSelected} className={classes.newButton} onClick={onExportZones}>
        {__('Export')}
      </Button>
      <Button variant="contained" className={classes.newButton} onClick={onCancel}>
        {__('Cancel')}
      </Button>
    </div>
  );
}

export default withStyles({
  components: {
    flex: 1,
  },
  newButton: {
    margin: '10px',
  },
  groupButton: {
    display: 'flex',
    justifyContent: 'space-between',
  },
})(HeadListPanel);
