import {
  getRendererForPattern,
  backslash,
  horizontal,
  vertical,
  slash,
  cross,
  crossDiagonal,
} from './build-patterns';

describe('ShapeStylePreview/build-patterns', () => {
  let contextMock = {};
  let canvasMock = {};

  beforeEach(() => {
    contextMock = {
      createPattern: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
    };

    canvasMock = {
      getContext: () => contextMock,
    };

    document.createElement = jest.fn(() => canvasMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRendererForPattern(id)', () => {
    it('returns correct renderer', () => {
      let renderer = {};
      expect(() => {
        renderer = getRendererForPattern('backslashes');
      }).not.toThrow(new Error('No pattern for id: foo'));

      expect(renderer).toEqual({
        id: 'backslashes',
        name: 'Backslashes',
        renderer: backslash,
      });
    });

    it('throws exception when id is invalid', () => {
      expect(() => {
        getRendererForPattern('foo');
      }).toThrow(new Error('No pattern for id: foo'));
    });
  });

  describe('horizontalLines()', () => {
    it('calls correct canvas functions for horizontal lines', () => {
      horizontal({
        fill: '#123456',
        stroke: '#654321',
      });

      expect(contextMock.fillRect).toHaveBeenCalledWith(0, 0, 64, 64);
      expect(contextMock.beginPath).toHaveBeenCalledWith();
      expect(contextMock.moveTo).toHaveBeenCalledTimes(5);
      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 16);
      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 32);
      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 48);
      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 64);
      expect(contextMock.lineTo).toHaveBeenCalledTimes(5);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 0);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 16);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 32);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 48);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 64);
      expect(contextMock.stroke).toHaveBeenCalledWith();
      expect(contextMock.createPattern).toHaveBeenCalled();

      expect(contextMock.fillStyle).toEqual('#123456');
      expect(contextMock.strokeStyle).toEqual('#654321');
      expect(contextMock.lineWidth).toEqual(2);
    });
  });

  describe('verticalLines()', () => {
    it('calls correct canvas functions for vertical lines', () => {
      vertical({
        fill: '#123456',
        stroke: '#654321',
      });

      expect(contextMock.fillRect).toHaveBeenCalledWith(0, 0, 64, 64);
      expect(contextMock.beginPath).toHaveBeenCalledWith();
      expect(contextMock.moveTo).toHaveBeenCalledTimes(5);
      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(16, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(32, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(48, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(64, 0);
      expect(contextMock.lineTo).toHaveBeenCalledTimes(5);
      expect(contextMock.lineTo).toHaveBeenCalledWith(0, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(16, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(32, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(48, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 64);
      expect(contextMock.stroke).toHaveBeenCalledWith();
      expect(contextMock.createPattern).toHaveBeenCalled();

      expect(contextMock.fillStyle).toEqual('#123456');
      expect(contextMock.strokeStyle).toEqual('#654321');
      expect(contextMock.lineWidth).toEqual(2);
    });
  });

  describe('slash()', () => {
    it('calls correct canvas functions for slash', () => {
      slash({
        fill: '#123456',
        stroke: '#654321',
      });

      expect(contextMock.fillRect).toHaveBeenCalledWith(0, 0, 64, 64);
      expect(contextMock.beginPath).toHaveBeenCalledWith();
      expect(contextMock.moveTo).toHaveBeenCalledTimes(10);
      expect(contextMock.lineTo).toHaveBeenCalledTimes(10);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 0);
      expect(contextMock.lineTo).toHaveBeenCalledWith(0, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 0);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 16);
      expect(contextMock.lineTo).toHaveBeenCalledWith(16, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(16, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 16);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 32);
      expect(contextMock.lineTo).toHaveBeenCalledWith(32, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(32, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 32);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 48);
      expect(contextMock.lineTo).toHaveBeenCalledWith(48, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(48, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 48);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 0);
      expect(contextMock.moveTo).toHaveBeenCalledWith(64, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 64);

      expect(contextMock.stroke).toHaveBeenCalledWith();
      expect(contextMock.createPattern).toHaveBeenCalled();

      expect(contextMock.fillStyle).toEqual('#123456');
      expect(contextMock.strokeStyle).toEqual('#654321');
      expect(contextMock.lineWidth).toEqual(2);
    });
  });

  describe('backslash()', () => {
    it('calls correct canvas functions for backslash', () => {
      backslash({
        fill: '#123456',
        stroke: '#654321',
      });

      expect(contextMock.fillRect).toHaveBeenCalledWith(0, 0, 64, 64);
      expect(contextMock.beginPath).toHaveBeenCalledWith();
      expect(contextMock.moveTo).toHaveBeenCalledTimes(10);
      expect(contextMock.lineTo).toHaveBeenCalledTimes(10);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 64);
      expect(contextMock.lineTo).toHaveBeenCalledWith(0, 64);
      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 0);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 64);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 48);
      expect(contextMock.lineTo).toHaveBeenCalledWith(16, 64);
      expect(contextMock.moveTo).toHaveBeenCalledWith(16, 0);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 48);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 32);
      expect(contextMock.lineTo).toHaveBeenCalledWith(32, 64);
      expect(contextMock.moveTo).toHaveBeenCalledWith(32, 0);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 32);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 16);
      expect(contextMock.lineTo).toHaveBeenCalledWith(48, 64);
      expect(contextMock.moveTo).toHaveBeenCalledWith(48, 0);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 16);

      expect(contextMock.moveTo).toHaveBeenCalledWith(0, 0);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 64);
      expect(contextMock.moveTo).toHaveBeenCalledWith(64, 0);
      expect(contextMock.lineTo).toHaveBeenCalledWith(64, 0);

      expect(contextMock.stroke).toHaveBeenCalledWith();
      expect(contextMock.createPattern).toHaveBeenCalled();

      expect(contextMock.fillStyle).toEqual('#123456');
      expect(contextMock.strokeStyle).toEqual('#654321');
      expect(contextMock.lineWidth).toEqual(2);
    });
  });
  describe('cross()', () => {
    it('calls correct canvas functions for cross', () => {
      cross({
        fill: '#123456',
        stroke: '#654321',
      });

      expect(contextMock.fillRect).toHaveBeenCalledWith(0, 0, 64, 64);
      expect(contextMock.beginPath).toHaveBeenCalledWith();
      expect(contextMock.moveTo).toHaveBeenCalledTimes(50);
      expect(contextMock.lineTo).toHaveBeenCalledTimes(50);

      expect(contextMock.stroke).toHaveBeenCalledWith();
      expect(contextMock.createPattern).toHaveBeenCalled();

      expect(contextMock.fillStyle).toEqual('#123456');
      expect(contextMock.strokeStyle).toEqual('#654321');
      expect(contextMock.lineWidth).toEqual(2);
    });
  });

  describe('crossDiagonal()', () => {
    it('calls correct canvas functions for crossDiagonal', () => {
      crossDiagonal({
        fill: '#123456',
        stroke: '#654321',
      });

      expect(contextMock.fillRect).toHaveBeenCalledWith(0, 0, 64, 64);
      expect(contextMock.beginPath).toHaveBeenCalledWith();
      expect(contextMock.moveTo).toHaveBeenCalledTimes(50);
      expect(contextMock.lineTo).toHaveBeenCalledTimes(50);

      expect(contextMock.stroke).toHaveBeenCalledWith();
      expect(contextMock.createPattern).toHaveBeenCalled();

      expect(contextMock.fillStyle).toEqual('#123456');
      expect(contextMock.strokeStyle).toEqual('#654321');
      expect(contextMock.lineWidth).toEqual(2);
    });
  });
});
