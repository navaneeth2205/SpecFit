import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';
import { PORTAL_PRESETS } from '../../data/presets';
import { PortalPreset } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface PortalPresetsViewProps {
  currentPreset: PortalPreset;
  onSelectPreset: (preset: PortalPreset) => void;
  onOpenCustomBuilder: () => void;
}

export const PortalPresetsView: React.FC<PortalPresetsViewProps> = ({
  currentPreset,
  onSelectPreset,
  onOpenCustomBuilder
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Universal & General',
    'Professional & Web',
    'Passports & Visas',
    'Application Portals'
  ];

  const filteredPresets = PORTAL_PRESETS.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E6E8E4] rounded-xs p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#676F69] uppercase tracking-wider">
              Presets & Standards Directory
            </span>
            <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3 text-[#2E7252]" />}>
              Ready to Use
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-[#1E2320] tracking-tight">
            Universal Sizing & Preset Standards
          </h2>
          <p className="text-xs text-[#676F69] mt-0.5">
            Select a target profile, strict file size ceiling, passport standard, or configure your own custom dimensions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<SlidersHorizontal className="w-4 h-4" />}
          onClick={onOpenCustomBuilder}
        >
          Create Custom Sizing
        </Button>
      </div>

      {/* Official Guidelines & Cycle Disclaimer Banner */}
      <div className="bg-[#FAF9F6] border border-[#E6E8E4] px-4 py-3 rounded-xs text-xs text-[#676F69] flex items-start gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1F352E] mt-1.5 shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-[#1E2320] font-medium">Official Sizing & Cycle Notice:</strong> Preset parameters are extracted directly from official brochures and regulatory publications for the specified notification cycles. Government commissions, visa consulates, and examination boards periodically adjust dimensional or byte limits between application cycles. Candidates and applicants are advised to verify requirements against their active cycle announcement.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-[#E6E8E4] p-3 rounded-xs shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1F352E] text-white'
                  : 'text-[#676F69] hover:text-[#1E2320] hover:bg-[#F2F4F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#676F69] absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search preset or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#FAF9F6] focus:bg-white border border-[#E6E8E4] rounded-xs focus:outline-none focus:border-[#1F352E]"
          />
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPresets.map((preset) => {
          const isActive = preset.id === currentPreset.id;
          return (
            <div
              key={preset.id}
              className={`bg-white border rounded-xs shadow-xs p-5 flex flex-col justify-between transition-all ${
                isActive ? 'border-2 border-[#1F352E]' : 'border-[#E6E8E4] hover:border-[#676F69]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-[#1F352E] bg-[#EAF2ED] px-2 py-0.5 rounded-[2px] font-mono">
                    {preset.code}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {preset.category}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-[#1E2320] tracking-tight mb-1">
                  {preset.name}
                </h3>
                <p className="text-xs text-[#676F69] leading-relaxed line-clamp-2 mb-3">
                  {preset.description}
                </p>

                {/* Specs snapshot */}
                <div className="bg-[#FAF9F6] border border-[#E6E8E4] p-2.5 rounded-xs space-y-1.5 text-[11px] mb-3">
                  <div className="flex justify-between">
                    <span className="text-[#676F69]">Image:</span>
                    <span className="font-mono text-[#1E2320] font-medium">
                      {preset.photo.exactWidth
                        ? `${preset.photo.exactWidth}×${preset.photo.exactHeight} px`
                        : `${preset.photo.minWidth}–${preset.photo.maxWidth} px`} • {preset.photo.minSizeKb}–{preset.photo.maxSizeKb} KB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#676F69]">Signature:</span>
                    <span className="font-mono text-[#1E2320] font-medium">
                      {preset.signature.exactWidth
                        ? `${preset.signature.exactWidth}×${preset.signature.exactHeight} px`
                        : `${preset.signature.minWidth}–${preset.signature.maxWidth} px`} • {preset.signature.minSizeKb}–{preset.signature.maxSizeKb} KB
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-[#676F69]">
                  <span className="font-medium text-[#1E2320]">{preset.sourceAuthority}</span>
                  <div>{preset.lastVerifiedDate}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E6E8E4] flex items-center justify-between gap-2">
                {preset.sourceUrl ? (
                  <a
                    href={preset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#676F69] hover:text-[#1E2320] inline-flex items-center gap-1"
                  >
                    Guidelines <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : <span />}

                <Button
                  variant={isActive ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => onSelectPreset(preset)}
                >
                  {isActive ? 'Active in Workspace' : 'Select Preset'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
