import { __ } from 'lib/i18n';

/**
 * Takes a response from the server and extracts the field
 * errors, if found in the data object on response
 * response:
 */
export function getFieldErrorsFromResponse(response) {
  let fieldErrors = new FieldErrors();
  if (response.data && Array.isArray(response.data)) {
    // should we be resetting fieldErrors here? Or just looping through the data.
    fieldErrors = response.data.reduce((state, fieldError) => {
      const names = fieldError.property.split('.');
      const walk = (obj, names, name) => {
        // Handle child fieldError since the property name is `.` notated.
        if (names.length > 0) {
          // Create new child Field errors if we don't already have one
          if (!Object.hasOwnProperty.call(obj, name)) {
            obj[name] = {
              property: name,
              fieldErrors: new FieldErrors(),
            };
          }

          walk(obj[name].fieldErrors, names, names.shift());
        } else {
          // No dot notation so just add the field error to the fieldErrors object.
          obj[name] = fieldError;
        }
      };
      walk(state, names, names.shift());

      return state;
    }, new FieldErrors());
  } else {
    fieldErrors = new FieldErrors();
    Object.assign(fieldErrors, response.data);
  }
  // add the helper functions for dealing with fieldErrors.
  return fieldErrors;
}

/**
 * Returns helper text for a field if the field has an error. The text will be the message
 * contained in the field errors, or null if no error is found for that field.
 *
 * @param {string} fieldName Name of the field to find errors about
 * @param {object} fieldErrors The object containing all field errors
 * @returns {string} Returns field error string or null if no error was found for that field.
 */
export function getHelperTextForField(fieldName, fieldErrors) {
  if (fieldErrors && fieldErrors[fieldName] !== undefined) {
    switch (fieldErrors[fieldName].rule) {
      case 'Required': {
        return __('Field is required.');
      }
      default:
        return fieldErrors[fieldName].message;
    }
  }

  return null;
}

/**
 * returns if the fieldErrors object has the provided field in its list of errors.
 * Usage is generally for the `error` property on `Input` and `TextField`
 * @param {string} fieldName The field to check for errors.
 * @param {object} fieldErrors The object containing field errors.
 * @return {bool} True if the error exists, false if there is no error for that field.
 */
export function hasErrorForField(fieldName, fieldErrors) {
  if (!fieldErrors) return false;
  return Object.hasOwnProperty.call(fieldErrors, fieldName);
}

/**
 * Updates the provided object property with the new value. `.` separated property names can be
 * used to replace child object properties. Eg: `foo.bar.baz` would set the baz property on the
 * following object: `{ foo: { bar: { baz: '' } }`.
 *
 * Examples:
 * ```
 * const obj = {
 *   foo: 'baz',
 * };
 * newState = updateObjectPropertyWithValue(obj, 'foo', 'bar');
 * > newState = { foo: 'bar' }
 * ```
 *
 * ```
 * const obj = {
 *   foo: {
 *     bar: {
 *       baz: 'hello',
 *     }
 *   },
 * };
 * newState = updateObjectPropertyWithValue(obj, 'foo.bar.baz', 'world');
 * > newState = { foo: { bar: { baz: 'world' } } }
 * ```
 *
 * @param {object} state Object to replace the property on
 * @param {string} propName Name of the property to replace. '.' delimited strings can denote
 *  properties on sub objects
 * @param {any} newValue New value to set on the property.
 */
export function updateObjectPropertyWithValue(state, propName, newValue) {
  const names = propName.split('.');
  const walk = (obj, names, name) => ({
    ...obj,
    [name]: names.length > 0 ? walk(obj[name], names, names.shift()) : newValue,
  });
  return walk(state, names, names.shift());
}

/**
 * Class for managing a forms errors. When parsing field errors from a response,
 * this class will provide easy access to parsing and handling different types
 * of errors.
 */
export class FieldErrors {
  getHelperTextForField = field => getHelperTextForField(field, this);

  hasErrorForField = field => hasErrorForField(field, this);

  /**
   * Returns a FieldErrors object for the embedded object field errors.
   * The field errors from the server are sent as . delimited property
   * names, which the parser will parse as child objects. This function
   * will return just the child object as a FieldError instance. If
   * there are no field errors for that object, then null is returned.
   *
   * @param {string} field The field name with the child fieldErrors.
   *
   * Eg.
   * Request:
   * ```
   *   [{
   *     property: 'person.name',
   *     rule: 'required',
   *     message: 'Field is required',
   *   }]
   * ```
   * Field Error object:
   * ```
   *   {
   *     person: {
   *       property: 'person',
   *       fieldErrors: {
   *         name: {
   *           property: 'name',
   *           rule: 'required',
   *           message: 'Field is required',
   *         }
   *       }
   *     }
   *   }
   * ```
   *
   * The returned FieldError object will be
   * ```
   * {
   *   name: {
   *     property: 'name',
   *     rule: 'required',
   *     message: 'Field is required',
   *   }
   * }
   * ```
   */
  getErrorsForChild = field => {
    if (this.hasErrorForField(field)) {
      return this[field].fieldErrors;
    }
  };
}
