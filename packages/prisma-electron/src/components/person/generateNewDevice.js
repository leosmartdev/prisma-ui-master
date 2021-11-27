import shortid from 'shortid';

// Default for an email
export const DefaultEmailDevice = {
  type: 'email',
  networks: [
    {
      type: 'smtp',
      subscriberId: '',
    },
  ],
};

// Default for a phone number
export const DefaultPhoneDevice = {
  type: 'phone',
  networks: [
    {
      type: 'cellular-voice',
      subscriberId: '',
    },
  ],
};

/**
 * Generates a new default device of type phone or email
 * that contains a new generated ID so it can be used in the REACT
 * key property.
 * @param {string} type One of ['email', 'phone']
 * @return {device} The newly created device object with a generated id property.
 */
export default function generateNewDevice(type) {
  let newDevice = {};
  switch (type) {
    case 'email': {
      newDevice = {
        ...DefaultEmailDevice,
        id: shortid(),
      };
      break;
    }
    case 'phone':
    default: {
      newDevice = {
        ...DefaultPhoneDevice,
        id: shortid(),
      };
      break;
    }
  }

  return newDevice;
}
