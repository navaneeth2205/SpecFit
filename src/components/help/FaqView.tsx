import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

export const FaqView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Why do application portals reject uploaded photographs?',
      a: 'Most government portals (such as UPSC OTR, SSC, GATE GOAPS, and IBPS) use automated backend validation scripts that reject uploads before human verification. Common rejection triggers include: (1) File size exceeding the strict ceiling (e.g., 50.1 KB when max is 50 KB) or below the floor (e.g., 9 KB when min is 10 KB); (2) Pixel dimensions not adhering to required aspect ratios; (3) Grey paper tint or uneven lighting behind signatures; and (4) Head size not covering 60%–70% of the photo area.'
    },
    {
      q: 'How does SpecFit guarantee 100% privacy without server uploads?',
      a: 'SpecFit executes all transformations, cropping, filtering, and adaptive compression purely inside your browser using HTML5 Canvas, the JavaScript File API, and Web Workers. Your photographs, signatures, and biometric data never traverse a network wire or reach any cloud servers. You can disconnect your internet completely or inspect the real-time Network Audit log to verify.'
    },
    {
      q: 'How does SpecFit guarantee that the compressed file fits between min and max KB?',
      a: 'Unlike naive image resizers that guess a quality percentage once, SpecFit uses an adaptive binary-search compression loop. It encodes the canvas as a JPEG Blob, measures the exact byte count on the file system, and dynamically adjusts the quality parameter across iterations until the image lands reliably inside the mandated kilobyte envelope.'
    },
    {
      q: 'What is the purpose of the Anthropometric Face Alignment Guide?',
      a: 'Examination authorities require applicant faces to cover a specific percentage of the photo (usually 60% to 70% or 70% to 80% for Indian & International passports). The SpecFit face alignment overlay provides an SVG guide showing the top clearance margin, eye level line, chin baseline, and head oval so you can align and zoom your face with desktop precision.'
    },
    {
      q: 'Does SpecFit strip personal EXIF metadata from photographs?',
      a: 'Yes. When an image is loaded and rendered onto the client-side HTML5 Canvas, all embedded EXIF metadata (such as GPS coordinates of where you took the photo, phone model, and serial number) is automatically dropped during canvas re-encoding. Only clean image pixels are saved in the output file.'
    },
    {
      q: 'Can I use SpecFit offline on my phone or computer?',
      a: 'Yes. SpecFit is built as a Progressive Web Application (PWA) with a local service worker cache. Once you visit the site once, the entire application shell is cached on your device, allowing you to prepare and compress documents even without active Wi-Fi or mobile data.'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E5E7E3] rounded-xs p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-[#747A75] uppercase tracking-wider">
            Knowledge Base
          </span>
          <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3 text-[#39765A]" />}>
            Verified Solutions
          </Badge>
        </div>
        <h2 className="text-xl font-bold text-[#202522] tracking-tight">
          Frequently Asked Questions & Portal Rejection Guide
        </h2>
        <p className="text-xs text-[#747A75] mt-1">
          Clear explanations on portal automated validators, compression mechanics, and offline security.
        </p>
      </div>

      {/* Accordion FAQ items */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-[#E5E7E3] rounded-xs shadow-xs overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
              >
                <span className="text-sm font-semibold text-[#202522]">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#747A75] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="p-4 pt-0 text-xs text-[#747A75] leading-relaxed border-t border-[#E5E7E3]/60 bg-[#FAFAF8]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
