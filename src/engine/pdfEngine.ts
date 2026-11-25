import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker for in-browser client rendering
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback to CDN worker if dynamic import resolution fails in strict sandboxes
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

export type PdfPageSize = 'a4' | 'letter' | 'legal' | 'fit_image';
export type PdfOrientation = 'auto' | 'portrait' | 'landscape';
export type PdfMargin = 'none' | 'small' | 'normal'; // none: 0, small: 28.3pt (10mm), normal: 56.7pt (20mm)

export interface ImageToPdfItem {
  id: string;
  file: File | Blob;
  name: string;
  previewUrl: string;
  rotation?: number; // 0, 90, 180, 270
}

export interface ImageToPdfOptions {
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  margin: PdfMargin;
  quality: number; // 0.1 to 1.0 (used if recompressing)
  compress: boolean;
  title?: string;
  author?: string;
  onProgress?: (current: number, total: number) => void;
}

export interface PdfConversionResult {
  blob: Blob;
  sizeBytes: number;
  sizeKb: number;
  pageCount: number;
}

export interface ExtractedPdfPage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  sizeKb: number;
}

export interface PdfCompressionProfile {
  id: 'extreme' | 'balanced' | 'high_quality' | 'custom';
  name: string;
  description: string;
  scale: number;      // scale factor for rendering (e.g. 1.0 = ~72-96 dpi, 1.5 = ~150 dpi, 2.0 = ~200 dpi)
  quality: number;    // 0.3 to 0.95
}

export const PDF_COMPRESSION_PROFILES: Record<'extreme' | 'balanced' | 'high_quality', PdfCompressionProfile> = {
  extreme: {
    id: 'extreme',
    name: 'Maximum Reduction',
    description: 'Compresses up to 80%–90%. Best for strict upload portals (< 500 KB or 1 MB).',
    scale: 1.0,
    quality: 0.45
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced (Recommended)',
    description: 'Optimal balance of clear text readability and significant file size savings (50%–75%).',
    scale: 1.4,
    quality: 0.70
  },
  high_quality: {
    id: 'high_quality',
    name: 'High Quality',
    description: 'Preserves fine lines and small print. Moderate compression (30%–50% reduction).',
    scale: 1.8,
    quality: 0.85
  }
};

export interface PdfCompressionResult {
  blob: Blob;
  originalSizeBytes: number;
  originalSizeKb: number;
  compressedSizeBytes: number;
  compressedSizeKb: number;
  reductionPercent: number;
  pageCount: number;
  satisfiesTarget: boolean;
}

// Convert MM to points (72 points per inch, 25.4 mm per inch)
const mmToPoints = (mm: number): number => (mm * 72) / 25.4;

const MARGIN_POINTS: Record<PdfMargin, number> = {
  none: 0,
  small: mmToPoints(10), // ~28.35 pt
  normal: mmToPoints(20) // ~56.7 pt
};

/**
 * Convert an image file or blob into an ArrayBuffer suitable for PDF embedding.
 * If image is WebP or needs compression/rotation, it is rasterized via Canvas first.
 */
async function prepareImageBytesForPdf(
  fileOrBlob: File | Blob,
  quality: number = 0.85,
  rotation: number = 0
): Promise<{ bytes: Uint8Array; format: 'jpg' | 'png'; width: number; height: number }> {
  // If it's standard JPEG or PNG without rotation, try direct embed first
  const isJpeg = fileOrBlob.type === 'image/jpeg' || fileOrBlob.type === 'image/jpg';
  const isPng = fileOrBlob.type === 'image/png';

  if ((isJpeg || isPng) && (!rotation || rotation % 360 === 0) && quality >= 0.95) {
    const buffer = await fileOrBlob.arrayBuffer();
    // Get image dimensions
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image for dimensions'));
      img.src = url;
    });
    URL.revokeObjectURL(url);
    return {
      bytes: new Uint8Array(buffer),
      format: isJpeg ? 'jpg' : 'png',
      width: img.naturalWidth,
      height: img.naturalHeight
    };
  }

  // Rasterize through canvas to handle WebP, recompression, or rotation
  const img = new Image();
  const url = URL.createObjectURL(fileOrBlob);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
  URL.revokeObjectURL(url);

  const rad = ((rotation % 360) * Math.PI) / 180;
  const isSideways = Math.abs(rotation % 180) === 90;
  const canvasWidth = isSideways ? img.naturalHeight : img.naturalWidth;
  const canvasHeight = isSideways ? img.naturalWidth : img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  // Convert to high-quality JPEG for maximum PDF compatibility and size efficiency
  const blob: Blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', quality);
  });
  const buffer = await blob.arrayBuffer();

  return {
    bytes: new Uint8Array(buffer),
    format: 'jpg',
    width: canvasWidth,
    height: canvasHeight
  };
}

