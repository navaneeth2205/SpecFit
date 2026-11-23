import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCw,
  RotateCcw,
  ZoomIn,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Sliders,
  Sparkles,
  User
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { FaceGuideOverlay } from './FaceGuideOverlay';
import {
  PortalPreset,
  ProcessedDocument,
  CropArea,
  FaceGuideSettings
} from '../../types';
import { renderCroppedCanvas } from '../../engine/canvas';
import { compressCanvasToTargetSize } from '../../engine/compressor';
import { validateDocument } from '../../engine/validator';
import { createSyntheticDemoPhoto } from '../../engine/demoGenerator';

interface PhotoEditorProps {
  preset: PortalPreset;
  currentDocument: ProcessedDocument | null;
  onSave: (doc: ProcessedDocument) => void;
  onCancel?: () => void;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  preset,
  currentDocument,
  onSave,
  onCancel
}) => {
  const [imageFile, setImageFile] = useState<File | null>(currentDocument?.originalFile || null);
  const [imageUrl, setImageUrl] = useState<string | null>(currentDocument?.originalUrl || null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // Transformations
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);

  // Aspect ratio choice: 'preset' | '1:1' | '4:5' | '3:4' | '16:9'
  const [aspectChoice, setAspectChoice] = useState<string>('preset');

  // Portrait guide: defaults to FALSE for universal images, toggleable for IDs
  const [faceGuide, setFaceGuide] = useState<FaceGuideSettings>({
    visible: false,
    headOvalScale: 1.0,
    verticalOffset: 0
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate active aspect ratio
  const activeAspectRatio =
    aspectChoice === '1:1'
      ? 1
      : aspectChoice === '4:5'
      ? 4 / 5
      : aspectChoice === '3:4'
      ? 3 / 4
      : aspectChoice === '16:9'
      ? 16 / 9
      : preset.photo.aspectRatio;

  const targetWidth = Math.round(preset.photo.exactWidth || preset.photo.maxWidth);
  const targetHeight = Math.round(targetWidth / activeAspectRatio);

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
      setRotation(0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

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
      const demoFile = await createSyntheticDemoPhoto();
      handleFileUpload(demoFile);
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

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setAspectChoice('preset');
  };

  const handleProcessAndSave = async () => {
    if (!loadedImage) return;
    setIsProcessing(true);

    try {
      const imgW = loadedImage.naturalWidth;
      const imgH = loadedImage.naturalHeight;

      const baseCropW = imgW / zoom;
      const baseCropH = baseCropW / activeAspectRatio;

      const centerX = imgW / 2 - (pan.x / (300 * zoom)) * (imgW / 2);
      const centerY = imgH / 2 - (pan.y / (300 * zoom)) * (imgH / 2);

      const cropArea: CropArea = {
        x: Math.max(0, Math.min(imgW - baseCropW, centerX - baseCropW / 2)),
        y: Math.max(0, Math.min(imgH - baseCropH, centerY - baseCropH / 2)),
        width: Math.min(imgW, baseCropW),
        height: Math.min(imgH, baseCropH)
      };

      const canvas = renderCroppedCanvas(
        loadedImage,
        cropArea,
        targetWidth,
        targetHeight,
        rotation
      );

      const compressionResult = await compressCanvasToTargetSize(canvas, {
        minSizeKb: preset.photo.minSizeKb,
        maxSizeKb: preset.photo.maxSizeKb,
        format: 'image/jpeg',
        minWidth: Math.min(targetWidth, preset.photo.minWidth),
        minHeight: Math.min(targetHeight, preset.photo.minHeight)
      });

      const validation = validateDocument(
        {
          width: compressionResult.width,
          height: compressionResult.height,
          sizeKb: compressionResult.sizeKb,
          sizeBytes: compressionResult.sizeBytes,
          format: 'image/jpeg'
        },
        preset.photo
      );

      const processed: ProcessedDocument = {
        originalFile: imageFile,
        originalUrl: imageUrl,
        canvas,
        blob: compressionResult.blob,
        objectUrl: URL.createObjectURL(compressionResult.blob),
        fileName: imageFile ? imageFile.name.replace(/\.[^/.]+$/, '.jpg') : 'image.jpg',
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
      console.error('Processing error:', err);
      alert('Could not process image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-[#E6E8E4] rounded-xs shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E6E8E4] flex flex-wrap items-center justify-between gap-4 bg-[#FAF9F6]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#1E2320] tracking-tight">
              Image & Photo Resizer
            </h2>
            <Badge variant="default" size="sm">
              {preset.code}
            </Badge>
          </div>
          <p className="text-xs text-[#676F69] mt-0.5">
            Output: {targetWidth} × {targetHeight} px • Target Size: {preset.photo.minSizeKb}–{preset.photo.maxSizeKb} KB
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
                <ImageIcon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1E2320]">
                Select any image to resize or crop
              </h3>
              <p className="text-xs text-[#676F69] mt-1 max-w-xs">
                Supports portraits, landscape photos, document scans, and graphics.
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
                    Browse Image
                  </span>
                </label>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Sparkles className="w-3.5 h-3.5 text-[#2E7252]" />}
                  onClick={handleDemoLoad}
                >
                  Load Sample Photo
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Aspect Ratio Framing Viewport */}
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative overflow-hidden border-2 border-[#1F352E] bg-[#EBEBE8] shadow-sm select-none cursor-grab active:cursor-grabbing"
                style={{
                  width: `${Math.min(380, 380 * activeAspectRatio)}px`,
                  height: `${380 / activeAspectRatio > 480 ? 480 : 380 / activeAspectRatio}px`
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`
                  }}
                >
                  <img
                    src={imageUrl!}
                    alt="Source"
                    className="max-w-none pointer-events-none"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>

                {/* Optional Anthropometric Face Guide */}
                <FaceGuideOverlay
                  settings={faceGuide}
                  width={Math.min(380, 380 * activeAspectRatio)}
                  height={380 / activeAspectRatio > 480 ? 480 : 380 / activeAspectRatio}
                />
              </div>

              <div className="mt-3 text-xs text-[#676F69] flex items-center gap-3">
                <span>Click & drag to position</span>
                <span>•</span>
                <button
                  onClick={handleReset}
                  className="text-[#1F352E] underline hover:text-black font-medium cursor-pointer"
                >
                  Reset framing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 p-6 flex flex-col justify-between bg-white space-y-6">
          <div className="space-y-6">
            {/* Aspect Ratio Choices */}
            <div>
              <h3 className="text-xs font-semibold text-[#1E2320] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#1F352E]" />
                Crop Aspect Ratio
              </h3>

              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: 'preset', label: preset.photo.aspectRatioLabel },
                  { id: '1:1', label: '1 : 1 Square' },
                  { id: '4:5', label: '4 : 5 Portrait' },
                  { id: '3:4', label: '3 : 4 Classic' },
                  { id: '16:9', label: '16 : 9 Wide' }
                ].map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => setAspectChoice(choice.id)}
                    className={`py-1.5 px-2 text-[11px] rounded-xs border text-center transition-colors cursor-pointer ${
                      aspectChoice === choice.id
                        ? 'bg-[#1F352E] text-white border-[#1F352E] font-medium'
                        : 'bg-white text-[#676F69] border-[#E6E8E4] hover:bg-[#F2F4F0]'
                    }`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale & Rotate */}
            <div className="pt-4 border-t border-[#E6E8E4] space-y-4">
              <h3 className="text-xs font-semibold text-[#1E2320] uppercase tracking-wider">
                Zoom & Rotation
              </h3>

              <div>
                <div className="flex justify-between text-xs text-[#1E2320] mb-1 font-medium">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-[#676F69]" />
                    Zoom Level
                  </span>
                  <span className="font-mono text-[#676F69]">{zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  disabled={!loadedImage}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#1F352E] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-[#1E2320] mb-1.5 font-medium">
                  Rotate
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                    disabled={!loadedImage}
                    onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  >
                    -90° Left
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<RotateCw className="w-3.5 h-3.5" />}
                    disabled={!loadedImage}
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                  >
                    +90° Right
                  </Button>
                </div>
              </div>
            </div>

            {/* Optional Passport Framing Guide */}
            <div className="pt-4 border-t border-[#E6E8E4]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1E2320] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#1F352E]" />
                  Passport & ID Face Guide
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={faceGuide.visible}
                    onChange={(e) => setFaceGuide({ ...faceGuide, visible: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-[#E6E8E4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1F352E]"></div>
                </label>
              </div>
              <p className="text-[11px] text-[#676F69]">
                Enable this overlay when preparing official passport, visa, or recruitment photos to verify 60%–70% head coverage.
              </p>
            </div>
          </div>

          {/* Action Button */}
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
