import { describe, it, expect } from 'vitest';
import { PORTAL_PRESETS } from '../data/presets';

describe('Portal Presets Specification Conformance', () => {
  it('should define all universal and portal presets with valid structures', () => {
    expect(PORTAL_PRESETS.length).toBeGreaterThanOrEqual(7);

    const requiredCodes = ['UNIVERSAL', 'PROFILE', 'GATE', 'UPSC'];
    const presetCodes = PORTAL_PRESETS.map((p) => p.code);

    requiredCodes.forEach((code) => {
      expect(presetCodes).toContain(code);
    });
  });

  it('each preset should have valid photo and signature byte ranges and dimensions', () => {
    PORTAL_PRESETS.forEach((preset) => {
      // Photo checks
      expect(preset.photo.minSizeKb).toBeGreaterThan(0);
      expect(preset.photo.maxSizeKb).toBeGreaterThan(preset.photo.minSizeKb);
      expect(preset.photo.minWidth).toBeGreaterThan(0);
      expect(preset.photo.minHeight).toBeGreaterThan(0);
      expect(preset.photo.aspectRatio).toBeGreaterThan(0);
      expect(preset.photo.formats.length).toBeGreaterThan(0);

      // Signature checks
      expect(preset.signature.minSizeKb).toBeGreaterThan(0);
      expect(preset.signature.maxSizeKb).toBeGreaterThan(preset.signature.minSizeKb);
      expect(preset.signature.minWidth).toBeGreaterThan(0);
      expect(preset.signature.minHeight).toBeGreaterThan(0);
      expect(preset.signature.aspectRatio).toBeGreaterThan(0);
      expect(preset.signature.formats.length).toBeGreaterThan(0);
    });
  });

  it('GATE 2025 preset should conform strictly to official IIT GOAPS guidelines', () => {
    const gate = PORTAL_PRESETS.find((p) => p.id === 'gate-2025')!;
    expect(gate).toBeDefined();
    expect(gate.photo.exactWidth).toBe(480);
    expect(gate.photo.exactHeight).toBe(640);
    expect(gate.photo.minSizeKb).toBe(5);
    expect(gate.photo.maxSizeKb).toBe(200);

    expect(gate.signature.exactWidth).toBe(560);
    expect(gate.signature.exactHeight).toBe(160);
    expect(gate.signature.minSizeKb).toBe(5);
    expect(gate.signature.maxSizeKb).toBe(200);
  });

  it('Universal preset should provide versatile all-purpose constraints', () => {
    const universal = PORTAL_PRESETS.find((p) => p.id === 'universal-quick')!;
    expect(universal).toBeDefined();
    expect(universal.photo.maxSizeKb).toBe(200);
    expect(universal.signature.maxSizeKb).toBe(50);
  });
});
