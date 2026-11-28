import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Upload,
  Image as ImageIcon,
  Download,
  FileText,
  Layers,
  ArrowRight,
  ExternalLink,
  Archive,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import {
  extractPdfPagesAsImages,
  ExtractedPdfPage,
  convertImagesToPdf
} from '../../engine/pdfEngine';
import { createSyntheticDemoDocument, createSyntheticDemoPhoto } from '../../engine/demoGenerator';

interface PdfToImageViewProps {
  onOpenInEditor?: (imageUrl: string) => void;
}

export const PdfToImageView: React.FC<PdfToImageViewProps> = ({ onOpenInEditor }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Settings
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [dpiScale, setDpiScale] = useState<number>(1.5); // 1.0 (~96dpi), 1.5 (~150dpi), 2.0 (~200dpi)
  const [quality, setQuality] = useState<number>(0.90);

  // Results
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [pages, setPages] = useState<ExtractedPdfPage[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleSelectFile = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }
    setFile(selectedFile);
    setPages([]);
    await runExtraction(selectedFile, format, dpiScale, quality);
  };

  const handleLoadSamplePdf = async () => {
    setIsExtracting(true);
    try {
      const docBlob = await createSyntheticDemoDocument();
      const photoBlob = await createSyntheticDemoPhoto();

      const pdf = await convertImagesToPdf(
        [
          { id: '1', file: docBlob, name: 'academic_transcript.jpg', previewUrl: '' },
          { id: '2', file: photoBlob, name: 'verified_photo.jpg', previewUrl: '' }
        ],
        {
          pageSize: 'a4',
          orientation: 'portrait',
          margin: 'small',
          quality: 0.95,
          compress: false,
          title: 'SpecFit Extractor Demo'
        }
      );

      const samplePdfFile = new File([pdf.blob], 'sample_document_portfolio.pdf', {
        type: 'application/pdf'
      });

      handleSelectFile(samplePdfFile);
    } finally {
      setIsExtracting(false);
    }
  };

  const runExtraction = async (
    targetFile: File,
    exportFormat: 'image/jpeg' | 'image/png' | 'image/webp',
    scale: number,
    q: number
  ) => {
    setIsExtracting(true);
    setProgress({ current: 0, total: 1 });
    try {
      const extracted = await extractPdfPagesAsImages(
        targetFile,
        exportFormat,
        q,
        scale,
        (current, total) => setProgress({ current, total })
      );
      setPages(extracted);
    } catch (err: any) {
      alert(`PDF page extraction error: ${err.message || 'Failed to render PDF pages.'}`);
    } finally {
      setIsExtracting(false);
      setProgress(null);
    }
  };

  const handleDownloadSinglePage = (page: ExtractedPdfPage) => {
    const ext = format === 'image/jpeg' ? '.jpg' : format === 'image/webp' ? '.webp' : '.png';
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(page.blob);
    link.download = `${baseName}_page_${page.pageNumber}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllAsZip = async () => {
    if (pages.length === 0 || !file) return;

    const zip = new JSZip();
    const ext = format === 'image/jpeg' ? '.jpg' : format === 'image/webp' ? '.webp' : '.png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    pages.forEach((page) => {
      const filename = `${baseName}_page_${page.pageNumber}${ext}`;
      zip.file(filename, page.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${baseName}_extracted_pages.zip`;
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
              Page Rasterizer
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#242824] tracking-tight">
            PDF to Image Extractor
          </h2>
          <p className="text-xs text-[#737872] mt-0.5">
            Render and extract all pages of a PDF document as high-resolution JPG, PNG, or WebP images on-device.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSamplePdf}
            className="text-xs px-3 py-1.5 bg-white border border-[#DFE2DC] hover:border-[#34483E] text-[#34483E] rounded-[3px] font-medium cursor-pointer transition-colors flex items-center gap-1.5 btn-tactile"
          >
            <Layers className="w-3.5 h-3.5 text-[#39765A]" />
            Try Sample PDF
          </button>

          <label className="text-xs px-3.5 py-1.5 bg-[#34483E] hover:bg-[#26362E] text-white rounded-[3px] font-medium cursor-pointer transition-colors shadow-xs flex items-center gap-1.5 btn-tactile">
            <Upload className="w-3.5 h-3.5" />
            Upload PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => e.target.files && e.target.files[0] && handleSelectFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="bg-[#F5F5F2] border border-[#DFE2DC] rounded-[3px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Format */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#242824]">Output Format:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 border border-[#DFE2DC] rounded-[2px]">
              {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => {
                    setFormat(fmt);
                    if (file) runExtraction(file, fmt, dpiScale, quality);
                  }}
                  className={`px-2 py-0.5 rounded-[2px] font-mono uppercase cursor-pointer transition-all ${
                    format === fmt
                      ? 'bg-[#34483E] text-white font-medium'
                      : 'text-[#737872] hover:text-[#242824]'
                  }`}
                >
                  {fmt === 'image/jpeg' ? 'JPG' : fmt === 'image/png' ? 'PNG' : 'WebP'}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution DPI */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#242824]">Resolution:</span>
            <select
              value={dpiScale}
              onChange={(e) => {
                const s = parseFloat(e.target.value);
                setDpiScale(s);
                if (file) runExtraction(file, format, s, quality);
              }}
              className="px-2 py-1 bg-white border border-[#DFE2DC] rounded-[2px] text-xs cursor-pointer focus:outline-none focus:border-[#34483E]"
            >
              <option value="1.0">Standard (96 DPI • Smallest Size)</option>
              <option value="1.5">Crisp / Recommended (150 DPI)</option>
              <option value="2.0">High-Res Print (200 DPI)</option>
            </select>
          </div>
        </div>

        {pages.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadAllAsZip}
            className="px-3.5 py-1.5 bg-[#34483E] hover:bg-[#26362E] active:scale-95 text-white rounded-[3px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs btn-tactile"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download All ({pages.length} Pages ZIP)</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      {!file ? (
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
          className={`border-2 border-dashed rounded-[4px] p-8 sm:p-14 text-center transition-colors bg-white min-h-[360px] flex flex-col items-center justify-center ${
            dragActive ? 'border-[#34483E] bg-[#F5F5F2]' : 'border-[#CBD0C8] hover:border-[#737872]'
          }`}
        >
          <div className="w-12 h-12 rounded-[4px] bg-[#F5F5F2] border border-[#DFE2DC] flex items-center justify-center text-[#34483E] mb-3">
            <ImageIcon className="w-6 h-6 text-[#34483E]" />
          </div>
          <h3 className="text-sm font-bold text-[#242824] mb-1">
            Drop your PDF to extract pages as images
          </h3>
          <p className="text-xs text-[#737872] max-w-sm mb-5 leading-relaxed">
            Convert any document or multi-page PDF into clean, standalone images. Send any page directly to the Image Editor.
          </p>
          <label className="px-4 py-2 bg-[#34483E] hover:bg-[#26362E] text-white text-xs font-semibold rounded-[3px] cursor-pointer shadow-2xs btn-tactile inline-flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Select PDF File
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => e.target.files && e.target.files[0] && handleSelectFile(e.target.files[0])}
            />
          </label>
        </div>
      ) : isExtracting ? (
        <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-12 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#34483E] border-t-transparent animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-[#242824]">
            Rendering PDF Pages ({progress?.current || 0}/{progress?.total || 1})...
          </h4>
          <p className="text-xs text-[#737872]">
            High-precision canvas rasterization running locally on your CPU/GPU.
          </p>
        </div>
      ) : (
        /* Pages Grid */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#737872] bg-white border border-[#DFE2DC] rounded-[3px] px-4 py-2.5 shadow-2xs">
            <span>
              Extracted <strong className="text-[#242824]">{pages.length}</strong> {pages.length === 1 ? 'page' : 'pages'} from{' '}
              <span className="font-mono text-[#242824]">{file.name}</span>
            </span>
            <span className="font-mono text-[11px] bg-[#EAF2ED] text-[#2E7252] border border-[#BFD9CA] px-2 py-0.5 rounded-[2px]">
              Total Output: {pages.reduce((acc, p) => acc + p.sizeKb, 0).toFixed(1)} KB
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                className="bg-white border border-[#DFE2DC] hover:border-[#34483E] rounded-[4px] p-3 shadow-2xs space-y-3 flex flex-col justify-between transition-all interactive-card"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#34483E] bg-[#EAECE7] px-2 py-0.5 rounded-[2px]">
                      Page {page.pageNumber}
                    </span>
                    <span className="font-mono text-[11px] text-[#737872]">
                      {page.width} × {page.height} px • {page.sizeKb} KB
                    </span>
                  </div>

                  <div className="bg-[#FAF9F6] border border-[#DFE2DC] rounded-[2px] overflow-hidden flex items-center justify-center max-h-72 p-2">
                    <img
                      src={page.dataUrl}
                      alt={`Rendered Page ${page.pageNumber}`}
                      className="max-h-64 object-contain shadow-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DFE2DC] space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadSinglePage(page)}
                      className="py-1.5 bg-[#F5F5F2] hover:bg-[#EAECE7] text-[#242824] border border-[#DFE2DC] rounded-[2px] text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-1 btn-tactile"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    {onOpenInEditor && (
                      <button
                        type="button"
                        onClick={() => onOpenInEditor(page.dataUrl)}
                        className="py-1.5 bg-[#34483E] hover:bg-[#26362E] active:scale-95 text-white rounded-[2px] text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 btn-tactile shadow-2xs"
                        title="Send this page directly into Universal Image Editor for custom dimensions and cropping"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Edit Page</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
