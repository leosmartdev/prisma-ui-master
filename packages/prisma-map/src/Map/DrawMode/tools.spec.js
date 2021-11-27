import { convertModeToTool, convertToolToMode } from './tools';

describe('Map/DrawMode/tools', () => {
  describe('convertModeToTool(mode)', () => {
    it('returns correct tool for draw_line_string', () => {
      expect(convertModeToTool('draw_line_string')).toEqual('line');
    });

    it('returns correct tool for draw_polygon', () => {
      expect(convertModeToTool('draw_polygon')).toEqual('polygon');
    });

    it('returns correct tool for draw_point', () => {
      expect(convertModeToTool('draw_point')).toEqual('point');
    });

    it('returns correct tool for simple_select', () => {
      expect(convertModeToTool('simple_select')).toEqual('select');
    });

    it('returns correct tool for direct_select', () => {
      expect(convertModeToTool('direct_select')).toEqual('select');
    });

    it('returns select as deault', () => {
      expect(convertModeToTool()).toEqual('select');
    });

    it('returns select when invalid mode is passed', () => {
      expect(convertModeToTool('foo')).toEqual('select');
    });
  });

  describe('convertToolToMode(tool)', () => {
    it('returns correct tool for draw_line_string', () => {
      expect(convertToolToMode('line')).toEqual('draw_line_string');
    });

    it('returns correct mode for polygon', () => {
      expect(convertToolToMode('polygon')).toEqual('draw_polygon');
    });

    it('returns correct mode for point', () => {
      expect(convertToolToMode('point')).toEqual('draw_point');
    });

    it('returns correct mode for select', () => {
      expect(convertToolToMode('select')).toEqual('simple_select');
    });

    it('returns simple_select as deault', () => {
      expect(convertToolToMode()).toEqual('simple_select');
    });

    it('returns simple_select when invalid tool is passed', () => {
      expect(convertToolToMode('foo')).toEqual('simple_select');
    });
  });
});
