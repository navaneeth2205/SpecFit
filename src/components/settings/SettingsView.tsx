import React, { useState } from 'react';
import {
  ShieldCheck,
  HardDrive,
  Trash2,
  CheckCircle2,
  Sliders,
  Settings as SettingsIcon,
  RefreshCw,
  Lock
} from 'lucide-react';
import { FileSizeUnit, SupportedFormat } from '../../types';
import { usePWA } from '../../hooks/usePWA';

interface SettingsViewProps {
  onOpenPrivacyModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenPrivacyModal }) => {
  const { isOnline, canInstall, isInstalled, triggerInstall } = usePWA();
  const [stripExif, setStripExif] = useState<boolean>(true);
  const [defaultUnit, setDefaultUnit] = useState<FileSizeUnit>('KB');
  const [defaultFormat, setDefaultFormat] = useState<SupportedFormat>('image/jpeg');
  const [clearingCache, setClearingCache] = useState<boolean>(false);
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch (err) {
      console.error('Failed to clear cache:', err);
    } finally {
      setClearingCache(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-4 h-4 text-[#34483E]" />
          <span className="text-xs font-semibold text-[#737872] uppercase tracking-wider">
            Utility Preferences
          </span>
        </div>
        <h2 className="text-lg font-bold text-[#242824] tracking-tight">
          Application Settings
        </h2>
        <p className="text-xs text-[#737872] mt-0.5">
          Manage local processing behaviors, default file units, metadata cleansing, and offline cache.
        </p>
      </div>

      {/* Processing & Metadata Preferences */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737872] pb-2 border-b border-[#DFE2DC]">
          Metadata & Privacy Defaults
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-start justify-between gap-4 p-2.5 rounded-[2px] hover:bg-[#F5F5F2] cursor-pointer">
            <div>
              <div className="font-semibold text-[#242824]">Automatic EXIF Metadata Cleansing</div>
              <div className="text-[#737872] text-[11px] mt-0.5">
                Strips camera model, GPS geolocation tags, timestamps, and serial numbers upon rendering.
              </div>
            </div>
            <input
              type="checkbox"
              checked={stripExif}
              onChange={(e) => setStripExif(e.target.checked)}
              className="mt-1 rounded-[2px]"
            />
          </label>

          <div className="p-2.5 flex items-center justify-between border-t border-[#DFE2DC]">
            <div>
              <div className="font-semibold text-[#242824]">Default File Size Unit</div>
              <div className="text-[#737872] text-[11px]">Primary unit when entering target sizes</div>
            </div>
            <select
              value={defaultUnit}
              onChange={(e) => setDefaultUnit(e.target.value as FileSizeUnit)}
              className="px-2.5 py-1 text-xs bg-[#F5F5F2] border border-[#DFE2DC] rounded-[2px]"
            >
              <option value="KB">Kilobytes (KB)</option>
              <option value="MB">Megabytes (MB)</option>
              <option value="Bytes">Bytes (B)</option>
            </select>
          </div>

          <div className="p-2.5 flex items-center justify-between border-t border-[#DFE2DC]">
            <div>
              <div className="font-semibold text-[#242824]">Default Image Format</div>
              <div className="text-[#737872] text-[11px]">Format selected upon uploading new files</div>
            </div>
            <select
              value={defaultFormat}
              onChange={(e) => setDefaultFormat(e.target.value as SupportedFormat)}
              className="px-2.5 py-1 text-xs bg-[#F5F5F2] border border-[#DFE2DC] rounded-[2px]"
            >
              <option value="image/jpeg">JPEG (.jpg)</option>
              <option value="image/png">PNG (.png)</option>
              <option value="image/webp">WebP (.webp)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Network & Privacy Architecture */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737872] pb-2 border-b border-[#DFE2DC]">
          Zero-Transmission Privacy
        </h3>

        <div className="text-xs text-[#737872] space-y-2">
          <p>
            SpecFit operates entirely in your web browser. No photos, signatures, or documents are transmitted to any server or cloud API.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onOpenPrivacyModal}
              className="px-3 py-1.5 bg-[#34483E] hover:bg-[#26362E] text-white rounded-[2px] font-medium cursor-pointer transition-colors text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Open Live Network Inspector
            </button>
          </div>
        </div>
      </div>

      {/* Offline PWA & Storage */}
      <div className="bg-white border border-[#DFE2DC] rounded-[3px] p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737872] pb-2 border-b border-[#DFE2DC]">
          Offline Storage & Cache
        </h3>

        <div className="text-xs text-[#737872] space-y-3">
          <div className="flex justify-between items-center">
            <span>Network Status:</span>
            <span className={`font-medium ${isOnline ? 'text-[#39765A]' : 'text-[#A87532]'}`}>
              {isOnline ? 'Online (Ready for Offline Use)' : 'Offline (Local Service Worker Active)'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Service Worker:</span>
            <span className="font-mono text-[#242824]">Active (Cache specfit-v2)</span>
          </div>

          <div className="pt-3 border-t border-[#DFE2DC] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#242824]">Purge Offline App Cache</div>
              <div className="text-[11px] text-[#737872]">Forces browser to redownload fresh bundles on next load</div>
            </div>

            <button
              onClick={handleClearCache}
              disabled={clearingCache}
              className="px-3 py-1.5 border border-[#DFE2DC] hover:bg-[#FDF2F2] text-[#B44B43] rounded-[2px] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{clearingCache ? 'Purging...' : cacheCleared ? 'Purged!' : 'Purge Cache'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
