/*
# i18n.js

Internationalization support.

Each module should store localized strings in a separate file and obtain
a translator with the following:

```javascript
import i18n from "path/to/i18n";
const __ = i18n.namespace("my-module");
```

This would load the `my-module.json` file in the `locales` directory in the
source root.
*/
import i18next from 'i18next';
import backend from 'i18next-sync-fs-backend';
import moment from 'moment-timezone';
import path from 'path';

/*
----
#### **`i18n`**

The i18n object is the `i18next` object as defined here:
http://i18next.com/docs/api/
*/
export default i18next;

let localePath = `${process.resourcesPath}/app/locales/{{lng}}.json`;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  localePath = path.resolve('./locales/{{lng}}.json');
}

// -----
// #### Setup

// Default to US English
const defaults = 'en-US';
const fallback = 'en-US';

// Change `debug` to true during development when having problems with
// i18next.
const debug = false;

i18next.use(backend);
i18next.init({
  lng: defaults,
  fallbackLng: fallback,
  nsSeparator: false,
  keySeparator: false,
  debug,
  // Example locale file: `locales/fr/country.json`
  backend: {
    loadPath: localePath,
  },
  // Normally the init is an async call, but for this application, it makes
  // more sense for it to be sync (with using the i18next-sync-fs-backend
  // package). For some strange reason, if the `initImmediate` option is
  // `true` it is async but if it is `false` is is sync.
  initImmediate: false,
});
moment.locale(defaults);

// deprecated
i18next.namespace = function namespace() {
  const t = i18next.getFixedT(null, null);
  t.n = (key, plural, count) => {
    let value = t(key, { count });
    if (i18next.language === 'en-US' && count !== 1) {
      value = plural;
    }
    return value;
  };
  return t;
};

const changeLanguage = i18next.changeLanguage;

i18next.changeLanguage = (locale, callback) => {
  moment.locale(locale);
  return changeLanguage.call(i18next, locale, callback);
};

export const alpha = (a, b) => a.localeCompare(b, i18next.language);
