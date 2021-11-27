import init from './index';

describe('redux init()', () => {
  it('registers reducers', () => {
    const store = {
      addReducer: jest.fn(),
      addEpic: jest.fn(),
    };

    init(store);

    expect(store.addReducer).toHaveBeenCalledWith('@prisma/map', expect.any(Function));
    expect(store.addEpic).toHaveBeenCalledTimes(7);
  });
});
