import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { PORTAL_PRESETS } from '../data/presets';
import { compressCanvasToTargetSize } from '../engine/compressor';
import { validateDocument } from '../engine/validator';
import { createZipArchive } from '../engine/zipExporter';
import { applySignatureFilters } from '../engine/filters';
import { ProcessedDocument } from '../types';

describe('Production Readiness Audit Suite', () => {
  // 1. Audit Presets and Citations
  describe('Portal Specifications & Citation Integrity', () => {
    it('all presets must have non-empty source authority, valid verification dates, and valid ranges', () => {
      PORTAL_PRESETS.forEach((preset) => {
        expect(preset.name.length).toBeGreaterThan(3);
        expect(preset.code.length).toBeGreaterThan(1);
        expect(preset.sourceAuthority.length).toBeGreaterThan(3);
        expect(preset.lastVerifiedDate.length).toBeGreaterThan(3);

        // Photo bounds
        expect(preset.photo.minSizeKb).toBeGreaterThanOrEqual(1);
        expect(preset.photo.maxSizeKb).toBeGreaterThan(preset.photo.minSizeKb);
        expect(preset.photo.minWidth).toBeGreaterThanOrEqual(100);
        expect(preset.photo.minHeight).toBeGreaterThanOrEqual(100);
        expect(preset.photo.aspectRatio).toBeGreaterThan(0);

        // Signature bounds
        expect(preset.signature.minSizeKb).toBeGreaterThanOrEqual(1);
        expect(preset.signature.maxSizeKb).toBeGreaterThan(preset.signature.minSizeKb);
        expect(preset.signature.minWidth).toBeGreaterThanOrEqual(50);
        expect(preset.signature.minHeight).toBeGreaterThanOrEqual(30);
        expect(preset.signature.aspectRatio).toBeGreaterThan(0);
      });
    });
  });

  // 2. Audit Image Processing & Filter Safety
  describe('Image Processing & Signature Filter Safety', () => {
    it('signature filter should not throw and should output valid canvas dimensions', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d')!;

      // Draw mock signature lines
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 400, 150);
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, 75);
      ctx.lineTo(350, 75);
      ctx.stroke();

      const filtered = applySignatureFilters(canvas, {
        grayscale: true,
        brightness: 10,
        contrast: 30,
        threshold: 210,
        inkEnhancement: true,
        backgroundWhitening: true
      });

      expect(filtered.width).toBe(400);
      expect(filtered.height).toBe(150);
    });
  });

  // 3. Audit Adaptive Compression
  describe('Adaptive Compression Engine', () => {
    it('should iteratively compress a canvas to meet byte constraints', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 800;
      const ctx = canvas.getContext('2d')!;

      // Fill canvas with visual data
      ctx.fillStyle = '#E0E5E0';
      ctx.fillRect(0, 0, 600, 800);
      ctx.fillStyle = '#263B35';
      ctx.beginPath();
      ctx.arc(300, 400, 150, 0, Math.PI * 2);
      ctx.fill();

      // Target 10 KB to 100 KB
      const result = await compressCanvasToTargetSize(canvas, {
        minSizeKb: 10,
        maxSizeKb: 100,
        format: 'image/jpeg',
        minWidth: 300,
        minHeight: 400
      });

      expect(result.sizeBytes).toBeGreaterThan(0);
      expect(result.sizeKb).toBeLessThanOrEqual(100);
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.iterations).toBeGreaterThanOrEqual(1);
    });
  });

  // 4. Audit ZIP Archive Creation & Integrity
  describe('Independent ZIP Archive Validation', () => {
    it('generated ZIP must start with PK\\x03\\x04 magic bytes and be independently extractable', async () => {
      const gatePreset = PORTAL_PRESETS.find((p) => p.id === 'gate-2025')!;
      const photoBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
      const photoBlob = new Blob([photoBytes], { type: 'image/jpeg' });

      const mockPhoto: ProcessedDocument = {
        originalFile: null,
        originalUrl: null,
        canvas: null,
        blob: photoBlob,
        objectUrl: 'blob:test',
        fileName: 'gate_photo.jpg',
        width: 480,
        height: 640,
        sizeBytes: 45000,
        sizeKb: 43.95,
        format: 'image/jpeg',
        quality: 0.85,
        validation: { passed: true, items: [] },
        lastModified: Date.now()
      };

      const mockSig: ProcessedDocument = {
        originalFile: null,
        originalUrl: null,
        canvas: null,
        blob: photoBlob,
        objectUrl: 'blob:test-sig',
        fileName: 'gate_sig.jpg',
        width: 560,
        height: 160,
        sizeBytes: 15000,
        sizeKb: 14.65,
        format: 'image/jpeg',
        quality: 0.85,
        validation: { passed: true, items: [] },
        lastModified: Date.now()
      };

      const zipBlob = await createZipArchive(gatePreset, mockPhoto, mockSig);
      expect(zipBlob.size).toBeGreaterThan(100);

      // Verify ZIP magic signature (0x50, 0x4B, 0x03, 0x04)
      const buffer = await zipBlob.arrayBuffer();
      const header = new Uint8Array(buffer.slice(0, 4));
      expect(header[0]).toBe(0x50); // 'P'
      expect(header[1]).toBe(0x4b); // 'K'
      expect(header[2]).toBe(0x03);
      expect(header[3]).toBe(0x04);

      // Extract ZIP using JSZip and inspect files
      const zip = await JSZip.loadAsync(buffer);
      const fileNames = Object.keys(zip.files);

      expect(fileNames.some((f) => f.includes('photograph.jpg'))).toBe(true);
      expect(fileNames.some((f) => f.includes('signature.jpg'))).toBe(true);
      expect(fileNames.some((f) => f.includes('specfit_conformance_report.txt'))).toBe(true);

      // Read verification report
      const reportFile = zip.file(fileNames.find((f) => f.includes('specfit_conformance_report.txt'))!);
      const reportText = await reportFile!.async('string');
      expect(reportText).toContain('SPECFIT VERIFICATION & SPECIFICATION CONFORMANCE AUDIT');
      expect(reportText).toContain('GATE');
      expect(reportText).toContain('100% On-Device Processing');
    });
  });

  // 5. Audit Strict Validation Boundaries
  describe('Multi-Factor Validation Engine Audit', () => {
    const universal = PORTAL_PRESETS.find((p) => p.id === 'universal-quick')!;

    it('should validate exact matches and reject out-of-boundary dimensions', () => {
      const match = validateDocument(
        {
          width: 800,
          height: 1000,
          sizeKb: 50,
          sizeBytes: 51200,
          format: 'image/jpeg'
        },
        universal.photo
      );
      expect(match.passed).toBe(true);

      const tooSmall = validateDocument(
        {
          width: 50,
          height: 50,
          sizeKb: 50,
          sizeBytes: 51200,
          format: 'image/jpeg'
        },
        universal.photo
      );
      expect(tooSmall.passed).toBe(false);
      expect(tooSmall.items.find((i) => i.key === 'dimensions')?.passed).toBe(false);
    });
  });
});
