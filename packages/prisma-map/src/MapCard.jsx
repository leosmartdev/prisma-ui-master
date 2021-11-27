/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import PrismaPropTypes from './prisma-prop-types';

MapCard.propTypes = {
  /**
   * className This component passes the classname into the underlying <Card> component which
   * knows how to handle the className property.
   */
  className: PropTypes.string,
  /**
   * Anchor location of the map card over the map.
   * Valid values are:
   *
   * ----------------------------------------------
   * | top-left        top-center       top-right |
   * |                                            |
   * | middle-left   middle-center   middle-right |
   * |                                            |
   * | bottom-left   bottom-center   bottom-right |
   * ---------------------------------------------|
   */
  anchor: PropTypes.oneOf([
    'top-left',
    'top-center',
    'top-right',
    'middle-left',
    'middle-center',
    'middle-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ]),
  /**
   * Child elements to place inside the card. This is how your custom content should be sent into
   * the component.
   */
  children: PrismaPropTypes.children,
  /** @private withStyles */
  classes: PropTypes.shape({
    root: PropTypes.string,
  }).isRequired,
};

MapCard.defaultProps = {
  anchor: 'top-right',
  children: null,
  className: null,
};

function MapCard({
  classes,
  children,
  className,
  anchor,
}) {
  const classNames = [classes[anchor]];
  if (className) {
    classNames.push(className);
  }

  return (
    <Card
      classes={{ root: classes.root }}
      className={classNames.join(' ')}
      raised
    >
      {children}
    </Card>
  );
}

export default withStyles(theme => ({
  root: {
    pointerEvents: 'auto',
    margin: theme.spacing.unit * 2,
    display: 'inline-block',
    maxHeight: `calc(100% - ${theme.spacing.unit * 4}px)`,
    maxWidth: `calc(100% - ${theme.spacing.unit * 4}px)`,
    position: 'absolute',
    boxSizing: 'border-box',
  },
  'top-left': {
    top: 0,
    left: 0,
  },
  'top-center': {
    left: '50%',
    top: 0,
    marginLeft: 0,
    transform: 'translateX(-50%)',
  },
  'top-right': {
    top: 0,
    right: 0,
  },
  'middle-left': {
    left: 0,
    top: '50%',
    marginTop: 0,
    transform: 'translateY(-50%)',
  },
  'middle-center': {
    left: '50%',
    top: '50%',
    marginLeft: 0,
    marginTop: 0,
    transform: 'translate(-50%, -50%)',
  },
  'middle-right': {
    top: '50%',
    right: 0,
    marginTop: 0,
    transform: 'translateY(-50%)',
  },
  'bottom-left': {
    left: 0,
    bottom: 0,
  },
  'bottom-center': {
    left: '50%',
    bottom: 0,
    marginLeft: 0,
    transform: 'translateX(-50%)',
  },
  'bottom-right': {
    bottom: 0,
    right: 0,
  },
}))(MapCard);
