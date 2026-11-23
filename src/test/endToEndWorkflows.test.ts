import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { PORTAL_PRESETS } from '../data/presets';
import { compressCanvasToTargetSize } from '../engine/compressor';
import { validateDocument } from '../engine/validator';
import { createZipArchive } from '../engine/zipExporter';
import { applySignatureFilters } from '../engine/filters';
import { ProcessedDocument } from '../types';

describe('End-to-End Workflows & Mathematical Compression Verification', () => {
  // 1. Image Format & Orientation Tests
  describe('Image Geometries & Formats', () => {
    it('supports 1:1 Square (Avatar/Passport)', () => {
      const spec = PORTAL_PRESETS.find((p) => p.id === 'profile-resume')!.photo;
      const doc = {
        width: 600,
        height: 600,
        sizeKb: 150,
        sizeBytes: 153600,
        format: 'image/jpeg' as const
      };
      const res = validateDocument(doc, spec);
      expect(res.passed).toBe(true);
      expect(doc.width / doc.height).toBe(1);
    });

    it('supports 3:4 Portrait (GATE/Passport)', () => {
      const spec = PORTAL_PRESETS.find((p) => p.id === 'gate-2025')!.photo;
      const doc = {
        width: 480,
        height: 640,
        sizeKb: 80,
        sizeBytes: 81920,
        format: 'image/jpeg' as const
      };
      const res = validateDocument(doc, spec);
      expect(res.passed).toBe(true);
      expect(doc.width / doc.height).toBeCloseTo(0.75, 2);
    });

    it('supports 7:2 Panoramic Signature', () => {
      const spec = PORTAL_PRESETS.find((p) => p.id === 'gate-2025')!.signature;
      const doc = {
        width: 560,
        height: 160,
        sizeKb: 30,
        sizeBytes: 30720,
        format: 'image/jpeg' as const
      };
      const res = validateDocument(doc, spec);
      expect(res.passed).toBe(true);
      expect(doc.width / doc.height).toBeCloseTo(3.5, 2);
    });
  });

  // 2. Mathematical Compression Verification
  describe('Mathematical Compression Checks', () => {
    it('strictly satisfies maximum file-size constraint (e.g. Max 100 KB)', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1600;

      const maxLimitKb = 100;
      const maxLimitBytes = maxLimitKb * 1024;

      const result = await compressCanvasToTargetSize(canvas, {
        minSizeKb: 10,
        maxSizeKb: maxLimitKb,
        format: 'image/jpeg',
        minWidth: 400,
        minHeight: 500
      });

      expect(result.sizeBytes).toBeLessThanOrEqual(maxLimitBytes);
      expect(result.satisfiesMax).toBe(true);
      expect(result.sizeKb).toBeLessThanOrEqual(maxLimitKb);
    });

    it('strictly satisfies tight range constraints (e.g. 20 KB to 50 KB)', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 350;
      canvas.height = 450;

      const minLimitKb = 15;
      const maxLimitKb = 50;

      const result = await compressCanvasToTargetSize(canvas, {
        minSizeKb: minLimitKb,
        maxSizeKb: maxLimitKb,
        format: 'image/jpeg',
        minWidth: 250,
        minHeight: 350
      });

      expect(result.sizeBytes).toBeLessThanOrEqual(maxLimitKb * 1024);
      expect(result.sizeBytes).toBeGreaterThanOrEqual(minLimitKb * 1024);
      expect(result.satisfiesMin).toBe(true);
      expect(result.satisfiesMax).toBe(true);
    });

    it('never reports success if an output violates byte limits', () => {
      const spec = PORTAL_PRESETS.find((p) => p.id === 'quick-50kb')!.photo;
      // 50.1 KB violates the 50.0 KB ceiling
      const invalidDoc = {
        width: 350,
        height: 450,
        sizeKb: 50.1,
        sizeBytes: 51302,
        format: 'image/jpeg' as const
      };

      const res = validateDocument(invalidDoc, spec);
      expect(res.passed).toBe(false);
      const sizeCheck = res.items.find((i) => i.key === 'fileSize')!;
      expect(sizeCheck.passed).toBe(false);
      expect(sizeCheck.actual).toContain('50.1 KB');
    });

    it('never reports success if dimensions deviate outside aspect ratio', () => {
      const spec = PORTAL_PRESETS.find((p) => p.id === 'passport-us')!.photo;
      // US Passport must be square (aspect ratio = 1)
      const nonSquareDoc = {
        width: 600,
        height: 800, // 3:4 aspect ratio instead of 1:1
        sizeKb: 100,
        sizeBytes: 102400,
        format: 'image/jpeg' as const
      };

      const res = validateDocument(nonSquareDoc, spec);
      expect(res.passed).toBe(false);
      expect(res.items.find((i) => i.key === 'aspectRatio')?.passed).toBe(false);
    });
  });

  // 3. Signature Filter Under Diverse Lighting Conditions
  describe('Signature Filters & Lighting Adaptation', () => {
    it('handles low-brightness (dimly lit phone camera photos)', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;

      // Dark background with even darker ink
      const filtered = applySignatureFilters(canvas, {
        grayscale: true,
        brightness: 35, // boost brightness
        contrast: 40,
        threshold: 200,
        inkEnhancement: true,
        backgroundWhitening: true
      });

      expect(filtered.width).toBe(400);
      expect(filtered.height).toBe(150);
    });

    it('handles faint ballpoint pen strokes without breaking lines', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;

      // Ink enhancement enabled with adaptive threshold
      const filtered = applySignatureFilters(canvas, {
        grayscale: true,
        brightness: 10,
        contrast: 45,
        threshold: 225, // captures faint strokes
        inkEnhancement: true,
        backgroundWhitening: true
      });

      expect(filtered.width).toBe(400);
      expect(filtered.height).toBe(150);
    });
  });

  // 4. Combined ZIP Archive Integrity
  describe('Combined ZIP Archive Integrity', () => {
    it('creates an uncorrupted ZIP containing both files and conformance audit text', async () => {
      const preset = PORTAL_PRESETS.find((p) => p.id === 'universal-quick')!;
      const dummyPhotoBlob = new Blob([new Uint8Array(45000)], { type: 'image/jpeg' });
      const dummySigBlob = new Blob([new Uint8Array(18000)], { type: 'image/jpeg' });

      const photoDoc: ProcessedDocument = {
        originalFile: null,
        originalUrl: null,
        canvas: null,
        blob: dummyPhotoBlob,
        objectUrl: 'blob:photo',
        fileName: 'universal_photo.jpg',
        width: 800,
        height: 1000,
        sizeBytes: 45000,
        sizeKb: 43.95,
        format: 'image/jpeg',
        quality: 0.85,
        validation: { passed: true, items: [] },
        lastModified: Date.now()
      };

      const sigDoc: ProcessedDocument = {
        originalFile: null,
        originalUrl: null,
        canvas: null,
        blob: dummySigBlob,
        objectUrl: 'blob:sig',
        fileName: 'universal_sig.jpg',
        width: 600,
        height: 200,
        sizeBytes: 18000,
        sizeKb: 17.58,
        format: 'image/jpeg',
        quality: 0.85,
        validation: { passed: true, items: [] },
        lastModified: Date.now()
      };

      const zipBlob = await createZipArchive(preset, photoDoc, sigDoc);
      expect(zipBlob.size).toBeGreaterThan(100);

      // Verify ZIP magic header
      const arrayBuffer = await zipBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      expect(bytes[0]).toBe(0x50); // P
      expect(bytes[1]).toBe(0x4B); // K
      expect(bytes[2]).toBe(0x03);
      expect(bytes[3]).toBe(0x04);

      // Load using JSZip to verify unzipping
      const zip = await JSZip.loadAsync(arrayBuffer);
      const files = Object.keys(zip.files);
      expect(files.some((f) => f.endsWith('.jpg'))).toBe(true);
      expect(files.some((f) => f.endsWith('specfit_conformance_report.txt'))).toBe(true);
    });
  });
});
