import React, { useState, useEffect } from 'react';
import {
  Upload,
  Download,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sliders
} from 'lucide-react';
import { SupportedFormat, FileSizeUnit } from '../../types';
import { compressCanvasToTargetSize, CompressionResult } from '../../engine/compressor';
import { createSyntheticDemoPhoto } from '../../engine/demoGenerator';

export const QuickCompressorView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Compression Target
  const [targetSize, setTargetSize] = useState<number>(100);
  const [targetUnit, setTargetUnit] = useState<FileSizeUnit>('KB');
  const [format, setFormat] = useState<SupportedFormat>('image/jpeg');

  // Results
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const targetBytes = targetUnit === 'MB' ? targetSize * 1024 * 1024 : targetUnit === 'Bytes' ? targetSize : targetSize * 1024;
  const targetKb = targetBytes / 1024;

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
    };
    img.src = url;
  };

  const handleLoadSample = async () => {
    setIsCompressing(true);
    try {
      const demoBlob = await createSyntheticDemoPhoto();
      const demoFile = new File([demoBlob], 'sample_document.jpg', { type: 'image/jpeg' });
      handleSelectFile(demoFile);
    } finally {
      setIsCompressing(false);
    }
  };

  // Run adaptive compression
  useEffect(() => {
    if (!imageElement) return;

    let isMounted = true;
    const runCompression = async () => {
      setIsCompressing(true);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(imageElement, 0, 0);

        const comp = await compressCanvasToTargetSize(canvas, {
          minSizeKb: 1,
          maxSizeKb: targetKb,
          format,
          allowDimensionScaling: true
        });

        if (isMounted) {
          setResult(comp);
          if (compressedUrl) URL.revokeObjectURL(compressedUrl);
          setCompressedUrl(URL.createObjectURL(comp.blob));
        }
      } catch (err) {
        console.error('Compression failed:', err);
      } finally {
        if (isMounted) setIsCompressing(false);
      }
    };

    const timer = setTimeout(runCompression, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imageElement, targetKb, format]);

  const handleDownload = () => {
    if (!result) return;
    const ext = format === 'image/jpeg' ? '.jpg' : format === 'image/webp' ? '.webp' : '.png';
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'compressed_image';
    const link = document.createElement('a');
    link.href = compressedUrl || URL.createObjectURL(result.blob);
    link.download = `${baseName}_compressed${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const originalKb = file ? +(file.size / 1024).toFixed(1) : 0;
  const reductionPercent = result && originalKb > 0
    ? Math.round(((originalKb - result.sizeKb) / originalKb) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#737872] uppercase tracking-wider">
              Target File Size Utility
            </span>
            <span className="text-[11px] font-mono bg-[#EAECE7] text-[#34483E] px-2 py-0.5 rounded-[2px]">
              Binary Search Compression
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#242824] tracking-tight">
            Image Compressor
          </h2>
          <p className="text-xs text-[#737872] mt-0.5">
            Reduce any image to an exact maximum byte ceiling while preserving maximum visual clarity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="text-xs px-3 py-1.5 bg-white border border-[#DFE2DC] hover:border-[#34483E] text-[#34483E] rounded-[3px] font-medium cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#39765A]" />
            Try Sample
          </button>

          <label className="text-xs px-3.5 py-1.5 bg-[#34483E] hover:bg-[#26362E] text-white rounded-[3px] font-medium cursor-pointer transition-colors shadow-xs flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Upload File
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files && e.target.files[0] && handleSelectFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Main Compressor Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs space-y-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737872] mb-1">
              Compression Constraints
            </h3>
            <p className="text-xs text-[#737872]">
              Set an exact maximum file size target. SpecFit uses adaptive binary-search to fit within your budget.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-[11px] text-[#737872] block mb-1.5">Quick Targets</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[20, 50, 100, 200].map((kb) => (
                <button
                  key={kb}
                  onClick={() => { setTargetSize(kb); setTargetUnit('KB'); }}
                  aria-pressed={targetSize === kb && targetUnit === 'KB'}
                  className={`py-1.5 text-xs font-mono rounded-[2px] border transition-all duration-150 cursor-pointer chip-tactile ${
                    targetSize === kb && targetUnit === 'KB'
                      ? 'bg-[#34483E] text-white border-[#34483E] font-medium shadow-2xs'
                      : 'bg-[#F5F5F2] hover:bg-[#EAECE7] text-[#242824] border-[#DFE2DC] hover:border-[#737872]'
                  }`}
                >
                  {kb} KB
                </button>
              ))}
            </div>
          </div>

          {/* Custom Size Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="compressor-target-size" className="text-xs font-medium text-[#242824]">Target Maximum Size</label>
              <div className="flex items-center gap-1 text-[11px]">
                {(['KB', 'MB', 'Bytes'] as FileSizeUnit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setTargetUnit(u)}
                    aria-pressed={targetUnit === u}
                    className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer transition-all duration-150 chip-tactile ${
                      targetUnit === u
                        ? 'bg-[#34483E] text-white font-medium shadow-2xs'
                        : 'text-[#737872] hover:text-[#242824]'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                id="compressor-target-size"
                type="number"
                min="1"
                max="100000000"
                value={targetSize}
                onChange={(e) => setTargetSize(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full text-xs font-mono px-3 py-2 bg-[#F5F5F2] focus:bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] transition-colors"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-[#737872] pointer-events-none">
                {targetUnit}
              </span>
            </div>
          </div>

          {/* Output Format */}
          <div>
            <span className="text-xs font-medium text-[#242824] block mb-1.5">Output Format</span>
            <div className="grid grid-cols-3 gap-2">
              {(['image/jpeg', 'image/png', 'image/webp'] as SupportedFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  aria-pressed={format === fmt}
                  className={`py-1.5 text-xs font-mono rounded-[3px] border transition-all duration-150 cursor-pointer text-center uppercase chip-tactile ${
                    format === fmt
                      ? 'bg-[#34483E] text-white border-[#34483E] font-medium shadow-2xs'
                      : 'bg-[#F5F5F2] hover:bg-[#EAECE7] text-[#242824] border-[#DFE2DC] hover:border-[#737872]'
                  }`}
                >
                  {fmt === 'image/jpeg' ? 'JPEG' : fmt === 'image/png' ? 'PNG' : 'WebP'}
                </button>
              ))}
            </div>
          </div>

          {/* Compression Results Metric Card */}
          {result && (
            <div className="bg-[#F5F5F2] border border-[#DFE2DC] p-3.5 rounded-[3px] space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#DFE2DC]">
                <span className="text-[#737872]">Status:</span>
                {result.satisfiesMax ? (
                  <span className="text-[#39765A] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Target Achieved
                  </span>
                ) : (
                  <span className="text-[#B44B43] font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Limit Exceeded
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-[#737872]">Original Size:</span>
                <span className="font-mono text-[#242824]">{originalKb} KB</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#737872]">Compressed Size:</span>
                <span className="font-mono font-bold text-[#34483E]">
                  {result.sizeKb} KB ({result.sizeBytes.toLocaleString()} B)
                </span>
              </div>

              {reductionPercent > 0 && (
                <div className="flex justify-between text-[#39765A] font-medium">
                  <span>Reduction:</span>
                  <span>-{reductionPercent}%</span>
                </div>
              )}
            </div>
          )}

          {/* Download Action */}
          <button
            onClick={handleDownload}
            disabled={!result || isCompressing}
            className={`w-full py-2.5 rounded-[3px] font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs ${
              result && !isCompressing
                ? 'bg-[#34483E] hover:bg-[#26362E] text-white'
                : 'bg-[#EAECE7] text-[#9EA39D] cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download Compressed File</span>
          </button>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-7 bg-[#F0F1ED] border border-[#DFE2DC] rounded-[3px] p-6 flex flex-col items-center justify-center min-h-[480px]">
          {!imageElement ? (
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
              className="text-center p-8"
            >
              <Upload className="w-10 h-10 text-[#737872] mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-[#242824] mb-1">
                Drop an image to compress
              </h4>
              <p className="text-xs text-[#737872] max-w-xs mb-4">
                JPEG, PNG, or WebP. Processed completely within your browser.
              </p>
              <label className="px-4 py-2 bg-[#34483E] hover:bg-[#26362E] text-white text-xs font-medium rounded-[3px] cursor-pointer shadow-xs">
                Select Image
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
              <div className="max-w-md w-full bg-white p-2 border border-[#CBD0C8] rounded-[3px] shadow-sm">
                {(compressedUrl || imageUrl) ? (
                  <img
                    src={compressedUrl || imageUrl || undefined}
                    alt="Compressed Preview"
                    className="w-full h-auto max-h-[380px] object-contain mx-auto"
                  />
                ) : null}
              </div>

              <div className="text-xs text-[#737872] font-mono">
                {result?.width} × {result?.height} px • Quality: {Math.round((result?.quality || 0.85) * 100)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
