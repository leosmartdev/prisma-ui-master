import PropTypes from 'prop-types';

/*
 * Default vessel object. Used to set defaults for vessel creation.
 */
const DefaultVessel = {
  name: '',
  type: '',
  person: {},
  devices: [],
  crew: [],
};

/*
 * Shape for checking prop types of vessels passed
 * to a component.
 */
const VesselShape = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  fleet: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }),
};

export { VesselShape, DefaultVessel };
