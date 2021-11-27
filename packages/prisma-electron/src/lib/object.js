import crypto from 'crypto';
/*
expands an object from:
{"foo.bar.baz": 1}
to:
{foo: {bar: {baz: 1}}}
*/
export const expand = attributes => {
  const result = {};
  Object.keys(attributes).forEach(attribute => {
    let previous = null;
    let last = null;
    let current = result;
    attribute.split('.').forEach(key => {
      if (current[key] === undefined) {
        current[key] = {};
      }
      previous = current;
      last = key;
      current = current[key];
    });
    previous[last] = attributes[attribute];
  });
  return result;
};

export const walk = (attributes, value) => {
  if (!value) {
    return undefined;
  }
  let current = value;
  attributes.split('.').forEach(key => {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[key];
  });
  if (current === null) {
    return undefined;
  }
  return current;
};

/**
 * Takes the input object and creates an MD5 checksum of the object by
 * converting it to JSON and then creating the hash from that.
 *
 * This is useful for times when you need a `key` for a repeated component
 * list but don't have a unique ID for the object.
 */
export function hashObject(obj) {
  if (obj) {
    const str = JSON.stringify(obj);
    return crypto
      .createHash('md5')
      .update(str)
      .digest('hex');
  }
  return null;
}
