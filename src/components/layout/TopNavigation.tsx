import React, { useState } from 'react';
import {
  Menu,
  ShieldCheck,
  Search,
  WifiOff,
  HelpCircle,
  ChevronRight,
  Home,
  LayoutGrid
} from 'lucide-react';
import { NavView } from './Sidebar';
import { PortalPreset } from '../../types';
import { PORTAL_PRESETS } from '../../data/presets';
import { SpecFitLogo } from '../common/SpecFitLogo';

interface TopNavigationProps {
  currentView: NavView;
  activePreset?: PortalPreset;
  isOnline: boolean;
  onOpenMobileMenu: () => void;
  onOpenPrivacyModal: () => void;
  onSelectView: (view: NavView) => void;
  onSelectPreset?: (preset: PortalPreset) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentView,
  activePreset,
  isOnline,
  onOpenMobileMenu,
  onOpenPrivacyModal,
  onSelectView,
  onSelectPreset
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const viewTitles: Record<NavView, string> = {
    landing: 'Overview & Tour',
    dashboard: 'Tools Dashboard',
    editor: 'Image Editor',
    compressor: 'Image Compressor',
    batch: 'Batch Processing',
    signature: 'Signature Cleaner',
    'image-to-pdf': 'Images to PDF Converter',
    'pdf-compressor': 'PDF Reducer & Compressor',
    'pdf-to-image': 'PDF to Images Extractor',
    presets: 'Presets Library',
    guide: 'Processing Guide',
    settings: 'Settings',
    faq: 'Help & FAQ',
    privacy: 'Privacy Architecture'
  };

  const filteredPresets = searchQuery.trim()
    ? PORTAL_PRESETS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-14 min-h-[56px] bg-white/95 backdrop-blur-sm border-b border-[#DFE2DC] px-3 sm:px-5 flex items-center justify-between gap-2 lg:gap-4 sticky top-0 z-20">
      {/* Left: Mobile Toggle & Tool Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 text-[#737872] hover:text-[#242824] hover:bg-[#F5F5F2] rounded-[3px] shrink-0 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs min-w-0">
          <button
            type="button"
            onClick={() => onSelectView('landing')}
            className="flex items-center gap-2 font-semibold text-[#242824] cursor-pointer hover:opacity-85 transition-opacity shrink-0 whitespace-nowrap"
            title="Return to Product Tour & Overview"
          >
            <SpecFitLogo size="xs" />
            <span className="tracking-tight">SpecFit</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#CBD0C8] shrink-0 hidden sm:block" />
          <span className="font-medium text-[#242824] truncate max-w-[120px] sm:max-w-[180px] xl:max-w-none hidden sm:inline">
            {viewTitles[currentView]}
          </span>
        </div>
      </div>

      {/* Center: Preset Quick Finder */}
      <div className="relative hidden lg:block w-56 xl:w-72 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#737872] absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            id="top-nav-preset-search"
            aria-label="Quick search presets"
            type="text"
            placeholder="Quick search presets (100KB, Visa)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#F5F5F2] focus:bg-white border border-[#DFE2DC] rounded-[3px] focus:outline-none focus:border-[#34483E] transition-colors"
          />
        </div>

        {searchFocused && filteredPresets.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DFE2DC] rounded-[3px] shadow-md py-1 z-30 max-h-60 overflow-y-auto">
            {filteredPresets.map((p) => (
              <button
                key={p.id}
                onMouseDown={() => {
                  if (onSelectPreset) onSelectPreset(p);
                  onSelectView('editor');
                  setSearchQuery('');
                }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-[#F5F5F2] flex items-center justify-between cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-medium text-[#242824] block truncate">{p.name}</span>
                  <span className="text-[10px] text-[#737872]">
                    {p.photo.exactWidth ? `${p.photo.exactWidth}×${p.photo.exactHeight} px` : `${p.photo.minWidth}–${p.photo.maxWidth} px`} • ≤ {p.photo.maxSizeKb} KB
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#34483E] bg-[#EAECE7] px-1.5 py-0.5 rounded-[2px] shrink-0">
                  {p.code}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Status Badges & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
        <button
          onClick={() => onSelectView('dashboard')}
          className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-[3px] font-medium cursor-pointer transition-all shrink-0 whitespace-nowrap shadow-2xs ${
            currentView === 'dashboard'
              ? 'bg-[#34483E] text-white border border-[#34483E]'
              : 'text-[#242824] hover:bg-[#F5F5F2] border border-[#DFE2DC]'
          }`}
          title="Open Card Dashboard"
        >
          <LayoutGrid className={`w-3.5 h-3.5 shrink-0 ${currentView === 'dashboard' ? 'text-white' : 'text-[#34483E]'}`} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectView('landing')}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#242824] hover:bg-[#F5F5F2] border border-[#DFE2DC] px-2.5 py-1.5 rounded-[3px] font-medium cursor-pointer transition-all shrink-0 whitespace-nowrap shadow-2xs"
          title="Return to Product Tour & Overview"
        >
          <Home className="w-3.5 h-3.5 text-[#34483E] shrink-0" />
          <span>Tour</span>
        </button>

        {!isOnline && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[#A87532] bg-[#FAF5EB] border border-[#E8DAC2] px-2 py-1 rounded-[3px] shrink-0 whitespace-nowrap">
            <WifiOff className="w-3 h-3 shrink-0" />
            <span className="hidden md:inline">Offline</span>
          </span>
        )}

        <button
          onClick={onOpenPrivacyModal}
          className="inline-flex items-center gap-1.5 text-xs text-[#2E7252] hover:text-[#23573E] bg-[#EAF2ED] hover:bg-[#DFEDE5] border border-[#BFD9CA] px-2 sm:px-2.5 py-1.5 rounded-[3px] font-medium cursor-pointer transition-colors shrink-0 whitespace-nowrap"
          title="Inspect live privacy and network logs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#39765A] shrink-0" />
          <span className="hidden md:inline">100% On-Device</span>
        </button>

        <button
          onClick={() => onSelectView('faq')}
          className="p-1.5 text-[#737872] hover:text-[#242824] hover:bg-[#F5F5F2] rounded-[3px] transition-colors cursor-pointer shrink-0"
          title="Help & FAQ"
          aria-label="Help and FAQ"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
