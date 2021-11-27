import ShapeStylePreview from './ShapeStylePreview';
import ShapeStylePreviewDefaultExport from './index';

describe('ShapeStylePreview/index', () => {
  it('exportes ShapeStylePreview component as default', () => {
    expect(ShapeStylePreview).toBe(ShapeStylePreviewDefaultExport);
  });
});
