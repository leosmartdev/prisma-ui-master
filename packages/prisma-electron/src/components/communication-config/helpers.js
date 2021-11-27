/* 127.0.0.1 -> 127.  0.  0.  1 */
export function getIpAddressForEditing(ipAddr) {
  let eachValues = ipAddr.split('.');

  if (eachValues.length == 0) {
    return '  0.  0.  0.  0';
  }

  eachValues = eachValues.map(val => {
    return val.padStart(3);
  });

  return eachValues.join(".");
}

/* 127.  0.  0.  1 -> 127.0.0.1 */
export function getIpAddressForDisplay(ipAddr) {
  let eachValues = ipAddr.split('.');

  eachValues = eachValues.map(val => {
    val = val.trim();

    return parseInt(val);
  });

  return eachValues.join(".");
}