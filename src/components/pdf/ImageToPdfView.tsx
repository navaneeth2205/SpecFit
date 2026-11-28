import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sliders,
  CheckCircle2,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import {
  convertImagesToPdf,
  ImageToPdfItem,
  PdfPageSize,
  PdfOrientation,
  PdfMargin,
  PdfConversionResult
} from '../../engine/pdfEngine';
import { createSyntheticDemoDocument, createSyntheticDemoPhoto } from '../../engine/demoGenerator';

export const ImageToPdfView: React.FC = () => {
  const [items, setItems] = useState<ImageToPdfItem[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // PDF Configuration
  const [pageSize, setPageSize] = useState<PdfPageSize>('a4');
  const [orientation, setOrientation] = useState<PdfOrientation>('auto');
  const [margin, setMargin] = useState<PdfMargin>('small');
  const [compress, setCompress] = useState<boolean>(true);
  const [quality, setQuality] = useState<number>(0.85);
  const [docTitle, setDocTitle] = useState<string>('Prepared Document');

  // Processing & State
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<PdfConversionResult | null>(null);

  const handleAddFiles = (fileList: FileList | File[]) => {
    const newItems: ImageToPdfItem[] = [];
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        newItems.push({
          id,
          file,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
          rotation: 0
        });
      }
    });

    if (newItems.length === 0) {
      alert('Please select valid image files (JPEG, PNG, WebP).');
      return;
    }

    setItems((prev) => [...prev, ...newItems]);
    setResult(null);
  };

  const handleLoadSample = async () => {
    setIsConverting(true);
    try {
      const docBlob = await createSyntheticDemoDocument();
      const photoBlob = await createSyntheticDemoPhoto();

      const f1 = new File([docBlob], 'academic_credential_scan.jpg', { type: 'image/jpeg' });
      const f2 = new File([photoBlob], 'identity_photograph.jpg', { type: 'image/jpeg' });

      handleAddFiles([f1, f2]);
    } finally {
      setIsConverting(false);
    }
  };

  const handleRotateItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotation: ((item.rotation || 0) + 90) % 360 } : item
      )
    );
    setResult(null);
  };

  const handleMoveItem = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setResult(null);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((i) => i.id === id);
      if (itemToRemove) URL.revokeObjectURL(itemToRemove.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    setResult(null);
  };

  const handleClearAll = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setResult(null);
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setIsConverting(true);
    setProgress({ current: 0, total: items.length });

    try {
      const res = await convertImagesToPdf(items, {
        pageSize,
        orientation,
        margin,
        quality,
        compress,
        title: docTitle,
        onProgress: (current, total) => setProgress({ current, total })
      });
      setResult(res);
    } catch (err: any) {
      alert(`PDF Conversion error: ${err.message || 'Failed to convert images to PDF.'}`);
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
  };

  // Real-time byte totals & live output KB estimation
  const totalInputBytes = items.reduce((acc, item) => acc + (item.file.size || 0), 0);
  const totalInputKb = +(totalInputBytes / 1024).toFixed(1);

  const estimatedOutputKb = (() => {
    if (items.length === 0) return 0;
    const pdfOverheadKb = 3.5 + items.length * 0.8;
    if (!compress) {
      return +(totalInputKb + pdfOverheadKb).toFixed(1);
    }
    const estimatedImageBytes = items.reduce((acc, item) => {
      const isLossless = item.file.type === 'image/png' || item.name.toLowerCase().endsWith('.png');
      const factor = isLossless
        ? Math.max(0.18, quality * 0.45)
        : Math.max(0.35, Math.min(1.0, quality * 0.92));
      return acc + (item.file.size || 0) * factor;
    }, 0);
    return +(estimatedImageBytes / 1024 + pdfOverheadKb).toFixed(1);
  })();

  const sizeDeltaPercent =
    result && totalInputBytes > 0
      ? Math.round(((result.sizeBytes - totalInputBytes) / totalInputBytes) * 100)
      : null;

  const handleDownload = () => {
    if (!result) return;
    const cleanName = docTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'converted_document';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(result.blob);
    link.download = `${cleanName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#737872] uppercase tracking-wider">
              PDF Worksuite
            </span>
            <span className="text-[11px] font-mono bg-[#EAECE7] text-[#34483E] px-2 py-0.5 rounded-[2px]">
              Multi-Image to PDF
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#242824] tracking-tight">
            Image to PDF Converter
          </h2>
          <p className="text-xs text-[#737872] mt-0.5">
            Assemble multiple photos, certificates, and document scans into a standardized, clean PDF with custom page geometry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="text-xs px-3 py-1.5 bg-white border border-[#DFE2DC] hover:border-[#34483E] text-[#34483E] rounded-[3px] font-medium cursor-pointer transition-colors flex items-center gap-1.5 btn-tactile"
          >
            <Layers className="w-3.5 h-3.5 text-[#39765A]" />
            Try Sample
          </button>

          <label className="text-xs px-3.5 py-1.5 bg-[#34483E] hover:bg-[#26362E] text-white rounded-[3px] font-medium cursor-pointer transition-colors shadow-xs flex items-center gap-1.5 btn-tactile">
            <Plus className="w-3.5 h-3.5" />
            Add Images
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Image Queue & Page Management */}
        <div className="lg:col-span-8 space-y-4">
          {items.length === 0 ? (
            /* Empty State Dropzone */
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-[4px] p-8 sm:p-12 text-center transition-colors bg-white ${
                dragActive ? 'border-[#34483E] bg-[#F5F5F2]' : 'border-[#CBD0C8] hover:border-[#737872]'
              }`}
            >
              <div className="w-12 h-12 rounded-[4px] bg-[#F5F5F2] border border-[#DFE2DC] flex items-center justify-center text-[#34483E] mx-auto mb-3">
                <FileText className="w-6 h-6 text-[#34483E]" />
              </div>
              <h3 className="text-sm font-bold text-[#242824] mb-1">
                Drop your images here to build a PDF
              </h3>
              <p className="text-xs text-[#737872] max-w-sm mx-auto mb-5 leading-relaxed">
                Add JPG, PNG, or WebP files. Reorder pages, rotate scans, and compile them into a unified PDF on your device.
              </p>
              <label className="px-4 py-2 bg-[#34483E] hover:bg-[#26362E] text-white text-xs font-semibold rounded-[3px] cursor-pointer shadow-2xs btn-tactile inline-flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Select Image Files
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
                />
              </label>
            </div>
          ) : (
            /* Active Page List & Reordering Grid */
            <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DC]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#242824]">
                    Pages Queue ({items.length} {items.length === 1 ? 'Page' : 'Pages'})
                  </span>
                  <span className="text-[11px] text-[#737872] font-mono">
                    Drag or use arrows to rearrange sequence
                  </span>
                </div>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-[#B44B43] hover:text-[#8E322C] flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>

              {/* Grid of Pages */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-[#FAF9F6] border border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] p-2 space-y-2 relative group transition-all shadow-2xs"
                  >
                    {/* Page Number Badge */}
                    <span className="absolute top-3 left-3 bg-[#242824]/85 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] z-10">
                      #{index + 1}
                    </span>

                    {/* Image Preview with rotation */}
                    <div className="h-36 bg-[#F0F1ED] rounded-[2px] overflow-hidden flex items-center justify-center relative">
                      <img
                        src={item.previewUrl}
                        alt={`Page ${index + 1}`}
                        className="max-h-full max-w-full object-contain transition-transform duration-200"
                        style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                      />
                    </div>

                    {/* Item Metadata */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="text-[11px] text-[#242824] truncate font-medium" title={item.name}>
                        {item.name}
                      </div>
                      <span className="text-[10px] font-mono text-[#737872] shrink-0">
                        {(item.file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#DFE2DC]/60 text-xs">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'left')}
                          disabled={index === 0}
                          className="p-1 text-[#737872] hover:text-[#242824] disabled:opacity-30 cursor-pointer"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'right')}
                          disabled={index === items.length - 1}
                          className="p-1 text-[#737872] hover:text-[#242824] disabled:opacity-30 cursor-pointer"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRotateItem(item.id)}
                          className="p-1 text-[#737872] hover:text-[#242824] cursor-pointer"
                          title="Rotate 90° clockwise"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-[#B44B43] hover:text-[#8E322C] cursor-pointer"
                          title="Remove Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add More Tile */}
                <label className="h-48 border-2 border-dashed border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] flex flex-col items-center justify-center p-4 cursor-pointer text-center bg-white transition-colors group">
                  <Plus className="w-6 h-6 text-[#737872] group-hover:text-[#34483E] mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-[#737872] group-hover:text-[#242824]">Add Page</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: PDF Properties & Export Settings */}
        <div className="lg:col-span-4 bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs space-y-5">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737872] mb-1">
              Document Geometry & Quality
            </h4>
            <p className="text-xs text-[#737872]">
              Configure standard paper format, orientation, and margins.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-1.5 pt-2 border-t border-[#DFE2DC]">
            <label htmlFor="pdf-title-input" className="text-xs font-semibold text-[#242824] block">
              Document Title
            </label>
            <input
              id="pdf-title-input"
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-[#DFE2DC] rounded-[3px] bg-[#F5F5F2] focus:bg-white focus:outline-none focus:border-[#34483E]"
              placeholder="e.g. Identity_Document_Bundle"
            />
          </div>

          {/* Page Size */}
          <div className="space-y-1.5 pt-2 border-t border-[#DFE2DC]">
            <label htmlFor="pdf-page-size" className="text-xs font-semibold text-[#242824] block">
              Paper Size
            </label>
            <select
              id="pdf-page-size"
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as PdfPageSize)}
              className="w-full text-xs px-2.5 py-1.5 border border-[#DFE2DC] rounded-[3px] bg-white focus:outline-none focus:border-[#34483E] cursor-pointer"
            >
              <option value="a4">A4 (210 × 297 mm • Standard)</option>
              <option value="letter">US Letter (8.5 × 11 in)</option>
              <option value="legal">US Legal (8.5 × 14 in)</option>
              <option value="fit_image">Fit to Image (No background canvas)</option>
            </select>
          </div>

          {/* Orientation */}
          {pageSize !== 'fit_image' && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#242824] block">Orientation</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['auto', 'portrait', 'landscape'] as PdfOrientation[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setOrientation(opt)}
                    aria-pressed={orientation === opt}
                    className={`py-1.5 rounded-[2px] border text-center capitalize cursor-pointer transition-all chip-tactile ${
                      orientation === opt
                        ? 'bg-[#34483E] text-white border-[#34483E] font-medium shadow-2xs'
                        : 'bg-[#F5F5F2] hover:bg-[#EAECE7] text-[#242824] border-[#DFE2DC]'
                    }`}
                  >
                    {opt === 'auto' ? 'Auto (Smart)' : opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Margins */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[#242824] block">Page Margins</span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(['none', 'small', 'normal'] as PdfMargin[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setMargin(opt)}
                  aria-pressed={margin === opt}
                  className={`py-1.5 rounded-[2px] border text-center capitalize cursor-pointer transition-all chip-tactile ${
                    margin === opt
                      ? 'bg-[#34483E] text-white border-[#34483E] font-medium shadow-2xs'
                      : 'bg-[#F5F5F2] hover:bg-[#EAECE7] text-[#242824] border-[#DFE2DC]'
                  }`}
                >
                  {opt === 'none' ? 'None (0mm)' : opt === 'small' ? 'Small (10mm)' : 'Normal (20mm)'}
                </button>
              ))}
            </div>
          </div>

          {/* Compression & Quality */}
          <div className="space-y-2 pt-2 border-t border-[#DFE2DC]">
            <div className="flex items-center justify-between">
              <label htmlFor="compress-toggle" className="text-xs font-semibold text-[#242824] cursor-pointer">
                JPEG Recompression
              </label>
              <input
                id="compress-toggle"
                type="checkbox"
                checked={compress}
                onChange={(e) => setCompress(e.target.checked)}
                className="accent-[#34483E] cursor-pointer"
              />
            </div>

            {compress && (
              <div className="space-y-1 bg-[#F5F5F2] p-2.5 rounded-[3px] border border-[#DFE2DC]">
                <div className="flex justify-between text-xs text-[#737872]">
                  <span>Quality:</span>
                  <span className="font-mono text-[#242824] font-medium">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="0.95"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  aria-label="Compression quality slider"
                  className="w-full accent-[#34483E] cursor-pointer"
                />
                <span className="text-[10px] text-[#737872] block">
                  Higher quality preserves high-frequency document text.
                </span>
              </div>
            )}
          </div>

          {/* Live Size Forecast & Output Comparison */}
          {items.length > 0 && !result && (
            <div className="p-3 bg-[#F5F5F2] border border-[#DFE2DC] rounded-[3px] space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-[#242824]">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#34483E]" />
                  Live PDF Size Estimate
                </span>
                <span className="font-mono text-[#34483E]">~{estimatedOutputKb} KB</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#737872] font-mono">
                <span>Source Images ({items.length}):</span>
                <span>{totalInputKb} KB</span>
              </div>
              <p className="text-[10px] text-[#737872] leading-snug">
                {compress
                  ? `Estimated after ${Math.round(quality * 100)}% JPEG stream compression. Click Generate for exact bytes.`
                  : 'Lossless embedding mode. Output closely tracks original source bytes.'}
              </p>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="p-3.5 bg-[#EAF2ED] border border-[#BFD9CA] rounded-[3px] space-y-2 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-[#2E7252]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>PDF Document Ready</span>
                </div>
                {sizeDeltaPercent !== null && (
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] ${
                      sizeDeltaPercent <= 0
                        ? 'bg-[#39765A] text-white'
                        : 'bg-white text-[#34483E] border border-[#BFD9CA]'
                    }`}
                  >
                    {sizeDeltaPercent <= 0 ? `${sizeDeltaPercent}% smaller` : `+${sizeDeltaPercent}%`}
                  </span>
                )}
              </div>
              <div className="space-y-1 pt-1 border-t border-[#BFD9CA]/60">
                <div className="flex justify-between text-[#737872] font-mono text-[11px]">
                  <span>Input Images Total:</span>
                  <span>{totalInputKb} KB</span>
                </div>
                <div className="flex justify-between text-[#242824] font-mono">
                  <span>Final PDF Size:</span>
                  <span className="font-bold text-[#2E7252]">{result.sizeKb} KB</span>
                </div>
                <div className="flex justify-between text-[#737872] text-[11px]">
                  <span>Total Pages:</span>
                  <span>{result.pageCount} {result.pageCount === 1 ? 'Page' : 'Pages'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleConvert}
              disabled={items.length === 0 || isConverting}
              className={`w-full py-2.5 rounded-[3px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs btn-tactile ${
                items.length > 0 && !isConverting
                  ? 'bg-[#34483E] hover:bg-[#26362E] text-white'
                  : 'bg-[#EAECE7] text-[#9EA39D] cursor-not-allowed'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>
                {isConverting
                  ? `Compiling PDF (${progress?.current || 0}/${progress?.total || items.length})...`
                  : `Generate PDF (${items.length} ${items.length === 1 ? 'Page' : 'Pages'})`}
              </span>
            </button>

            {result && (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-2 bg-[#39765A] hover:bg-[#2C5F48] active:scale-95 text-white rounded-[3px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs btn-tactile"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF ({result.sizeKb} KB)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
