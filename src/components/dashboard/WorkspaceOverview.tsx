import React, { useState } from 'react';
import {
  Archive,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DocumentCard } from './DocumentCard';
import { SpecificationSummary } from './SpecificationSummary';
import { ValidationPanel } from './ValidationPanel';
import {
  PortalPreset,
  ProcessedDocument,
  DocumentType
} from '../../types';
import { PORTAL_PRESETS } from '../../data/presets';
import { createZipArchive, downloadBlob } from '../../engine/zipExporter';
import {
  createSyntheticDemoPhoto,
  createSyntheticDemoSignature
} from '../../engine/demoGenerator';
import { renderCroppedCanvas } from '../../engine/canvas';
import { applySignatureFilters } from '../../engine/filters';
import { compressCanvasToTargetSize } from '../../engine/compressor';
import { validateDocument } from '../../engine/validator';

interface WorkspaceOverviewProps {
  currentPreset: PortalPreset;
  onSelectPreset: (preset: PortalPreset) => void;
  photoDoc: ProcessedDocument | null;
  signatureDoc: ProcessedDocument | null;
  onUpdatePhoto: (doc: ProcessedDocument | null) => void;
  onUpdateSignature: (doc: ProcessedDocument | null) => void;
  onOpenPhotoEditor: () => void;
  onOpenSignatureEditor: () => void;
  onOpenCustomSpecModal: () => void;
}

