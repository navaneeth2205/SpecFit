import React, { useState } from 'react';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { TopNavigation } from './components/layout/TopNavigation';
import { MobileDrawer } from './components/layout/MobileDrawer';

// Landing Page
import { LandingPage } from './components/landing/LandingPage';

// Primary Tools
import { UniversalImageEditor } from './components/editor/UniversalImageEditor';
import { QuickCompressorView } from './components/compressor/QuickCompressorView';
import { BatchProcessingView } from './components/batch/BatchProcessingView';
import { SignatureCleanerView } from './components/signature/SignatureCleanerView';

// Secondary Reference & System Views
import { PresetsDirectoryView } from './components/presets/PresetsDirectoryView';
import { CustomSpecBuilder } from './components/presets/CustomSpecBuilder';
import { ProcessingGuideView } from './components/help/ProcessingGuideView';
import { FaqView } from './components/help/FaqView';
import { SettingsView } from './components/settings/SettingsView';
import { NetworkAuditModal } from './components/privacy/NetworkAuditModal';

import { PORTAL_PRESETS, DEFAULT_PRESET_ID } from './data/presets';
import { PortalPreset, SupportedFormat } from './types';
import { useNetworkAudit } from './hooks/useNetworkAudit';
import { usePWA } from './hooks/usePWA';

export function App() {
  // Start on the comprehensive human-designed Landing Page
  const [currentView, setCurrentView] = useState<NavView>('landing');
  const [sampleToLoad, setSampleToLoad] = useState<'portrait' | 'signature' | 'document' | 'landscape' | undefined>(undefined);
  const [imageUrlToLoad, setImageUrlToLoad] = useState<string | undefined>(undefined);

  // Active preset (optional reference)
  const [activePreset, setActivePreset] = useState<PortalPreset>(
    PORTAL_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID) || PORTAL_PRESETS[0]
  );

  // Editor pre-fill settings when user selects a preset
  const [editorSettings, setEditorSettings] = useState<{
    width: number;
    height: number;
    maxKb: number;
    minKb: number;
    format: SupportedFormat;
  }>({
    width: 1200,
    height: 800,
    maxKb: 150,
    minKb: 40,
    format: 'image/jpeg'
  });

  // Modals & Drawers
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isCustomSpecModalOpen, setIsCustomSpecModalOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Privacy & PWA hooks
  const { networkLogs, totalOutboundImageBytes, isCompletelyPrivate } = useNetworkAudit();
  const { isOnline } = usePWA();

  // Apply a preset to the universal editor without locking any fields
  const handleApplyPresetToEditor = (preset: PortalPreset) => {
    setActivePreset(preset);
    const targetW = preset.photo.exactWidth || preset.photo.maxWidth || 1200;
    const targetH = preset.photo.exactHeight || preset.photo.maxHeight || 800;
    const fmt = preset.photo.formats.includes('image/jpeg') ? 'image/jpeg' : preset.photo.formats[0];

    setEditorSettings({
      width: targetW,
      height: targetH,
      maxKb: preset.photo.maxSizeKb,
      minKb: preset.photo.minSizeKb,
      format: fmt
    });

    setCurrentView('editor');
  };

  // Full-width Landing Page View with custom desktop scrollbars
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-[#F5F5F2] text-[#242824]">
        <LandingPage
          onOpenEditor={() => {
            setImageUrlToLoad(undefined);
            setSampleToLoad(undefined);
            setCurrentView('editor');
          }}
          onOpenCompressor={() => setCurrentView('compressor')}
          onOpenBatch={() => setCurrentView('batch')}
          onOpenSignature={() => setCurrentView('signature')}
          onOpenPresets={() => setCurrentView('presets')}
          onLoadSampleIntoEditor={(sampleType) => {
            setImageUrlToLoad(undefined);
            setSampleToLoad(sampleType);
            setCurrentView('editor');
          }}
          onLoadImageUrlIntoEditor={(url) => {
            setSampleToLoad(undefined);
            setImageUrlToLoad(url);
            setCurrentView('editor');
          }}
        />

        {/* Network Privacy Audit Modal */}
        <NetworkAuditModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          logs={networkLogs}
          totalImageBytes={totalOutboundImageBytes}
          isPrivate={isCompletelyPrivate}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#242824] flex">
      {/* Desktop Sidebar (Fixed width) */}
      <div className="hidden md:block">
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavigation
          currentView={currentView}
          activePreset={activePreset}
          isOnline={isOnline}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          onSelectView={setCurrentView}
          onSelectPreset={handleApplyPresetToEditor}
        />

        <main className="p-3 sm:p-5 lg:p-7 flex-1 max-w-7xl w-full mx-auto animate-fade-in min-w-0">
          {/* PRIMARY TOOL 1: Universal Image Editor */}
          {currentView === 'editor' && (
            <UniversalImageEditor
              key={`${editorSettings.width}-${editorSettings.height}-${editorSettings.maxKb}-${editorSettings.format}-${sampleToLoad || imageUrlToLoad || 'none'}`}
              initialWidth={editorSettings.width}
              initialHeight={editorSettings.height}
              initialMaxKb={editorSettings.maxKb}
              initialMinKb={editorSettings.minKb}
              initialFormat={editorSettings.format}
              initialSampleType={sampleToLoad}
              initialImageUrl={imageUrlToLoad}
              onOpenPresets={() => setCurrentView('presets')}
            />
          )}

          {/* PRIMARY TOOL 2: Quick Image Compressor */}
          {currentView === 'compressor' && <QuickCompressorView />}

          {/* PRIMARY TOOL 3: Batch Processing */}
          {currentView === 'batch' && <BatchProcessingView />}

          {/* PRIMARY TOOL 4: Signature Cleaner */}
          {currentView === 'signature' && <SignatureCleanerView />}

          {/* SECONDARY: Presets Library */}
          {currentView === 'presets' && (
            <PresetsDirectoryView
              onApplyPresetToEditor={handleApplyPresetToEditor}
              onOpenCustomBuilder={() => setIsCustomSpecModalOpen(true)}
            />
          )}

          {/* SECONDARY: Processing Guide */}
          {currentView === 'guide' && <ProcessingGuideView />}

          {/* SECONDARY: Help & FAQ */}
          {currentView === 'faq' && <FaqView />}

          {/* SYSTEM: Settings */}
          {currentView === 'settings' && (
            <SettingsView onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)} />
          )}

          {/* SYSTEM: Privacy Architecture */}
          {currentView === 'privacy' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-6 shadow-xs">
                <h2 className="text-lg font-bold text-[#242824]">Privacy Architecture</h2>
                <p className="text-xs text-[#737872] mt-1">
                  SpecFit has no backend database, no upload servers, and no telemetry tracking your images or documents.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="px-3 py-1.5 bg-[#34483E] hover:bg-[#26362E] text-white rounded-[2px] text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                  >
                    Open Live Network Inspector
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Network Privacy Audit Modal */}
      <NetworkAuditModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        logs={networkLogs}
        totalImageBytes={totalOutboundImageBytes}
        isPrivate={isCompletelyPrivate}
      />

      {/* Custom Specification Builder Modal */}
      <CustomSpecBuilder
        isOpen={isCustomSpecModalOpen}
        onClose={() => setIsCustomSpecModalOpen(false)}
        onSavePreset={handleApplyPresetToEditor}
      />
    </div>
  );
}

export default App;