/**
 * 1. Convert 1 or more images into a clean, professional PDF document on-device.
 */
export async function convertImagesToPdf(
  items: ImageToPdfItem[],
  options: ImageToPdfOptions
): Promise<PdfConversionResult> {
  if (!items || items.length === 0) {
    throw new Error('At least one image is required to generate a PDF.');
  }

  const pdfDoc = await PDFDocument.create();

  if (options.title) pdfDoc.setTitle(options.title);
  if (options.author) pdfDoc.setAuthor(options.author);
  pdfDoc.setProducer('SpecFit Universal Utility (https://specfit.onrender.com)');
  pdfDoc.setCreator('SpecFit');

  const marginPt = MARGIN_POINTS[options.margin];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (options.onProgress) {
      options.onProgress(i + 1, items.length);
    }

    const prepared = await prepareImageBytesForPdf(
      item.file,
      options.compress ? options.quality : 0.95,
      item.rotation || 0
    );

    const embeddedImage =
      prepared.format === 'jpg'
        ? await pdfDoc.embedJpg(prepared.bytes)
        : await pdfDoc.embedPng(prepared.bytes);

    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'fit_image') {
      pageWidth = prepared.width + marginPt * 2;
      pageHeight = prepared.height + marginPt * 2;
    } else {
      let baseDims: [number, number];
      if (options.pageSize === 'letter') {
        baseDims = PageSizes.Letter;
      } else if (options.pageSize === 'legal') {
        baseDims = PageSizes.Legal;
      } else {
        baseDims = PageSizes.A4; // Default A4 [595.28, 841.89]
      }

      let isLandscape = false;
      if (options.orientation === 'auto') {
        isLandscape = prepared.width > prepared.height;
      } else if (options.orientation === 'landscape') {
        isLandscape = true;
      }

      pageWidth = isLandscape ? Math.max(baseDims[0], baseDims[1]) : Math.min(baseDims[0], baseDims[1]);
      pageHeight = isLandscape ? Math.min(baseDims[0], baseDims[1]) : Math.max(baseDims[0], baseDims[1]);
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate maximum image box within margins
    const availableWidth = pageWidth - marginPt * 2;
    const availableHeight = pageHeight - marginPt * 2;

    const scale = Math.min(
      availableWidth / prepared.width,
      availableHeight / prepared.height,
      options.pageSize === 'fit_image' ? 1 : Infinity
    );

    const scaledWidth = prepared.width * scale;
    const scaledHeight = prepared.height * scale;

    // Center image on the page
    const x = marginPt + (availableWidth - scaledWidth) / 2;
    const y = marginPt + (availableHeight - scaledHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight
    });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });

  return {
    blob,
    sizeBytes: blob.size,
    sizeKb: +(blob.size / 1024).toFixed(2),
    pageCount: items.length
  };
}

/**
 * 2. Render PDF Pages to HTML5 Canvas elements using pdfjs-dist.
 */
export async function renderPdfPages(
  pdfFileOrBlob: File | Blob,
  scale: number = 1.5,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ pageNumber: number; canvas: HTMLCanvasElement; width: number; height: number }>> {
  const arrayBuffer = await pdfFileOrBlob.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;

  const totalPages = pdfDoc.numPages;
  const results: Array<{ pageNumber: number; canvas: HTMLCanvasElement; width: number; height: number }> = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) onProgress(pageNum, totalPages);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    // Render white background first (vital for transparent PDFs)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport,
      canvas
    }).promise;

    results.push({
      pageNumber: pageNum,
      canvas,
      width: viewport.width,
      height: viewport.height
    });
  }

  return results;
}

