import Papa from 'papaparse'
import { parseDms } from 'dms-conversion'

export function csvToGeoJSON(text, options) {
  options = options || {}
  let lonFieldName = options.longitudeColumn || 'LONGITUDE'
  let latFieldName = options.latitudeColumn || 'LATITUDE'

  let inData = false
  let lonField = -1
  let latField = -1
  let coords = []

  let result = Papa.parse(text, {skipEmptyLines: true})
  for (let fields of result.data) {
    if (!inData) {
      for (let i = 0; i < fields.length; i++) {
        let f = fields[i]
        if (f) {
          f = f.trim().toUpperCase()
        }
        if (f === lonFieldName.toUpperCase()) {
          lonField = i
        }
        if (f === latFieldName.toUpperCase()) {
          latField = i
        }
      }
      if (lonField >= 0 && latField >= 0) {
        inData = true
      }
    }
    else {
      if (lonField >= fields.length) {
        continue
      }
      if (latField >= fields.length) {
        continue
      }
      let strlon = fields[lonField].trim()
      let strlat = fields[latField].trim()

      let lat = parseDms(strlat)
      if (Number.isNaN(lat)) {
        lat = Number.parseFloat(+lat)
        if (Number.isNaN(lat)) {
          throw new Error(`invalid latitude: ${strlat}`)
        }
      }

      let lon = parseDms(strlon)
      if (Number.isNaN(lon)) {
        lon = Number.parseFloat(+lon)
        if (Number.isNaN(lon)) {
          throw new Error(`invalid longitude: ${strlon}`)
        }
      }
      coords.push([lon, lat])
    }
  }
  if (lonField < 0) {
    throw new Error(`header for ${lonFieldName} not found`)
  }
  if (latField < 0) {
    throw new Error(`header for ${latFieldName} not found`)
  }

  // ensure that the last point is also the first point
  let first = coords[0]
  let last = coords[coords.length - 1]
  if (first[0] !== last[0] || first[0] !== last[1]) {
    coords.push(first)
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coords]
        },
        properties: {}
      }
    ]
  }
}

