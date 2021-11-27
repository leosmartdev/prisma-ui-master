/**
 * 
 * @param {object} color => {r, g, b}
 * @returns {string} hex_color
 * ie.
 * rgba2hex(0, 255, 0) returns #00ff00
 */
export function rgb2hex(color) {
  let hex =
    (color.r | 1 << 8).toString(16).slice(1) +
    (color.g | 1 << 8).toString(16).slice(1) +
    (color.b | 1 << 8).toString(16).slice(1);

  let result = `#${hex}`;

  return result;
}