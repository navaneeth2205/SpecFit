import { describe, it, expect } from 'vitest';
import { convertImagesToPdf, ImageToPdfItem, PDF_COMPRESSION_PROFILES } from '../engine/pdfEngine';
import { PDFDocument } from 'pdf-lib';

describe('PDF Engine — On-Device Processing', () => {
  it('should convert multiple images into a valid PDF document with custom margins and A4 sizing', async () => {
    // Create synthetic 1x1 PNG image blob
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 100, 100);

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const items: ImageToPdfItem[] = [
      {
        id: 'page-1',
        file: blob,
        name: 'test_page_1.png',
        previewUrl: 'blob:test-1',
        rotation: 0
      },
      {
        id: 'page-2',
        file: blob,
        name: 'test_page_2.png',
        previewUrl: 'blob:test-2',
        rotation: 90
      }
    ];

    const result = await convertImagesToPdf(items, {
      pageSize: 'a4',
      orientation: 'portrait',
      margin: 'small',
      quality: 0.85,
      compress: true,
      title: 'Test Document',
      author: 'SpecFit Test'
    });

    expect(result).toBeDefined();
    expect(result.pageCount).toBe(2);
    expect(result.sizeBytes).toBeGreaterThan(500);
    expect(result.sizeKb).toBeGreaterThan(0);
    expect(result.blob.type).toBe('application/pdf');

    // Parse the generated PDF with pdf-lib to verify validity
    const arrayBuffer = await result.blob.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    expect(doc.getPageCount()).toBe(2);
    expect(doc.getTitle()).toBe('Test Document');
    expect(doc.getAuthor()).toBe('SpecFit Test');
  });

  it('should throw an error if no images are provided to convertImagesToPdf', async () => {
    await expect(
      convertImagesToPdf([], {
        pageSize: 'a4',
        orientation: 'portrait',
        margin: 'none',
        quality: 0.85,
        compress: true
      })
    ).rejects.toThrow('At least one image is required to generate a PDF.');
  });

  it('should support fit_image page sizing', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(0, 0, 200, 300);

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.9);
    });

    const items: ImageToPdfItem[] = [
      {
        id: 'page-1',
        file: blob,
        name: 'portrait.jpg',
        previewUrl: 'blob:test-portrait',
        rotation: 0
      }
    ];

    const result = await convertImagesToPdf(items, {
      pageSize: 'fit_image',
      orientation: 'auto',
      margin: 'none',
      quality: 0.85,
      compress: false
    });

    expect(result.pageCount).toBe(1);
    expect(result.blob.type).toBe('application/pdf');

    const arrayBuffer = await result.blob.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    const page = doc.getPage(0);
    expect(page.getWidth()).toBeGreaterThan(0);
    expect(page.getHeight()).toBeGreaterThan(0);
  });

  it('should define valid compression profiles for extreme, balanced, and high_quality', () => {
    expect(PDF_COMPRESSION_PROFILES.extreme).toBeDefined();
    expect(PDF_COMPRESSION_PROFILES.balanced).toBeDefined();
    expect(PDF_COMPRESSION_PROFILES.high_quality).toBeDefined();

    expect(PDF_COMPRESSION_PROFILES.extreme.quality).toBeLessThan(PDF_COMPRESSION_PROFILES.balanced.quality);
    expect(PDF_COMPRESSION_PROFILES.balanced.quality).toBeLessThan(PDF_COMPRESSION_PROFILES.high_quality.quality);
    expect(PDF_COMPRESSION_PROFILES.extreme.scale).toBeLessThanOrEqual(PDF_COMPRESSION_PROFILES.high_quality.scale);
  });
});
