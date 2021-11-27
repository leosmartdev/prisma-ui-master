import { walk } from 'lib/object';

export const avatarInitials = user => {
  if (!user || !user.userId) {
    return '';
  }

  const firstName = walk('profile.firstName', user) || '';
  const lastName = walk('profile.lastName', user) || '';

  const last = lastName.charAt(0);
  const first = firstName.charAt(0);
  const userId = user.userId.charAt(0);

  if ((first === '' && last === '') || (first === ' ' && last === ' ')) {
    return userId;
  }
  return (first + last).trim();
};

export const friendlyName = user => {
  const firstName = walk('profile.firstName', user) || '';
  const lastName = walk('profile.lastName', user) || '';

  if (firstName === '' && lastName === '') {
    if (!user) return '';
    return user.userId || '';
  }
  return `${firstName} ${lastName}`;
};
