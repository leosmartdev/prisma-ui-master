import PropTypes from 'prop-types';

const PersonShape = {
  id: PropTypes.string,
  name: PropTypes.string,
};

/**
 * Email device prop types shape.
 * Every email device is required to be of type `email`, with a
 * single network of type `smtp` and subscriberId containing the email address.
 */
const EmailDeviceShape = {
  type: PropTypes.oneOf(['email']).isRequired,
  networks: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['smtp']).isRequired,
      subscriberId: PropTypes.string,
    }),
  ).isRequired,
};

/**
 * Phone device prop types shape.
 * Every phone device is required to be of type `phone`, with a
 * single network of type `cellular-voice` and subscriberId containing the phone number.
 */
const PhoneDeviceShape = {
  type: PropTypes.oneOf(['phone']).isRequired,
  networks: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['cellular-voice']).isRequired,
      subscriberId: PropTypes.string,
    }),
  ).isRequired,
};

// Default person values, used for controlled form inputs.
const DefaultPerson = {
  name: '',
  address: '',
  devices: [],
};

export { PersonShape, EmailDeviceShape, PhoneDeviceShape, DefaultPerson };
