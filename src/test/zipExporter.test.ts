import { describe, it, expect } from 'vitest';
import { createZipArchive } from '../engine/zipExporter';
import { PORTAL_PRESETS } from '../data/presets';
import { ProcessedDocument } from '../types';
import JSZip from 'jszip';

describe('Combined JSZip Export Engine', () => {
  const gatePreset = PORTAL_PRESETS.find((p) => p.id === 'gate-2025')!;

  it('should generate a valid ZIP containing photo, signature, and verification certificate', async () => {
    const dummyBlob = new Blob(['mock binary image data'], { type: 'image/jpeg' });

    const mockPhoto: ProcessedDocument = {
      originalFile: null,
      originalUrl: null,
      canvas: null,
      blob: dummyBlob,
      objectUrl: 'blob:mock-photo',
      fileName: 'gate_photograph.jpg',
      width: 480,
      height: 640,
      sizeBytes: 50000,
      sizeKb: 48.8,
      format: 'image/jpeg',
      quality: 0.85,
      validation: { passed: true, items: [] },
      lastModified: Date.now()
    };

    const mockSignature: ProcessedDocument = {
      originalFile: null,
      originalUrl: null,
      canvas: null,
      blob: dummyBlob,
      objectUrl: 'blob:mock-sig',
      fileName: 'gate_signature.jpg',
      width: 560,
      height: 160,
      sizeBytes: 25000,
      sizeKb: 24.4,
      format: 'image/jpeg',
      quality: 0.85,
      validation: { passed: true, items: [] },
      lastModified: Date.now()
    };

    const zipBlob = await createZipArchive(gatePreset, mockPhoto, mockSignature);
    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(0);

    // Unpack ZIP to verify internal files
    const unzipped = await JSZip.loadAsync(zipBlob);
    const files = Object.keys(unzipped.files);

    const hasPhoto = files.some((f) => f.includes('photograph.jpg'));
    const hasSig = files.some((f) => f.includes('signature.jpg'));
    const hasReport = files.some((f) => f.includes('specfit_conformance_report.txt'));

    expect(hasPhoto).toBe(true);
    expect(hasSig).toBe(true);
    expect(hasReport).toBe(true);
  });
});
