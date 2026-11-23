import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PortalPreset } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface CustomSpecBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreset: (preset: PortalPreset) => void;
  initialPreset?: PortalPreset;
}

export const CustomSpecBuilder: React.FC<CustomSpecBuilderProps> = ({
  isOpen,
  onClose,
  onSavePreset,
  initialPreset
}) => {
  const [name, setName] = useState(initialPreset?.name || 'Custom Image Sizing');
  const [code, setCode] = useState(initialPreset?.code || 'CUSTOM');
  const [description, setDescription] = useState(
    initialPreset?.description || 'Custom dimensions and target file sizes for your specific upload requirements.'
  );

  // Photo
  const [photoWidth, setPhotoWidth] = useState(initialPreset?.photo.exactWidth || 800);
  const [photoHeight, setPhotoHeight] = useState(initialPreset?.photo.exactHeight || 1000);
  const [photoMinKb, setPhotoMinKb] = useState(initialPreset?.photo.minSizeKb || 10);
  const [photoMaxKb, setPhotoMaxKb] = useState(initialPreset?.photo.maxSizeKb || 200);

  // Signature
  const [sigWidth, setSigWidth] = useState(initialPreset?.signature.exactWidth || 400);
  const [sigHeight, setSigHeight] = useState(initialPreset?.signature.exactHeight || 150);
  const [sigMinKb, setSigMinKb] = useState(initialPreset?.signature.minSizeKb || 5);
  const [sigMaxKb, setSigMaxKb] = useState(initialPreset?.signature.maxSizeKb || 50);

  const handleSave = () => {
    const customPreset: PortalPreset = {
      id: `custom-${Date.now()}`,
      name,
      code: code.toUpperCase().trim() || 'CUSTOM',
      category: 'Custom',
      applicationCycle: 'User Configured',
      lastVerifiedDate: `Configured on ${new Date().toLocaleDateString()}`,
      sourceAuthority: 'User Defined Settings',
      sourceUrl: '',
      description,
      isCustom: true,
      photo: {
        exactWidth: photoWidth,
        exactHeight: photoHeight,
        minWidth: Math.round(photoWidth * 0.8),
        maxWidth: Math.round(photoWidth * 1.2),
        minHeight: Math.round(photoHeight * 0.8),
        maxHeight: Math.round(photoHeight * 1.2),
        aspectRatio: photoWidth / photoHeight,
        aspectRatioLabel: `${photoWidth} × ${photoHeight} px`,
        minSizeKb: photoMinKb,
        maxSizeKb: photoMaxKb,
        formats: ['image/jpeg'],
        background: 'Any background',
        specialInstructions: [
          'Custom dimension and target weight applied'
        ]
      },
      signature: {
        exactWidth: sigWidth,
        exactHeight: sigHeight,
        minWidth: Math.round(sigWidth * 0.8),
        maxWidth: Math.round(sigWidth * 1.2),
        minHeight: Math.round(sigHeight * 0.8),
        maxHeight: Math.round(sigHeight * 1.2),
        aspectRatio: sigWidth / sigHeight,
        aspectRatioLabel: `${sigWidth} × ${sigHeight} px`,
        minSizeKb: sigMinKb,
        maxSizeKb: sigMaxKb,
        formats: ['image/jpeg'],
        background: 'White paper or transparent',
        specialInstructions: [
          'Custom signature limits applied'
        ]
      }
    };

    onSavePreset(customPreset);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Sizing & File Weight Builder"
      subtitle="Set custom pixel dimensions and maximum kilobyte boundaries"
      maxWidth="xl"
    >
      <div className="space-y-5 text-xs text-[#1E2320]">
        {/* Preset Name & Code */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-[#1E2320] font-semibold mb-1">Preset / Purpose Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Website Headshot, Job Upload, State Portal"
              className="w-full px-3 py-1.5 border border-[#E6E8E4] rounded-xs bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-[#1F352E]"
            />
          </div>
          <div>
            <label className="block text-[#1E2320] font-semibold mb-1">Short Label</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CUSTOM"
              className="w-full px-3 py-1.5 border border-[#E6E8E4] rounded-xs bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-[#1F352E] font-mono"
            />
          </div>
        </div>

        {/* Photo Box */}
        <div className="p-3.5 border border-[#E6E8E4] bg-[#FAF9F6] rounded-xs space-y-3">
          <span className="font-semibold text-[#1E2320] uppercase tracking-wider block">
            Photograph / Image Targets
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[#676F69] block mb-1">Width (px)</label>
              <input
                type="number"
                value={photoWidth}
                onChange={(e) => setPhotoWidth(parseInt(e.target.value, 10) || 100)}
                className="w-full px-2 py-1 border border-[#E6E8E4] bg-white rounded-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[#676F69] block mb-1">Height (px)</label>
              <input
                type="number"
                value={photoHeight}
                onChange={(e) => setPhotoHeight(parseInt(e.target.value, 10) || 100)}
                className="w-full px-2 py-1 border border-[#E6E8E4] bg-white rounded-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[#676F69] block mb-1">Min Size (KB)</label>
              <input
                type="number"
                value={photoMinKb}
                onChange={(e) => setPhotoMinKb(parseInt(e.target.value, 10) || 5)}
                className="w-full px-2 py-1 border border-[#E6E8E4] bg-white rounded-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[#676F69] block mb-1">Max Size (KB)</label>
              <input
                type="number"
                value={photoMaxKb}
                onChange={(e) => setPhotoMaxKb(parseInt(e.target.value, 10) || 50)}
                className="w-full px-2 py-1 border border-[#E6E8E4] bg-white rounded-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Signature Box */}
        <div className="p-3.5 border border-[#E6E8E4] bg-[#FAF9F6] rounded-xs space-y-3">
          <span className="font-semibold text-[#1E2320] uppercase tracking-wider block">
            Signature / Ink Targets
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[#676F69] block mb-1">Width (px)</label>
              <input
                type="number"
                value={sigWidth}
                onChange={(e) => setSigWidth(parseInt(e.target.value, 10) || 50)}
                className="w-full px-2 py-1 border border-[#E6E8E4] bg-white rounded-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[#676F69] block mb-1">Height (px)</label>
              <input
                type="number"
                value={sigHeight}
                onChange={(e) => setSigHeight(parseInt(e.target.value, 10) || 50)}
                className="w-full px-2 py-1 border border-[#E6E8E4] bg-white rounded-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[#676F69] block mb-1">Min Size (KB)</label>
              <input
                type="number"
                value={sigMinKb}
                onChange={(e) => setSigMinKb(parseInt(e.target.value, 10) || 5)}
                className="w-full px-2 py-1 border border-[#E6E8E4] bg-white rounded-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[#676F69] block mb-1">Max Size (KB)</label>
              <input
                type="number"
                value={sigMaxKb}
                onChange={(e) => setSigMaxKb(parseInt(e.target.value, 10) || 50)}
                className="w-full px-2 py-1 border border-[#E6E8E4] bg-white rounded-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E6E8E4] flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save & Activate
          </Button>
        </div>
      </div>
    </Modal>
  );
};
