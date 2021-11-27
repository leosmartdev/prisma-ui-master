import ConnectedMap from './ConnectedMap';
import ConnectedMapDefault from './';

describe('index.js exports', () => {
  it('imports ConnectedMap from index.js same as direct import', () => {
    expect(ConnectedMap).toBe(ConnectedMapDefault);
  });
});
