import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import {
  mapLoadedEpic,
  updateStyleEpic,
  setLayerVisibilityEpic,
} from './epics';
import {
  mapLoaded,
  requestMapStyleUpdate,
  setLayerVisibility,
  setLayerVisible,
  setLayerHidden,
} from './actions';

describe('redux/map/epics', () => {
  let testScheduler = null;
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('mapLoadedEpic', () => {
    it('dispatches setMapStyle() on map load (using rxjs TestScheduler)', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const style = {
          name: 'foo',
        };

        const action$ = hot('-a', {
          a: mapLoaded('foo', style),
        });

        const output$ = mapLoadedEpic(action$);

        expectObservable(output$).toBe('-(abc)', {
          a: {
            type: 'Map/Style/SET',
            payload: {
              mapId: 'foo',
              style,
            },
          },
          b: {
            type: 'Map/SET_LOADED',
            payload: {
              mapId: 'foo',
            },
          },
          c: {
            type: 'Map/Style/REQUEST_UPDATE',
            payload: {
              mapId: 'foo',
            },
          },
        });
      });
    });

    it('dispatches setMapStyle() on map load (using basic of function)', () => {
      const style = {
        name: 'foo',
      };

      const action$ = of(mapLoaded('foo', style));
      const next = jest.fn();

      mapLoadedEpic(action$).subscribe(next);

      expect(next).toHaveBeenCalledWith({
        type: 'Map/Style/SET',
        payload: {
          mapId: 'foo',
          style,
        },
      });
      expect(next).toHaveBeenCalledWith({
        type: 'Map/SET_LOADED',
        payload: {
          mapId: 'foo',
        },
      });
      expect(next).toHaveBeenCalledWith({
        type: 'Map/Style/REQUEST_UPDATE',
        payload: {
          mapId: 'foo',
        },
      });
    });
  });

  describe('updateStyleEpic', () => {
    it('waits 700ms to update style', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        const action$ = hot('^-a', {
          a: {
            type: 'Map/Style/REQUEST_UPDATE',
          },
        });

        const state$ = cold('a', {
          a: {
            '@prisma/map': {
              map: {
                mapIds: ['map1'],
                map1: {
                  loaded: true,
                  style: { layers: [], sources: {} },
                },
              },
              features: {},
              layers: {},
            },
          },
        });

        const output$ = updateStyleEpic(action$, state$);

        expectObservable(output$).toBe('^- 700ms a', {
          a: {
            type: 'Map/Style/SET_GENERATED',
            payload: {
              mapId: 'map1',
              style: expect.any(Object),
            },
          },
        });
      });
    });

    it('batches style updates to a single map update after time', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        const updateAction = { type: 'Map/Style/REQUEST_UPDATE' };
        const action$ = hot('^-a--b 400ms -c', {
          a: updateAction,
          b: updateAction,
          c: updateAction,
        });

        const state$ = cold('a', {
          a: {
            '@prisma/map': {
              map: {
                mapIds: ['map1'],
                map1: {
                  loaded: true,
                  style: { layers: [], sources: {} },
                },
              },
              features: {},
              layers: {},
            },
          },
        });

        const output$ = updateStyleEpic(action$, state$);

        expectObservable(output$).toBe('^- 700ms a', {
          a: {
            type: 'Map/Style/SET_GENERATED',
            payload: {
              mapId: 'map1',
              style: expect.any(Object),
            },
          },
        });
      });
    });

    it('batches updates and after time batches again', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        const updateAction = { type: 'Map/Style/REQUEST_UPDATE' };
        const action$ = hot('^-a--b 697ms -c---d', {
          a: updateAction,
          b: updateAction,
          c: updateAction,
          d: updateAction,
        });

        const state$ = cold('a', {
          a: {
            '@prisma/map': {
              map: {
                mapIds: ['map1'],
                map1: {
                  loaded: true,
                  style: { layers: [], sources: {} },
                },
              },
              features: {},
              layers: {},
            },
          },
        });

        const output$ = updateStyleEpic(action$, state$);

        expectObservable(output$).toBe('^- 700ms a 700ms -a', {
          a: {
            type: 'Map/Style/SET_GENERATED',
            payload: {
              mapId: 'map1',
              style: expect.any(Object),
            },
          },
        });
      });
    });

    it('dispatches once per mapId', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        const action$ = hot('^-a---b', {
          a: { type: 'Map/Style/REQUEST_UPDATE' },
          b: { type: 'Map/Style/REQUEST_UPDATE' },
        });

        const state$ = cold('a', {
          a: {
            '@prisma/map': {
              map: {
                mapIds: ['map1', 'map2', 'map3'],
                map1: {
                  loaded: true,
                  style: { layers: [], sources: {} },
                },
                map2: {
                  loaded: true,
                  style: { layers: [], sources: {} },
                },
                map3: {
                  loaded: true,
                  style: { layers: [], sources: {} },
                },
              },
              features: {},
              layers: {},
            },
          },
        });

        const output$ = updateStyleEpic(action$, state$);

        expectObservable(output$).toBe('^- 700ms (abc)', {
          a: {
            type: 'Map/Style/SET_GENERATED',
            payload: {
              mapId: 'map1',
              style: expect.any(Object),
            },
          },
          b: {
            type: 'Map/Style/SET_GENERATED',
            payload: {
              mapId: 'map2',
              style: expect.any(Object),
            },
          },
          c: {
            type: 'Map/Style/SET_GENERATED',
            payload: {
              mapId: 'map3',
              style: expect.any(Object),
            },
          },
        });
      });
    });

    it('only generated styles for loaded maps', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        const action$ = hot('^-a---b', {
          a: { type: 'Map/Style/REQUEST_UPDATE' },
          b: { type: 'Map/Style/REQUEST_UPDATE' },
        });

        const state$ = cold('a', {
          a: {
            '@prisma/map': {
              map: {
                mapIds: ['map1', 'map2', 'map3'],
                map1: {
                  loaded: true,
                  style: { layers: [], sources: {} },
                },
                map2: {
                  loaded: false,
                  style: { layers: [], sources: {} },
                },
                map3: {
                  loaded: true,
                  style: { layers: [], sources: {} },
                },
              },
              features: {},
              layers: {},
            },
          },
        });

        const output$ = updateStyleEpic(action$, state$);

        expectObservable(output$).toBe('^- 700ms (ab)', {
          a: {
            type: 'Map/Style/SET_GENERATED',
            payload: {
              mapId: 'map1',
              style: expect.any(Object),
            },
          },
          b: {
            type: 'Map/Style/SET_GENERATED',
            payload: {
              mapId: 'map3',
              style: expect.any(Object),
            },
          },
        });
      });
    });
  });

  describe('setLayerVisibilityEpic', () => {
    it('dispatches requestMapUpdate() on setLayerVisible', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: setLayerVisible('map1', 'layer1'),
        });

        const output$ = setLayerVisibilityEpic(action$);

        expectObservable(output$).toBe('-(ab)', {
          a: setLayerVisibility('map1', 'layer1', true),
          b: requestMapStyleUpdate('map1'),
        });
      });
    });

    it('dispatches requestMapUpdate() on setLayerHidden', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: setLayerHidden('map1', 'layer1'),
        });

        const output$ = setLayerVisibilityEpic(action$);

        expectObservable(output$).toBe('-(ab)', {
          a: setLayerVisibility('map1', 'layer1', false),
          b: requestMapStyleUpdate('map1'),
        });
      });
    });
  });
});
