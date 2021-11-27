import React from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';

export default class MapIcon extends React.Component {
  render() {
    return (
      <SvgIcon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 426.667 426.667">
          <path d="M128 85.333h42.667V384H128zm128-42.666h42.667v298.667H256z" />
          <path d="M277.333 20.267l-128 42.667L0 13.014v343.68l149.333 49.92 128-42.668 149.333 49.707V69.973L277.333 20.267zM384 358.827L277.333 323.2l-128 42.667L42.667 330.24V68.053l106.667 35.413 128-42.667L384 96.425v262.4z" />
        </svg>
      </SvgIcon>
    );
  }
}
