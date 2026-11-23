import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Upload,
  Files,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Sliders,
  Archive,
  Layers
} from 'lucide-react';
import {
  BatchItem,
  SupportedFormat,
  FileSizeUnit,
  ResizeMode
} from '../../types';
import { renderCroppedCanvas, renderWholeResizedCanvas } from '../../engine/canvas';
import { compressCanvasToTargetSize } from '../../engine/compressor';
import { createSyntheticDemoPhoto } from '../../engine/demoGenerator';

export const BatchProcessingView: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Shared Batch Settings
  const [batchWidth, setBatchWidth] = useState<number>(1200);
  const [batchHeight, setBatchHeight] = useState<number>(800);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [batchMaxKb, setBatchMaxKb] = useState<number>(200);
  const [batchMinKb, setBatchMinKb] = useState<number>(10);
  const [batchFormat, setBatchFormat] = useState<SupportedFormat>('image/jpeg');
  const [sizeUnit, setSizeUnit] = useState<FileSizeUnit>('KB');

  // Convert unit to KB
  const targetMaxKb = sizeUnit === 'MB' ? batchMaxKb * 1024 : sizeUnit === 'Bytes' ? batchMaxKb / 1024 : batchMaxKb;
  const targetMinKb = sizeUnit === 'MB' ? batchMinKb * 1024 : sizeUnit === 'Bytes' ? batchMinKb / 1024 : batchMinKb;

  // Add files to batch queue
  const handleAddFiles = (fileList: FileList | File[]) => {
    const newItems: BatchItem[] = [];
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const id = `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        newItems.push({
          id,
          file,
          name: file.name,
          originalWidth: 0,
          originalHeight: 0,
          originalSizeBytes: file.size,
          status: 'idle'
        });
      }
    });

    if (newItems.length === 0) {
      alert('Please upload valid image files (JPEG, PNG, or WebP).');
      return;
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  // Add demo files
  const handleAddDemoFiles = async () => {
    const demoBlob1 = await createSyntheticDemoPhoto();
    const demoBlob2 = await createSyntheticDemoPhoto();
    const f1 = new File([demoBlob1], 'document_scan_01.jpg', { type: 'image/jpeg' });
    const f2 = new File([demoBlob2], 'document_scan_02.jpg', { type: 'image/jpeg' });
    handleAddFiles([f1, f2]);
  };

  // Process a single item
  const processSingleItem = async (item: BatchItem): Promise<BatchItem> => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(item.file);
      await new Promise<void>((resolve, reject) => {
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });

      let w = batchWidth;
      let h = batchHeight;

      if (keepAspectRatio) {
        const ratio = img.naturalWidth / img.naturalHeight;
        h = Math.round(w / ratio);
      }

      // Render resized canvas
      const canvas = renderWholeResizedCanvas(img, w, h, 0, false);

      // Compress to target size
      const compression = await compressCanvasToTargetSize(canvas, {
        minSizeKb: targetMinKb,
        maxSizeKb: targetMaxKb,
        format: batchFormat,
        allowDimensionScaling: true
      });

      const validationPassed = compression.satisfiesMax && compression.satisfiesMin;
      const processedUrl = URL.createObjectURL(compression.blob);

      return {
        ...item,
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
        status: validationPassed ? 'ready' : 'error',
        processedBlob: compression.blob,
        processedUrl,
        processedWidth: compression.width,
        processedHeight: compression.height,
        processedSizeBytes: compression.sizeBytes,
        processedSizeKb: compression.sizeKb,
        validationPassed,
        errorMessage: !validationPassed ? compression.explanation || 'Size out of bounds' : undefined
      };
    } catch (err: any) {
      return {
        ...item,
        status: 'error',
        errorMessage: err.message || 'Processing failed'
      };
    }
  };

  // Process all items
  const handleProcessAll = async () => {
    if (items.length === 0) return;
    setIsProcessingAll(true);

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'processing' };
      setItems([...updated]);

      const result = await processSingleItem(updated[i]);
      updated[i] = result;
      setItems([...updated]);
    }

    setIsProcessingAll(false);
  };

  // Download single item
  const handleDownloadItem = (item: BatchItem) => {
    if (!item.processedBlob) return;
    const ext = batchFormat === 'image/jpeg' ? '.jpg' : batchFormat === 'image/webp' ? '.webp' : '.png';
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_${item.processedWidth}x${item.processedHeight}${ext}`;

    const link = document.createElement('a');
    link.href = item.processedUrl || URL.createObjectURL(item.processedBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all valid items as a ZIP archive
  const handleDownloadAllZip = async () => {
    const validItems = items.filter((item) => item.status === 'ready' && item.processedBlob);
    if (validItems.length === 0) {
      alert('No successfully validated files ready for export.');
      return;
    }

    const zip = new JSZip();
    const ext = batchFormat === 'image/jpeg' ? '.jpg' : batchFormat === 'image/webp' ? '.webp' : '.png';

    // Add each valid image
    validItems.forEach((item, index) => {
      const baseName = item.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_${item.processedWidth}x${item.processedHeight}${ext}`;
      zip.file(filename, item.processedBlob!);
    });

    // Add audit manifest
    const manifest = [
      '========================================================================',
      'SPECFIT BATCH CONFORMANCE & ON-DEVICE VALIDATION MANIFEST',
      '========================================================================',
      `Export Timestamp: ${new Date().toISOString()}`,
      `Total Valid Assets Included: ${validItems.length} of ${items.length} total files`,
      `Target Dimensions: ${batchWidth} × ${batchHeight} px (Aspect ratio lock: ${keepAspectRatio ? 'ON' : 'OFF'})`,
      `Target File Size: ≤ ${batchMaxKb} ${sizeUnit}`,
      `Output Format: ${batchFormat}`,
      `Privacy Assurance: 100% On-Device Processing (Zero External Exfiltration)`,
      '------------------------------------------------------------------------',
      'FILE AUDIT TABLE:',
      ...validItems.map((item, i) => 
        `[${i + 1}] ${item.name} ➔ ${item.processedWidth}x${item.processedHeight} px | ${item.processedSizeKb} KB (${item.processedSizeBytes} B) | Status: VALID`
      ),
      '========================================================================'
    ].join('\n');

    zip.file('specfit_batch_manifest.txt', manifest);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `SpecFit_Batch_Export_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const readyCount = items.filter((i) => i.status === 'ready').length;
  const errorCount = items.filter((i) => i.status === 'error').length;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#737872] uppercase tracking-wider">
              Batch Processing Utility
            </span>
            <span className="text-[11px] font-mono bg-[#EAECE7] text-[#34483E] px-2 py-0.5 rounded-[2px]">
              Multi-File Queue
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#242824] tracking-tight">
            Batch Resizer & Compressor
          </h2>
          <p className="text-xs text-[#737872] mt-0.5">
            Process multiple images with shared dimensions and byte targets. Download individually or as a combined ZIP archive.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddDemoFiles}
            className="text-xs px-3 py-1.5 bg-white border border-[#DFE2DC] hover:border-[#34483E] text-[#34483E] rounded-[3px] font-medium cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#39765A]" />
            Add Sample Files
          </button>

          <label className="text-xs px-3.5 py-1.5 bg-[#34483E] hover:bg-[#26362E] text-white rounded-[3px] font-medium cursor-pointer transition-colors shadow-xs flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
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

      {/* Shared Batch Settings Bar */}
      <div className="bg-[#F5F5F2] border border-[#DFE2DC] rounded-[3px] p-4 shadow-xs">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#737872] mb-3">
          Shared Target Specifications
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Width & Height */}
          <div>
            <label htmlFor="batch-output-width" className="text-[11px] text-[#737872] block mb-1">Output Width (px)</label>
            <input
              id="batch-output-width"
              type="number"
              min="50"
              max="8000"
              value={batchWidth}
              onChange={(e) => setBatchWidth(parseInt(e.target.value, 10) || 50)}
              className="w-full font-mono px-2.5 py-1.5 bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="batch-output-height" className="text-[11px] text-[#737872]">Output Height (px)</label>
              <label className="text-[10px] text-[#737872] flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepAspectRatio}
                  onChange={(e) => setKeepAspectRatio(e.target.checked)}
                  className="rounded-[2px]"
                />
                Auto Ratio
              </label>
            </div>
            <input
              id="batch-output-height"
              type="number"
              min="50"
              max="8000"
              disabled={keepAspectRatio}
              value={batchHeight}
              onChange={(e) => setBatchHeight(parseInt(e.target.value, 10) || 50)}
              className={`w-full font-mono px-2.5 py-1.5 border rounded-[3px] focus:outline-none transition-colors ${
                keepAspectRatio ? 'bg-[#EAECE7] border-[#DFE2DC] text-[#737872]' : 'bg-white border-[#DFE2DC] focus:border-[#34483E]'
              }`}
            />
          </div>

          {/* File Size */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="batch-max-size" className="text-[11px] text-[#737872]">Max Size</label>
              <select
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value as FileSizeUnit)}
                aria-label="Batch file size unit"
                className="text-[10px] bg-white border border-[#DFE2DC] rounded-[2px] px-1 py-0.5"
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="Bytes">Bytes</option>
              </select>
            </div>
            <input
              id="batch-max-size"
              type="number"
              min="1"
              max="50000000"
              value={batchMaxKb}
              onChange={(e) => setBatchMaxKb(parseFloat(e.target.value) || 1)}
              className="w-full font-mono px-2.5 py-1.5 bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] transition-colors"
            />
          </div>

          {/* Format */}
          <div>
            <label htmlFor="batch-output-format" className="text-[11px] text-[#737872] block mb-1">Output Format</label>
            <select
              id="batch-output-format"
              value={batchFormat}
              onChange={(e) => setBatchFormat(e.target.value as SupportedFormat)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] cursor-pointer transition-colors"
            >
              <option value="image/jpeg">JPEG (.jpg)</option>
              <option value="image/png">PNG (.png)</option>
              <option value="image/webp">WebP (.webp)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Area */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] shadow-xs overflow-hidden">
        {/* Queue Header Controls */}
        <div className="px-5 py-3 border-b border-[#DFE2DC] bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#242824]">
              Queue ({items.length} {items.length === 1 ? 'file' : 'files'})
            </span>
            {readyCount > 0 && (
              <span className="text-[#39765A] font-medium bg-[#EAF2ED] px-2 py-0.5 rounded-[2px]">
                {readyCount} Ready
              </span>
            )}
            {errorCount > 0 && (
              <span className="text-[#B44B43] font-medium bg-[#FDF2F2] px-2 py-0.5 rounded-[2px]">
                {errorCount} Excluded
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <>
                <button
                  onClick={handleClearAll}
                  disabled={isProcessingAll}
                  className="px-2.5 py-1 text-xs text-[#737872] hover:text-[#B44B43] cursor-pointer transition-colors"
                >
                  Clear Queue
                </button>

                <button
                  onClick={handleProcessAll}
                  disabled={isProcessingAll || items.length === 0}
                  className="px-3 py-1.5 bg-[#34483E] hover:bg-[#26362E] text-white rounded-[3px] font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isProcessingAll ? 'Processing...' : 'Process All'}</span>
                </button>

                <button
                  onClick={handleDownloadAllZip}
                  disabled={readyCount === 0 || isProcessingAll}
                  className={`px-3 py-1.5 rounded-[3px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    readyCount > 0 && !isProcessingAll
                      ? 'bg-[#39765A] hover:bg-[#2C5F48] text-white shadow-xs'
                      : 'bg-[#EAECE7] text-[#9EA39D] cursor-not-allowed'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download ZIP ({readyCount})</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dropzone if empty */}
        {items.length === 0 ? (
          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
            }}
            className={`p-12 text-center flex flex-col items-center justify-center border-2 border-dashed m-6 rounded-[4px] transition-colors ${
              dragActive ? 'border-[#34483E] bg-[#EAECE7]' : 'border-[#CBD0C8] hover:border-[#737872]'
            }`}
          >
            <Files className="w-10 h-10 text-[#737872] mb-3" />
            <h4 className="text-sm font-semibold text-[#242824] mb-1">
              No files in the batch queue
            </h4>
            <p className="text-xs text-[#737872] max-w-sm mb-4">
              Drag and drop multiple images or click below to select files from your computer.
            </p>
            <label className="px-4 py-2 bg-[#34483E] hover:bg-[#26362E] text-white text-xs font-medium rounded-[3px] cursor-pointer transition-colors shadow-xs">
              Choose Multiple Images
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
          /* Queue Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#DFE2DC]">
              <thead className="bg-[#FAF9F6] text-[#737872] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">File Name</th>
                  <th className="py-2.5 px-3">Original Size</th>
                  <th className="py-2.5 px-3">Target Size</th>
                  <th className="py-2.5 px-3">Output Result</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE2DC]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F5F2] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#242824] max-w-[200px] truncate">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#737872]">
                      {(item.originalSizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-3 font-mono text-[#737872]">
                      {batchWidth} px • ≤ {batchMaxKb} {sizeUnit}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {item.processedSizeKb ? (
                        <span className="text-[#242824] font-medium">
                          {item.processedWidth}×{item.processedHeight} px • {item.processedSizeKb} KB
                        </span>
                      ) : (
                        <span className="text-[#9EA39D]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {item.status === 'idle' && (
                        <span className="text-[#737872] bg-[#EAECE7] px-2 py-0.5 rounded-[2px] text-[11px]">
                          Pending
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="text-[#34483E] bg-[#EAECE7] px-2 py-0.5 rounded-[2px] text-[11px] animate-pulse">
                          Processing...
                        </span>
                      )}
                      {item.status === 'ready' && (
                        <span className="text-[#39765A] bg-[#EAF2ED] px-2 py-0.5 rounded-[2px] text-[11px] font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-[#B44B43] bg-[#FDF2F2] px-2 py-0.5 rounded-[2px] text-[11px] font-medium inline-flex items-center gap-1" title={item.errorMessage}>
                          <AlertTriangle className="w-3 h-3" /> Excluded
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {item.status === 'ready' && (
                        <button
                          onClick={() => handleDownloadItem(item)}
                          className="text-[#34483E] hover:text-[#26362E] font-medium cursor-pointer inline-flex items-center gap-1"
                          title="Download individual file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[#737872] hover:text-[#B44B43] cursor-pointer"
                        title="Remove file from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