export const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({
  currentPreset,
  onSelectPreset,
  photoDoc,
  signatureDoc,
  onUpdatePhoto,
  onUpdateSignature,
  onOpenPhotoEditor,
  onOpenSignatureEditor,
  onOpenCustomSpecModal
}) => {
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState<boolean>(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState<boolean>(false);

  const canExportZip =
    photoDoc?.validation.passed && signatureDoc?.validation.passed;

  const processUploadedFile = async (file: File, type: DocumentType) => {
    const isPhoto = type === 'photo';
    const spec = isPhoto ? currentPreset.photo : currentPreset.signature;
    const targetW = spec.exactWidth || spec.maxWidth;
    const targetH = spec.exactHeight || spec.maxHeight;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const targetRatio = spec.aspectRatio;

      let cropW = imgW;
      let cropH = imgW / targetRatio;
      if (cropH > imgH) {
        cropH = imgH;
        cropW = imgH * targetRatio;
      }

      const cropArea = {
        x: (imgW - cropW) / 2,
        y: (imgH - cropH) / 2,
        width: cropW,
        height: cropH
      };

      let canvas = renderCroppedCanvas(img, cropArea, targetW, targetH, 0);

      if (!isPhoto) {
        canvas = applySignatureFilters(canvas, {
          grayscale: true,
          brightness: 12,
          contrast: 35,
          threshold: 215,
          inkEnhancement: true,
          backgroundWhitening: true
        });
      }

      const compression = await compressCanvasToTargetSize(canvas, {
        minSizeKb: spec.minSizeKb,
        maxSizeKb: spec.maxSizeKb,
        format: 'image/jpeg',
        minWidth: spec.minWidth,
        minHeight: spec.minHeight
      });

      const validation = validateDocument(
        {
          width: compression.width,
          height: compression.height,
          sizeKb: compression.sizeKb,
          sizeBytes: compression.sizeBytes,
          format: 'image/jpeg'
        },
        spec
      );

      const processed: ProcessedDocument = {
        originalFile: file,
        originalUrl: objectUrl,
        canvas,
        blob: compression.blob,
        objectUrl: URL.createObjectURL(compression.blob),
        fileName: file.name.replace(/\.[^/.]+$/, '.jpg'),
        width: compression.width,
        height: compression.height,
        sizeBytes: compression.sizeBytes,
        sizeKb: compression.sizeKb,
        format: 'image/jpeg',
        quality: compression.quality,
        validation,
        isDemo: file.name.includes('synthetic'),
        lastModified: Date.now()
      };

      if (isPhoto) {
        onUpdatePhoto(processed);
      } else {
        onUpdateSignature(processed);
      }
    };

    img.src = objectUrl;
  };

  const handleLoadFullDemo = async () => {
    setIsGeneratingDemo(true);
    try {
      const demoPhoto = await createSyntheticDemoPhoto();
      const demoSignature = await createSyntheticDemoSignature();

      await processUploadedFile(demoPhoto, 'photo');
      await processUploadedFile(demoSignature, 'signature');
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!canExportZip) return;
    setIsExportingZip(true);
    try {
      const zipBlob = await createZipArchive(currentPreset, photoDoc, signatureDoc);
      downloadBlob(zipBlob, `${currentPreset.code}_Prepared_Documents.zip`);
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Human-designed Workspace Header */}
      <div className="bg-white border border-[#E6E8E4] rounded-xs p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-[#676F69] uppercase tracking-wider">
              Document & Image Studio
            </span>
            <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3 text-[#2E7252]" />}>
              Private on Device
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-[#1E2320] tracking-tight">
            Resize, crop, and compress your files to exact specifications
          </h2>
          <p className="text-xs text-[#676F69] mt-1">
            Works for any photograph, document scan, avatar, or handwritten signature with instant local processing.
          </p>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="relative shrink-0">
          <label className="block text-[11px] font-medium text-[#676F69] mb-1">
            Active Size & Format Preset:
          </label>
          <div className="relative">
            <button
              onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
              className="flex items-center justify-between w-full md:w-72 bg-[#FAF9F6] hover:bg-[#F2F4F0] text-[#1E2320] border border-[#E6E8E4] px-3.5 py-2 rounded-xs text-xs font-medium cursor-pointer transition-colors shadow-xs"
            >
              <div className="text-left truncate">
                <span className="font-semibold block text-[#1E2320]">{currentPreset.name}</span>
                <span className="text-[11px] text-[#676F69] truncate block max-w-[210px]">
                  {currentPreset.category} • {currentPreset.photo.minSizeKb}–{currentPreset.photo.maxSizeKb} KB
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#676F69] shrink-0 ml-2" />
            </button>

            {portalDropdownOpen && (
              <div className="absolute right-0 mt-1 w-84 bg-white border border-[#E6E8E4] shadow-lg rounded-xs z-30 py-1 max-h-96 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#676F69] uppercase tracking-wider border-b border-[#E6E8E4] bg-[#FAF9F6]">
                  Choose Size or Purpose Preset
                </div>
                {PORTAL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setPortalDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 hover:bg-[#F2F4F0] transition-colors flex items-start justify-between border-b border-[#E6E8E4]/60 last:border-0 ${
                      preset.id === currentPreset.id ? 'bg-[#EAF2ED]' : ''
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#1E2320] flex items-center gap-1.5">
                        {preset.name}
                      </div>
                      <div className="text-[11px] text-[#676F69] line-clamp-1">{preset.description}</div>
                      <div className="text-[10px] text-[#2E7252] mt-0.5 font-mono">
                        Photo: {preset.photo.minSizeKb}–{preset.photo.maxSizeKb} KB • Sig: {preset.signature.minSizeKb}–{preset.signature.maxSizeKb} KB
                      </div>
                    </div>
                    {preset.id === currentPreset.id && (
                      <Check className="w-4 h-4 text-[#2E7252] shrink-0 mt-1" />
                    )}
                  </button>
                ))}

                <div className="p-2 border-t border-[#E6E8E4] bg-[#FAF9F6]">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setPortalDropdownOpen(false);
                      onOpenCustomSpecModal();
                    }}
                  >
                    Set Custom Dimensions & Max File Size
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Purpose Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-medium text-[#676F69] mr-1 shrink-0">Quick Switch:</span>
        {PORTAL_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPreset(p)}
            className={`px-3 py-1 rounded-xs transition-colors shrink-0 cursor-pointer ${
              p.id === currentPreset.id
                ? 'bg-[#1F352E] text-white font-medium'
                : 'bg-white text-[#676F69] hover:text-[#1E2320] border border-[#E6E8E4] hover:bg-[#F2F4F0]'
            }`}
          >
            {p.code === 'UNIVERSAL' ? 'All-Purpose' : p.code}
          </button>
        ))}
      </div>

      {/* Helpful Sample Banner */}
      {(!photoDoc || !signatureDoc) && (
        <div className="bg-[#EAF2ED] border border-[#BFD9CA] p-4 rounded-xs flex flex-wrap items-center justify-between gap-3 text-xs text-[#23583E]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#2E7252] shrink-0" />
            <div>
              <span className="font-semibold text-[#1E2320]">Want to preview how it works?</span>
              <p className="text-[11px] text-[#676F69] mt-0.5">
                Load sample photograph and signature images with one click to test instant resizing, background whitening, and compression.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5 text-[#2E7252]" />}
            onClick={handleLoadFullDemo}
            isLoading={isGeneratingDemo}
          >
            Load Sample Files
          </Button>
        </div>
      )}

      {/* Dual Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentCard
          type="photo"
          preset={currentPreset}
          document={photoDoc}
          onEdit={onOpenPhotoEditor}
          onUpload={(f) => processUploadedFile(f, 'photo')}
          onLoadDemo={async () => {
            const p = await createSyntheticDemoPhoto();
            processUploadedFile(p, 'photo');
          }}
        />

        <DocumentCard
          type="signature"
          preset={currentPreset}
          document={signatureDoc}
          onEdit={onOpenSignatureEditor}
          onUpload={(f) => processUploadedFile(f, 'signature')}
          onLoadDemo={async () => {
            const s = await createSyntheticDemoSignature();
            processUploadedFile(s, 'signature');
          }}
        />
      </div>

      {/* Specification Summary */}
      <SpecificationSummary preset={currentPreset} />

      {/* Validation Checklist */}
      <ValidationPanel photoDoc={photoDoc} signatureDoc={signatureDoc} />

      {/* Download Action Footer */}
      <div className="bg-white border border-[#E6E8E4] rounded-xs p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1E2320] tracking-tight">
            Export Prepared Files
          </h3>
          <p className="text-xs text-[#676F69] mt-0.5">
            {canExportZip
              ? 'Both files satisfy all target dimensions and byte limits.'
              : 'Add both an image and signature to export them together as a clean ZIP package.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={<Archive className="w-4 h-4" />}
            onClick={handleDownloadZip}
            disabled={!canExportZip || isExportingZip}
            isLoading={isExportingZip}
          >
            Download Both as ZIP ({currentPreset.code})
          </Button>
        </div>
      </div>
    </div>
  );
};
