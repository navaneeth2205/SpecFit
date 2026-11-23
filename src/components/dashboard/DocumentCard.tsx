import React from 'react';
import {
  Image as ImageIcon,
  PenTool,
  Upload,
  Crop,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DocumentType, ProcessedDocument, PortalPreset } from '../../types';
import { downloadBlob } from '../../engine/zipExporter';

interface DocumentCardProps {
  type: DocumentType;
  preset: PortalPreset;
  document: ProcessedDocument | null;
  onEdit: () => void;
  onUpload: (file: File) => void;
  onLoadDemo: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  type,
  preset,
  document,
  onEdit,
  onUpload,
  onLoadDemo
}) => {
  const isPhoto = type === 'photo';
  const spec = isPhoto ? preset.photo : preset.signature;
  const title = isPhoto ? 'Photo or Document Image' : 'Signature or Handwritten Ink';
  const icon = isPhoto ? (
    <ImageIcon className="w-4 h-4 text-[#1F352E]" />
  ) : (
    <PenTool className="w-4 h-4 text-[#1F352E]" />
  );

  const handleDownload = () => {
    if (!document || !document.blob) return;
    const ext = document.format === 'image/jpeg' ? 'jpg' : 'png';
    const fileName = `${preset.code.toLowerCase()}_${type}_specfit.${ext}`;
    downloadBlob(document.blob, fileName);
  };

  return (
    <div className="bg-white border border-[#E6E8E4] rounded-xs shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Top Header */}
      <div className="p-4 border-b border-[#E6E8E4] bg-[#FAF9F6] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white border border-[#E6E8E4] rounded-xs">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#1E2320] tracking-tight">{title}</h4>
            <span className="text-[11px] text-[#676F69]">
              Target: {spec.aspectRatioLabel} • {spec.minSizeKb}–{spec.maxSizeKb} KB
            </span>
          </div>
        </div>

        <div>
          {document ? (
            document.validation.passed ? (
              <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-[#2E7252]" />}>
                Ready
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" icon={<AlertCircle className="w-3 h-3 text-[#9B6A28]" />}>
                Check Sizing
              </Badge>
            )
          ) : (
            <Badge variant="neutral" size="sm">
              Empty
            </Badge>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="p-5 flex-1 flex flex-col items-center justify-center min-h-[220px]">
        {document ? (
          <div className="w-full flex flex-col items-center">
            <div
              className={`relative border-2 ${
                document.validation.passed ? 'border-[#2E7252]' : 'border-[#9B6A28]'
              } bg-[#F2F4F0] p-1 shadow-xs rounded-xs overflow-hidden max-h-[170px] flex items-center justify-center`}
            >
              <img
                src={document.objectUrl!}
                alt={title}
                className="max-h-[160px] w-auto object-contain"
              />

              {document.isDemo && (
                <span className="absolute top-1 left-1 bg-[#1E2320]/80 text-white text-[9px] font-mono px-1 py-0.5 rounded-[2px]">
                  SAMPLE
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[11px] bg-[#FAF9F6] border border-[#E6E8E4] px-2 py-0.5 rounded-[2px] text-[#1E2320]">
                {document.width} × {document.height} px
              </span>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded-[2px] border ${
                  document.sizeKb >= spec.minSizeKb && document.sizeKb <= spec.maxSizeKb
                    ? 'bg-[#EAF2ED] text-[#2E7252] border-[#BFD9CA]'
                    : 'bg-[#FDF2F1] text-[#B54238] border-[#F2C5C1]'
                }`}
              >
                {document.sizeKb} KB
              </span>
              <span className="font-mono text-[11px] bg-[#FAF9F6] border border-[#E6E8E4] px-2 py-0.5 rounded-[2px] text-[#676F69]">
                {document.format === 'image/jpeg' ? 'JPEG' : 'PNG'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center w-full py-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#F2F4F0] flex items-center justify-center text-[#676F69] mb-2.5">
              {icon}
            </div>
            <p className="text-xs font-medium text-[#1E2320]">
              Drop your {isPhoto ? 'image or photo' : 'signature image'} here
            </p>
            <p className="text-[11px] text-[#676F69] mt-0.5 max-w-xs mx-auto">
              Supports JPEG, PNG, and WebP files. Processed instantly on your device.
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                />
                <span className="inline-flex items-center justify-center font-medium text-xs px-2.5 py-1.5 gap-1.5 rounded-sm bg-[#1F352E] text-white hover:bg-[#162722] transition-colors">
                  <Upload className="w-3 h-3" />
                  Select File
                </span>
              </label>

              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles className="w-3 h-3 text-[#2E7252]" />}
                onClick={onLoadDemo}
              >
                Sample
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-[#E6E8E4] bg-[#FAF9F6] flex items-center justify-between gap-2">
        {document ? (
          <>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                icon={<Crop className="w-3.5 h-3.5" />}
                onClick={onEdit}
              >
                Adjust & Crop
              </Button>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                />
                <span className="inline-flex items-center justify-center font-medium text-xs px-2.5 py-1.5 gap-1.5 rounded-sm bg-transparent hover:bg-[#F2F4F0] text-[#676F69] hover:text-[#1E2320] border border-[#E6E8E4] transition-colors cursor-pointer">
                  <RefreshCw className="w-3 h-3" />
                  Change
                </span>
              </label>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </>
        ) : (
          <div className="text-[11px] text-[#676F69] flex items-center justify-between w-full">
            <span>Runs locally in browser</span>
            <span>No upload to cloud</span>
          </div>
        )}
      </div>
    </div>
  );
};
