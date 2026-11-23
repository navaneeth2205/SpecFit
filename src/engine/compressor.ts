import { SupportedFormat } from '../types';

export interface CompressionResult {
  blob: Blob;
  sizeBytes: number;
  sizeKb: number;
  quality: number;
  width: number;
  height: number;
  iterations: number;
  satisfiesMin: boolean;
  satisfiesMax: boolean;
  explanation?: string;
}

export interface CompressionOptions {
  minSizeKb: number;
  maxSizeKb: number;
  format: SupportedFormat;
  maxIterations?: number;
  allowDimensionScaling?: boolean;
  minWidth?: number;
  minHeight?: number;
}

/**
 * Converts canvas to Blob with specified quality
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: SupportedFormat = 'image/jpeg',
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob returned null'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Adaptive binary-search compression engine targeting exact byte constraints
 */
export async function compressCanvasToTargetSize(
  initialCanvas: HTMLCanvasElement,
  options: CompressionOptions
): Promise<CompressionResult> {
  const {
    minSizeKb,
    maxSizeKb,
    format = 'image/jpeg',
    maxIterations = 9,
    allowDimensionScaling = true,
    minWidth = 100,
    minHeight = 100
  } = options;

  const minBytes = minSizeKb * 1024;
  const maxBytes = maxSizeKb * 1024;
  // Target a comfortable 75% point between min and max
  const targetBytes = minBytes + (maxBytes - minBytes) * 0.75;

  let currentCanvas = initialCanvas;
  let width = currentCanvas.width;
  let height = currentCanvas.height;

  // Handle PNG format
  if (format === 'image/png') {
    let pngBlob = await canvasToBlob(currentCanvas, 'image/png');
    let sizeBytes = pngBlob.size;
    let iterations = 1;

    // If PNG exceeds max size and scaling is permitted, iteratively scale down
    if (sizeBytes > maxBytes && allowDimensionScaling && width > minWidth && height > minHeight) {
      let scale = 0.9;
      while (sizeBytes > maxBytes && scale >= 0.5) {
        const scaledCanvas = document.createElement('canvas');
        const newW = Math.max(minWidth, Math.round(width * scale));
        const newH = Math.max(minHeight, Math.round(height * scale));
        if (newW === width && newH === height) break;

        scaledCanvas.width = newW;
        scaledCanvas.height = newH;
        const sCtx = scaledCanvas.getContext('2d')!;
        sCtx.imageSmoothingEnabled = true;
        sCtx.imageSmoothingQuality = 'high';
        sCtx.drawImage(currentCanvas, 0, 0, newW, newH);

        const scaledBlob = await canvasToBlob(scaledCanvas, 'image/png');
        iterations++;
        pngBlob = scaledBlob;
        sizeBytes = scaledBlob.size;
        width = newW;
        height = newH;
        currentCanvas = scaledCanvas;

        if (sizeBytes <= maxBytes) break;
        scale -= 0.1;
      }
    }

    const sizeKb = +(sizeBytes / 1024).toFixed(2);
    const satisfiesMin = sizeBytes >= minBytes;
    const satisfiesMax = sizeBytes <= maxBytes;

    return {
      blob: pngBlob,
      sizeBytes,
      sizeKb,
      quality: 1.0,
      width,
      height,
      iterations,
      satisfiesMin,
      satisfiesMax,
      explanation: !satisfiesMax
        ? `PNG file size (${sizeKb} KB) exceeds the maximum limit of ${maxSizeKb} KB. JPEG is recommended for lossy compression.`
        : !satisfiesMin
        ? `PNG file size (${sizeKb} KB) is below the minimum limit of ${minSizeKb} KB.`
        : undefined
    };
  }

  // Binary search for optimal lossy quality (JPEG & WebP)
  const lossyFormat: SupportedFormat = format === 'image/webp' ? 'image/webp' : 'image/jpeg';
  let lowQ = 0.05;
  let highQ = 0.99;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.85;
  let bestSizeBytes = 0;
  let iterations = 0;

  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    const testQuality = +(lowQ + (highQ - lowQ) / 2).toFixed(3);
    const blob = await canvasToBlob(currentCanvas, lossyFormat, testQuality);
    const bytes = blob.size;

    bestBlob = blob;
    bestQuality = testQuality;
    bestSizeBytes = bytes;

    // Check if within bounds
    if (bytes >= minBytes && bytes <= maxBytes) {
      if (Math.abs(bytes - targetBytes) < 0.15 * maxBytes) {
        break; // Good enough
      }
    }

    if (bytes > maxBytes) {
      highQ = testQuality;
    } else if (bytes < minBytes) {
      lowQ = testQuality;
    } else {
      if (bytes < targetBytes) {
        lowQ = testQuality;
      } else {
        highQ = testQuality;
      }
    }

    if (highQ - lowQ < 0.02) {
      break;
    }
  }

  // If still exceeds maxBytes after reaching lowest quality, consider dimension downscaling
  if (bestSizeBytes > maxBytes && allowDimensionScaling && width > minWidth && height > minHeight) {
    let scale = 0.9;
    while (bestSizeBytes > maxBytes && scale >= 0.5) {
      const scaledCanvas = document.createElement('canvas');
      const newW = Math.max(minWidth, Math.round(width * scale));
      const newH = Math.max(minHeight, Math.round(height * scale));
      if (newW === width && newH === height) break;

      scaledCanvas.width = newW;
      scaledCanvas.height = newH;
      const sCtx = scaledCanvas.getContext('2d')!;
      sCtx.imageSmoothingEnabled = true;
      sCtx.imageSmoothingQuality = 'high';
      sCtx.drawImage(currentCanvas, 0, 0, newW, newH);

      const scaledBlob = await canvasToBlob(scaledCanvas, lossyFormat, 0.65);
      iterations++;
      bestBlob = scaledBlob;
      bestSizeBytes = scaledBlob.size;
      bestQuality = 0.65;
      width = newW;
      height = newH;
      currentCanvas = scaledCanvas;

      if (bestSizeBytes <= maxBytes) break;
      scale -= 0.1;
    }
  }

  // If file size is below minimum requirement even at highest quality, try encoding at maximum quality
  if (bestSizeBytes < minBytes) {
    const maxQBlob = await canvasToBlob(currentCanvas, lossyFormat, 0.99);
    if (maxQBlob.size > bestSizeBytes) {
      bestBlob = maxQBlob;
      bestSizeBytes = maxQBlob.size;
      bestQuality = 0.99;
    }
  }

  if (!bestBlob) {
    bestBlob = await canvasToBlob(currentCanvas, lossyFormat, 0.85);
    bestSizeBytes = bestBlob.size;
  }

  const satisfiesMin = bestSizeBytes >= minBytes;
  const satisfiesMax = bestSizeBytes <= maxBytes;
  const sizeKb = +(bestSizeBytes / 1024).toFixed(2);

  let explanation: string | undefined;
  if (!satisfiesMax) {
    explanation = `File size (${sizeKb} KB) exceeds the maximum allowed limit of ${maxSizeKb} KB.`;
  } else if (!satisfiesMin) {
    explanation = `File size (${sizeKb} KB) is below the minimum portal requirement of ${minSizeKb} KB.`;
  }

  return {
    blob: bestBlob,
    sizeBytes: bestSizeBytes,
    sizeKb,
    quality: bestQuality,
    width,
    height,
    iterations,
    satisfiesMin,
    satisfiesMax,
    explanation
  };
}
