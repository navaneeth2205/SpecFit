import React from 'react';
import {
  X,
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
import { NavView } from './Sidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenPrivacyModal: () => void;
  onTriggerDemo?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  onOpenPrivacyModal
}) => {
  if (!isOpen) return null;

  const handleNav = (view: NavView) => {
    onSelectView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#242824]/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-68 bg-[#F5F5F2] h-full shadow-lg flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DC]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#34483E] rounded-[3px] flex items-center justify-center text-white font-mono font-bold text-xs">
                SF
              </div>
              <span className="font-semibold text-sm text-[#242824]">SpecFit Tools</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#737872] hover:text-[#242824]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-4 text-xs font-medium">
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav('landing')}
                className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                  currentView === 'landing' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                }`}
              >
                <Home className="w-4 h-4 text-[#34483E]" />
                <span>Overview & Tour</span>
              </button>

              <button
                onClick={() => handleNav('dashboard')}
                className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                  currentView === 'dashboard' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-[#34483E]" />
                <span>Tools Dashboard</span>
              </button>
            </div>

            {/* Image Suite */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#737872] font-semibold block mb-1">
                Image Suite
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNav('editor')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'editor' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-[#34483E]" />
                  <span>Image Editor</span>
                </button>
                <button
                  onClick={() => handleNav('compressor')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'compressor' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <Minimize2 className="w-4 h-4 text-[#34483E]" />
                  <span>Image Compressor</span>
                </button>
                <button
                  onClick={() => handleNav('signature')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'signature' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <PenTool className="w-4 h-4 text-[#34483E]" />
                  <span>Signature Cleaner</span>
                </button>
                <button
                  onClick={() => handleNav('batch')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'batch' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <Files className="w-4 h-4 text-[#34483E]" />
                  <span>Batch Resizer</span>
                </button>
              </div>
            </div>

            {/* PDF Suite */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#737872] font-semibold block mb-1">
                PDF Suite
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNav('image-to-pdf')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'image-to-pdf' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <FilePlus className="w-4 h-4 text-[#34483E]" />
                  <span>Images to PDF</span>
                </button>
                <button
                  onClick={() => handleNav('pdf-compressor')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'pdf-compressor' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <FileDown className="w-4 h-4 text-[#34483E]" />
                  <span>PDF Reducer</span>
                </button>
                <button
                  onClick={() => handleNav('pdf-to-image')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'pdf-to-image' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <FileImage className="w-4 h-4 text-[#34483E]" />
                  <span>PDF to Images</span>
                </button>
              </div>
            </div>

            {/* Reference & Presets */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#737872] font-semibold block mb-1">
                Reference & Presets
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNav('presets')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'presets' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-[#34483E]" />
                  <span>Presets Library</span>
                </button>
                <button
                  onClick={() => handleNav('guide')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'guide' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#34483E]" />
                  <span>Processing Guide</span>
                </button>
                <button
                  onClick={() => handleNav('faq')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'faq' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-[#34483E]" />
                  <span>Help & FAQ</span>
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#737872] font-semibold block mb-1">
                Preferences
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNav('settings')}
                  className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors ${
                    currentView === 'settings' ? 'bg-[#EAECE7] text-[#242824] font-semibold border-l-2 border-[#34483E]' : 'text-[#737872]'
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#34483E]" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Privacy Card */}
        <div className="pt-3 border-t border-[#DFE2DC] mt-4">
          <button
            onClick={() => {
              onOpenPrivacyModal();
              onClose();
            }}
            className="w-full flex items-center gap-2 p-2 bg-white border border-[#DFE2DC] rounded-[3px] text-left cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-[#39765A] shrink-0" />
            <div className="text-[11px] font-semibold text-[#242824]">
              100% On-Device Privacy
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
