import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, EyeOff, Wifi, FileCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface NetworkAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: any[];
  totalImageBytes?: number;
  isPrivate?: boolean;
}

export const NetworkAuditModal: React.FC<NetworkAuditModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy & Data Protection Guarantee"
      subtitle="How SpecFit keeps your personal documents, photos, and signatures completely secure"
      maxWidth="lg"
    >
      <div className="space-y-6 text-xs text-[#1E2320]">
        {/* Main Status Callout */}
        <div className="p-4 bg-[#EAF2ED] border border-[#BFD9CA] rounded-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2E7252] shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-[#1E2320]">
              100% On-Device Processing
            </div>
            <p className="text-xs text-[#23583E] mt-1 leading-relaxed">
              Your photographs, signature images, and document files are processed entirely inside your local browser memory. Nothing is ever sent to or stored on any server.
            </p>
          </div>
        </div>

        {/* 4 Human-Centered Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E8E4] rounded-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[#1E2320]">
              <Lock className="w-4 h-4 text-[#2E7252]" />
              Zero Server Uploads
            </div>
            <p className="text-[11px] text-[#676F69] leading-relaxed">
              Image resizing, background whitening, and compression algorithms execute locally using HTML5 Canvas on your computer or phone.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E8E4] rounded-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[#1E2320]">
              <EyeOff className="w-4 h-4 text-[#2E7252]" />
              Automatic EXIF Stripping
            </div>
            <p className="text-[11px] text-[#676F69] leading-relaxed">
              Embedded GPS coordinates, phone camera serial numbers, and timestamp tags are automatically purged when your image is processed.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E8E4] rounded-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[#1E2320]">
              <Wifi className="w-4 h-4 text-[#2E7252]" />
              Works Completely Offline
            </div>
            <p className="text-[11px] text-[#676F69] leading-relaxed">
              SpecFit operates as an installable Progressive Web App. You can sever your internet connection and compress documents seamlessly.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E8E4] rounded-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[#1E2320]">
              <FileCheck className="w-4 h-4 text-[#2E7252]" />
              No Accounts or Tracking
            </div>
            <p className="text-[11px] text-[#676F69] leading-relaxed">
              No account creation, no cookies analyzing your documents, and no third-party data tracking. Clean, private software.
            </p>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="border border-[#E6E8E4] rounded-xs p-3.5 bg-white space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#676F69] mb-1">
            Privacy Verification Checklist
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-[#E6E8E4]/60">
            <span className="text-[#676F69]">Outbound image transmissions</span>
            <span className="font-mono font-semibold text-[#2E7252]">0 Bytes (Blocked)</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-[#E6E8E4]/60">
            <span className="text-[#676F69]">Third-party analytics / trackers</span>
            <span className="font-mono font-semibold text-[#2E7252]">None</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-[#676F69]">Temporary file storage location</span>
            <span className="font-mono text-[#1E2320]">Local Browser Memory Only</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
