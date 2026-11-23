import React, { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  Upload,
  PenTool,
  Sparkles
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  PortalPreset,
  ProcessedDocument,
  CropArea,
  SignatureFilterSettings
} from '../../types';
import { renderCroppedCanvas } from '../../engine/canvas';
import { applySignatureFilters } from '../../engine/filters';
import { compressCanvasToTargetSize } from '../../engine/compressor';
import { validateDocument } from '../../engine/validator';
import { createSyntheticDemoSignature } from '../../engine/demoGenerator';

interface SignatureEditorProps {
  preset: PortalPreset;
  currentDocument: ProcessedDocument | null;
  onSave: (doc: ProcessedDocument) => void;
  onCancel?: () => void;
}

export const SignatureEditor: React.FC<SignatureEditorProps> = ({
  preset,
  currentDocument,
  onSave,
  onCancel
}) => {
  const [imageFile, setImageFile] = useState<File | null>(currentDocument?.originalFile || null);
  const [imageUrl, setImageUrl] = useState<string | null>(currentDocument?.originalUrl || null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  const [filters, setFilters] = useState<SignatureFilterSettings>({
    grayscale: true,
    brightness: 12,
    contrast: 35,
    threshold: 215,
    inkEnhancement: true,
    backgroundWhitening: true
  });

  const [viewMode, setViewMode] = useState<'enhanced' | 'original' | 'split'>('enhanced');

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const originalPreviewCanvasRef = useRef<HTMLCanvasElement>(null);
  const enhancedPreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const targetWidth = preset.signature.exactWidth || preset.signature.maxWidth;
  const targetHeight = preset.signature.exactHeight || preset.signature.maxHeight;
  const aspectRatio = preset.signature.aspectRatio;

  useEffect(() => {
    if (!imageUrl) {
      setLoadedImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImage(img);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!loadedImage) return;

    const imgW = loadedImage.naturalWidth;
    const imgH = loadedImage.naturalHeight;

    const baseCropW = imgW / zoom;
    const baseCropH = baseCropW / aspectRatio;

    const centerX = imgW / 2 - (pan.x / (250 * zoom)) * (imgW / 2);
    const centerY = imgH / 2 - (pan.y / (250 * zoom)) * (imgH / 2);

    const cropArea: CropArea = {
      x: Math.max(0, Math.min(imgW - baseCropW, centerX - baseCropW / 2)),
      y: Math.max(0, Math.min(imgH - baseCropH, centerY - baseCropH / 2)),
      width: Math.min(imgW, baseCropW),
      height: Math.min(imgH, baseCropH)
    };

    const rawCanvas = renderCroppedCanvas(
      loadedImage,
      cropArea,
      targetWidth,
      targetHeight,
      0
    );

    if (originalPreviewCanvasRef.current) {
      const oc = originalPreviewCanvasRef.current;
      oc.width = targetWidth;
      oc.height = targetHeight;
      const ctx = oc.getContext('2d')!;
      ctx.drawImage(rawCanvas, 0, 0);
    }

    const filteredCanvas = applySignatureFilters(rawCanvas, filters);

    if (enhancedPreviewCanvasRef.current) {
      const ec = enhancedPreviewCanvasRef.current;
      ec.width = targetWidth;
      ec.height = targetHeight;
      const ctx = ec.getContext('2d')!;
      ctx.drawImage(filteredCanvas, 0, 0);
    }
  }, [loadedImage, zoom, pan, filters, targetWidth, targetHeight, aspectRatio]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(url);
  };

  const handleDemoLoad = async () => {
    setIsProcessing(true);
    try {
      const demoFile = await createSyntheticDemoSignature();
      handleFileUpload(demoFile);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      grayscale: true,
      brightness: 12,
      contrast: 35,
      threshold: 215,
      inkEnhancement: true,
      backgroundWhitening: true
    });
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleProcessAndSave = async () => {
    if (!enhancedPreviewCanvasRef.current || !loadedImage) return;
    setIsProcessing(true);

    try {
      const canvasToCompress = enhancedPreviewCanvasRef.current;

      const compressionResult = await compressCanvasToTargetSize(canvasToCompress, {
        minSizeKb: preset.signature.minSizeKb,
        maxSizeKb: preset.signature.maxSizeKb,
        format: 'image/jpeg',
        minWidth: preset.signature.minWidth,
        minHeight: preset.signature.minHeight
      });

      const validation = validateDocument(
        {
          width: compressionResult.width,
          height: compressionResult.height,
          sizeKb: compressionResult.sizeKb,
          sizeBytes: compressionResult.sizeBytes,
          format: 'image/jpeg'
        },
        preset.signature
      );

      const processed: ProcessedDocument = {
        originalFile: imageFile,
        originalUrl: imageUrl,
        canvas: canvasToCompress,
        blob: compressionResult.blob,
        objectUrl: URL.createObjectURL(compressionResult.blob),
        fileName: imageFile ? imageFile.name.replace(/\.[^/.]+$/, '.jpg') : 'signature.jpg',
        width: compressionResult.width,
        height: compressionResult.height,
        sizeBytes: compressionResult.sizeBytes,
        sizeKb: compressionResult.sizeKb,
        format: 'image/jpeg',
        quality: compressionResult.quality,
        validation,
        isDemo: imageFile?.name.includes('synthetic'),
        lastModified: Date.now()
      };

      onSave(processed);
    } catch (err) {
      console.error('Signature processing error:', err);
      alert('Could not process signature.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!loadedImage) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="bg-white border border-[#E6E8E4] rounded-xs shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E6E8E4] flex flex-wrap items-center justify-between gap-4 bg-[#FAF9F6]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#1E2320] tracking-tight">
              Signature & Ink Cleaner
            </h2>
            <Badge variant="default" size="sm">
              {preset.code}
            </Badge>
          </div>
          <p className="text-xs text-[#676F69] mt-0.5">
            Output: {targetWidth} × {targetHeight} px • Target Size: {preset.signature.minSizeKb}–{preset.signature.maxSizeKb} KB
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleProcessAndSave}
            disabled={!loadedImage || isProcessing}
            isLoading={isProcessing}
          >
            Apply & Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E6E8E4]">
        {/* Main Canvas Area */}
        <div className="lg:col-span-8 p-6 flex flex-col items-center justify-center bg-[#FAF9F6] min-h-[500px]">
          {!loadedImage ? (
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              className={`w-full max-w-md p-8 border-2 border-dashed rounded-xs text-center flex flex-col items-center justify-center transition-colors ${
                dragActive
                  ? 'border-[#1F352E] bg-[#EAF2ED]'
                  : 'border-[#E6E8E4] hover:border-[#676F69] bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#F2F4F0] flex items-center justify-center text-[#1F352E] mb-3">
                <PenTool className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1E2320]">
                Select signature or handwritten ink photo
              </h3>
              <p className="text-xs text-[#676F69] mt-1 max-w-xs">
                Whitens background paper shadows, deepens pen ink, and crops tightly around your signature.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                  <span className="inline-flex items-center justify-center font-medium text-xs px-3.5 py-2 gap-1.5 rounded-sm bg-[#1F352E] text-white hover:bg-[#162722] transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Browse Signature
                  </span>
                </label>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Sparkles className="w-3.5 h-3.5 text-[#2E7252]" />}
                  onClick={handleDemoLoad}
                >
                  Load Sample Signature
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full max-w-2xl">
              {/* Inspection Mode Switcher */}
              <div className="mb-4 flex items-center gap-1 bg-[#F2F4F0] p-1 border border-[#E6E8E4] rounded-xs text-xs">
                <button
                  onClick={() => setViewMode('enhanced')}
                  className={`px-3 py-1 font-medium transition-colors rounded-xs cursor-pointer ${
                    viewMode === 'enhanced'
                      ? 'bg-white text-[#1E2320] shadow-xs'
                      : 'text-[#676F69] hover:text-[#1E2320]'
                  }`}
                >
                  Enhanced Ink
                </button>
                <button
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1 font-medium transition-colors rounded-xs cursor-pointer ${
                    viewMode === 'original'
                      ? 'bg-white text-[#1E2320] shadow-xs'
                      : 'text-[#676F69] hover:text-[#1E2320]'
                  }`}
                >
                  Original Camera Photo
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 font-medium transition-colors rounded-xs cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-white text-[#1E2320] shadow-xs'
                      : 'text-[#676F69] hover:text-[#1E2320]'
                  }`}
                >
                  Side-by-Side Comparison
                </button>
              </div>

              {/* Viewport Display */}
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full flex items-center justify-center p-4 bg-white border border-[#E6E8E4] shadow-xs rounded-xs cursor-grab active:cursor-grabbing select-none"
              >
                {viewMode === 'split' ? (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="text-center">
                      <span className="text-[11px] font-semibold text-[#676F69] uppercase tracking-wider block mb-1">
                        Original Camera
                      </span>
                      <div className="border border-[#E6E8E4] bg-[#FAF9F6] p-2 flex items-center justify-center">
                        <canvas
                          ref={originalPreviewCanvasRef}
                          className="max-w-full h-auto max-h-[180px] shadow-xs"
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] font-semibold text-[#2E7252] uppercase tracking-wider block mb-1">
                        Clean Whitened Ink
                      </span>
                      <div className="border-2 border-[#1F352E] bg-white p-2 flex items-center justify-center">
                        <canvas
                          ref={enhancedPreviewCanvasRef}
                          className="max-w-full h-auto max-h-[180px] shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="border-2 border-[#1F352E] bg-white p-3 shadow-xs">
                      <canvas
                        ref={enhancedPreviewCanvasRef}
                        className={`max-w-full h-auto max-h-[220px] ${
                          viewMode === 'enhanced' ? 'block' : 'hidden'
                        }`}
                      />
                      <canvas
                        ref={originalPreviewCanvasRef}
                        className={`max-w-full h-auto max-h-[220px] ${
                          viewMode === 'original' ? 'block' : 'hidden'
                        }`}
                      />
                    </div>
                    <span className="text-xs text-[#676F69] mt-2">
                      {viewMode === 'enhanced'
                        ? 'Background shadows removed & ink strokes deepened'
                        : 'Unprocessed camera input'}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-[#676F69] flex items-center gap-3">
                <span>Drag to reposition signature</span>
                <span>•</span>
                <button
                  onClick={handleResetFilters}
                  className="text-[#1F352E] underline hover:text-black font-medium cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls Sidebar */}
        <div className="lg:col-span-4 p-6 flex flex-col justify-between bg-white space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[#1E2320] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-[#1F352E]" />
                Ink Clarity Filters
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-[#FAF9F6] border border-[#E6E8E4] rounded-xs">
                  <div>
                    <span className="text-xs font-medium text-[#1E2320] block">
                      Background Whitening
                    </span>
                    <span className="text-[11px] text-[#676F69]">
                      Removes paper grey tint and shadows
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.backgroundWhitening}
                    onChange={(e) =>
                      setFilters({ ...filters, backgroundWhitening: e.target.checked })
                    }
                    className="accent-[#1F352E] w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#FAF9F6] border border-[#E6E8E4] rounded-xs">
                  <div>
                    <span className="text-xs font-medium text-[#1E2320] block">
                      Ink Deepening
                    </span>
                    <span className="text-[11px] text-[#676F69]">
                      Protects fine ballpoint and gel pen strokes
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.inkEnhancement}
                    onChange={(e) =>
                      setFilters({ ...filters, inkEnhancement: e.target.checked })
                    }
                    className="accent-[#1F352E] w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#FAF9F6] border border-[#E6E8E4] rounded-xs">
                  <div>
                    <span className="text-xs font-medium text-[#1E2320] block">
                      Black & White Mode
                    </span>
                    <span className="text-[11px] text-[#676F69]">
                      Clean high-contrast grayscale
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.grayscale}
                    onChange={(e) => setFilters({ ...filters, grayscale: e.target.checked })}
                    className="accent-[#1F352E] w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="pt-4 border-t border-[#E6E8E4] space-y-4">
              <h3 className="text-xs font-semibold text-[#1E2320] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#1F352E]" />
                Fine Adjustments
              </h3>

              <div>
                <div className="flex justify-between text-xs text-[#1E2320] mb-1 font-medium">
                  <span>Whitening Threshold</span>
                  <span className="font-mono text-[#676F69]">{filters.threshold}</span>
                </div>
                <input
                  type="range"
                  min="160"
                  max="245"
                  step="1"
                  value={filters.threshold}
                  onChange={(e) =>
                    setFilters({ ...filters, threshold: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-[#1F352E] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#1E2320] mb-1 font-medium">
                  <span>Ink Contrast</span>
                  <span className="font-mono text-[#676F69]">+{filters.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={filters.contrast}
                  onChange={(e) =>
                    setFilters({ ...filters, contrast: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-[#1F352E] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#1E2320] mb-1 font-medium">
                  <span>Zoom / Scale</span>
                  <span className="font-mono text-[#676F69]">{zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#1F352E] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E8E4]">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleProcessAndSave}
              disabled={!loadedImage || isProcessing}
              isLoading={isProcessing}
            >
              Save & Apply Sizing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
