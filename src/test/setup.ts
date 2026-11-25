// Vitest setup file for headless canvas & image mocking

// Valid minimal 1x1 PNG bytes for pdf-lib parsing in headless tests
const MINIMAL_PNG_BYTES = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
  0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84,
  120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78,
  68, 174, 66, 96, 130
]);

// Valid minimal 1x1 JPEG bytes for pdf-lib parsing in headless tests
const MINIMAL_JPEG_BYTES = new Uint8Array([
  255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 1, 1, 0, 72, 0, 72, 0, 0,
  255, 219, 0, 67, 0, 8, 6, 6, 7, 6, 5, 8, 7, 7, 7, 9, 9, 8, 10, 12, 20, 13,
  12, 11, 11, 12, 25, 18, 19, 15, 20, 29, 26, 31, 30, 29, 26, 28, 28, 32, 36,
  46, 39, 32, 34, 44, 35, 28, 28, 40, 55, 41, 44, 48, 49, 52, 52, 52, 31, 39,
  57, 61, 56, 50, 60, 46, 51, 52, 50, 255, 192, 0, 17, 8, 0, 1, 0, 1, 1, 1,
  17, 0, 255, 196, 0, 20, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  7, 255, 218, 0, 8, 1, 1, 0, 0, 63, 0, 158, 255, 217
]);

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (contextId: string) {
    if (contextId === '2d') {
      return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
        fillRect: () => {},
        clearRect: () => {},
        drawImage: () => {},
        getImageData: (_x: number, _y: number, w: number, h: number) => ({
          data: new Uint8ClampedArray(w * h * 4)
        }),
        putImageData: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        ellipse: () => {},
        stroke: () => {},
        fill: () => {},
        closePath: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        translate: () => {},
        rotate: () => {},
        save: () => {},
        restore: () => {},
        strokeRect: () => {},
        fillText: () => {}
      } as any;
    }
    return null;
  };

  HTMLCanvasElement.prototype.toBlob = function (
    callback: BlobCallback,
    type = 'image/jpeg',
    quality = 0.85
  ) {
    // Generates a mock blob with realistic byte size scaling and valid magic headers for PDF parsers
    const width = this.width || 400;
    const height = this.height || 400;
    const baseSize = Math.round((width * height) / 10);
    const size = Math.max(5000, Math.round(baseSize * (quality || 0.85)));

    const isPng = type === 'image/png';
    const header = isPng ? MINIMAL_PNG_BYTES : MINIMAL_JPEG_BYTES;
    const mockBytes = new Uint8Array(Math.max(size, header.length));
    mockBytes.set(header, 0);

    const blob = new Blob([mockBytes], { type });
    setTimeout(() => callback(blob), 10);
  };
}

if (typeof Image !== 'undefined') {
  try {
    Object.defineProperty(Image.prototype, 'naturalWidth', {
      get() {
        return (this as any)._naturalWidth !== undefined ? (this as any)._naturalWidth : 400;
      },
      set(val: number) {
        (this as any)._naturalWidth = val;
      },
      configurable: true
    });

    Object.defineProperty(Image.prototype, 'naturalHeight', {
      get() {
        return (this as any)._naturalHeight !== undefined ? (this as any)._naturalHeight : 400;
      },
      set(val: number) {
        (this as any)._naturalHeight = val;
      },
      configurable: true
    });

    Object.defineProperty(Image.prototype, 'src', {
      get() {
        return (this as any)._src || '';
      },
      set(src: string) {
        (this as any)._src = src;
        setTimeout(() => {
          if (typeof this.onload === 'function') {
            this.onload(new Event('load'));
          }
        }, 10);
      },
      configurable: true
    });
  } catch (e) {
    console.warn('Image mock definition notice:', e);
  }
}
