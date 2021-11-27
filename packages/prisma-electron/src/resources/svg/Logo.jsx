import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

import SvgIcon from '@material-ui/core/SvgIcon';

const LogoIcon = ({ classes, width, height, className }) => (
  <SvgIcon style={{ height, width }} className={className}>
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 163.2 163.3"
      xmlSpace="preserve"
    >
      <g>
        <polygon className={classes.st0} points="77.7,28.9 77.7,100.2 19.8,129.1        " />
        <polygon className={classes.st1} points="85.5,100.2 85.5,28.9 143.3,129.1       " />
        <polygon className={classes.st2} points="26.6,134.4 81.6,107 136.6,134.4        " />
      </g>
    </svg>
  </SvgIcon>
);

LogoIcon.propTypes = {
  height: PropTypes.string,
  width: PropTypes.string,
  className: PropTypes.string,
  /**
   * @private withStyles
   */
  classes: PropTypes.object.isRequired,
};

LogoIcon.defaultProps = {
  height: '48px',
  width: '48px',
  className: '',
};

export default withStyles({
  st0: {
    fill: '#255DAB',
  },
  st1: {
    fill: '#A8AAAD',
  },
  st2: {
    fill: '#595A5C',
  },
})(LogoIcon);
