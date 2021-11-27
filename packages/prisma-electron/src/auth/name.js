import { alpha } from 'lib/i18n';

export const lfname = user => {
  if (user && user.profile) {
    const { profile } = user;
    if (profile.firstName && profile.lastName) {
      return `${profile.lastName}, ${profile.firstName}`;
    }

    if (profile.lastName) {
      return profile.lastName;
    }

    if (profile.lastName) {
      return profile.lastName;
    }
    return user.userId;
  }
};

export const flname = user => {
  if (user && user.profile) {
    const { profile } = user;
    const { lastName, firstName } = profile;
    if (!lastName) {
      return firstName;
    }

    if (!firstName) {
      return lastName;
    }

    return `${firstName.trim()} ${lastName.trim()}`;
  }
};

export const sortName = (a, b) => {
  const al = a.lastName || '';
  const af = a.firstName || '';
  const bl = b.lastName || '';
  const bf = b.firstName || '';

  const xa = al + af;
  const xb = bl + bf;

  return alpha(xa, xb);
};

export const sortUserObject = (a, b) => sortName(a.userObject, b.userObject);
