import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Crop as CropIcon,
  FileType,
  FileText,
  Clipboard,
  Globe,
  Camera,
  Layers,
  FileCheck,
  Image as ImageIcon,
  PenTool,
  X
} from 'lucide-react';
import {
  SupportedFormat,
  FileSizeUnit,
  FileSizeMode,
  AspectRatioOption,
  ResizeMode,
  CropArea,
  FaceGuideSettings
} from '../../types';
import { renderCroppedCanvas, renderWholeResizedCanvas } from '../../engine/canvas';
import { compressCanvasToTargetSize, CompressionResult } from '../../engine/compressor';
import {
  createSyntheticDemoPhoto,
  createSyntheticDemoSignature,
  createSyntheticDemoDocument,
  createSyntheticDemoLandscape
} from '../../engine/demoGenerator';

interface UniversalImageEditorProps {
  initialWidth?: number;
  initialHeight?: number;
  initialMaxKb?: number;
  initialMinKb?: number;
  initialFormat?: SupportedFormat;
  initialSampleType?: 'portrait' | 'signature' | 'document' | 'landscape';
  initialImageUrl?: string;
  onOpenPresets?: () => void;
}

export const UniversalImageEditor: React.FC<UniversalImageEditorProps> = ({
  initialWidth = 1200,
  initialHeight = 800,
  initialMaxKb = 150,
  initialMinKb = 40,
  initialFormat = 'image/jpeg',
  initialSampleType,
  initialImageUrl,
  onOpenPresets
}) => {
  // Source Image state
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [originalMeta, setOriginalMeta] = useState<{
    name: string;
    width: number;
    height: number;
    sizeBytes: number;
    format: string;
  } | null>(null);

  // Output Dimensions Settings
  const [outputWidth, setOutputWidth] = useState<number>(initialWidth);
  const [outputHeight, setOutputHeight] = useState<number>(initialHeight);
  const [aspectLocked, setAspectLocked] = useState<boolean>(true);
  const [aspectRatioOption, setAspectRatioOption] = useState<AspectRatioOption>('3:2');
  const [customRatio, setCustomRatio] = useState<{ w: number; h: number }>({ w: 3, h: 2 });
  const [resizeMode, setResizeMode] = useState<ResizeMode>('crop_to_fit');

  // File Size Constraints (First-Class Feature!)
  const [fileSizeMode, setFileSizeMode] = useState<FileSizeMode>('min_max');
  const [maxSizeValue, setMaxSizeValue] = useState<number>(initialMaxKb);
  const [minSizeValue, setMinSizeValue] = useState<number>(initialMinKb || 40);
  const [sizeUnit, setSizeUnit] = useState<FileSizeUnit>('KB');

  // Format & Quality Settings
  const [outputFormat, setOutputFormat] = useState<SupportedFormat>(initialFormat);
  const [manualQuality, setManualQuality] = useState<number>(85);
  const [useAdaptiveQuality, setUseAdaptiveQuality] = useState<boolean>(true);

  // Viewport / Interactive Crop state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isFaceGuideVisible, setIsFaceGuideVisible] = useState<boolean>(false);

  // Processing & Live Blob Measurement
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<CompressionResult | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Drag & Drop
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Canvas pan dragging
  const isDraggingCanvasRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Input from Any Source states
  const [isUrlModalOpen, setIsUrlModalOpen] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Global Clipboard Paste listener (Ctrl+V)
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            const ext = blob.type.split('/')[1] || 'jpg';
            const pastedFile = new File([blob], `pasted_image_${Date.now()}.${ext}`, { type: blob.type });
            handleSelectFile(pastedFile);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  // Load sample by type
  const handleLoadSampleType = async (type: 'portrait' | 'signature' | 'document' | 'landscape') => {
    setIsProcessing(true);
    try {
      let demoBlob: Blob;
      let filename = 'sample_portrait.jpg';
      if (type === 'signature') {
        demoBlob = await createSyntheticDemoSignature();
        filename = 'sample_signature.jpg';
      } else if (type === 'document') {
        demoBlob = await createSyntheticDemoDocument();
        filename = 'sample_document.jpg';
      } else if (type === 'landscape') {
        demoBlob = await createSyntheticDemoLandscape();
        filename = 'sample_landscape.jpg';
      } else {
        demoBlob = await createSyntheticDemoPhoto();
        filename = 'sample_portrait.jpg';
      }
      const demoFile = new File([demoBlob], filename, { type: 'image/jpeg' });
      handleSelectFile(demoFile);
    } finally {
      setIsProcessing(false);
    }
  };

  // Initial sample loading if passed via prop
  useEffect(() => {
    if (initialSampleType && !file) {
      handleLoadSampleType(initialSampleType);
    }
  }, [initialSampleType]);

  // Initial web image loading if passed via prop
  useEffect(() => {
    if (initialImageUrl && !file) {
      const loadWebImg = async () => {
        setIsProcessing(true);
        try {
          const resp = await fetch(initialImageUrl);
          if (!resp.ok) throw new Error('Fetch failed');
          const blob = await resp.blob();
          const cleanName = initialImageUrl.split('/').pop()?.split('?')[0] || 'web_sample.jpg';
          const webFile = new File([blob], cleanName, { type: blob.type || 'image/jpeg' });
          handleSelectFile(webFile);
        } catch {
          // Graceful fallback to synthetic photo fixture
          const demoBlob = await createSyntheticDemoPhoto();
          const demoFile = new File([demoBlob], 'sample_portrait.jpg', { type: 'image/jpeg' });
          handleSelectFile(demoFile);
        } finally {
          setIsProcessing(false);
        }
      };
      loadWebImg();
    }
  }, [initialImageUrl]);

  // Direct Clipboard button
  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        alert('Please press Ctrl+V or Cmd+V to paste directly from your clipboard.');
        return;
      }
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const ext = imageType.split('/')[1] || 'png';
          const pasted = new File([blob], `clipboard_image_${Date.now()}.${ext}`, { type: imageType });
          handleSelectFile(pasted);
          return;
        }
      }
      alert('No image found in clipboard. Copy an image or screenshot first, then press Ctrl+V.');
    } catch {
      alert('Clipboard access was blocked by browser permissions. You can still paste directly using Ctrl+V or Cmd+V.');
    }
  };

  // Import from Web URL
  const handleImportFromUrl = async () => {
    if (!inputUrl.trim()) return;
    setIsLoadingUrl(true);
    setUrlError(null);
    try {
      const resp = await fetch(inputUrl.trim());
      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
      const blob = await resp.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to a valid image.');
      }
      const filename = inputUrl.split('/').pop()?.split('?')[0] || `web_image_${Date.now()}.jpg`;
      const webFile = new File([blob], filename, { type: blob.type });
      handleSelectFile(webFile);
      setIsUrlModalOpen(false);
      setInputUrl('');
    } catch (err: any) {
      console.error('URL import error:', err);
      setUrlError('Unable to load image from this URL. This may be due to CORS restrictions on the remote server. Try copying the image to your clipboard and pressing Ctrl+V, or saving it locally first.');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Convert entered values to Kilobytes for the compression engine
  const getBytesFromValue = (val: number, unit: FileSizeUnit): number => {
    if (unit === 'MB') return val * 1024 * 1024;
    if (unit === 'Bytes') return val;
    return val * 1024; // KB
  };

  const maxTargetBytes = getBytesFromValue(maxSizeValue, sizeUnit);
  const minTargetBytes = fileSizeMode === 'min_max' ? getBytesFromValue(minSizeValue, sizeUnit) : 0;
  const maxTargetKb = maxTargetBytes / 1024;
  const minTargetKb = minTargetBytes / 1024;

  // Compute active numerical aspect ratio
  const getActiveRatioNumber = useCallback((): number => {
    if (aspectRatioOption === '1:1') return 1;
    if (aspectRatioOption === '3:4') return 3 / 4;
    if (aspectRatioOption === '4:5') return 4 / 5;
    if (aspectRatioOption === '16:9') return 16 / 9;
    if (aspectRatioOption === '3:2') return 3 / 2;
    if (aspectRatioOption === 'original' && imageElement) {
      return imageElement.naturalWidth / imageElement.naturalHeight;
    }
    if (aspectRatioOption === 'custom' && customRatio.h > 0) {
      return customRatio.w / customRatio.h;
    }
    // Free or default to outputWidth / outputHeight
    return outputWidth / outputHeight;
  }, [aspectRatioOption, customRatio, imageElement, outputWidth, outputHeight]);

  // Handle image file selection
  const handleSelectFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
      setImageUrl(url);
      setFile(selectedFile);
      setOriginalMeta({
        name: selectedFile.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeBytes: selectedFile.size,
        format: selectedFile.type
      });
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    img.src = url;
  };

  // Load sample image
  const handleLoadSample = async () => {
    setIsProcessing(true);
    try {
      const demoBlob = await createSyntheticDemoPhoto();
      const demoFile = new File([demoBlob], 'sample_portrait.jpg', { type: 'image/jpeg' });
      handleSelectFile(demoFile);
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync width & height when aspect ratio option changes
  const handleAspectRatioChange = (opt: AspectRatioOption) => {
    setAspectRatioOption(opt);
    if (opt === 'free') {
      setAspectLocked(false);
    } else if (opt === '1:1') {
      setAspectLocked(true);
      setOutputHeight(outputWidth);
    } else if (opt === '3:4') {
      setAspectLocked(true);
      setOutputHeight(Math.round(outputWidth * (4 / 3)));
    } else if (opt === '4:5') {
      setAspectLocked(true);
      setOutputHeight(Math.round(outputWidth * (5 / 4)));
    } else if (opt === '16:9') {
      setAspectLocked(true);
      setOutputHeight(Math.round(outputWidth * (9 / 16)));
    } else if (opt === '3:2') {
      setAspectLocked(true);
      setOutputHeight(Math.round(outputWidth * (2 / 3)));
    } else if (opt === 'original' && imageElement) {
      setAspectLocked(true);
      const r = imageElement.naturalWidth / imageElement.naturalHeight;
      setOutputHeight(Math.round(outputWidth / r));
    } else if (opt === 'custom') {
      setAspectLocked(true);
      if (customRatio.h > 0) {
        setOutputHeight(Math.round(outputWidth / (customRatio.w / customRatio.h)));
      }
    }
  };

  // Width change handler with aspect lock
  const handleWidthChange = (newW: number) => {
    const validW = Math.max(10, Math.min(10000, newW || 10));
    setOutputWidth(validW);
    if (aspectLocked && aspectRatioOption !== 'free') {
      const ratio = getActiveRatioNumber();
      setOutputHeight(Math.max(10, Math.round(validW / ratio)));
    }
  };

  // Height change handler with aspect lock
  const handleHeightChange = (newH: number) => {
    const validH = Math.max(10, Math.min(10000, newH || 10));
    setOutputHeight(validH);
    if (aspectLocked && aspectRatioOption !== 'free') {
      const ratio = getActiveRatioNumber();
      setOutputWidth(Math.max(10, Math.round(validH * ratio)));
    }
  };

  // Process & encode canvas whenever inputs change
  const processImage = useCallback(async () => {
    if (!imageElement) return;
    setIsProcessing(true);
    setValidationError(null);

    try {
      let canvas: HTMLCanvasElement;

      if (resizeMode === 'resize_stretch' || resizeMode === 'fit_inside') {
        canvas = renderWholeResizedCanvas(
          imageElement,
          outputWidth,
          outputHeight,
          rotation,
          resizeMode === 'fit_inside'
        );
      } else {
        // Crop & scale to fit
        const imgW = imageElement.naturalWidth;
        const imgH = imageElement.naturalHeight;
        const targetRatio = outputWidth / outputHeight;

        const baseCropW = imgW / zoom;
        const baseCropH = baseCropW / targetRatio;

        const centerX = imgW / 2 - (pan.x / (250 * zoom)) * (imgW / 2);
        const centerY = imgH / 2 - (pan.y / (250 * zoom)) * (imgH / 2);

        const cropArea: CropArea = {
          x: Math.max(0, Math.min(imgW - baseCropW, centerX - baseCropW / 2)),
          y: Math.max(0, Math.min(imgH - baseCropH, centerY - baseCropH / 2)),
          width: Math.min(imgW, baseCropW),
          height: Math.min(imgH, baseCropH)
        };

        canvas = renderCroppedCanvas(imageElement, cropArea, outputWidth, outputHeight, rotation);
      }

      // Compression & encoding
      let result: CompressionResult;
      if (useAdaptiveQuality && fileSizeMode !== 'quality_only') {
        result = await compressCanvasToTargetSize(canvas, {
          minSizeKb: minTargetKb,
          maxSizeKb: maxTargetKb,
          format: outputFormat,
          allowDimensionScaling: false // Universal editor preserves user's exact requested width & height
        });
      } else {
        // Manual quality encoding
        const q = manualQuality / 100;
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), outputFormat, q));
        const sizeBytes = blob.size;
        const sizeKb = +(sizeBytes / 1024).toFixed(2);
        const satisfiesMax = fileSizeMode === 'quality_only' || sizeBytes <= maxTargetBytes;
        const satisfiesMin = fileSizeMode !== 'min_max' || sizeBytes >= minTargetBytes;

        result = {
          blob,
          sizeBytes,
          sizeKb,
          quality: q,
          width: outputWidth,
          height: outputHeight,
          iterations: 1,
          satisfiesMin,
          satisfiesMax,
          explanation: !satisfiesMax
            ? `Output size (${sizeKb} KB) exceeds your maximum limit of ${maxSizeValue} ${sizeUnit}.`
            : !satisfiesMin
            ? `Output size (${sizeKb} KB) is below your minimum limit of ${minSizeValue} ${sizeUnit}.`
            : undefined
        };
      }

      setLastResult(result);

      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
      setPreviewBlobUrl(URL.createObjectURL(result.blob));

      // Check validation
      if (!result.satisfiesMax || !result.satisfiesMin) {
        setValidationError(result.explanation || 'File size limits could not be met with current settings.');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setValidationError('Failed to render and compress image.');
    } finally {
      setIsProcessing(false);
    }
  }, [
    imageElement,
    outputWidth,
    outputHeight,
    rotation,
    resizeMode,
    zoom,
    pan,
    useAdaptiveQuality,
    fileSizeMode,
    minTargetKb,
    maxTargetKb,
    minTargetBytes,
    maxTargetBytes,
    outputFormat,
    manualQuality,
    maxSizeValue,
    minSizeValue,
    sizeUnit
  ]);

  // Trigger processing on changes with debounce
  useEffect(() => {
    if (!imageElement) return;
    const timer = setTimeout(() => {
      processImage();
    }, 180);
    return () => clearTimeout(timer);
  }, [processImage, imageElement]);

  // Canvas pan mouse handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!imageElement) return;
    isDraggingCanvasRef.current = true;
    dragStartPosRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCanvasRef.current) return;
    setPan({
      x: e.clientX - dragStartPosRef.current.x,
      y: e.clientY - dragStartPosRef.current.y
    });
  };

  const handleCanvasMouseUp = () => {
    isDraggingCanvasRef.current = false;
  };

  // Download action
  const handleDownload = () => {
    if (!lastResult || !lastResult.blob) return;
    const ext = outputFormat === 'image/jpeg' ? '.jpg' : outputFormat === 'image/webp' ? '.webp' : '.png';
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'prepared_image';
    const filename = `${baseName}_${outputWidth}x${outputHeight}${ext}`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(lastResult.blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetSettings = () => {
    setOutputWidth(initialWidth);
    setOutputHeight(initialHeight);
    setAspectLocked(true);
    setAspectRatioOption('3:2');
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setMaxSizeValue(200);
    setMinSizeValue(20);
    setSizeUnit('KB');
    setOutputFormat('image/jpeg');
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#DFE2DC] rounded-[3px] shadow-xs overflow-hidden flex flex-col">
      {/* Top Utility Header */}
      <div className="px-5 py-3 border-b border-[#DFE2DC] bg-[#F5F5F2] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#242824] tracking-tight">
              Image Editor & Resizer
            </span>
            <span className="text-[11px] font-mono text-[#737872] bg-[#EAECE7] px-2 py-0.5 rounded-[2px]">
              {outputWidth} × {outputHeight} px
            </span>
          </div>
          {originalMeta && (
            <span className="hidden sm:inline-block text-xs text-[#737872]">
              Source: {originalMeta.width} × {originalMeta.height} px ({(originalMeta.sizeBytes / 1024).toFixed(1)} KB)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenPresets && (
            <button
              onClick={onOpenPresets}
              className="text-xs px-2.5 py-1.5 border border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] text-[#242824] bg-white cursor-pointer transition-colors"
            >
              Presets Library...
            </button>
          )}

          <button
            onClick={handleResetSettings}
            className="text-xs px-2.5 py-1.5 border border-[#DFE2DC] hover:bg-[#F0F1ED] rounded-[3px] text-[#737872] hover:text-[#242824] bg-white cursor-pointer transition-colors flex items-center gap-1"
            title="Reset dimensions and framing"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!lastResult || isProcessing}
            className={`text-xs px-3.5 py-1.5 rounded-[3px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              lastResult && !isProcessing
                ? 'bg-[#34483E] hover:bg-[#26362E] text-white shadow-xs'
                : 'bg-[#EAECE7] text-[#9EA39D] cursor-not-allowed'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              Download
              {lastResult ? ` (${lastResult.sizeKb} KB)` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Main 2-Pane Editor Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left / Central Image Preview Canvas (approx 70% width on desktop) */}
        <div className="lg:col-span-8 bg-[#F0F1ED] p-4 sm:p-6 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-[#DFE2DC] select-none">
          {!imageElement ? (
            /* Upload & Universal Input Dropzone */
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleSelectFile(e.dataTransfer.files[0]);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[4px] p-6 sm:p-8 transition-colors text-center ${
                dragActive
                  ? 'border-[#34483E] bg-[#EAECE7]'
                  : 'border-[#CBD0C8] bg-white hover:border-[#737872]'
              }`}
            >
              <div className="w-12 h-12 rounded-[4px] bg-[#F5F5F2] border border-[#DFE2DC] flex items-center justify-center text-[#34483E] mb-3 shadow-2xs">
                <Upload className="w-6 h-6 text-[#34483E]" />
              </div>

              <h3 className="text-base font-bold text-[#242824] mb-1">
                Drop your image here or choose a source
              </h3>
              <p className="text-xs text-[#737872] max-w-md mb-5 leading-relaxed">
                Take images from any source: local disk, clipboard paste, direct URL, mobile camera, or sample fixtures.
              </p>

              {/* 4 Input Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg mb-6">
                {/* 1. Local File */}
                <label className="px-3.5 py-2 bg-[#34483E] hover:bg-[#26362E] active:scale-[0.98] text-white text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-xs flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files && e.target.files[0] && handleSelectFile(e.target.files[0])}
                  />
                </label>

                {/* 2. Clipboard Paste */}
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-3.5 py-2 bg-white hover:bg-[#F5F5F2] active:scale-[0.98] text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 flex items-center gap-1.5 shadow-2xs"
                  title="Paste from clipboard or press Ctrl+V"
                >
                  <Clipboard className="w-3.5 h-3.5 text-[#34483E]" />
                  <span>Paste (Ctrl+V)</span>
                </button>

                {/* 3. Web URL */}
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(true)}
                  className="px-3.5 py-2 bg-white hover:bg-[#F5F5F2] active:scale-[0.98] text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 flex items-center gap-1.5 shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5 text-[#34483E]" />
                  <span>Web URL</span>
                </button>

                {/* 4. Mobile Camera */}
                <label className="px-3.5 py-2 bg-white hover:bg-[#F5F5F2] active:scale-[0.98] text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 flex items-center gap-1.5 shadow-2xs">
                  <Camera className="w-3.5 h-3.5 text-[#34483E]" />
                  <span>Camera</span>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files && e.target.files[0] && handleSelectFile(e.target.files[0])}
                  />
                </label>
              </div>

              {/* Curated Sample Fixtures Bar */}
              <div className="w-full max-w-md pt-4 border-t border-[#DFE2DC]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737872] mb-2.5">
                  Or load one-click sample fixture:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSampleType('portrait')}
                    className="px-2 py-1.5 bg-[#FAF9F6] hover:bg-[#F0F1ED] active:scale-[0.96] text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-[11px] font-medium rounded-[2px] cursor-pointer transition-all duration-150 flex items-center justify-center gap-1 hover:-translate-y-0.5"
                  >
                    <ImageIcon className="w-3 h-3 text-[#34483E]" />
                    <span>Portrait</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleType('signature')}
                    className="px-2 py-1.5 bg-[#FAF9F6] hover:bg-[#F0F1ED] active:scale-[0.96] text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-[11px] font-medium rounded-[2px] cursor-pointer transition-all duration-150 flex items-center justify-center gap-1 hover:-translate-y-0.5"
                  >
                    <PenTool className="w-3 h-3 text-[#34483E]" />
                    <span>Signature</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleType('document')}
                    className="px-2 py-1.5 bg-[#FAF9F6] hover:bg-[#F0F1ED] active:scale-[0.96] text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-[11px] font-medium rounded-[2px] cursor-pointer transition-all duration-150 flex items-center justify-center gap-1 hover:-translate-y-0.5"
                  >
                    <FileCheck className="w-3 h-3 text-[#34483E]" />
                    <span>Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleType('landscape')}
                    className="px-2 py-1.5 bg-[#FAF9F6] hover:bg-[#F0F1ED] active:scale-[0.96] text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-[11px] font-medium rounded-[2px] cursor-pointer transition-all duration-150 flex items-center justify-center gap-1 hover:-translate-y-0.5"
                  >
                    <Layers className="w-3 h-3 text-[#34483E]" />
                    <span>Landscape</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 text-[11px] text-[#737872]">
                <span>✓ Zero Server Uploads</span>
                <span>•</span>
                <span>✓ 100% In-Browser</span>
                <span>•</span>
                <span>✓ Exact Byte Target</span>
              </div>
            </div>
          ) : (
            /* Active Interactive Canvas Preview */
            <div className="flex-1 flex flex-col justify-between">
              {/* Canvas Floating Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-[#DFE2DC]">
                <div className="flex items-center gap-1.5 bg-white border border-[#DFE2DC] p-1 rounded-[3px] shadow-2xs">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))}
                    className="p-1 hover:bg-[#F5F5F2] active:scale-95 text-[#242824] rounded-[2px] cursor-pointer transition-transform"
                    title="Zoom Out"
                    aria-label="Zoom out preview"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono w-10 text-center text-[#242824]" aria-label={`Current zoom level ${Math.round(zoom * 100)}%`}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(3.0, +(z + 0.1).toFixed(1)))}
                    className="p-1 hover:bg-[#F5F5F2] active:scale-95 text-[#242824] rounded-[2px] cursor-pointer transition-transform"
                    title="Zoom In"
                    aria-label="Zoom in preview"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-white border border-[#DFE2DC] p-1 rounded-[3px] shadow-2xs">
                    <button
                      onClick={() => setRotation((r) => (r - 90) % 360)}
                      className="p-1 hover:bg-[#F5F5F2] active:scale-95 text-[#242824] rounded-[2px] cursor-pointer flex items-center gap-1 text-[11px] transition-transform"
                      title="Rotate 90 degrees counter-clockwise"
                      aria-label="Rotate 90 degrees counter-clockwise"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">-90°</span>
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1 hover:bg-[#F5F5F2] active:scale-95 text-[#242824] rounded-[2px] cursor-pointer flex items-center gap-1 text-[11px] transition-transform"
                      title="Rotate 90 degrees clockwise"
                      aria-label="Rotate 90 degrees clockwise"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">+90°</span>
                    </button>
                  </div>

                  {/* Input Source Swapping when image is loaded */}
                  <div className="flex items-center gap-1">
                    <label className="text-[11px] px-2.5 py-1.5 bg-white border border-[#DFE2DC] hover:border-[#34483E] active:scale-95 rounded-[3px] cursor-pointer text-[#242824] transition-all shadow-2xs flex items-center gap-1 btn-tactile">
                      <Upload className="w-3 h-3 text-[#34483E]" />
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => e.target.files && e.target.files[0] && handleSelectFile(e.target.files[0])}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="text-[11px] p-1.5 bg-white border border-[#DFE2DC] hover:border-[#34483E] active:scale-95 rounded-[3px] cursor-pointer text-[#242824] transition-all shadow-2xs btn-tactile"
                      title="Paste another image from clipboard"
                      aria-label="Paste image from clipboard"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-[#34483E]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsUrlModalOpen(true)}
                      className="text-[11px] p-1.5 bg-white border border-[#DFE2DC] hover:border-[#34483E] active:scale-95 rounded-[3px] cursor-pointer text-[#242824] transition-all shadow-2xs btn-tactile"
                      title="Import from web URL"
                      aria-label="Import image from web URL"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#34483E]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Viewport Box */}
              <div
                className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing relative py-2"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
              >
                <div
                  className="relative bg-white shadow-md border border-[#CBD0C8] overflow-hidden flex items-center justify-center transition-all"
                  style={{
                    width: '100%',
                    maxWidth: '480px',
                    aspectRatio: `${outputWidth} / ${outputHeight}`
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Active Preview"
                      className="max-w-none pointer-events-none transition-transform"
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center'
                      }}
                    />
                  ) : null}

                  {/* Framing Overlay Grid */}
                  <div className="absolute inset-0 pointer-events-none border border-[#34483E]/40 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-[#34483E]/20" />
                    <div className="border-r border-b border-[#34483E]/20" />
                    <div className="border-b border-[#34483E]/20" />
                    <div className="border-r border-b border-[#34483E]/20" />
                    <div className="border-r border-b border-[#34483E]/20" />
                    <div className="border-b border-[#34483E]/20" />
                    <div className="border-r border-[#34483E]/20" />
                    <div className="border-r border-[#34483E]/20" />
                    <div />
                  </div>
                </div>
              </div>

              {/* Bottom Canvas Status Bar */}
              <div className="mt-3 pt-2.5 border-t border-[#DFE2DC] flex flex-wrap items-center justify-between gap-2 text-xs text-[#737872]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#242824] font-medium">
                    {outputWidth} × {outputHeight} px
                  </span>
                  <span>•</span>
                  <span>Ratio: {(outputWidth / outputHeight).toFixed(3)}</span>
                  <span>•</span>
                  <span>{outputFormat.replace('image/', '').toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  {lastResult ? (
                    <span className={`font-semibold ${lastResult.satisfiesMax && lastResult.satisfiesMin ? 'text-[#39765A]' : 'text-[#A87532]'}`}>
                      Encoded: {lastResult.sizeKb} KB ({lastResult.sizeBytes.toLocaleString()} B)
                    </span>
                  ) : (
                    <span>Calculating...</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Properties Panel: Universal Output Settings */}
        <div className="lg:col-span-4 p-4 sm:p-5 bg-white space-y-5 lg:overflow-y-auto lg:max-h-[820px]">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737872] mb-1">
              Properties & Output Settings
            </h4>
            <p className="text-xs text-[#737872]">
              Freely configure dimensions, aspect ratio, and file-size constraints.
            </p>
          </div>

          {/* 1. DIMENSIONS */}
          <div className="space-y-3 pt-2 border-t border-[#DFE2DC]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#242824]">
                Target Dimensions
              </span>
              <button
                type="button"
                onClick={() => setAspectLocked(!aspectLocked)}
                aria-pressed={aspectLocked}
                className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-[2px] transition-all duration-150 cursor-pointer chip-tactile ${
                  aspectLocked
                    ? 'bg-[#EAECE7] text-[#34483E] font-medium shadow-2xs'
                    : 'bg-white text-[#737872] border border-[#DFE2DC] hover:border-[#34483E]'
                }`}
                title={aspectLocked ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                aria-label={aspectLocked ? 'Aspect ratio locked. Click to unlock.' : 'Aspect ratio unlocked. Click to lock.'}
              >
                {aspectLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{aspectLocked ? 'Locked' : 'Unlocked'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="editor-target-width" className="text-[11px] text-[#737872] block mb-1">Width (px)</label>
                <input
                  id="editor-target-width"
                  type="number"
                  min="10"
                  max="10000"
                  value={outputWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-mono px-3 py-1.5 border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] bg-[#F5F5F2] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="editor-target-height" className="text-[11px] text-[#737872] block mb-1">Height (px)</label>
                <input
                  id="editor-target-height"
                  type="number"
                  min="10"
                  max="10000"
                  value={outputHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-mono px-3 py-1.5 border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] bg-[#F5F5F2] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Aspect Ratio Selector Chips */}
            <div>
              <label className="text-[11px] text-[#737872] block mb-1.5">Aspect Ratio Presets</label>
              <div className="grid grid-cols-4 gap-1 text-[11px]">
                {(['free', 'original', '1:1', '3:4', '4:5', '16:9', '3:2', 'custom'] as AspectRatioOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAspectRatioChange(opt)}
                    aria-pressed={aspectRatioOption === opt}
                    className={`py-1 rounded-[2px] border transition-all duration-150 cursor-pointer text-center capitalize chip-tactile ${
                      aspectRatioOption === opt
                        ? 'bg-[#34483E] text-white border-[#34483E] font-medium shadow-2xs'
                        : 'bg-[#F5F5F2] hover:bg-[#EAECE7] text-[#242824] border-[#DFE2DC] hover:border-[#737872]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {aspectRatioOption === 'custom' && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-[#F5F5F2] border border-[#DFE2DC] rounded-[2px] text-xs">
                  <span className="text-[11px] text-[#737872]">Ratio:</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customRatio.w}
                    aria-label="Custom aspect ratio width"
                    onChange={(e) => {
                      const w = parseFloat(e.target.value) || 1;
                      setCustomRatio((prev) => ({ ...prev, w }));
                      if (aspectLocked && customRatio.h > 0) {
                        setOutputHeight(Math.max(10, Math.round(outputWidth / (w / customRatio.h))));
                      }
                    }}
                    className="w-16 text-xs font-mono px-2 py-1 bg-white border border-[#DFE2DC] rounded-[2px]"
                    placeholder="W"
                  />
                  <span className="text-[#737872]">:</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customRatio.h}
                    aria-label="Custom aspect ratio height"
                    onChange={(e) => {
                      const h = parseFloat(e.target.value) || 1;
                      setCustomRatio((prev) => ({ ...prev, h }));
                      if (aspectLocked && h > 0) {
                        setOutputHeight(Math.max(10, Math.round(outputWidth / (customRatio.w / h))));
                      }
                    }}
                    className="w-16 text-xs font-mono px-2 py-1 bg-white border border-[#DFE2DC] rounded-[2px]"
                    placeholder="H"
                  />
                </div>
              )}
            </div>

            {/* Resize Mode */}
            <div>
              <label htmlFor="editor-framing-mode" className="text-[11px] text-[#737872] block mb-1">Framing Behavior</label>
              <select
                id="editor-framing-mode"
                value={resizeMode}
                onChange={(e) => setResizeMode(e.target.value as ResizeMode)}
                className="w-full text-xs px-2.5 py-1.5 border border-[#DFE2DC] rounded-[3px] bg-white focus:outline-none focus:border-[#34483E] cursor-pointer hover:border-[#737872] transition-colors"
              >
                <option value="crop_to_fit">Crop viewport & Scale to Fit</option>
                <option value="fit_inside">Fit inside (letterbox background)</option>
                <option value="resize_stretch">Resample entire image</option>
              </select>
            </div>
          </div>

          {/* 2. FILE SIZE CONSTRAINTS (First-Class Feature!) */}
          <div className="space-y-3 pt-3 border-t border-[#DFE2DC]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#242824]">
                Target File Size
              </span>
              {/* Unit Selector */}
              <div className="flex items-center gap-1 text-[11px]">
                {(['KB', 'MB', 'Bytes'] as FileSizeUnit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setSizeUnit(u)}
                    aria-pressed={sizeUnit === u}
                    className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer transition-all duration-150 chip-tactile ${
                      sizeUnit === u
                        ? 'bg-[#34483E] text-white font-medium shadow-2xs'
                        : 'text-[#737872] hover:text-[#242824]'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-1 bg-[#F0F1ED] p-0.5 rounded-[3px] text-xs">
              <button
                onClick={() => setFileSizeMode('max_only')}
                aria-pressed={fileSizeMode === 'max_only'}
                className={`py-1 text-center rounded-[2px] transition-all duration-150 cursor-pointer chip-tactile ${
                  fileSizeMode === 'max_only'
                    ? 'bg-white text-[#242824] font-medium shadow-2xs'
                    : 'text-[#737872] hover:text-[#242824]'
                }`}
              >
                Max Only
              </button>
              <button
                onClick={() => setFileSizeMode('min_max')}
                aria-pressed={fileSizeMode === 'min_max'}
                className={`py-1 text-center rounded-[2px] transition-all duration-150 cursor-pointer chip-tactile ${
                  fileSizeMode === 'min_max'
                    ? 'bg-white text-[#242824] font-medium shadow-2xs'
                    : 'text-[#737872] hover:text-[#242824]'
                }`}
              >
                Min & Max Range
              </button>
            </div>

            {/* Numeric Size Inputs */}
            <div className={`grid ${fileSizeMode === 'min_max' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {fileSizeMode === 'min_max' && (
                <div>
                  <label htmlFor="editor-min-size" className="text-[11px] text-[#737872] block mb-1">
                    Minimum ({sizeUnit})
                  </label>
                  <input
                    id="editor-min-size"
                    type="number"
                    min="1"
                    max={maxSizeValue}
                    value={minSizeValue}
                    onChange={(e) => setMinSizeValue(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full text-xs font-mono px-3 py-1.5 border border-[#DFE2DC] rounded-[3px] bg-[#F5F5F2] focus:bg-white focus:outline-none focus:border-[#34483E] transition-colors"
                  />
                </div>
              )}

              <div>
                <label htmlFor="editor-max-size" className="text-[11px] text-[#737872] block mb-1">
                  Maximum ({sizeUnit})
                </label>
                <input
                  id="editor-max-size"
                  type="number"
                  min="1"
                  max="100000000"
                  value={maxSizeValue}
                  onChange={(e) => setMaxSizeValue(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full text-xs font-mono px-3 py-1.5 border border-[#DFE2DC] rounded-[3px] bg-[#F5F5F2] focus:bg-white focus:outline-none focus:border-[#34483E] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#737872]">
              <span>Adaptive binary-search compression</span>
              <span className="font-mono text-[#242824]">
                Target: {fileSizeMode === 'min_max' ? `${minSizeValue}–${maxSizeValue}` : `≤ ${maxSizeValue}`} {sizeUnit}
              </span>
            </div>
          </div>

          {/* 3. FORMAT & QUALITY */}
          <div className="space-y-3 pt-3 border-t border-[#DFE2DC]">
            <span className="text-xs font-semibold text-[#242824] block">
              Format & Encoding
            </span>

            <div className="grid grid-cols-3 gap-2">
              {(['image/jpeg', 'image/png', 'image/webp'] as SupportedFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  aria-pressed={outputFormat === fmt}
                  className={`py-1.5 text-xs rounded-[3px] border font-medium transition-all duration-150 cursor-pointer text-center uppercase font-mono chip-tactile ${
                    outputFormat === fmt
                      ? 'bg-[#34483E] text-white border-[#34483E] shadow-2xs'
                      : 'bg-white hover:bg-[#F5F5F2] text-[#242824] border-[#DFE2DC] hover:border-[#737872]'
                  }`}
                >
                  {fmt === 'image/jpeg' ? 'JPEG' : fmt === 'image/png' ? 'PNG' : 'WebP'}
                </button>
              ))}
            </div>

            {outputFormat === 'image/png' && (
              <p className="text-[11px] text-[#A87532] bg-[#FAF5EB] p-2 rounded-[2px] border border-[#E8DAC2]">
                PNG uses lossless compression. Strict byte limits are enforced via color depth and dimensional optimization. For fine-grained compression, JPEG or WebP is recommended.
              </p>
            )}
          </div>

          {/* 4. VERIFICATION STATUS BADGE */}
          <div className="pt-3 border-t border-[#DFE2DC]">
            <div className="text-xs font-semibold text-[#242824] mb-2 flex items-center justify-between">
              <span>Actual Encoded Output</span>
              {isProcessing && <span className="text-[11px] text-[#737872]">Encoding...</span>}
            </div>

            <div className="bg-[#F5F5F2] border border-[#DFE2DC] rounded-[3px] p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#737872]">Output Dimensions:</span>
                <span className="font-mono font-medium text-[#242824]">
                  {outputWidth} × {outputHeight} px
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#737872]">Measured Blob Size:</span>
                <span className="font-mono font-medium text-[#242824]">
                  {lastResult ? `${lastResult.sizeKb} KB (${lastResult.sizeBytes.toLocaleString()} B)` : '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#737872]">Target Constraint:</span>
                <span className="font-mono text-[#242824]">
                  {fileSizeMode === 'min_max'
                    ? `${minSizeValue} ${sizeUnit} – ${maxSizeValue} ${sizeUnit}`
                    : `≤ ${maxSizeValue} ${sizeUnit}`}
                </span>
              </div>

              {/* Status Outcome */}
              <div className="pt-2 border-t border-[#DFE2DC] flex items-center justify-between">
                <span className="text-[#737872]">Status:</span>
                {!lastResult ? (
                  <span className="text-[#737872] font-medium text-[11px]">
                    Awaiting Image
                  </span>
                ) : lastResult.satisfiesMax && lastResult.satisfiesMin ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[#39765A]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-[#B44B43]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Out of Range
                  </span>
                )}
              </div>

              {validationError && (
                <div className="text-[11px] text-[#B44B43] bg-[#FDF2F2] p-2 rounded-[2px] border border-[#F5C2C2] mt-2">
                  {validationError}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleDownload}
              disabled={!lastResult || isProcessing}
              className={`w-full py-2.5 rounded-[3px] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-xs hover:shadow-sm active:scale-[0.98] ${
                lastResult && !isProcessing
                  ? 'bg-[#34483E] hover:bg-[#26362E] text-white'
                  : 'bg-[#EAECE7] text-[#9EA39D] cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                Download Output Image
                {lastResult ? ` (${lastResult.sizeKb} KB)` : ''}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Import from Web URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#242824]/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE2DC] rounded-[4px] shadow-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE2DC]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#34483E]" />
                <h3 className="text-sm font-bold text-[#242824]">Import Image from Web URL</h3>
              </div>
              <button
                onClick={() => { setIsUrlModalOpen(false); setUrlError(null); }}
                className="p-1 text-[#737872] hover:text-[#242824] rounded-[2px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#737872] leading-relaxed">
              Enter any direct image link (JPEG, PNG, or WebP). The image is fetched directly into your browser's local memory with zero external tracking.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#242824] uppercase tracking-wider block">
                Direct Image Link (HTTPS)
              </label>
              <input
                type="url"
                placeholder="https://example.com/sample-photo.jpg"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleImportFromUrl()}
                className="w-full px-3 py-2 text-xs border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] font-mono text-[#242824]"
                autoFocus
              />
            </div>

            {urlError && (
              <div className="text-[11px] text-[#B44B43] bg-[#FDF2F2] p-2.5 rounded-[2px] border border-[#F5C2C2] leading-relaxed">
                {urlError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE2DC]">
              <button
                type="button"
                onClick={() => { setIsUrlModalOpen(false); setUrlError(null); }}
                className="px-3 py-1.5 border border-[#DFE2DC] hover:bg-[#F5F5F2] text-xs font-medium rounded-[3px] text-[#737872] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportFromUrl}
                disabled={isLoadingUrl || !inputUrl.trim()}
                className={`px-4 py-1.5 text-xs font-semibold rounded-[3px] text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs ${
                  isLoadingUrl || !inputUrl.trim()
                    ? 'bg-[#CBD0C8] cursor-not-allowed'
                    : 'bg-[#34483E] hover:bg-[#26362E]'
                }`}
              >
                {isLoadingUrl ? 'Fetching...' : 'Load into Editor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
