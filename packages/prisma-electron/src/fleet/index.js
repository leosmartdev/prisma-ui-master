import PropTypes from 'prop-types';

import { PersonShape } from 'components/person';

const FleetShape = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  person: PropTypes.shape(PersonShape),
  organization: PropTypes.shape(PersonShape),
};

const DefaultFleet = {
  name: '',
  description: '',
};

export { FleetShape, DefaultFleet };
