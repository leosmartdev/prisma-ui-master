// import { __ } from './i18n';

const SIZE = 64;
const SPACING = 16;
const STROKEWIDTH = 2;
const SYMBOLSIZE = 8;

const makeCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  return { canvas, g: canvas.getContext('2d') };
};

const makePattern = (canvas, g) => g.createPattern(canvas, 'repeat');

/**
 * Creates a solid background of color
 * @param {object} style
 * @param {string} style.fill The color.
 */
export const solid = (style) => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, SIZE, SIZE);
  return makePattern(canvas, g);
};

/**
 * Creates a horizontal pattern of lines.
 * |--------------|
 * |--------------|
 * |--------------|
 * |--------------|
 * |--------------|
 * |--------------|
 * @param {object} style
 * @param {string} style.fill Background color for the fill pattern.
 * @param {string} style.stroke Color for the fill pattern stroke lines.
 */
export const horizontal = (style) => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;

  g.fillRect(0, 0, SIZE, SIZE);
  g.strokeStyle = style.stroke;
  g.lineWidth = STROKEWIDTH;
  g.beginPath();
  for (let i = 0; i <= SIZE; i += SPACING) {
    g.moveTo(0, i);
    g.lineTo(SIZE, i);
  }
  g.stroke();
  return makePattern(canvas, g);
};

/**
 * Creates a vertical pattern of lines.
 * ---------------
 * | | | | | | | |
 * | | | | | | | |
 * | | | | | | | |
 * | | | | | | | |
 * ---------------
 * @param {object} style
 * @param {string} style.fill Background color for the fill pattern.
 * @param {string} style.stroke Color for the fill pattern stroke lines.
 */
export const vertical = (style) => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, SIZE, SIZE);

  g.strokeStyle = style.stroke;
  g.lineWidth = STROKEWIDTH;
  g.beginPath();
  for (let i = 0; i <= SIZE; i += SPACING) {
    g.moveTo(i, 0);
    g.lineTo(i, SIZE);
  }
  g.stroke();
  return makePattern(canvas, g);
};

/**
 * Creates a pattern of slashes.
 * ---------------
 * | / / / / / / |
 * |/ / / / / / /|
 * | / / / / / / |
 * |/ / / / / / /|
 * ---------------
 * @param {object} style
 * @param {string} style.fill Background color for the fill pattern.
 * @param {string} style.stroke Color for the fill pattern stroke lines.
 */
export const slash = (style) => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, SIZE, SIZE);

  g.strokeStyle = style.stroke;
  g.lineWidth = STROKEWIDTH;
  g.beginPath();
  for (let i = 0; i <= SIZE; i += SPACING) {
    g.moveTo(0, i);
    g.lineTo(i, 0);
    g.moveTo(i, SIZE);
    g.lineTo(SIZE, i);
  }
  g.stroke();
  return makePattern(canvas, g);
};

/**
 * Creates a pattern of backslashes slashes.
 * ---------------
 * | \ \ \ \ \ \ |
 * |\ \ \ \ \ \ \|
 * | \ \ \ \ \ \ |
 * |\ \ \ \ \ \ \|
 * ---------------
 * @param {object} style
 * @param {string} style.fill Background color for the fill pattern.
 * @param {string} style.stroke Color for the fill pattern stroke lines.
 */
export const backslash = (style) => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, SIZE, SIZE);

  g.strokeStyle = style.stroke;
  g.lineWidth = STROKEWIDTH;
  g.beginPath();
  for (let i = 0; i <= SIZE; i += SPACING) {
    g.moveTo(0, SIZE - i);
    g.lineTo(i, SIZE);
    g.moveTo(i, 0);
    g.lineTo(SIZE, SIZE - i);
  }
  g.stroke();
  return makePattern(canvas, g);
};

/**
 * Creates a pattern of crosses.
 * ---------------
 * |+ + + + + + +|
 * |+ + + + + + +|
 * |+ + + + + + +|
 * |+ + + + + + +|
 * ---------------
 * @param {object} style
 * @param {string} style.fill Background color for the fill pattern.
 * @param {string} style.stroke Color for the fill pattern stroke lines.
 */
export const cross = (style) => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, SIZE, SIZE);

  g.strokeStyle = style.stroke;
  g.lineWidth = STROKEWIDTH;
  g.beginPath();
  for (let px = 0; px <= SIZE; px += SPACING) {
    for (let py = 0; py <= SIZE; py += SPACING) {
      const x = (py / SPACING) % 2 === 0 ? px : px + (SPACING / 2);
      const y = py;
      g.moveTo(x - (SYMBOLSIZE / 2), y);
      g.lineTo(x + (SYMBOLSIZE / 2), y);
      g.moveTo(x, y - (SYMBOLSIZE / 2));
      g.lineTo(x, y + (SYMBOLSIZE / 2));
    }
  }
  g.stroke();
  return makePattern(canvas, g);
};

/**
 * Creates a pattern of diagonal crosses.
 * ---------------
 * |x x x x x x x|
 * |x x x x x x x|
 * |x x x x x x x|
 * |x x x x x x x|
 * ---------------
 * @param {object} style
 * @param {string} style.fill Background color for the fill pattern.
 * @param {string} style.stroke Color for the fill pattern stroke lines.
 */
export const crossDiagonal = (style) => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, SIZE, SIZE);

  g.strokeStyle = style.stroke;
  g.lineWidth = STROKEWIDTH;
  g.beginPath();
  for (let px = 0; px <= SIZE; px += SPACING) {
    for (let py = 0; py <= SIZE; py += SPACING) {
      const x = (py / SPACING) % 2 === 0 ? px : px + (SPACING / 2);
      const y = py;
      g.moveTo(x - (SYMBOLSIZE / 2), y - (SYMBOLSIZE / 2));
      g.lineTo(x + (SYMBOLSIZE / 2), y + (SYMBOLSIZE / 2));
      g.moveTo(x - (SYMBOLSIZE / 2), y + (SYMBOLSIZE / 2));
      g.lineTo(x + (SYMBOLSIZE / 2), y - (SYMBOLSIZE / 2));
    }
  }
  g.stroke();
  return makePattern(canvas, g);
};

export const table = [
  { id: 'solid', name: 'Solid', renderer: solid },
  { id: 'horiz', name: 'Horizontal lines', renderer: horizontal }, // deprecated
  { id: 'horizontalLines', name: 'Horizontal lines', renderer: horizontal },
  { id: 'vert', name: 'Vertical lines', renderer: vertical }, // deprecated
  { id: 'verticalLines', name: 'Vertical lines', renderer: vertical },
  { id: 'slash', name: 'Slashes', renderer: slash }, // deprecated
  { id: 'slashes', name: 'Slashes', renderer: slash },
  { id: 'backs', name: 'Backslashes', renderer: backslash }, // deprecated
  { id: 'backslashes', name: 'Backslashes', renderer: backslash },
  { id: 'cross', name: 'Crosses', renderer: cross }, // deprecated
  { id: 'crosses', name: 'Crosses', renderer: cross },
  { id: 'diag', name: 'Diagonal crosses', renderer: crossDiagonal }, // deprecated
  { id: 'diagonalCrosses', name: 'Diagonal crosses', renderer: crossDiagonal },
];

/**
 * Gets a fillStyle canvas renderer for the provided pattern ID. See `table` constant above for
 * available patterns.
 *
 * @param {string} id
 * @return {object} { id: string, name: string, renderer: function }
 */
export const getRendererForPattern = (id) => {
  const pattern = table.find(item => item.id === id);
  if (!pattern) {
    throw new Error(`No pattern for id: ${id}`);
  }
  return pattern;
};
