import moment from 'moment';

import i18n from '../../../src/lib/i18n';

describe('lib/i18n', () => {
  afterEach(() => {
    i18n.changeLanguage('en-US');
  });

  it('should change moment locale when i18n locale changes', () => {
    i18n.changeLanguage('fr');
    const date = moment('2013-02-08 09:30:26');
    const result = moment(date).format('LLLL');
    expect(result).toBe('vendredi 8 février 2013 09:30');
  });
});
