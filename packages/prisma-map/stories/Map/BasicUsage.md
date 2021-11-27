# Map Component

The Map component is a lightweight wrapper around the Uber `react-map-gl/ReactMapGL` component.
We provided a few new capabilites that fit within the Prisma use cases as well as providing
a layer of abstraction around mapbox so if we need to change engines in the future you only
have to change the import of the `Map` component not the interface itself.

We however, have decided on the Mapbox API for most of our interactions with the map. The use of
JSON is declarative and clean, as well as easily convertable to other mapping engines when needed.
This means, if you are used to the Mapbox way of doing things, our API will be almost identical.

There are a few minor changes and features that we will be adding to our API, and most of them
are related to moving features into Redux so we can dispatch map actions, as well as custom tools
like the measure and zones tools that utilize the map. 
