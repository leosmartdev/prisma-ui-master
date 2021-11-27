/**
 * Returns the owner object from the fleet and the type of owner
 * that it is (eg person or organization).
 *
 * @param {object} fleet - The fleet containing the owner
 * @return {object} - { owner, ownerType } owner object, type is one of ['person', 'organization']
 *                    { null, null } if there is no owner for the fleet.
 */
export default function getOwnerFromFleet(fleet) {
  let owner = null;
  let ownerType = null;

  if (fleet) {
    if (fleet.person) {
      owner = fleet.person;
      ownerType = 'person';
    } else if (fleet.organization) {
      owner = fleet.organization;
      ownerType = 'organization';
    }
  }

  return { owner, ownerType };
}
