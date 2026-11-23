import React from 'react';
import { Camera, Sun, PenTool, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ProcessingGuideView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E5E7E3] rounded-xs p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-[#747A75] uppercase tracking-wider">
            Processing Manual
          </span>
          <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3 text-[#39765A]" />}>
            Standard Operating Procedures
          </Badge>
        </div>
        <h2 className="text-xl font-bold text-[#202522] tracking-tight">
          How to Capture and Prepare Government Portal Ready Documents
        </h2>
        <p className="text-xs text-[#747A75] mt-1">
          Follow these practical techniques when photographing yourself or your signature with a smartphone to achieve instant portal acceptance.
        </p>
      </div>

      {/* Guide Section 1: Photograph Capture */}
      <div className="bg-white border border-[#E5E7E3] rounded-xs p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7E3]">
          <Camera className="w-5 h-5 text-[#263B35]" />
          <h3 className="text-base font-semibold text-[#202522] tracking-tight">
            1. Photograph Capture Rules (Passport & Recruitment Portals)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#747A75]">
          <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E7E3] rounded-xs space-y-2">
            <div className="font-semibold text-[#202522] flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-[#A87532]" />
              Lighting & Shadows
            </div>
            <p>
              Stand 1.5 to 2 meters away from a plain off-white or white wall. Position yourself facing a window or soft natural light source. Avoid direct harsh overhead bulbs that cast harsh shadows under the nose, chin, or ears.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E7E3] rounded-xs space-y-2">
            <div className="font-semibold text-[#202522] flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#39765A]" />
              Posture & Framing
            </div>
            <p>
              Hold the camera at exact eye level. Look straight ahead with a neutral facial expression and both eyes open. Keep shoulders level and ensure both ear lobes are uncovered and clearly visible.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E7E3] rounded-xs space-y-2">
            <div className="font-semibold text-[#202522] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#B44B43]" />
              Strict Disqualifiers
            </div>
            <p>
              No sunglasses, tinted lenses, baseball caps, headphones, or selfies taken with front wide-angle distortion. Spectacles are allowed only if completely non-reflective and transparent.
            </p>
          </div>
        </div>
      </div>

      {/* Guide Section 2: Signature Capture */}
      <div className="bg-white border border-[#E5E7E3] rounded-xs p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7E3]">
          <PenTool className="w-5 h-5 text-[#263B35]" />
          <h3 className="text-base font-semibold text-[#202522] tracking-tight">
            2. Signature Capture & Ink Optimization
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#747A75]">
          <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E7E3] rounded-xs space-y-2">
            <span className="font-semibold text-[#202522] block">
              Paper & Pen Selection
            </span>
            <p>
              Use an unlined, pure white sheet of paper (such as standard 75+ GSM A4 copy paper). Do not use lined notebooks, registers, or colored paper. Sign in running cursive hand using a black ballpoint or dark blue gel pen.
            </p>
            <p className="text-[11px] text-[#A87532] font-medium">
              Note: UPSC, SSC, and IBPS explicitly reject signatures written solely in CAPITAL letters.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E7E3] rounded-xs space-y-2">
            <span className="font-semibold text-[#202522] block">
              Camera Photography & Alignment
            </span>
            <p>
              Place the signed paper on a flat table under daylight. Hold your smartphone parallel directly above the paper so there is no trapezoidal perspective tilt.
            </p>
            <p>
              SpecFit's signature engine will automatically whiten ambient grey shadows and deepen fine ink loops while preserving natural pen pressure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
