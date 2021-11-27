export const getLookup = props => {
  if (props.registryId) {
    return { id: props.registryId, type: 'registry' };
  }

  if (props.trackId) {
    return { id: props.trackId, type: 'track' };
  }

  if (props.type == 'Marker' || props.markerId) {
    return { id: props.id, type: 'marker' };
  }

  if (props.id) {
    return { id: props.id, type: 'track' };
  }
  return { id: props.databaseId, type: props.type };
};

export const getPositionLookup = props => {
  if (props.historical) {
    return { id: props.databaseId, type: 'history' };
  }
  return getLookup(props);
};
