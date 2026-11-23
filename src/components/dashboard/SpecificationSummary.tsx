import React from 'react';
import { ExternalLink, Check } from 'lucide-react';
import { PortalPreset } from '../../types';
import { Badge } from '../common/Badge';

interface SpecificationSummaryProps {
  preset: PortalPreset;
}

export const SpecificationSummary: React.FC<SpecificationSummaryProps> = ({ preset }) => {
  return (
    <div className="bg-white border border-[#E6E8E4] rounded-xs p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E6E8E4]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#1E2320] tracking-tight">
            Target Sizing & Format Rules
          </h3>
          <Badge variant="success" size="sm">
            {preset.category}
          </Badge>
        </div>

        {preset.sourceUrl && (
          <a
            href={preset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#1F352E] hover:underline inline-flex items-center gap-1 font-medium"
          >
            Official Guidelines
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="mt-3 text-xs text-[#676F69]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span><span className="font-medium text-[#1E2320]">{preset.name}</span> • {preset.applicationCycle}</span>
          <span className="text-[11px] text-[#8C938D]">Cycle Notice: Specifications apply to the cited notification cycle. Always confirm criteria in your active brochure.</span>
        </div>
      </div>

      {/* Side-by-side spec comparison table */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Photo Spec */}
        <div className="bg-[#FAF9F6] border border-[#E6E8E4] p-3.5 rounded-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1E2320] uppercase tracking-wider">
              Photo / Image Criteria
            </span>
            <span className="text-[11px] font-mono font-medium text-[#1F352E]">
              {preset.photo.aspectRatioLabel}
            </span>
          </div>

          <dl className="text-xs space-y-1.5 divide-y divide-[#E6E8E4]/60">
            <div className="pt-1.5 flex justify-between">
              <dt className="text-[#676F69]">Dimensions:</dt>
              <dd className="font-mono text-[#1E2320] font-medium">
                {preset.photo.exactWidth
                  ? `${preset.photo.exactWidth} × ${preset.photo.exactHeight} px`
                  : `${preset.photo.minWidth}–${preset.photo.maxWidth} × ${preset.photo.minHeight}–${preset.photo.maxHeight} px`}
              </dd>
            </div>
            <div className="pt-1.5 flex justify-between">
              <dt className="text-[#676F69]">Target File Size:</dt>
              <dd className="font-mono text-[#1E2320] font-medium">
                {preset.photo.minSizeKb} KB – {preset.photo.maxSizeKb} KB
              </dd>
            </div>
            <div className="pt-1.5 flex justify-between">
              <dt className="text-[#676F69]">Accepted Formats:</dt>
              <dd className="font-mono text-[#1E2320] font-medium">
                {preset.photo.formats.map((f) => (f === 'image/jpeg' ? 'JPEG' : 'PNG')).join(', ')}
              </dd>
            </div>
            <div className="pt-1.5 flex justify-between">
              <dt className="text-[#676F69]">Background:</dt>
              <dd className="text-[#1E2320] text-right font-medium truncate max-w-[170px]">
                {preset.photo.background}
              </dd>
            </div>
          </dl>

          <div className="mt-2.5 pt-2 border-t border-[#E6E8E4] text-[11px] text-[#676F69]">
            <p className="font-medium text-[#1E2320] mb-1">Key Notes:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              {preset.photo.specialInstructions.slice(0, 2).map((inst, i) => (
                <li key={i} className="truncate">{inst}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Signature Spec */}
        <div className="bg-[#FAF9F6] border border-[#E6E8E4] p-3.5 rounded-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1E2320] uppercase tracking-wider">
              Signature / Ink Criteria
            </span>
            <span className="text-[11px] font-mono font-medium text-[#1F352E]">
              {preset.signature.aspectRatioLabel}
            </span>
          </div>

          <dl className="text-xs space-y-1.5 divide-y divide-[#E6E8E4]/60">
            <div className="pt-1.5 flex justify-between">
              <dt className="text-[#676F69]">Dimensions:</dt>
              <dd className="font-mono text-[#1E2320] font-medium">
                {preset.signature.exactWidth
                  ? `${preset.signature.exactWidth} × ${preset.signature.exactHeight} px`
                  : `${preset.signature.minWidth}–${preset.signature.maxWidth} × ${preset.signature.minHeight}–${preset.signature.maxHeight} px`}
              </dd>
            </div>
            <div className="pt-1.5 flex justify-between">
              <dt className="text-[#676F69]">Target File Size:</dt>
              <dd className="font-mono text-[#1E2320] font-medium">
                {preset.signature.minSizeKb} KB – {preset.signature.maxSizeKb} KB
              </dd>
            </div>
            <div className="pt-1.5 flex justify-between">
              <dt className="text-[#676F69]">Accepted Formats:</dt>
              <dd className="font-mono text-[#1E2320] font-medium">
                {preset.signature.formats.map((f) => (f === 'image/jpeg' ? 'JPEG' : 'PNG')).join(', ')}
              </dd>
            </div>
            <div className="pt-1.5 flex justify-between">
              <dt className="text-[#676F69]">Background:</dt>
              <dd className="text-[#1E2320] text-right font-medium truncate max-w-[170px]">
                {preset.signature.background}
              </dd>
            </div>
          </dl>

          <div className="mt-2.5 pt-2 border-t border-[#E6E8E4] text-[11px] text-[#676F69]">
            <p className="font-medium text-[#1E2320] mb-1">Key Notes:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              {preset.signature.specialInstructions.slice(0, 2).map((inst, i) => (
                <li key={i} className="truncate">{inst}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
