import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  SlidersHorizontal,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { PORTAL_PRESETS } from '../../data/presets';
import { PortalPreset } from '../../types';

interface PresetsDirectoryViewProps {
  onApplyPresetToEditor: (preset: PortalPreset) => void;
  onOpenCustomBuilder: () => void;
}

export const PresetsDirectoryView: React.FC<PresetsDirectoryViewProps> = ({
  onApplyPresetToEditor,
  onOpenCustomBuilder
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Universal & General',
    'Social Media & Web',
    'Profile & Resume',
    'Documents & Scans',
    'Passports & Visas',
    'Application Portals'
  ];

  const filteredPresets = PORTAL_PRESETS.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category === selectedCategory ||
      (selectedCategory === 'Social Media & Web' && (p.category === 'Professional & Web' || p.category === 'Universal & General')) ||
      (selectedCategory === 'Profile & Resume' && p.category === 'Professional & Web') ||
      (selectedCategory === 'Documents & Scans' && p.category === 'Universal & General');

    const matchesQuery =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#737872] uppercase tracking-wider">
              Optional Preset Catalog
            </span>
            <span className="text-[11px] font-mono bg-[#EAECE7] text-[#34483E] px-2 py-0.5 rounded-[2px]">
              Ready-Made Standards
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#242824] tracking-tight">
            Presets & Standards Directory
          </h2>
          <p className="text-xs text-[#737872] mt-0.5">
            Quick-start templates for common web, document, visa, and portal requirements. Applying a preset pre-fills the Image Editor without locking any custom values.
          </p>
        </div>

        <button
          onClick={onOpenCustomBuilder}
          className="text-xs px-3.5 py-1.5 bg-white border border-[#DFE2DC] hover:border-[#34483E] text-[#34483E] rounded-[3px] font-medium cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 self-start md:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Create Custom Preset
        </button>
      </div>

      {/* Official Guidelines & Cycle Disclaimer Banner */}
      <div className="bg-[#FAF9F6] border border-[#DFE2DC] px-4 py-3 rounded-[3px] text-xs text-[#737872] flex items-start gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#34483E] mt-1.5 shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-[#242824] font-medium">Official Sizing & Cycle Notice:</strong> Preset specifications for government and passport applications are verified from cited official brochures for the specific cycle listed. Requirements may vary between cycles. Always verify guidelines in your active recruitment or visa brochure.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-[#DFE2DC] p-3 rounded-[3px] shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[2px] transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#34483E] text-white'
                  : 'text-[#737872] hover:text-[#242824] hover:bg-[#F0F1ED]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#737872] absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search preset or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#F5F5F2] focus:bg-white border border-[#DFE2DC] rounded-[2px] focus:outline-none focus:border-[#34483E]"
          />
        </div>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs flex flex-col justify-between hover:border-[#737872] transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold font-mono text-[#34483E] bg-[#EAECE7] px-2 py-0.5 rounded-[2px]">
                  {preset.code}
                </span>
                <span className="text-[11px] text-[#737872] border border-[#DFE2DC] px-1.5 py-0.5 rounded-[2px]">
                  {preset.category}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-[#242824] mb-1">
                {preset.name}
              </h3>
              <p className="text-xs text-[#737872] leading-relaxed line-clamp-2 mb-3">
                {preset.description}
              </p>

              {/* Sizing snapshot */}
              <div className="bg-[#F5F5F2] border border-[#DFE2DC] p-2.5 rounded-[2px] space-y-1 text-[11px] font-mono mb-3">
                <div className="flex justify-between">
                  <span className="text-[#737872]">Target Dimensions:</span>
                  <span className="text-[#242824] font-medium">
                    {preset.photo.exactWidth
                      ? `${preset.photo.exactWidth} × ${preset.photo.exactHeight} px`
                      : `${preset.photo.minWidth}–${preset.photo.maxWidth} px`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737872]">File Size Limit:</span>
                  <span className="text-[#242824] font-medium">
                    {preset.photo.minSizeKb} KB – {preset.photo.maxSizeKb} KB
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-[#737872]">
                <div className="font-medium text-[#242824]">{preset.sourceAuthority}</div>
                <div>{preset.lastVerifiedDate}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DFE2DC] flex items-center justify-between gap-2">
              {preset.sourceUrl ? (
                <a
                  href={preset.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#737872] hover:text-[#242824] inline-flex items-center gap-1"
                >
                  Source <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : <span />}

              <button
                onClick={() => onApplyPresetToEditor(preset)}
                className="text-xs px-3 py-1.5 bg-[#34483E] hover:bg-[#26362E] text-white rounded-[2px] font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>Use in Image Editor</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
