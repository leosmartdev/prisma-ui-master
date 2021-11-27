import {csvToGeoJSON} from './csv'

describe('lib/geo/csv', () => {
  it('parses files with DMS coordinates', () => {
    let data = `
COORDINATES OF SINGAPORE MSRR,,
NO,LATITUDE,LONGITUDE
1,01° 00.00 N,108° 54.00 E
2,01° 00.00 N,108° 30.00 E
3,02° 15.00 N,108° 30.00 E
`
    let result = csvToGeoJSON(data)
    expect(result.features[0].geometry.coordinates).toEqual([[
      [108.9, 1], [108.5, 1], [108.5, 2.25], [108.9, 1],
    ]])
  })

  it('parses files with DD coordinates', () => {
    let data = `
COORDINATES OF SINGAPORE MSRR,,
NO,LATITUDE,LONGITUDE
1,1,108.9
2,1,108.5
3,2.25,108.5
`
    let result = csvToGeoJSON(data)
    expect(result.features[0].geometry.coordinates).toEqual([[
      [108.9, 1], [108.5, 1], [108.5, 2.25], [108.9, 1],
    ]])
  })

  it('parses when header fields are lowercase', () => {
    let data = `
COORDINATES OF SINGAPORE MSRR,,
NO,latitude,longitude
1,01° 00.00 N,108° 54.00 E
2,01° 00.00 N,108° 30.00 E
3,02° 15.00 N,108° 30.00 E
`
    let result = csvToGeoJSON(data)
    expect(result.features[0].geometry.coordinates).toEqual([[
      [108.9, 1], [108.5, 1], [108.5, 2.25], [108.9, 1],
    ]])
  })

  it('throws an exception on an invalid latitude', () => {
    let data = `
COORDINATES OF SINGAPORE MSRR,,
NO,LATITUDE,LONGITUDE
1,1,108.9
2,xxx1,108.5
3,2.25,108.5
`
    expect(() => csvToGeoJSON(data)).toThrow('invalid latitude: xxx1')
  })

  it('throws an exception on an invalid longitude', () => {
    let data = `
COORDINATES OF SINGAPORE MSRR,,
NO,LATITUDE,LONGITUDE
1,1,108.9
2,1,xxx108.5
3,2.25,108.5
`
    expect(() => csvToGeoJSON(data)).toThrow('invalid longitude: xxx108.5')
  })

  it('throws an exception with no headers', () => {
    let data = `
COORDINATES OF SINGAPORE MSRR,,
1,01° 00.00 N,108° 54.00 E
2,01° 00.00 N,108° 30.00 E
3,02° 15.00 N,108° 30.00 E
`
    expect(() => csvToGeoJSON(data)).toThrow('header for LONGITUDE not found')
  })

})
