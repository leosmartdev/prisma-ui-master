import React from 'react';

// Create the Map context to allow children to access the map object and call methods on map
export const { Provider, Consumer } = React.createContext(null);
