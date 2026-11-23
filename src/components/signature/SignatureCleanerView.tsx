import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  Sliders,
  RotateCw,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  FileText,
  PenTool
} from 'lucide-react';
import { SignatureFilterSettings, SupportedFormat } from '../../types';
import { applySignatureFilters } from '../../engine/filters';
import { renderCroppedCanvas } from '../../engine/canvas';
import { compressCanvasToTargetSize, CompressionResult } from '../../engine/compressor';
import { createSyntheticDemoSignature } from '../../engine/demoGenerator';

export const SignatureCleanerView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Dimensions & Sizing
  const [targetWidth, setTargetWidth] = useState<number>(600);
  const [targetHeight, setTargetHeight] = useState<number>(200);
  const [targetMaxKb, setTargetMaxKb] = useState<number>(50);
  const [targetMinKb, setTargetMinKb] = useState<number>(5);
  const [format, setFormat] = useState<SupportedFormat>('image/jpeg');

  // Filters
  const [filters, setFilters] = useState<SignatureFilterSettings>({
    grayscale: true,
    brightness: 12,
    contrast: 35,
    threshold: 215,
    inkEnhancement: true,
    backgroundWhitening: true
  });

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);

  // Result
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSelectFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
      setImageUrl(url);
      setFile(selectedFile);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = url;
  };

  const handleLoadSample = async () => {
    setIsProcessing(true);
    try {
      const demoBlob = await createSyntheticDemoSignature();
      const demoFile = new File([demoBlob], 'sample_signature.jpg', { type: 'image/jpeg' });
      handleSelectFile(demoFile);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process filters & compression
  useEffect(() => {
    if (!imageElement) return;

    let isMounted = true;
    const runProcessing = async () => {
      setIsProcessing(true);
      try {
        const cropArea = {
          x: 0,
          y: 0,
          width: imageElement.naturalWidth,
          height: imageElement.naturalHeight
        };

        // Render cropped canvas
        let canvas = renderCroppedCanvas(imageElement, cropArea, targetWidth, targetHeight, rotation);

        // Apply signature whitening & ink filters
        canvas = applySignatureFilters(canvas, filters);

        // Compress
        const comp = await compressCanvasToTargetSize(canvas, {
          minSizeKb: targetMinKb,
          maxSizeKb: targetMaxKb,
          format,
          allowDimensionScaling: false
        });

        if (isMounted) {
          setResultCanvas(canvas);
          setCompressionResult(comp);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(comp.blob));
        }
      } catch (err) {
        console.error('Signature processing failed:', err);
      } finally {
        if (isMounted) setIsProcessing(false);
      }
    };

    const timer = setTimeout(runProcessing, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imageElement, targetWidth, targetHeight, targetMaxKb, targetMinKb, format, filters, rotation]);

  const handleDownload = () => {
    if (!compressionResult) return;
    const ext = format === 'image/jpeg' ? '.jpg' : format === 'image/webp' ? '.webp' : '.png';
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'cleaned_signature';
    const link = document.createElement('a');
    link.href = previewUrl || URL.createObjectURL(compressionResult.blob);
    link.download = `${baseName}_${targetWidth}x${targetHeight}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#737872] uppercase tracking-wider">
              Signature & Paper Scanner
            </span>
            <span className="text-[11px] font-mono bg-[#EAECE7] text-[#34483E] px-2 py-0.5 rounded-[2px]">
              Paper Whitening Engine
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#242824] tracking-tight">
            Signature & Ink Cleaner
          </h2>
          <p className="text-xs text-[#737872] mt-0.5">
            Whiten uneven paper shadows, darken faint ink strokes, and export crisp digital signatures for contracts, applications, and documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="text-xs px-3 py-1.5 bg-white border border-[#DFE2DC] hover:border-[#34483E] text-[#34483E] rounded-[3px] font-medium cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <PenTool className="w-3.5 h-3.5 text-[#39765A]" />
            Try Sample Signature
          </button>

          <label className="text-xs px-3.5 py-1.5 bg-[#34483E] hover:bg-[#26362E] text-white rounded-[3px] font-medium cursor-pointer transition-colors shadow-xs flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Upload Signature
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files && e.target.files[0] && handleSelectFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Main 2-Pane Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Properties Panel */}
        <div className="lg:col-span-5 bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs space-y-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737872] mb-1">
              Ink & Background Filters
            </h3>
            <p className="text-xs text-[#737872]">
              Adjust threshold and paper whitening to remove grey shadows and creases.
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2 pt-2 border-t border-[#DFE2DC] text-xs">
            <label className="flex items-center justify-between p-2 rounded-[2px] hover:bg-[#F5F5F2] cursor-pointer">
              <span className="font-medium text-[#242824]">Background Paper Whitening</span>
              <input
                type="checkbox"
                checked={filters.backgroundWhitening}
                onChange={(e) => setFilters({ ...filters, backgroundWhitening: e.target.checked })}
                className="rounded-[2px]"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-[2px] hover:bg-[#F5F5F2] cursor-pointer">
              <span className="font-medium text-[#242824]">Stroke Ink Enhancement</span>
              <input
                type="checkbox"
                checked={filters.inkEnhancement}
                onChange={(e) => setFilters({ ...filters, inkEnhancement: e.target.checked })}
                className="rounded-[2px]"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-[2px] hover:bg-[#F5F5F2] cursor-pointer">
              <span className="font-medium text-[#242824]">Monochrome Grayscale</span>
              <input
                type="checkbox"
                checked={filters.grayscale}
                onChange={(e) => setFilters({ ...filters, grayscale: e.target.checked })}
                className="rounded-[2px]"
              />
            </label>
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-3 border-t border-[#DFE2DC] text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="sig-paper-threshold" className="text-[#737872]">Paper Threshold:</label>
                <span className="font-mono text-[#242824]">{filters.threshold}</span>
              </div>
              <input
                id="sig-paper-threshold"
                type="range"
                min="100"
                max="250"
                value={filters.threshold}
                aria-label="Paper whitening threshold"
                onChange={(e) => setFilters({ ...filters, threshold: parseInt(e.target.value, 10) })}
                className="w-full accent-[#34483E] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="sig-contrast-boost" className="text-[#737872]">Contrast Boost:</label>
                <span className="font-mono text-[#242824]">+{filters.contrast}%</span>
              </div>
              <input
                id="sig-contrast-boost"
                type="range"
                min="0"
                max="80"
                value={filters.contrast}
                aria-label="Contrast boost percentage"
                onChange={(e) => setFilters({ ...filters, contrast: parseInt(e.target.value, 10) })}
                className="w-full accent-[#34483E] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="sig-paper-brightness" className="text-[#737872]">Paper Brightness:</label>
                <span className="font-mono text-[#242824]">+{filters.brightness}%</span>
              </div>
              <input
                id="sig-paper-brightness"
                type="range"
                min="-20"
                max="50"
                value={filters.brightness}
                aria-label="Paper brightness percentage"
                onChange={(e) => setFilters({ ...filters, brightness: parseInt(e.target.value, 10) })}
                className="w-full accent-[#34483E] cursor-pointer"
              />
            </div>
          </div>

          {/* Output Dimensions & Target File Size */}
          <div className="space-y-3 pt-3 border-t border-[#DFE2DC] text-xs">
            <h4 className="font-semibold text-[#242824]">Output Sizing</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sig-output-width" className="text-[11px] text-[#737872] block mb-1">Width (px)</label>
                <input
                  id="sig-output-width"
                  type="number"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(parseInt(e.target.value, 10) || 100)}
                  className="w-full font-mono px-2.5 py-1.5 bg-[#F5F5F2] focus:bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="sig-output-height" className="text-[11px] text-[#737872] block mb-1">Height (px)</label>
                <input
                  id="sig-output-height"
                  type="number"
                  value={targetHeight}
                  onChange={(e) => setTargetHeight(parseInt(e.target.value, 10) || 50)}
                  className="w-full font-mono px-2.5 py-1.5 bg-[#F5F5F2] focus:bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sig-target-max-kb" className="text-[11px] text-[#737872] block mb-1">Max KB</label>
                <input
                  id="sig-target-max-kb"
                  type="number"
                  value={targetMaxKb}
                  onChange={(e) => setTargetMaxKb(parseFloat(e.target.value) || 10)}
                  className="w-full font-mono px-2.5 py-1.5 bg-[#F5F5F2] focus:bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="sig-output-format" className="text-[11px] text-[#737872] block mb-1">Format</label>
                <select
                  id="sig-output-format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as SupportedFormat)}
                  className="w-full px-2.5 py-1.5 bg-[#F5F5F2] focus:bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] transition-colors cursor-pointer"
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!compressionResult || isProcessing}
            className={`w-full py-2.5 rounded-[3px] font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs ${
              compressionResult && !isProcessing
                ? 'bg-[#34483E] hover:bg-[#26362E] text-white'
                : 'bg-[#EAECE7] text-[#9EA39D] cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>
              Download Clean Signature
              {compressionResult ? ` (${compressionResult.sizeKb} KB)` : ''}
            </span>
          </button>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-7 bg-[#F0F1ED] border border-[#DFE2DC] rounded-[3px] p-6 flex flex-col items-center justify-center min-h-[480px]">
          {!imageElement ? (
            <div className="text-center p-8">
              <PenTool className="w-10 h-10 text-[#737872] mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-[#242824] mb-1">
                Upload a handwritten signature or stamp
              </h4>
              <p className="text-xs text-[#737872] max-w-xs mb-4">
                Take a quick phone photo of your signature on paper and drop it here.
              </p>
              <label className="px-4 py-2 bg-[#34483E] hover:bg-[#26362E] text-white text-xs font-medium rounded-[3px] cursor-pointer shadow-xs">
                Select Signature File
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files && e.target.files[0] && handleSelectFile(e.target.files[0])}
                />
              </label>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center space-y-4">
              <div
                className="bg-white border border-[#CBD0C8] p-4 rounded-[3px] shadow-sm flex items-center justify-center overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  aspectRatio: `${targetWidth} / ${targetHeight}`
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Cleaned Signature Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : null}
              </div>

              <div className="text-xs text-[#737872] font-mono flex items-center gap-3">
                <span>{targetWidth} × {targetHeight} px</span>
                <span>•</span>
                <span className="text-[#39765A] font-semibold">
                  {compressionResult ? `${compressionResult.sizeKb} KB (${compressionResult.sizeBytes.toLocaleString()} B)` : 'Processing...'}
                </span>
                <span>•</span>
                <span>{format.replace('image/', '').toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
