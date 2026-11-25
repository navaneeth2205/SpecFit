import React, { useState } from 'react';
import {
  Upload,
  Minimize2,
  Download,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sliders,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  compressPdfDocument,
  PdfCompressionResult,
  PDF_COMPRESSION_PROFILES,
  convertImagesToPdf
} from '../../engine/pdfEngine';
import { createSyntheticDemoDocument, createSyntheticDemoPhoto } from '../../engine/demoGenerator';

export const PdfCompressorView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Compression Mode: 'target_size' | 'profile'
  const [mode, setMode] = useState<'target_size' | 'profile'>('target_size');
  const [targetSizeValue, setTargetSizeValue] = useState<number>(500);
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');
  const [selectedProfile, setSelectedProfile] = useState<'extreme' | 'balanced' | 'high_quality'>('balanced');

  // Processing & State
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [result, setResult] = useState<PdfCompressionResult | null>(null);

  const handleSelectFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleLoadSamplePdf = async () => {
    setIsCompressing(true);
    try {
      const docBlob = await createSyntheticDemoDocument();
      const photoBlob = await createSyntheticDemoPhoto();

      // Create a 2-page sample PDF
      const pdf = await convertImagesToPdf(
        [
          { id: '1', file: docBlob, name: 'credential.jpg', previewUrl: '' },
          { id: '2', file: photoBlob, name: 'photo.jpg', previewUrl: '' }
        ],
        {
          pageSize: 'a4',
          orientation: 'portrait',
          margin: 'small',
          quality: 0.95,
          compress: false,
          title: 'SpecFit Sample PDF'
        }
      );

      const samplePdfFile = new File([pdf.blob], 'sample_application_package.pdf', {
        type: 'application/pdf'
      });

      handleSelectFile(samplePdfFile);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    setProgressPercent(5);

    const targetMaxKb =
      mode === 'target_size'
        ? targetUnit === 'MB'
          ? targetSizeValue * 1024
          : targetSizeValue
        : undefined;

    try {
      const res = await compressPdfDocument(file, {
        targetMaxKb,
        profile: mode === 'profile' ? selectedProfile : undefined,
        onProgress: (current, _total) => {
          setProgressPercent(Math.min(98, current));
        }
      });
      setResult(res);
      setProgressPercent(100);
    } catch (err: any) {
      alert(`PDF Compression error: ${err.message || 'Failed to compress PDF.'}`);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_compressed.pdf`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(result.blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const originalKb = file ? +(file.size / 1024).toFixed(1) : 0;
  const originalMb = file ? +(file.size / (1024 * 1024)).toFixed(2) : 0;

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
              Adaptive PDF Reducer
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#242824] tracking-tight">
            PDF Reducer & Compressor
          </h2>
          <p className="text-xs text-[#737872] mt-0.5">
            Reduce bloated multi-page PDFs to strict portal kilobyte caps while maintaining sharp text and fine vector clarity.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Dropzone & Source Document Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {!file ? (
            /* Upload Dropzone */
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
              className={`border-2 border-dashed rounded-[4px] p-8 sm:p-14 text-center transition-colors bg-white min-h-[380px] flex flex-col items-center justify-center ${
                dragActive ? 'border-[#34483E] bg-[#F5F5F2]' : 'border-[#CBD0C8] hover:border-[#737872]'
              }`}
            >
              <div className="w-12 h-12 rounded-[4px] bg-[#F5F5F2] border border-[#DFE2DC] flex items-center justify-center text-[#34483E] mb-3">
                <Minimize2 className="w-6 h-6 text-[#34483E]" />
              </div>
              <h3 className="text-sm font-bold text-[#242824] mb-1">
                Drop your PDF file here to compress
              </h3>
              <p className="text-xs text-[#737872] max-w-sm mb-5 leading-relaxed">
                Supports single-page and multi-page PDFs. Everything is processed directly in your browser with zero remote server exfiltration.
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
          ) : (
            /* Selected PDF Overview Card */
            <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DC]">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#34483E]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#242824] truncate max-w-sm" title={file.name}>
                      {file.name}
                    </h3>
                    <span className="text-[11px] text-[#737872] font-mono">
                      {originalKb > 1024 ? `${originalMb} MB` : `${originalKb} KB`} ({file.size.toLocaleString()} Bytes)
                    </span>
                  </div>
                </div>

                <label className="text-xs px-2.5 py-1.5 border border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] text-[#242824] cursor-pointer transition-colors btn-tactile">
                  Change File
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => e.target.files && e.target.files[0] && handleSelectFile(e.target.files[0])}
                  />
                </label>
              </div>

              {/* Progress Bar when compressing */}
              {isCompressing && (
                <div className="space-y-2 py-4">
                  <div className="flex justify-between text-xs font-medium text-[#242824]">
                    <span>Compressing PDF pages...</span>
                    <span className="font-mono">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F0F1ED] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#34483E] transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#737872] block">
                    Re-encoding canvas rasters and optimizing quantization streams on-device.
                  </span>
                </div>
              )}

              {/* Result Comparison Card */}
              {result && (
                <div className="p-4 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DFE2DC]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#39765A]" />
                      <span className="text-xs font-bold text-[#242824]">Compression Complete</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#39765A] bg-[#EAF2ED] px-2 py-0.5 rounded-[2px]">
                      -{result.reductionPercent}% Reduction
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-white border border-[#DFE2DC] rounded-[2px] space-y-0.5">
                      <span className="text-[10px] text-[#737872] uppercase font-sans font-semibold block">Original</span>
                      <span className="text-[#737872] line-through">{result.originalSizeKb} KB</span>
                    </div>
                    <div className="p-2.5 bg-[#EAF2ED] border border-[#BFD9CA] rounded-[2px] space-y-0.5">
                      <span className="text-[10px] text-[#2E7252] uppercase font-sans font-semibold block">Optimized</span>
                      <span className="text-sm font-bold text-[#39765A]">{result.compressedSizeKb} KB</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full py-2.5 bg-[#34483E] hover:bg-[#26362E] active:scale-95 text-white rounded-[3px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs btn-tactile"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Compressed PDF ({result.compressedSizeKb} KB)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Compression Target Settings */}
        <div className="lg:col-span-5 bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs space-y-5">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737872] mb-1">
              Target File Size Controls
            </h4>
            <p className="text-xs text-[#737872]">
              Choose an exact ceiling or pick a preset optimization profile.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-[#F0F1ED] p-0.5 rounded-[3px] text-xs">
            <button
              type="button"
              onClick={() => setMode('target_size')}
              aria-pressed={mode === 'target_size'}
              className={`py-1.5 text-center rounded-[2px] transition-all cursor-pointer chip-tactile ${
                mode === 'target_size'
                  ? 'bg-white text-[#242824] font-semibold shadow-2xs'
                  : 'text-[#737872] hover:text-[#242824]'
              }`}
            >
              Exact Max Size
            </button>
            <button
              type="button"
              onClick={() => setMode('profile')}
              aria-pressed={mode === 'profile'}
              className={`py-1.5 text-center rounded-[2px] transition-all cursor-pointer chip-tactile ${
                mode === 'profile'
                  ? 'bg-white text-[#242824] font-semibold shadow-2xs'
                  : 'text-[#737872] hover:text-[#242824]'
              }`}
            >
              Preset Profiles
            </button>
          </div>

          {mode === 'target_size' ? (
            /* Target Max Size Mode */
            <div className="space-y-3 pt-1">
              {/* Quick Preset Chips */}
              <div>
                <label className="text-[11px] text-[#737872] block mb-1.5">Common Portal Ceilings</label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  {[200, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setTargetSizeValue(val >= 1000 ? val / 1000 : val);
                        setTargetUnit(val >= 1000 ? 'MB' : 'KB');
                      }}
                      className={`py-1.5 border rounded-[2px] cursor-pointer transition-all chip-tactile ${
                        (targetUnit === 'MB' ? targetSizeValue * 1024 : targetSizeValue) === val
                          ? 'bg-[#34483E] text-white border-[#34483E] font-medium shadow-2xs'
                          : 'bg-[#F5F5F2] hover:bg-[#EAECE7] text-[#242824] border-[#DFE2DC]'
                      }`}
                    >
                      {val >= 1000 ? `${val / 1000} MB` : `${val} KB`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="pdf-target-input" className="text-xs font-semibold text-[#242824]">
                    Target Maximum Size
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    {(['KB', 'MB'] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setTargetUnit(u)}
                        aria-pressed={targetUnit === u}
                        className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer transition-colors ${
                          targetUnit === u
                            ? 'bg-[#34483E] text-white font-medium'
                            : 'text-[#737872] hover:text-[#242824]'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  id="pdf-target-input"
                  type="number"
                  min="10"
                  max="50000"
                  value={targetSizeValue}
                  onChange={(e) => setTargetSizeValue(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#F5F5F2] focus:bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E]"
                />
              </div>

              <div className="text-[11px] text-[#737872]">
                SpecFit automatically optimizes raster resolution and JPEG stream tables to satisfy your ceiling.
              </div>
            </div>
          ) : (
            /* Profile Presets Mode */
            <div className="space-y-2 pt-1">
              {(Object.keys(PDF_COMPRESSION_PROFILES) as Array<'extreme' | 'balanced' | 'high_quality'>).map((key) => {
                const prof = PDF_COMPRESSION_PROFILES[key];
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedProfile(key)}
                    className={`p-3 rounded-[3px] border cursor-pointer transition-all chip-tactile ${
                      selectedProfile === key
                        ? 'border-[#34483E] bg-[#FAF9F6] shadow-2xs'
                        : 'border-[#DFE2DC] bg-white hover:border-[#737872]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#242824]">{prof.name}</span>
                      <input
                        type="radio"
                        name="profile-radio"
                        checked={selectedProfile === key}
                        onChange={() => setSelectedProfile(key)}
                        className="accent-[#34483E]"
                      />
                    </div>
                    <p className="text-[11px] text-[#737872] leading-relaxed">
                      {prof.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-3 border-t border-[#DFE2DC]">
            <button
              type="button"
              onClick={handleCompress}
              disabled={!file || isCompressing}
              className={`w-full py-2.5 rounded-[3px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs btn-tactile ${
                file && !isCompressing
                  ? 'bg-[#34483E] hover:bg-[#26362E] text-white'
                  : 'bg-[#EAECE7] text-[#9EA39D] cursor-not-allowed'
              }`}
            >
              <Minimize2 className="w-4 h-4" />
              <span>
                {isCompressing
                  ? `Compressing (${progressPercent}%)...`
                  : file
                  ? `Reduce PDF Size (${originalKb > 1024 ? `${originalMb} MB` : `${originalKb} KB`})`
                  : 'Select a PDF to Compress'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
