import clone from 'clone';

export const updateList = (previous, message, compare) => {
  const list = clone(previous);
  let contents = message.contents;
  if (!contents) {
    contents = message;
  }
  const index = list.findIndex(v => v.id === contents.id);

  if (message.status === 'Timeout' && index >= 0) {
    list.splice(index, 1);
  } else if (index >= 0) {
    list[index] = contents;
  } else {
    list.push(contents);
  }
  if (compare) {
    list.sort(compare);
  }

  return list;
};

export const toList = value => {
  if (value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
};

export function upsert(list, item, comparator) {
  if (!list) {
    return [item];
  }

  if (!item) {
    return list;
  }

  // Default comparator is to match IDs.
  let func = (item, newItem) => item.id === newItem.id;
  if (comparator) {
    func = comparator;
  }

  let placed = false;
  const newList = list.map(i => {
    if (func(i, item)) {
      placed = true;
      return item;
    }
    return i;
  });

  if (!placed) {
    newList.push(item);
  }

  return newList;
}
