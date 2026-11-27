import React from 'react';
import {
  Home,
  LayoutGrid,
  Image as ImageIcon,
  Minimize2,
  Files,
  PenTool,
  Bookmark,
  BookOpen,
  HelpCircle,
  Settings,
  ShieldCheck,
  FilePlus,
  FileDown,
  FileImage
} from 'lucide-react';

export type NavView =
  | 'landing'
  | 'dashboard'
  | 'editor'
  | 'compressor'
  | 'batch'
  | 'signature'
  | 'image-to-pdf'
  | 'pdf-compressor'
  | 'pdf-to-image'
  | 'presets'
  | 'guide'
  | 'settings'
  | 'faq'
  | 'privacy';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenPrivacyModal: () => void;
  onTriggerDemo?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenPrivacyModal,
  onTriggerDemo
}) => {
  const navItemClass = (view: NavView) =>
    `w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-[3px] transition-all duration-150 cursor-pointer text-left hover:translate-x-0.5 ${
      currentView === view
        ? 'bg-[#EAECE7] text-[#242824] font-semibold shadow-2xs border-l-2 border-[#34483E]'
        : 'text-[#737872] hover:text-[#242824] hover:bg-[#F0F1ED]'
    }`;

  return (
    <aside className="hidden md:flex w-56 shrink-0 bg-[#F5F5F2] border-r border-[#DFE2DC] flex-col justify-between h-screen sticky top-0 select-none">
      <div className="p-3.5 space-y-5 overflow-y-auto">
        {/* Brand Header */}
        <div
          onClick={() => onSelectView('landing')}
          className="flex items-center gap-2.5 px-2 pt-1 cursor-pointer hover:opacity-85 transition-opacity"
          title="Go to Overview & Tour"
        >
          <div className="w-6 h-6 bg-[#34483E] rounded-[3px] flex items-center justify-center text-white font-mono font-bold text-xs tracking-wider">
            SF
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-[#242824] leading-tight">
              SpecFit
            </div>
            <div className="text-[10px] text-[#737872] -mt-0.5">
              Image & PDF Utility
            </div>
          </div>
        </div>

        {/* OVERVIEW & DASHBOARD */}
        <div className="space-y-0.5">
          <button
            onClick={() => onSelectView('landing')}
            className={navItemClass('landing')}
          >
            <Home className="w-4 h-4 shrink-0 text-[#34483E]" />
            <span>Overview & Tour</span>
          </button>

          <button
            onClick={() => onSelectView('dashboard')}
            className={navItemClass('dashboard')}
          >
            <LayoutGrid className="w-4 h-4 shrink-0 text-[#34483E]" />
            <span>Tools Dashboard</span>
          </button>
        </div>

        {/* IMAGE SUITE */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#737872]">
            Image Suite
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => onSelectView('editor')}
              className={navItemClass('editor')}
            >
              <ImageIcon className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>Image Editor</span>
            </button>

            <button
              onClick={() => onSelectView('compressor')}
              className={navItemClass('compressor')}
            >
              <Minimize2 className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>Image Compressor</span>
            </button>

            <button
              onClick={() => onSelectView('signature')}
              className={navItemClass('signature')}
            >
              <PenTool className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>Signature Cleaner</span>
            </button>

            <button
              onClick={() => onSelectView('batch')}
              className={navItemClass('batch')}
            >
              <Files className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>Batch Resizer</span>
            </button>
          </nav>
        </div>

        {/* PDF SUITE */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#737872]">
            PDF Suite
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => onSelectView('image-to-pdf')}
              className={navItemClass('image-to-pdf')}
            >
              <FilePlus className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>Images to PDF</span>
            </button>

            <button
              onClick={() => onSelectView('pdf-compressor')}
              className={navItemClass('pdf-compressor')}
            >
              <FileDown className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>PDF Reducer</span>
            </button>

            <button
              onClick={() => onSelectView('pdf-to-image')}
              className={navItemClass('pdf-to-image')}
            >
              <FileImage className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>PDF to Images</span>
            </button>
          </nav>
        </div>

        {/* PRESETS & REFERENCE (SECONDARY) */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#737872]">
            Reference & Presets
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => onSelectView('presets')}
              className={navItemClass('presets')}
            >
              <Bookmark className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>Presets Library</span>
            </button>

            <button
              onClick={() => onSelectView('guide')}
              className={navItemClass('guide')}
            >
              <BookOpen className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>Processing Guide</span>
            </button>

            <button
              onClick={() => onSelectView('faq')}
              className={navItemClass('faq')}
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>Help & FAQ</span>
            </button>
          </nav>
        </div>

        {/* UTILITY SETTINGS */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#737872]">
            Preferences
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => onSelectView('settings')}
              className={navItemClass('settings')}
            >
              <Settings className="w-4 h-4 shrink-0 text-[#34483E]" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </div>

      {/* BOTTOM PRIVACY STATUS */}
      <div className="p-3 border-t border-[#DFE2DC] bg-[#F5F5F2]">
        <button
          onClick={onOpenPrivacyModal}
          className="w-full flex items-center gap-2 p-2 rounded-[3px] border border-[#DFE2DC] hover:border-[#34483E] bg-white transition-colors cursor-pointer text-left shadow-2xs"
        >
          <ShieldCheck className="w-4 h-4 text-[#39765A] shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#242824] truncate">100% On-Device</div>
            <div className="text-[10px] text-[#737872] truncate">Zero network uploads</div>
          </div>
        </button>
      </div>
    </aside>
  );
};
