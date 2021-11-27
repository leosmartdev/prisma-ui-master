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
 * CoordinateContent
 * Show coordinate data and actions
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';
import CoordinateTable from './CoordinateTable';

import {
  Button,
} from '@material-ui/core';

CoordinateContent.propTypes = {
  /** change coordinates */
  onChange: PropTypes.func,
  /** remove a coordinate */
  onRemove: PropTypes.func,
  /** add a coordinate */
  onAdd: PropTypes.func,
  /** list of coordinates */
  coordinates: PropTypes.array,
};

CoordinateContent.defaultProps = {
  coordinates: [],
  onChange: () => { },
  onRemove: () => { },
  onAdd: () => { },
};

function CoordinateContent({ coordinates, onChange, onRemove, onAdd }) {
  return (
    <FlexContainer align="center" direction="column">
      <CoordinateTable coordinates={coordinates} onRemove={onRemove} onChange={onChange} />
      <Button fullWidth variant="contained" color="primary" onClick={onAdd}>
        {__('Add')}
      </Button>
    </FlexContainer>
  );
}

export default CoordinateContent;
