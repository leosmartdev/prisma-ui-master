import { avatarInitials, friendlyName } from 'lib/user_helpers';

describe('lib/user_helpers', () => {
  it('should get avatar initials for a user', () => {
    const user = {
      userId: 'admin',
      profile: {
        firstName: 'Albert',
        lastName: 'Einstein',
      },
    };
    expect(avatarInitials(user)).toBe('AE');
  });

  it('should get avatar initials based on user id if there are no names', () => {
    const user = {
      userId: 'admin',
      profile: {},
    };
    expect(avatarInitials(user)).toBe('a');
  });

  it('should use the first letter of first name if there is no last name', () => {
    const user = {
      userId: 'admin',
      profile: {
        firstName: 'Albert',
      },
    };
    expect(avatarInitials(user)).toBe('A');
  });

  it('should use only the first letter of userID if there is no first name', () => {
    const user = {
      userId: 'admin',
      profile: {
        lastName: 'Einstein',
      },
    };
    expect(avatarInitials(user)).toBe('E');
  });

  it('should use the first letter of first name if the last name starts with a space', () => {
    const user = {
      userId: 'admin',
      profile: {
        firstName: 'Albert',
        lastName: ' Einstein',
      },
    };
    expect(avatarInitials(user)).toBe('A');
  });

  it('should use the first letter of last name if the first name starts with a space', () => {
    const user = {
      userId: 'admin',
      profile: {
        firstName: ' Albert',
        lastName: 'Einstein',
      },
    };
    expect(avatarInitials(user)).toBe('E');
  });

  it('should use the first letter of userID if first and last name starts with spaces', () => {
    const user = {
      userId: 'admin',
      profile: {
        firstName: ' Albert',
        lastName: ' Einstein',
      },
    };
    expect(avatarInitials(user)).toBe('a');
  });

  it('should get a friendly name', () => {
    const user = {
      profile: {
        firstName: 'Albert',
        lastName: 'Einstein',
      },
    };
    expect(friendlyName(user)).toBe('Albert Einstein');
  });

  it('should use the user id if there is no friendly name', () => {
    const user = {
      userId: 'admin',
    };
    expect(friendlyName(user)).toBe('admin');
  });

  it('should return default when invalid user is passed to friendly name', () => {
    expect(friendlyName({})).toBe('');
  });

  it('should return default when null user is passed to friendly name', () => {
    expect(friendlyName(null)).toBe('');
  });

  it('should return default when undefined user is passed to friendly name', () => {
    expect(friendlyName(undefined)).toBe('');
  });

  it('should return default when invalid user is passed to avatar initials', () => {
    expect(avatarInitials({})).toBe('');
  });

  it('should return default when null user is passed to avatar initials', () => {
    expect(avatarInitials(null)).toBe('');
  });

  it('should return default when undefined user is passed to avatar initials', () => {
    expect(avatarInitials(undefined)).toBe('');
  });
});

