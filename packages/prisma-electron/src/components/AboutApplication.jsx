/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * AboutApplication provides information about this software such as the software publisher,
 * the version, release date, the copyrighted year, etc.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { makeStyles } from '@material-ui/styles';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  Typography,
} from '@material-ui/core';

// Icons
import LogoIcon from 'resources/svg/Logo';


const useStyles = makeStyles(theme => ({
  container: {
    height: '100%',
  },
  brand: {
    margin: `${theme.spacing(2)}px 0`,
  },
  copyright: {
    marginBottom: `${theme.spacing(1)}px`,
    marginTop: 'auto',
  },
}));

AboutApplication.propTypes = {
  brand: PropTypes.shape({
    name: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    copyright: PropTypes.string.isRequired,
    clientVersion: PropTypes.string,
    releaseDate: PropTypes.string,
  }),
};

AboutApplication.defaultProps = {
  brand: {
    clientVersion: '',
    releaseDate: '',
  },
};

export default function AboutApplication({ brand }) {
  const { name, version, clientVersion, releaseDate, copyright } = brand;
  const classes = useStyles();

  return (
    <FlexContainer className={classes.container} align="center center" column>
      <LogoIcon width="96px" height="96px" />
      <Typography variant="h3" className={classes.brand}>
        {name || __('PRISMA')}
      </Typography>
      <Typography variant="subtitle1">
        {clientVersion && `${__('Client Version:')}: ${clientVersion}`}
      </Typography>
      <Typography variant="subtitle1">
        {version && `${__('Server Version:')}: ${version}`}
      </Typography>
      <Typography variant="subtitle1">
        {releaseDate && `${__('Build Date:')}: ${releaseDate}`}
      </Typography>
      <Typography variant="caption" className={classes.copyright}>
        {copyright || ''}
      </Typography>
    </FlexContainer>
  );
}
