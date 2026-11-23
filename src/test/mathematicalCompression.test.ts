import { describe, it, expect } from 'vitest';
import { compressCanvasToTargetSize, canvasToBlob } from '../engine/compressor';
import { validateDocument } from '../engine/validator';
import { DocumentSpec } from '../types';

describe('Mathematical Compression & Constraint Engine', () => {
  // Helper to create test canvas
  function createTestCanvas(width: number, height: number, pattern: 'gradient' | 'flat' | 'dense' = 'gradient'): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    if (pattern === 'flat') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    } else if (pattern === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1F352E');
      grad.addColorStop(0.5, '#FAF9F6');
      grad.addColorStop(1, '#8C938D');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Dense pattern with high entropy
      for (let x = 0; x < width; x += 10) {
        for (let y = 0; y < height; y += 10) {
          ctx.fillStyle = (x + y) % 20 === 0 ? '#111111' : '#EEEEEE';
          ctx.fillRect(x, y, 10, 10);
        }
      }
    }
    return canvas;
  }

  describe('1. Maximum-Only vs Min-to-Max File Size Constraints', () => {
    it('handles maximum-only constraint (minSizeKb = 0, maxSizeKb = 50)', async () => {
      const canvas = createTestCanvas(400, 400, 'flat');
      const result = await compressCanvasToTargetSize(canvas, {
        minSizeKb: 0,
        maxSizeKb: 50,
        format: 'image/jpeg'
      });

      expect(result.sizeBytes).toBeLessThanOrEqual(50 * 1024);
      expect(result.satisfiesMax).toBe(true);
      expect(result.satisfiesMin).toBe(true);
      expect(result.sizeBytes).toBe(result.blob.size);
    });

    it('handles strict min-to-max range constraint (e.g. 20 KB to 50 KB)', async () => {
      const canvas = createTestCanvas(600, 800, 'gradient');
      const result = await compressCanvasToTargetSize(canvas, {
        minSizeKb: 20,
        maxSizeKb: 50,
        format: 'image/jpeg',
        minWidth: 300,
        minHeight: 400
      });

      expect(result.sizeBytes).toBeLessThanOrEqual(50 * 1024);
      expect(result.sizeBytes).toBeGreaterThanOrEqual(20 * 1024);
      expect(result.satisfiesMin).toBe(true);
      expect(result.satisfiesMax).toBe(true);
      expect(result.sizeBytes).toBe(result.blob.size);
    });
  });

  describe('2. Extreme Input Image Geometries & Sizes', () => {
    it('handles very small input images (e.g. 60 × 60 px)', async () => {
      const tinyCanvas = createTestCanvas(60, 60, 'flat');
      const result = await compressCanvasToTargetSize(tinyCanvas, {
        minSizeKb: 1,
        maxSizeKb: 30,
        format: 'image/jpeg',
        minWidth: 50,
        minHeight: 50
      });

      expect(result.width).toBe(60);
      expect(result.height).toBe(60);
      expect(result.sizeBytes).toBe(result.blob.size);
      expect(result.sizeBytes).toBeLessThanOrEqual(30 * 1024);
    });

    it('handles very large input images (e.g. 3000 × 4000 px)', async () => {
      const largeCanvas = createTestCanvas(3000, 4000, 'gradient');
      const result = await compressCanvasToTargetSize(largeCanvas, {
        minSizeKb: 50,
        maxSizeKb: 200,
        format: 'image/jpeg',
        minWidth: 600,
        minHeight: 800,
        allowDimensionScaling: true
      });

      expect(result.sizeBytes).toBeLessThanOrEqual(200 * 1024);
      expect(result.satisfiesMax).toBe(true);
      // Dimensions should maintain 3:4 aspect ratio
      const finalAspect = result.width / result.height;
      expect(finalAspect).toBeCloseTo(3000 / 4000, 2);
    });
  });

  describe('3. Multi-Format Handling (JPEG, PNG, WebP)', () => {
    it('compresses JPEG with binary search quality refinement', async () => {
      const canvas = createTestCanvas(800, 1000, 'gradient');
      const result = await compressCanvasToTargetSize(canvas, {
        minSizeKb: 20,
        maxSizeKb: 80,
        format: 'image/jpeg'
      });

      expect(result.blob.type).toBe('image/jpeg');
      expect(result.quality).toBeGreaterThanOrEqual(0.05);
      expect(result.quality).toBeLessThanOrEqual(0.99);
      expect(result.sizeBytes).toBeLessThanOrEqual(80 * 1024);
    });

    it('compresses PNG with dimensional downscaling when exceeding bounds', async () => {
      const canvas = createTestCanvas(800, 1000, 'dense');
      const result = await compressCanvasToTargetSize(canvas, {
        minSizeKb: 5,
        maxSizeKb: 100,
        format: 'image/png',
        allowDimensionScaling: true,
        minWidth: 300,
        minHeight: 375
      });

      expect(result.blob.type).toBe('image/png');
      expect(result.sizeBytes).toBeLessThanOrEqual(100 * 1024);
      expect(result.satisfiesMax).toBe(true);
    });
  });

  describe('4. Failure Reporting & Unsatisfiable Constraints', () => {
    it('clearly explains when constraints cannot be satisfied', async () => {
      // Impossible constraint: Dense 2000x2000 PNG with strict 5KB ceiling and no dimension scaling
      const canvas = createTestCanvas(2000, 2000, 'dense');
      const result = await compressCanvasToTargetSize(canvas, {
        minSizeKb: 1,
        maxSizeKb: 2, // 2 KB is impossible for 2000x2000 PNG without downscaling
        format: 'image/png',
        allowDimensionScaling: false
      });

      expect(result.satisfiesMax).toBe(false);
      expect(result.explanation).toBeDefined();
      expect(result.explanation).toContain('exceeds the maximum limit');
    });

    it('validator strictly rejects outputs violating any constraint', () => {
      const spec: DocumentSpec = {
        minWidth: 400,
        maxWidth: 400,
        minHeight: 400,
        maxHeight: 400,
        exactWidth: 400,
        exactHeight: 400,
        aspectRatio: 1,
        aspectRatioLabel: '1:1',
        minSizeKb: 20,
        maxSizeKb: 50,
        formats: ['image/jpeg'],
        background: 'White',
        specialInstructions: []
      };

      // Case A: Size 1 byte over max
      const overMax = {
        width: 400,
        height: 400,
        sizeKb: 50.01,
        sizeBytes: 50 * 1024 + 1,
        format: 'image/jpeg' as const
      };
      const resA = validateDocument(overMax, spec);
      expect(resA.passed).toBe(false);

      // Case B: Size 1 byte below min
      const underMin = {
        width: 400,
        height: 400,
        sizeKb: 19.99,
        sizeBytes: 20 * 1024 - 1,
        format: 'image/jpeg' as const
      };
      const resB = validateDocument(underMin, spec);
      expect(resB.passed).toBe(false);

      // Case C: 1 pixel off in dimensions
      const wrongDim = {
        width: 401,
        height: 400,
        sizeKb: 35,
        sizeBytes: 35840,
        format: 'image/jpeg' as const
      };
      const resC = validateDocument(wrongDim, spec);
      expect(resC.passed).toBe(false);
    });
  });
});
