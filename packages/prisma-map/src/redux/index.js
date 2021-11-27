import { combineReducers } from 'redux';
import features, { epics as featureEpics } from './features';
import historicalFeatures from './historicalFeatures';
import layers from './layers';
import map, { epics as styleEpics } from './map';

export default function init(store) {
  const reducer = combineReducers({
    features,
    historicalFeatures,
    layers,
    map,
  });

  store.addReducer('@prisma/map', reducer);
  styleEpics.forEach(epic => store.addEpic(epic));
  featureEpics.forEach(epic => store.addEpic(epic));
}
