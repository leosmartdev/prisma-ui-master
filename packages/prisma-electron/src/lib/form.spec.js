import { getFieldErrorsFromResponse, getHelperTextForField, updateObjectPropertyWithValue } from 'lib/form';

describe('lib/form', () => {
  describe('getFieldErrorsFromResponse', () => {
    it('doesnt parse non array responses but adds helper methods', () => {
      const response = {
        data: {
          name: 'TEST',
        },
      };

      const errors = getFieldErrorsFromResponse(response);

      expect(errors.getHelperTextForField).toBeDefined();
      expect(errors.hasErrorForField).toBeDefined();
      expect(errors.name).toBe('TEST');
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

  describe('updateObjectPropertyWithValue', () => {
    it('sets value for propertyName provided', () => {
      const state = {
        foo: undefined,
      };

      const newState = updateObjectPropertyWithValue(state, 'foo', 'bar');

      expect(newState).toEqual({ foo: 'bar' });
    });
  });
});
