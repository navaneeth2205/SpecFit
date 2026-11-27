import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Minimize2,
  PenTool,
  Files,
  FilePlus,
  FileDown,
  FileImage,
  Bookmark,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Upload,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Zap,
  Lock,
  ChevronRight,
  Filter
} from 'lucide-react';
import { NavView } from '../layout/Sidebar';

interface ToolsDashboardViewProps {
  onSelectView: (view: NavView) => void;
  onLoadSampleIntoEditor: (sampleType: 'portrait' | 'signature' | 'document' | 'landscape') => void;
  onOpenPrivacyModal: () => void;
}

type CategoryFilter = 'all' | 'image' | 'pdf' | 'reference';

interface ToolCardItem {
  id: NavView;
  title: string;
  category: 'image' | 'pdf' | 'reference';
  categoryLabel: string;
  badge: string;
  badgeType: 'flagship' | 'popular' | 'new' | 'utility';
  description: string;
  icon: React.FC<{ className?: string }>;
  features: string[];
  primaryActionLabel: string;
  sampleAction?: {
    label: string;
    action: () => void;
  };
}

export const ToolsDashboardView: React.FC<ToolsDashboardViewProps> = ({
  onSelectView,
  onLoadSampleIntoEditor,
  onOpenPrivacyModal
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleGlobalDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        onSelectView('pdf-compressor');
      } else {
        onSelectView('editor');
      }
    }
  };

  const toolCards: ToolCardItem[] = [
    // --- Image Suite ---
    {
      id: 'editor',
      title: 'Universal Image Editor',
      category: 'image',
      categoryLabel: 'Image Suite',
      badge: 'Flagship Tool',
      badgeType: 'flagship',
      description: 'Crop freely, dial exact pixel width and height, lock aspect ratios, and dial in strict KB caps.',
      icon: ImageIcon,
      features: [
        'Arbitrary W × H pixel dimensions',
        'Interactive bi-cubic viewport pan & zoom',
        'Strict KB limit target validator',
        'JPG, PNG, WebP export formats'
      ],
      primaryActionLabel: 'Open Image Editor',
      sampleAction: {
        label: 'Test Portrait Sample',
        action: () => onLoadSampleIntoEditor('portrait')
      }
    },
    {
      id: 'compressor',
      title: 'Quick Image Compressor',
      category: 'image',
      categoryLabel: 'Image Suite',
      badge: 'KB Targeted',
      badgeType: 'popular',
      description: 'Fast binary-search compression to hit strict portal size limits without blurry downscaling.',
      icon: Minimize2,
      features: [
        'Target sizes in Bytes, KB, or MB',
        'Iterative quantization sweep',
        'Live byte reduction percentage',
        'Instant single-click downloads'
      ],
      primaryActionLabel: 'Open Compressor'
    },
    {
      id: 'signature',
      title: 'Signature & Scan Cleaner',
      category: 'image',
      categoryLabel: 'Image Suite',
      badge: 'Filter Engine',
      badgeType: 'utility',
      description: 'Transforms phone snapshots of signatures & paper forms into clean publication-grade assets.',
      icon: PenTool,
      features: [
        'S-curve ink enhancement filter',
        'Removes yellow glare & room shadows',
        'Pure white JPG or transparent PNG',
        'Contrast and threshold sliders'
      ],
      primaryActionLabel: 'Open Signature Cleaner',
      sampleAction: {
        label: 'Test Ink Sample',
        action: () => onLoadSampleIntoEditor('signature')
      }
    },
    {
      id: 'batch',
      title: 'Parallel Batch Resizer',
      category: 'image',
      categoryLabel: 'Image Suite',
      badge: 'Multi-File',
      badgeType: 'utility',
      description: 'Queue dozens of images, apply unified constraints simultaneously, and download a validated ZIP.',
      icon: Files,
      features: [
        'Parallel Web Worker execution',
        'Shared dimension & KB budgets',
        'Auto-generated audit manifest',
        'One-click ZIP bundle export'
      ],
      primaryActionLabel: 'Open Batch Queue'
    },

    // --- PDF Suite ---
    {
      id: 'image-to-pdf',
      title: 'Images to PDF Converter',
      category: 'pdf',
      categoryLabel: 'PDF Suite',
      badge: 'PDF Builder',
      badgeType: 'new',
      description: 'Compile multiple images into a single standardized document with page order, rotation, and margins.',
      icon: FilePlus,
      features: [
        'A4, US Letter, US Legal, or Fit-to-Image',
        'Per-page 90° clockwise rotation',
        'Drag-and-drop page reordering',
        'Custom margins and title metadata'
      ],
      primaryActionLabel: 'Open Images to PDF'
    },
    {
      id: 'pdf-compressor',
      title: 'PDF Reducer & Compressor',
      category: 'pdf',
      categoryLabel: 'PDF Suite',
      badge: 'Stream Reducer',
      badgeType: 'new',
      description: 'Shrink oversized PDF files on-device to meet application upload caps (< 500 KB or 1 MB).',
      icon: FileDown,
      features: [
        'Exact target limit (KB / MB)',
        'Extreme, Balanced & High-Q profiles',
        'Resolution downsampling & stream compression',
        'Detailed savings & reduction % badge'
      ],
      primaryActionLabel: 'Open PDF Reducer'
    },
    {
      id: 'pdf-to-image',
      title: 'PDF to Images Extractor',
      category: 'pdf',
      categoryLabel: 'PDF Suite',
      badge: 'Page Rasterizer',
      badgeType: 'new',
      description: 'Extract PDF pages into high-resolution JPG, PNG, or WebP with configurable DPI scaling.',
      icon: FileImage,
      features: [
        'Client-side rendering via PDF.js',
        '96, 150, or 200 DPI resolution',
        'Direct "Edit in Image Editor" handoff',
        'Batch ZIP export for all pages'
      ],
      primaryActionLabel: 'Open PDF to Images'
    },

    // --- Reference & Presets ---
    {
      id: 'presets',
      title: 'Portal Presets Directory',
      category: 'reference',
      categoryLabel: 'Reference',
      badge: 'Standards',
      badgeType: 'popular',
      description: 'Pre-verified dimensions and size specifications for official exam, visa, and passport portals.',
      icon: Bookmark,
      features: [
        'GATE, UPSC, SSC, IBPS requirements',
        'US Visa, Schengen & Passport standards',
        'Pre-fills Editor without locking fields',
        'Official government citations'
      ],
      primaryActionLabel: 'Browse Presets'
    },
    {
      id: 'guide',
      title: 'Processing Guide',
      category: 'reference',
      categoryLabel: 'Reference',
      badge: 'Knowledge',
      badgeType: 'utility',
      description: 'Practical recommendations for document lighting, mobile camera setup, DPI calculations, and ratios.',
      icon: BookOpen,
      features: [
        'Lighting and glare prevention tips',
        'DPI to pixel conversion matrix',
        'File size optimization strategy',
        'Common portal rejection causes'
      ],
      primaryActionLabel: 'Read Guide'
    },
    {
      id: 'privacy',
      title: 'Zero-Upload Privacy Inspector',
      category: 'reference',
      categoryLabel: 'Reference',
      badge: '100% On-Device',
      badgeType: 'flagship',
      description: 'Inspect live browser network events and verify that 0 bytes of your imagery ever leave your machine.',
      icon: ShieldCheck,
      features: [
        'Local HTML5 Canvas sandbox audit',
        'Outbound byte counter (0 bytes)',
        'Automatic EXIF geodata stripping',
        'No remote databases or tracking'
      ],
      primaryActionLabel: 'Inspect Privacy Audit'
    }
  ];

  const filteredCards = toolCards.filter((card) => {
    if (filter === 'all') return true;
    return card.category === filter;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header Banner */}
      <div className="bg-white border border-[#DFE2DC] rounded-[4px] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-[#34483E] uppercase tracking-wider bg-[#EAF2ED] border border-[#BFD9CA] px-2 py-0.5 rounded-[2px]">
                Workhorse Workspace
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#39765A]">
                <span className="w-2 h-2 rounded-full bg-[#39765A] animate-badge-dot" />
                Local Sandbox Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#242824] tracking-tight">
              SpecFit Tools Dashboard
            </h1>
            <p className="text-xs text-[#737872] max-w-2xl leading-relaxed">
              Every tool is engineered for dependable, classic desktop utility. Select any card below to launch its dedicated workflow, or drop any file directly into the quick ingestion target.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="px-3 py-2 bg-[#F5F5F2] border border-[#DFE2DC] rounded-[3px] text-center min-w-[90px]">
              <div className="text-base font-mono font-bold text-[#34483E]">7</div>
              <div className="text-[10px] text-[#737872]">Core Tools</div>
            </div>
            <div className="px-3 py-2 bg-[#F5F5F2] border border-[#DFE2DC] rounded-[3px] text-center min-w-[90px]">
              <div className="text-base font-mono font-bold text-[#39765A]">0 KB</div>
              <div className="text-[10px] text-[#737872]">Cloud Uploads</div>
            </div>
            <div className="px-3 py-2 bg-[#F5F5F2] border border-[#DFE2DC] rounded-[3px] text-center min-w-[90px]">
              <div className="text-base font-mono font-bold text-[#242824]">100%</div>
              <div className="text-[10px] text-[#737872]">Client-Side</div>
            </div>
          </div>
        </div>

        {/* Global Smart Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleGlobalDrop}
          className={`mt-5 p-4 rounded-[3px] border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
            dragActive
              ? 'border-[#34483E] bg-[#EAF2ED]'
              : 'border-[#DFE2DC] hover:border-[#34483E]/60 bg-[#FAF9F6]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[3px] bg-white border border-[#DFE2DC] text-[#34483E] flex items-center justify-center shrink-0 shadow-2xs">
              <Upload className="w-4 h-4 text-[#34483E]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#242824]">
                Smart Quick Ingestion Target
              </div>
              <div className="text-[11px] text-[#737872]">
                Drag and drop any Image or PDF file here — SpecFit detects the format and routes directly to the optimal tool.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onLoadSampleIntoEditor('portrait')}
              className="px-2.5 py-1.5 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] text-[11px] font-medium cursor-pointer transition-all shadow-2xs flex items-center gap-1.5 btn-tactile"
            >
              <Sparkles className="w-3 h-3 text-[#39765A]" />
              <span>Load Sample Image</span>
            </button>
            <button
              onClick={() => onSelectView('image-to-pdf')}
              className="px-2.5 py-1.5 bg-[#34483E] hover:bg-[#26362E] active:scale-95 text-white rounded-[3px] text-[11px] font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5 btn-tactile"
            >
              <span>Build PDF</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-[3px] border border-[#DFE2DC] shadow-2xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[2px] transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#34483E] text-white shadow-2xs'
                : 'text-[#737872] hover:text-[#242824] hover:bg-[#F0F1ED]'
            }`}
          >
            All Workflows ({toolCards.length})
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[2px] transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'image'
                ? 'bg-[#34483E] text-white shadow-2xs'
                : 'text-[#737872] hover:text-[#242824] hover:bg-[#F0F1ED]'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Image Suite (4)</span>
          </button>
          <button
            onClick={() => setFilter('pdf')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[2px] transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'pdf'
                ? 'bg-[#34483E] text-white shadow-2xs'
                : 'text-[#737872] hover:text-[#242824] hover:bg-[#F0F1ED]'
            }`}
          >
            <FilePlus className="w-3 h-3" />
            <span>PDF Suite (3)</span>
          </button>
          <button
            onClick={() => setFilter('reference')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[2px] transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'reference'
                ? 'bg-[#34483E] text-white shadow-2xs'
                : 'text-[#737872] hover:text-[#242824] hover:bg-[#F0F1ED]'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>Reference & Presets (3)</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-[#737872]">
          Showing {filteredCards.length} of {toolCards.length} modules
        </div>
      </div>

      {/* Interactive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCards.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <div
              key={tool.id}
              className="bg-white border border-[#DFE2DC] hover:border-[#34483E] rounded-[4px] p-5 shadow-2xs flex flex-col justify-between transition-all duration-200 group interactive-card"
            >
              <div className="space-y-3.5">
                {/* Header: Icon, Category & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[4px] bg-[#EAF2ED] text-[#34483E] flex items-center justify-center border border-[#BFD9CA] group-hover:bg-[#34483E] group-hover:text-white transition-colors duration-200 shadow-2xs">
                      <IconComponent className="w-5 h-5 text-[#34483E] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#737872] block">
                        {tool.categoryLabel}
                      </span>
                      <h3 className="text-sm font-bold text-[#242824] group-hover:text-[#34483E] transition-colors leading-tight">
                        {tool.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[2px] shrink-0 ${
                      tool.badgeType === 'flagship'
                        ? 'bg-[#EAF2ED] text-[#2E7252] border border-[#BFD9CA]'
                        : tool.badgeType === 'new'
                        ? 'bg-[#EAECE7] text-[#34483E] border border-[#CBD0C8]'
                        : tool.badgeType === 'popular'
                        ? 'bg-[#FDF6E2] text-[#8F6B00] border border-[#F3E2A5]'
                        : 'bg-[#F5F5F2] text-[#737872] border border-[#DFE2DC]'
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#737872] leading-relaxed min-h-[36px]">
                  {tool.description}
                </p>

                {/* Checklist Features */}
                <ul className="text-[11px] text-[#242824] space-y-1.5 pt-1 border-t border-[#DFE2DC]/60">
                  {tool.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#39765A] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#DFE2DC] space-y-2 mt-4">
                {tool.sampleAction && (
                  <button
                    onClick={tool.sampleAction.action}
                    className="w-full py-1.5 bg-[#F5F5F2] hover:bg-[#FAF9F6] active:scale-95 text-[#34483E] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-medium rounded-[3px] cursor-pointer transition-all flex items-center justify-center gap-1.5 btn-tactile"
                  >
                    <Sparkles className="w-3 h-3 text-[#39765A]" />
                    <span>{tool.sampleAction.label}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (tool.id === 'privacy') {
                      onOpenPrivacyModal();
                    } else {
                      onSelectView(tool.id);
                    }
                  }}
                  className="w-full py-2 bg-white hover:bg-[#34483E] hover:text-white active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 flex items-center justify-center gap-2 btn-tactile shadow-2xs"
                >
                  <span>{tool.primaryActionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Guarantee Banner */}
      <div className="bg-[#FAF9F6] border border-[#DFE2DC] rounded-[4px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#737872]">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#39765A] shrink-0" />
          <span>
            <strong className="text-[#242824]">Air-Gapped In-Browser Execution:</strong> SpecFit never makes remote API calls with your images or PDF files.
          </span>
        </div>
        <button
          onClick={onOpenPrivacyModal}
          className="text-[#34483E] font-semibold hover:underline cursor-pointer shrink-0"
        >
          Open Live Network Inspector →
        </button>
      </div>
    </div>
  );
};
