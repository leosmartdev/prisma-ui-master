// Crud operations for features that users can dispatch.
export const ADD_FEATURE = 'Map/Feature/ADD';
export const TIMEOUT_FEATURE = 'Map/Feature/TIMEOUT';
export const LEFT_GEO_RANGE = 'Map/Feature/LEFT_GEO_RANGE';

// Internal actions to be emitted from epics as result of above actions.
export const UPSERT_FEATURE = 'Map/Feature/UPSERT';
export const REMOVE_FEATURE = 'Map/Feature/REMOVE';
