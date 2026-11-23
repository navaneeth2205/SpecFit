import { describe, it, expect } from 'vitest';
import { validateDocument } from '../engine/validator';
import { PORTAL_PRESETS } from '../data/presets';

describe('Document Validation Engine', () => {
  const gatePreset = PORTAL_PRESETS.find((p) => p.id === 'gate-2025')!;

  it('should pass a document matching all GATE photo criteria', () => {
    const validPhoto = {
      width: 480,
      height: 640,
      sizeKb: 45.2,
      sizeBytes: 46284,
      format: 'image/jpeg' as const
    };

    const result = validateDocument(validPhoto, gatePreset.photo);
    expect(result.passed).toBe(true);
    expect(result.items.every((item) => item.passed)).toBe(true);
  });

  it('should fail when file size exceeds maximum permitted KB', () => {
    const oversizedPhoto = {
      width: 480,
      height: 640,
      sizeKb: 205.5, // max is 200 KB
      sizeBytes: 210432,
      format: 'image/jpeg' as const
    };

    const result = validateDocument(oversizedPhoto, gatePreset.photo);
    expect(result.passed).toBe(false);
    const sizeItem = result.items.find((i) => i.key === 'fileSize');
    expect(sizeItem?.passed).toBe(false);
  });

  it('should fail when file size is below minimum permitted KB', () => {
    const undersizedPhoto = {
      width: 480,
      height: 640,
      sizeKb: 3.2, // min is 5 KB
      sizeBytes: 3276,
      format: 'image/jpeg' as const
    };

    const result = validateDocument(undersizedPhoto, gatePreset.photo);
    expect(result.passed).toBe(false);
    const sizeItem = result.items.find((i) => i.key === 'fileSize');
    expect(sizeItem?.passed).toBe(false);
  });

  it('should fail when dimensions do not match exact pixel requirements', () => {
    const wrongDimensions = {
      width: 300,
      height: 300,
      sizeKb: 50,
      sizeBytes: 51200,
      format: 'image/jpeg' as const
    };

    const result = validateDocument(wrongDimensions, gatePreset.photo);
    expect(result.passed).toBe(false);
    const dimItem = result.items.find((i) => i.key === 'dimensions');
    expect(dimItem?.passed).toBe(false);
  });

  it('should fail when format is unsupported', () => {
    const wrongFormat = {
      width: 480,
      height: 640,
      sizeKb: 50,
      sizeBytes: 51200,
      format: 'image/png' as const // GATE only allows JPEG
    };

    const result = validateDocument(wrongFormat, gatePreset.photo);
    expect(result.passed).toBe(false);
    const formatItem = result.items.find((i) => i.key === 'format');
    expect(formatItem?.passed).toBe(false);
  });
});
