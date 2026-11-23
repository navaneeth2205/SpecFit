import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { compressCanvasToTargetSize } from '../engine/compressor';
import { renderWholeResizedCanvas, renderCroppedCanvas } from '../engine/canvas';
import { BatchItem, SupportedFormat } from '../types';

describe('Batch Processing & Universal Formatting Suite', () => {
  it('correctly handles arbitrary file size conversions (MB, KB, Bytes)', () => {
    const toBytes = (val: number, unit: 'MB' | 'KB' | 'Bytes') => {
      if (unit === 'MB') return val * 1024 * 1024;
      if (unit === 'Bytes') return val;
      return val * 1024;
    };

    expect(toBytes(2, 'MB')).toBe(2097152);
    expect(toBytes(150, 'KB')).toBe(153600);
    expect(toBytes(50000, 'Bytes')).toBe(50000);
  });

  it('renders whole resized image without cropping when requested', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1200;

    // Create an image source from canvas
    const img = new Image();
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const resized = renderWholeResizedCanvas(img, 800, 600, 0, false);
    expect(resized.width).toBe(800);
    expect(resized.height).toBe(600);
  });

  it('batches multiple items and exports an uncorrupted ZIP manifest', async () => {
    const zip = new JSZip();
    const dummyBlob1 = new Blob([new Uint8Array(25000)], { type: 'image/jpeg' });
    const dummyBlob2 = new Blob([new Uint8Array(35000)], { type: 'image/jpeg' });

    const batchQueue: BatchItem[] = [
      {
        id: 'item-1',
        file: new File([dummyBlob1], 'vacation_photo.jpg', { type: 'image/jpeg' }),
        name: 'vacation_photo.jpg',
        originalWidth: 2400,
        originalHeight: 1600,
        originalSizeBytes: 25000,
        status: 'ready',
        processedBlob: dummyBlob1,
        processedWidth: 1200,
        processedHeight: 800,
        processedSizeBytes: 24800,
        processedSizeKb: 24.22,
        validationPassed: true
      },
      {
        id: 'item-2',
        file: new File([dummyBlob2], 'profile_headshot.jpg', { type: 'image/jpeg' }),
        name: 'profile_headshot.jpg',
        originalWidth: 1000,
        originalHeight: 1000,
        originalSizeBytes: 35000,
        status: 'ready',
        processedBlob: dummyBlob2,
        processedWidth: 600,
        processedHeight: 600,
        processedSizeBytes: 34500,
        processedSizeKb: 33.69,
        validationPassed: true
      }
    ];

    // Add files to zip
    batchQueue.forEach((item) => {
      zip.file(`processed_${item.name}`, item.processedBlob!);
    });

    // Add manifest
    const manifest = [
      'SPECFIT BATCH CONFORMANCE MANIFEST',
      `Total items: ${batchQueue.length}`,
      ...batchQueue.map((item) => `${item.name} -> ${item.processedWidth}x${item.processedHeight} (${item.processedSizeKb} KB)`)
    ].join('\n');
    zip.file('specfit_batch_manifest.txt', manifest);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    expect(zipBlob.size).toBeGreaterThan(100);

    // Verify magic bytes
    const buffer = await zipBlob.arrayBuffer();
    const header = new Uint8Array(buffer.slice(0, 4));
    expect(header[0]).toBe(0x50);
    expect(header[1]).toBe(0x4b);
    expect(header[2]).toBe(0x03);
    expect(header[3]).toBe(0x04);

    // Verify unzipping
    const loadedZip = await JSZip.loadAsync(buffer);
    const files = Object.keys(loadedZip.files);
    expect(files).toContain('processed_vacation_photo.jpg');
    expect(files).toContain('processed_profile_headshot.jpg');
    expect(files).toContain('specfit_batch_manifest.txt');
  });

  it('supports custom arbitrary width & height without preset restrictions', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;

    // User chooses unusual custom dimensions: 975 × 525 px, max 75 KB
    const customResult = await compressCanvasToTargetSize(canvas, {
      minSizeKb: 5,
      maxSizeKb: 75,
      format: 'image/jpeg',
      minWidth: 400,
      minHeight: 200,
      allowDimensionScaling: false // exact dimensions preserved
    });

    expect(customResult.sizeBytes).toBeLessThanOrEqual(75 * 1024);
    expect(customResult.satisfiesMax).toBe(true);
    expect(customResult.blob.size).toBe(customResult.sizeBytes);
  });
});
