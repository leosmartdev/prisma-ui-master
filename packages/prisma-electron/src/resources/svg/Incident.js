import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

const IncidentIcon = props => (
  <SvgIcon {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 363 363">
      <path
        d="M305.307 175.536l-42.104-71.994 42.444-72.574c2.26-3.866 2.28-8.646.053-12.53-2.228-3.884-6.364-6.28-10.843-6.28H80.607C80.424 5.414 74.913 0 68.125 0c-6.904 0-12.5 5.596-12.5 12.5v338c0 6.904 5.596 12.5 12.5 12.5s12.5-5.596 12.5-12.5V194.927h214.25c6.904 0 12.5-5.596 12.5-12.5 0-2.547-.76-4.915-2.068-6.89zm-224.682-5.61V37.157h192.44L237.93 97.232c-2.28 3.9-2.28 8.724 0 12.622l35.134 60.074H80.624z"
      />
    </svg>
  </SvgIcon>
);

export default IncidentIcon;