/**
 * 3. Extract PDF pages as individual image files (JPEG, PNG, WebP).
 */
export async function extractPdfPagesAsImages(
  pdfFileOrBlob: File | Blob,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality: number = 0.88,
  scale: number = 1.5,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedPdfPage[]> {
  const rendered = await renderPdfPages(pdfFileOrBlob, scale, onProgress);
  const pages: ExtractedPdfPage[] = [];

  for (const item of rendered) {
    const blob: Blob = await new Promise((resolve) => {
      item.canvas.toBlob((b) => resolve(b || new Blob()), format, quality);
    });

    const dataUrl = item.canvas.toDataURL(format, quality);

    pages.push({
      pageNumber: item.pageNumber,
      blob,
      dataUrl,
      width: item.width,
      height: item.height,
      sizeBytes: blob.size,
      sizeKb: +(blob.size / 1024).toFixed(2)
    });
  }

  return pages;
}

/**
 * 4. Compress / Reduce PDF file size.
 * Renders pages, applies optimal adaptive quantization & resolution scaling,
 * and reassembles into a compressed PDF with streams enabled.
 */
export async function compressPdfDocument(
  pdfFileOrBlob: File | Blob,
  options: {
    targetMaxKb?: number;
    profile?: 'extreme' | 'balanced' | 'high_quality';
    onProgress?: (current: number, total: number) => void;
  }
): Promise<PdfCompressionResult> {
  const originalSizeBytes = pdfFileOrBlob.size;
  const originalSizeKb = +(originalSizeBytes / 1024).toFixed(2);

  // Determine compression parameters
  let scale = 1.4;
  let quality = 0.70;

  if (options.targetMaxKb && options.targetMaxKb > 0) {
    // If strict target KB is given, compute aggressive settings
    const currentKb = originalSizeKb;
    const ratio = options.targetMaxKb / currentKb;

    if (ratio < 0.3) {
      scale = 1.0;
      quality = 0.45;
    } else if (ratio < 0.6) {
      scale = 1.2;
      quality = 0.60;
    } else {
      scale = 1.4;
      quality = 0.75;
    }
  } else if (options.profile && PDF_COMPRESSION_PROFILES[options.profile]) {
    scale = PDF_COMPRESSION_PROFILES[options.profile].scale;
    quality = PDF_COMPRESSION_PROFILES[options.profile].quality;
  }

  // Render pages to canvas
  const renderedPages = await renderPdfPages(pdfFileOrBlob, scale, (curr, tot) => {
    if (options.onProgress) options.onProgress(Math.round(curr * 0.6), tot);
  });

  const newDoc = await PDFDocument.create();
  newDoc.setProducer('SpecFit Universal PDF Compressor (100% On-Device)');

  for (let i = 0; i < renderedPages.length; i++) {
    const pageItem = renderedPages[i];

    // Recompress page canvas to JPEG blob
    const pageBlob: Blob = await new Promise((resolve) => {
      pageItem.canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', quality);
    });

    const pageBuffer = await pageBlob.arrayBuffer();
    const embeddedImg = await newDoc.embedJpg(new Uint8Array(pageBuffer));

    // Create page matching the original aspect ratio
    const page = newDoc.addPage([pageItem.width / scale, pageItem.height / scale]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: pageItem.width / scale,
      height: pageItem.height / scale
    });

    if (options.onProgress) {
      const progress = Math.min(100, Math.round(60 + ((i + 1) / renderedPages.length) * 35));
      options.onProgress(progress, renderedPages.length);
    }
  }

  const finalPdfBytes = await newDoc.save({ useObjectStreams: true });
  const compressedBlob = new Blob([finalPdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  const compressedSizeBytes = compressedBlob.size;
  const compressedSizeKb = +(compressedSizeBytes / 1024).toFixed(2);

  const reductionPercent = Math.max(
    0,
    Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)
  );

  const satisfiesTarget = options.targetMaxKb
    ? compressedSizeKb <= options.targetMaxKb
    : true;

  return {
    blob: compressedBlob,
    originalSizeBytes,
    originalSizeKb,
    compressedSizeBytes,
    compressedSizeKb,
    reductionPercent,
    pageCount: renderedPages.length,
    satisfiesTarget
  };
}
