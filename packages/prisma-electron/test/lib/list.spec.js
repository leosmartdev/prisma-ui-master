import { alpha } from 'lib/i18n';
import { updateList, toList, upsert } from 'lib/list';

describe('lib/list', () => {
  describe('updateList', () => {
    it('should add items', () => {
      let list = updateList([], { contents: { id: 1 } });
      expect(list).toEqual([
        { id: 1 },
      ]);
      list = updateList(list, { contents: { id: 2 } });
      expect(list).toEqual([
        { id: 1 },
        { id: 2 },
      ]);
    });

    it('should use the message itself when contents is not given', () => {
      let list = updateList([], { id: 1 });
      expect(list).toEqual([
        { id: 1 },
      ]);
      list = updateList(list, { id: 2 });
      expect(list).toEqual([
        { id: 1 },
        { id: 2 },
      ]);
    });

    it('should remove items', () => {
      let list = [
        { id: 1 },
        { id: 2 },
      ];
      list = updateList(list, { status: 'Timeout', contents: { id: 1 } });
      expect(list).toEqual([
        { id: 2 },
      ]);
    });

    it('should update items', () => {
      let list = [
        { id: 1 },
        { id: 2 },
      ];
      list = updateList(list, { contents: { id: 2, message: 'bar' } });
      list = updateList(list, { contents: { id: 1, message: 'foo' } });
      expect(list).toEqual([
        { id: 1, message: 'foo' },
        { id: 2, message: 'bar' },
      ]);
    });

    it('should sort items', () => {
      const sort = (a, b) => alpha(a.message, b.message);
      let list = [];

      list = updateList(list, { contents: { id: 2, message: 'bar' } }, sort);
      list = updateList(list, { contents: { id: 1, message: 'foo' } }, sort);
      expect(list).toEqual([
        { id: 2, message: 'bar' },
        { id: 1, message: 'foo' },
      ]);
    });
  });

  describe('toList', () => {
    it('returns empty list when value is undefined', () => {
      const newList = toList(undefined);

      expect(newList).toEqual([]);
    });

    it('returns the value if its already an array', () => {
      const list = ['TEST'];
      const newList = toList(list);

      expect(newList).toBe(list);
    });

    it('returns a new array with the value as the only item when not a list', () => {
      const value = 'TEST';
      const newList = toList(value);

      expect(newList).toEqual([value]);
    });
  });

  describe('upsert', () => {
    it('returns the list if the item is undefined', () => {
      const list = [];
      const item = undefined;
      const newList = upsert(list, item);

      expect(newList.length).toBe(0);
    });

    it('adds the item to the list when list is empty', () => {
      const list = [];
      const item = { id: 'ITEM' };
      const newList = upsert(list, item);

      expect(newList.length).toBe(1);
      expect(newList[0]).toBe(item);
    });

    it('returns a list with the item when the list is null', () => {
      const list = null;
      const item = { id: 'ITEM' };
      const newList = upsert(list, item);

      expect(newList.length).toBe(1);
      expect(newList[0]).toBe(item);
    });

    it('adds the item to the end of the list', () => {
      const list = [{ id: 'ANOTHER ITEM' }];
      const item = { id: 'ITEM' };
      const newList = upsert(list, item);

      expect(newList.length).toBe(2);
      expect(newList[0]).toEqual({ id: 'ANOTHER ITEM' });
      expect(newList[1]).toBe(item);
    });

    it('replaces existing item in the list with the same id', () => {
      const list = [
        { id: 'TEST_ORIG' },
        { id: 'TEST', value: 'OLD VALUE' },
        { id: 'TEST_ORIG2' },
      ];
      const item = { id: 'TEST', value: 'A NEW VALUE' };
      const newList = upsert(list, item);

      expect(newList.length).toBe(3);
      expect(newList[0]).toEqual({ id: 'TEST_ORIG' });
      expect(newList[1].value).toBe('A NEW VALUE');
      expect(newList[2]).toEqual({ id: 'TEST_ORIG2' });
    });

    it('accepts custom compare functions', () => {
      const comparator = (i, n) => i.foo === n.foo;
      const list = [
        { foo: 'TEST_ORIG' },
        { foo: 'TEST', bar: 'OLD VALUE', baz: 'BAZ' },
        { foo: 'TEST_ORIG2' },
      ];
      const item = { foo: 'TEST', bar: 'A NEW VALUE' };
      const newList = upsert(list, item, comparator);

      expect(newList.length).toBe(3);
      expect(newList[0]).toEqual({ foo: 'TEST_ORIG' });
      expect(newList[1].bar).toBe('A NEW VALUE');
      expect(newList[2]).toEqual({ foo: 'TEST_ORIG2' });
    });
  });
});

