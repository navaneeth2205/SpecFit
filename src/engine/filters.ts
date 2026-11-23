import { SignatureFilterSettings } from '../types';

/**
 * Applies fine-tuned signature enhancements:
 * - Grayscale conversion
 * - Brightness & Contrast
 * - Selective ink deepening (without destroying hairline strokes)
 * - Paper background whitening
 * - Soft thresholding
 */
export function applySignatureFilters(
  sourceCanvas: HTMLCanvasElement,
  settings: SignatureFilterSettings
): HTMLCanvasElement {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height;

  const ctx = outputCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  // Draw source image
  ctx.drawImage(sourceCanvas, 0, 0);

  const imgData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
  const data = imgData.data;
  const len = data.length;

  const {
    grayscale,
    brightness,
    contrast,
    threshold,
    inkEnhancement,
    backgroundWhitening
  } = settings;

  // Contrast multiplier: contrast is -100 to 100
  // formula: factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - Math.min(contrast, 250)));
  const bAdd = brightness * 1.5;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Grayscale (standard perceptual luminance)
    if (grayscale || inkEnhancement || backgroundWhitening) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum;
      g = lum;
      b = lum;
    }

    // 2. Brightness & Contrast
    if (brightness !== 0 || contrast !== 0) {
      r = cFactor * (r - 128) + 128 + bAdd;
      g = cFactor * (g - 128) + 128 + bAdd;
      b = cFactor * (b - 128) + 128 + bAdd;
    }

    // Clamp values
    r = r < 0 ? 0 : r > 255 ? 255 : r;
    g = g < 0 ? 0 : g > 255 ? 255 : g;
    b = b < 0 ? 0 : b > 255 ? 255 : b;

    // 3. Background whitening & Ink Enhancement
    if (backgroundWhitening || inkEnhancement) {
      const lum = r; // already grayscale

      if (lum >= threshold) {
        // High luminance => Whitened background
        if (backgroundWhitening) {
          r = 255;
          g = 255;
          b = 255;
        }
      } else {
        // Below threshold => Ink stroke
        if (inkEnhancement) {
          // Soft ink curve to avoid harsh jagged pixelation on fine ballpoint pen edges
          const inkRatio = lum / threshold; // 0 (pure black) to 1.0 (threshold edge)
          const enhancedLum = Math.pow(inkRatio, 1.4) * (threshold * 0.7);
          r = enhancedLum;
          g = enhancedLum;
          b = enhancedLum;
        }
      }
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    // data[i + 3] remains 255 (fully opaque)
  }

  ctx.putImageData(imgData, 0, 0);
  return outputCanvas;
}
