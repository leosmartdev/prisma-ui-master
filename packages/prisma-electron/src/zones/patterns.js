/* eslint-disable no-mixed-operators */
import { __ } from 'lib/i18n';

const size = 64;
const spacing = 16;
const strokeWidth = 2;
const symbolSize = 8;

const makeCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return { canvas, g: canvas.getContext('2d') };
};

const makePattern = (canvas, g) => g.createPattern(canvas, 'repeat');

export const solid = style => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, size, size);
  return makePattern(canvas, g);
};

export const horizontal = style => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, size, size);

  g.strokeStyle = style.stroke;
  g.lineWidth = strokeWidth;
  g.beginPath();
  for (let i = 0; i <= size; i += spacing) {
    g.moveTo(0, i);
    g.lineTo(size, i);
  }
  g.stroke();
  return makePattern(canvas, g);
};

export const vertical = style => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, size, size);

  g.strokeStyle = style.stroke;
  g.lineWidth = strokeWidth;
  g.beginPath();
  for (let i = 0; i <= size; i += spacing) {
    g.moveTo(i, 0);
    g.lineTo(i, size);
  }
  g.stroke();
  return makePattern(canvas, g);
};

export const slash = style => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, size, size);

  g.strokeStyle = style.stroke;
  g.lineWidth = strokeWidth;
  g.beginPath();
  for (let i = 0; i <= size; i += spacing) {
    g.moveTo(0, i);
    g.lineTo(i, 0);
    g.moveTo(i, size);
    g.lineTo(size, i);
  }
  g.stroke();
  return makePattern(canvas, g);
};

export const backslash = style => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, size, size);

  g.strokeStyle = style.stroke;
  g.lineWidth = strokeWidth;
  g.beginPath();
  for (let i = 0; i <= size; i += spacing) {
    g.moveTo(0, size - i);
    g.lineTo(i, size);
    g.moveTo(i, 0);
    g.lineTo(size, size - i);
  }
  g.stroke();
  return makePattern(canvas, g);
};

export const cross = style => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, size, size);

  g.strokeStyle = style.stroke;
  g.lineWidth = strokeWidth;
  g.beginPath();
  for (let px = 0; px <= size; px += spacing) {
    for (let py = 0; py <= size; py += spacing) {
      const x = (py / spacing) % 2 === 0 ? px : px + spacing / 2;
      const y = py;
      g.moveTo(x - symbolSize / 2, y);
      g.lineTo(x + symbolSize / 2, y);
      g.moveTo(x, y - symbolSize / 2);
      g.lineTo(x, y + symbolSize / 2);
    }
  }
  g.stroke();
  return makePattern(canvas, g);
};

export const crossDiagonal = style => {
  const { canvas, g } = makeCanvas();
  g.fillStyle = style.fill;
  g.fillRect(0, 0, size, size);

  g.strokeStyle = style.stroke;
  g.lineWidth = strokeWidth;
  g.beginPath();
  for (let px = 0; px <= size; px += spacing) {
    for (let py = 0; py <= size; py += spacing) {
      const x = (py / spacing) % 2 === 0 ? px : px + spacing / 2;
      const y = py;
      g.moveTo(x - symbolSize / 2, y - symbolSize / 2);
      g.lineTo(x + symbolSize / 2, y + symbolSize / 2);
      g.moveTo(x - symbolSize / 2, y + symbolSize / 2);
      g.lineTo(x + symbolSize / 2, y - symbolSize / 2);
    }
  }
  g.stroke();
  return makePattern(canvas, g);
};

export const table = [
  { id: 'solid', name: __('Solid'), renderer: solid },
  { id: 'horiz', name: __('Horizontal lines'), renderer: horizontal },
  { id: 'vert', name: __('Vertical lines'), renderer: vertical },
  { id: 'slash', name: __('Slashes'), renderer: slash },
  { id: 'backs', name: __('Backslashes'), renderer: backslash },
  { id: 'cross', name: __('Crosses'), renderer: cross },
  { id: 'diag', name: __('Diagonal crosses'), renderer: crossDiagonal },
];

// Deprecated: Use patternById
export const byId = id => {
  const pattern = table.find(item => item.id === id);
  if (!pattern) {
    throw new Error(`No pattern for id: ${id}`);
  }
  return pattern;
};

export const patternById = byId;
