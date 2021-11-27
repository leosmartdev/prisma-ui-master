import {
  FieldErrors,
  getFieldErrorsFromResponse,
  getHelperTextForField,
  hasErrorForField,
  updateObjectPropertyWithValue
} from 'lib/form';

describe('lib/form', () => {
  describe('class FieldErrors', () => {
    it('can create FieldErrors class', () => {
      const fieldErrors = new FieldErrors();

      expect(fieldErrors).toBeDefined();
    });

    it('has function to getHelperTextForField', () => {
      const fieldErrors = new FieldErrors();

      fieldErrors.name = {
        property: 'name',
        rule: 'test',
        message: 'TEST',
      };

      const helperText = fieldErrors.getHelperTextForField('name');

      expect(helperText).toBe('TEST');
    });

    it('has function to hasErrorForField', () => {
      const fieldErrors = new FieldErrors();

      fieldErrors.name = {
        property: 'name',
        rule: 'test',
        message: 'TEST',
      };

      expect(fieldErrors.hasErrorForField('name')).toBe(true);
    });

    it('hasErrorForField returns false when field has no error', () => {
      const fieldErrors = new FieldErrors();

      expect(fieldErrors.hasErrorForField('name')).toBe(false);
    });

    it('has function for getting child field errors and returns those errors', () => {
      const fieldErrors = new FieldErrors();
      const childFieldErrors = new FieldErrors();

      childFieldErrors.name = {
        property: '',
        rule: 'test',
        message: 'TEST',
      };

      fieldErrors.person = {
        property: 'person',
        fieldErrors: childFieldErrors,
      };

      // Parent should not have name prop
      expect(fieldErrors.hasErrorForField('name')).toBe(false);
      // Parent should have person prop
      expect(fieldErrors.hasErrorForField('person')).toBe(true);

      const returnedErrors = fieldErrors.getErrorsForChild('person');

      // Child should be a field errors instance
      expect(returnedErrors instanceof FieldErrors).toBe(true);
      // Child should have name prop.
      expect(returnedErrors.hasErrorForField('name')).toBe(true);
    });

  });

  describe('getFieldErrorsFromResponse', () => {
    it('ignores non array responses', () => {
      const response = {
        data: {
          name: 'TEST',
        },
      };

      const errors = getFieldErrorsFromResponse(response);

      expect(errors.name).toBe('TEST');
    });

    it('returns parsed field errors when passed response with errors', () => {
      const response = {
        data: [
          {
            property: 'TEST',
            rule: 'required',
            message: 'message',
          },
        ],
      };

      const errors = getFieldErrorsFromResponse(response);

      expect(errors.TEST).toEqual({
        property: 'TEST',
        rule: 'required',
        message: 'message',
      });
    });

    it('returns Field error class', () => {
      const response = {
        data: [
          {
            property: 'TEST',
            rule: 'required',
            message: 'message',
          },
        ],
      };

      const errors = getFieldErrorsFromResponse(response);

      expect(errors instanceof FieldErrors).toBe(true);
    });

    it('returns Field error class for non field error response', () => {
      const response = {
        data: {
            name: 'TEST',
        },
      };

      const errors = getFieldErrorsFromResponse(response);

      expect(errors instanceof FieldErrors).toBe(true);

    });

    it('Parses fields with dot notation as child field errors', () => {
      const response = {
        data: [
          {
            property: 'foo.bar',
            rule: 'required',
            message: 'message',
          },
        ],
      };

      const errors = getFieldErrorsFromResponse(response);

      expect(errors.foo.property).toBe('foo');
      // child should be instance of FieldErrors
      expect(errors.foo.fieldErrors instanceof FieldErrors).toBe(true);
      // child should have correct field error format
      expect(errors.foo.fieldErrors.bar).toEqual({
        property: 'foo.bar',
        rule: 'required',
        message: 'message',
      });
    });

    it('Can handle multiple dot notation child fields and return correct fieldError structure', () => {
      const response = {
        data: [
          {
            property: 'fooBar',
            rule: 'test',
            message: 'TESTING',
          },
          {
            property: 'foo.bar',
            rule: 'required',
            message: 'message',
          },
          {
            property: 'foo.baz',
            rule: 'MaxLength',
            message: 'out of bounds',
          },
        ],
      };

      const errors = getFieldErrorsFromResponse(response);

      expect(errors.fooBar).toEqual({
        property: 'fooBar',
        rule: 'test',
        message: 'TESTING',
      });
      // child should be instance of FieldErrors
      expect(errors.foo.fieldErrors instanceof FieldErrors).toBe(true);
      expect(errors.foo.property).toBe('foo');
      // foo.bar child object is correctly added to FieldErrors
      expect(errors.foo.fieldErrors.bar).toEqual({
        property: 'foo.bar',
        rule: 'required',
        message: 'message',
      });
      // foo.baz child object is correctly added to FieldErrors
      expect(errors.foo.fieldErrors.baz).toEqual({
        property: 'foo.baz',
        rule: 'MaxLength',
        message: 'out of bounds',
      });
    });
  });

  describe('getHelperTextForField', () => {
    it('doesnt break with null field errors', () => {
      const response = getHelperTextForField('name', null);

      expect(response).toBeNull();
    });

    it('Correctly returns when error is required', () => {
      const response = getHelperTextForField('name', { name: { rule: 'Required' } });

      expect(response).toBe('Field is required.');
    });

    it('returns message when field is found', () => {
      const response = getHelperTextForField('name', { name: { rule: 'Test', message: 'TEST' } });

      expect(response).toBe('TEST');
    });

    it('returns null when field is not found', () => {
      const response = getHelperTextForField('another', { name: { rule: 'Test', message: 'TEST' } });

      expect(response).toBeNull();
    });
  });

  describe('fieldHasError', () => {
    it('returns true when the fieldErrors object has the provided field', () => {
      const fieldErrors = {
        name: {},
      };
      expect(hasErrorForField('name', fieldErrors)).toBe(true);
    });

    it('returns false when the fieldErrors object does not have the field', () => {
      const fieldErrors = {
        bar: ''
      };
      expect(hasErrorForField('name', fieldErrors)).toBe(false);
    });

    it('returns false when the fieldErrors object doesnt exist', () => {
      expect(hasErrorForField('name', null)).toBe(false);
    });
  });

  describe('updateObjectPropertyWithValue', () => {
    it('sets value for propertyName provided', () => {
      const state = {
        foo: undefined,
      };

      const newState = updateObjectPropertyWithValue(state, 'foo', 'bar');

      expect(newState).toEqual({ foo: 'bar' });
    });

    it('sets value for propertyName on child object', () => {
      const state = {
        foo: {
          bar: {
            baz: undefined,
          },
        },
      };

      const newState = updateObjectPropertyWithValue(state, 'foo.bar.baz', 'hello world');

      expect(newState).toEqual({ foo: { bar: { baz: 'hello world' } } });
    });

    it('returns new props when propName doesn\'t already exist', () => {
      const state = {
        foo: {
          bar: {
            baz: undefined,
          },
        },
      };

      const newState = updateObjectPropertyWithValue(state, 'foo.bars.bazz', 'hello world');

      expect(newState).toEqual({ foo: { bar: { baz: undefined }, bars: { bazz: 'hello world' } } });
    });
  });
});
