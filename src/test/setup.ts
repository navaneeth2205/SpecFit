// Vitest setup file for headless canvas mocking

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
    // Generates a mock blob with realistic byte size scaling by dimensions and quality
    const width = this.width || 400;
    const height = this.height || 400;
    const baseSize = Math.round((width * height) / 10);
    const size = Math.max(5000, Math.round(baseSize * (quality || 0.85)));
    const mockBytes = new Uint8Array(size);
    const blob = new Blob([mockBytes], { type });
    setTimeout(() => callback(blob), 10);
  };
}
