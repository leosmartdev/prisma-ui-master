/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 *
 * Provides a loading state for when vessels are loading. Displays in a column text and below
 * that a loading spinner.
 */
import React from 'react';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  Typography,
  CircularProgress,
} from '@material-ui/core';

/**
 * Component to display a loading indicator when vessels are loading.
 */
const VesselsLoading = () => (
  <FlexContainer column align="center center">
    <Typography variant="h4">{__('Loading Vessels...')}</Typography>
    <CircularProgress size={50} />
  </FlexContainer>
);

export default VesselsLoading;
