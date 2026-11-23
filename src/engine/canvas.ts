import { CropArea } from '../types';

/**
 * Loads an image from a URL or File object into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

/**
 * Reads a File into an Object URL
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Renders an image to an HTMLCanvasElement with given crop area, rotation, and target output dimensions
 */
export function renderCroppedCanvas(
  image: HTMLImageElement,
  cropArea: CropArea,
  targetWidth: number,
  targetHeight: number,
  rotationDegrees: number = 0
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  // Use high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill with pure white background by default (avoids black background if transparent PNG)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  if (rotationDegrees % 360 !== 0) {
    // Intermediate canvas for rotation
    const tempCanvas = document.createElement('canvas');
    const rad = (rotationDegrees * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    tempCanvas.width = image.width * cos + image.height * sin;
    tempCanvas.height = image.width * sin + image.height * cos;

    const tCtx = tempCanvas.getContext('2d')!;
    tCtx.imageSmoothingEnabled = true;
    tCtx.imageSmoothingQuality = 'high';
    tCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tCtx.rotate(rad);
    tCtx.drawImage(image, -image.width / 2, -image.height / 2);

    // Draw from tempCanvas using cropArea scaled to tempCanvas
    ctx.drawImage(
      tempCanvas,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
  } else {
    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
  }

  return canvas;
}

/**
 * Resizes an entire image without cropping
 */
export function renderWholeResizedCanvas(
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  rotationDegrees: number = 0,
  preserveAspect: boolean = false
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  if (preserveAspect) {
    const scale = Math.min(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
    const drawW = Math.round(image.naturalWidth * scale);
    const drawH = Math.round(image.naturalHeight * scale);
    const offsetX = Math.round((targetWidth - drawW) / 2);
    const offsetY = Math.round((targetHeight - drawH) / 2);
    ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
  } else {
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  }

  return canvas;
}
