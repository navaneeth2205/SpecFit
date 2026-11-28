import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Image as ImageIcon,
  PenTool,
  Minimize2,
  Files,
  Sliders,
  Upload,
  Clipboard,
  Globe,
  Camera,
  Layers,
  FileCheck,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Maximize,
  Check,
  Zap,
  Info,
  Eye,
  SlidersHorizontal,
  Compass,
  FilePlus,
  FileDown,
  FileText,
  LayoutGrid
} from 'lucide-react';
import { PORTAL_PRESETS } from '../../data/presets';
import { SpecFitLogo } from '../common/SpecFitLogo';

interface ShowcaseExample {
  id: string;
  title: string;
  category: string;
  originalDimensions: string;
  originalSize: string;
  outputDimensions: string;
  outputSize: string;
  reduction: string;
  format: string;
  imageUrl: string;
  description: string;
}

const WEB_SHOWCASE_EXAMPLES: ShowcaseExample[] = [
  {
    id: 'portrait',
    title: 'Studio Portrait & Profile',
    category: 'Portrait & ID',
    originalDimensions: '4000 × 3000 px',
    originalSize: '4.82 MB',
    outputDimensions: '1200 × 800 px',
    outputSize: '84.20 KB',
    reduction: '-98.2%',
    format: 'JPEG (High-Q)',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    description: 'Bi-cubic resampling with balanced skin tone compression and zero facial distortion.'
  },
  {
    id: 'scenery',
    title: 'Scenic Travel & Fine Art',
    category: 'High-Frequency Detail',
    originalDimensions: '5616 × 3744 px',
    originalSize: '8.10 MB',
    outputDimensions: '1920 × 1080 px',
    outputSize: '165.40 KB',
    reduction: '-97.9%',
    format: 'JPEG (Landscape)',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    description: 'Preserves edge sharpness in mountain ridges and water reflections while staying within strict kilobyte caps.'
  },
  {
    id: 'document',
    title: 'Academic & Legal Document',
    category: 'Document Scan',
    originalDimensions: '3200 × 4500 px',
    originalSize: '6.40 MB',
    outputDimensions: '1000 × 1414 px',
    outputSize: '92.15 KB',
    reduction: '-98.5%',
    format: 'JPEG (A4 Ratio)',
    imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1200&q=80',
    description: 'Whitens ambient paper glare and uneven room shadows for a crisp document scan.'
  },
  {
    id: 'signature',
    title: 'Handwritten Ink Signature',
    category: 'Signature & Ink',
    originalDimensions: '2800 × 1600 px',
    originalSize: '3.20 MB',
    outputDimensions: '600 × 240 px',
    outputSize: '18.40 KB',
    reduction: '-99.4%',
    format: 'PNG (Transparent)',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    description: 'Extracts deep pen ink strokes while converting muddy paper background to pure white.'
  }
];

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenEditor: () => void;
  onOpenCompressor: () => void;
  onOpenBatch: () => void;
  onOpenSignature: () => void;
  onOpenImageToPdf: () => void;
  onOpenPdfCompressor: () => void;
  onOpenPdfToImage: () => void;
  onOpenPresets: () => void;
  onLoadSampleIntoEditor: (sampleType: 'portrait' | 'signature' | 'document' | 'landscape') => void;
  onLoadImageUrlIntoEditor: (url: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDashboard,
  onOpenEditor,
  onOpenCompressor,
  onOpenBatch,
  onOpenSignature,
  onOpenImageToPdf,
  onOpenPdfCompressor,
  onOpenPdfToImage,
  onOpenPresets,
  onLoadSampleIntoEditor,
  onLoadImageUrlIntoEditor
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage for split slider
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const activeExample = WEB_SHOWCASE_EXAMPLES[selectedExampleIndex];

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  // Direct Interactive Pointer / Touch Drag Handler on the Before/After Image
  const updateSliderFromClientX = (clientX: number) => {
    if (!viewerRef.current) return;
    const rect = viewerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingSlider(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingSlider(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#242824] flex flex-col font-sans selection:bg-[#34483E] selection:text-white">
      {/* 0. WCAG AA Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#34483E] focus:text-white focus:rounded-[3px] focus:shadow-md focus:text-xs focus:font-semibold focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Screen Reader Live Status Announcer */}
      <div role="status" aria-live="polite" className="sr-only">
        Active specimen: {activeExample.title}. Target output: {activeExample.outputDimensions}, {activeExample.outputSize}.
      </div>

      {/* 1. Header Navigation Bar */}
      <header role="banner" className="sticky top-0 z-30 bg-[#F5F5F2]/95 backdrop-blur-md border-b border-[#DFE2DC] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div
            onClick={onOpenEditor}
            role="button"
            tabIndex={0}
            aria-label="SpecFit Home"
            onKeyDown={(e) => e.key === 'Enter' && onOpenEditor()}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0 whitespace-nowrap"
          >
            <SpecFitLogo size="sm" className="group-hover:scale-105 transition-transform duration-150" />
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-base tracking-tight text-[#242824]">SpecFit</span>
              <span className="text-[11px] text-[#737872] hidden xl:inline-block border-l border-[#DFE2DC] pl-2.5">
                Image &amp; PDF Suite
              </span>
            </div>
          </div>

          {/* Nav Anchor Links — Single Row, Zero Overlap */}
          <nav role="navigation" aria-label="Main Navigation" className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-medium text-[#737872] shrink-0 whitespace-nowrap">
            <a href="#showcase" className="hover:text-[#242824] transition-colors py-1.5 whitespace-nowrap">Showcase</a>
            <a href="#sources" className="hover:text-[#242824] transition-colors py-1.5 whitespace-nowrap">Any Source</a>
            <a href="#tools" className="hover:text-[#242824] transition-colors py-1.5 whitespace-nowrap">Tools Suite</a>
            <a href="#privacy" className="hover:text-[#242824] transition-colors py-1.5 whitespace-nowrap">Privacy</a>
            <a href="#standards" className="hover:text-[#242824] transition-colors py-1.5 whitespace-nowrap">Standards</a>
            <a href="#faq" className="hover:text-[#242824] transition-colors py-1.5 whitespace-nowrap">FAQ</a>
          </nav>

          {/* Quick Action Buttons with tactile micro-animation */}
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <button
              onClick={onOpenDashboard}
              className="px-2.5 sm:px-3.5 py-2 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 shadow-2xs flex items-center gap-1.5 btn-tactile whitespace-nowrap"
              aria-label="Open Tools Dashboard"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#34483E] shrink-0" aria-hidden="true" />
              <span><span className="hidden sm:inline">Tools </span>Dashboard</span>
            </button>

            <button
              onClick={onOpenEditor}
              className="px-3 sm:px-4 py-2 bg-[#34483E] hover:bg-[#26362E] active:scale-95 text-white text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-md flex items-center gap-1.5 btn-tactile whitespace-nowrap"
              aria-label="Open Universal Image Editor"
            >
              <span><span className="hidden sm:inline">Open </span>Editor</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Flow */}
      <main id="main-content" role="main" className="flex-1">
        {/* 2. Hero Section */}
        <section aria-labelledby="hero-heading" className="pt-10 pb-14 sm:pt-16 sm:pb-20 border-b border-[#DFE2DC] bg-[#F5F5F2]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            {/* Top Local-First Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF2ED] border border-[#BFD9CA] rounded-[2px] text-xs font-medium text-[#2E7252] shadow-2xs hover:border-[#39765A] transition-colors">
              <ShieldCheck className="w-4 h-4 text-[#39765A]" aria-hidden="true" />
              <span>100% In-Browser Execution • Zero Remote Server Uploads</span>
            </div>

            {/* Bespoke Editorial Headline in Instrument Serif */}
            <h1 id="hero-heading" className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#242824] tracking-tight leading-[1.12] max-w-4xl mx-auto">
              Your image. Your dimensions. <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#34483E]">Your file size. Your control.</span>
            </h1>

            {/* Grounded Human Copy */}
            <p className="text-sm sm:text-base md:text-lg text-[#737872] max-w-2xl mx-auto leading-relaxed">
              A classic desktop-grade utility for cropping images freely, choosing exact pixel dimensions, and dialling in strict kilobyte limits. No cloud accounts. No arbitrary portal restrictions.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenDashboard}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#34483E] hover:bg-[#26362E] active:scale-95 text-white text-sm font-semibold rounded-[3px] cursor-pointer transition-all duration-150 shadow-xs hover:shadow-md flex items-center justify-center gap-2 btn-tactile"
              >
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                <span>Open Card Dashboard</span>
              </button>

              <button
                onClick={onOpenEditor}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-sm font-semibold rounded-[3px] cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-sm flex items-center justify-center gap-2 btn-tactile"
              >
                <ImageIcon className="w-4 h-4 text-[#34483E]" aria-hidden="true" />
                <span>Image Editor</span>
              </button>

              <button
                onClick={onOpenImageToPdf}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-sm font-semibold rounded-[3px] cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-sm flex items-center justify-center gap-2 btn-tactile"
              >
                <FilePlus className="w-4 h-4 text-[#34483E]" aria-hidden="true" />
                <span>Images to PDF</span>
              </button>

              <button
                onClick={onOpenPdfCompressor}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-sm font-semibold rounded-[3px] cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-sm flex items-center justify-center gap-2 btn-tactile"
              >
                <FileDown className="w-4 h-4 text-[#34483E]" aria-hidden="true" />
                <span>PDF Reducer</span>
              </button>
            </div>

            {/* Verified Capabilities Checklist */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#737872]">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39765A]" aria-hidden="true" /> Free or locked aspect ratio
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39765A]" aria-hidden="true" /> Target exact min & max KB
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39765A]" aria-hidden="true" /> Whitens paper & ink scans
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#39765A]" aria-hidden="true" /> Runs 100% offline via PWA
              </span>
            </div>

            {/* 3. INTERACTIVE BEFORE/AFTER WEB SHOWCASE (HERO CARD) */}
            <div id="showcase" className="scroll-mt-20 mt-8 sm:mt-10 bg-white border border-[#DFE2DC] rounded-[4px] shadow-sm p-4 sm:p-6 text-left transition-all duration-200">
              {/* Showcase Category Tabs (Horizontally scrollable on mobile) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-[#DFE2DC] gap-3">
                <div
                  role="tablist"
                  aria-label="Showcase categories"
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap pb-1 max-w-full"
                >
                  {WEB_SHOWCASE_EXAMPLES.map((ex, idx) => (
                    <button
                      key={ex.id}
                      role="tab"
                      aria-selected={selectedExampleIndex === idx}
                      onClick={() => setSelectedExampleIndex(idx)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-[3px] shrink-0 cursor-pointer transition-all duration-150 flex items-center gap-1.5 chip-tactile ${
                        selectedExampleIndex === idx
                          ? 'bg-[#34483E] text-white shadow-2xs'
                          : 'bg-[#F5F5F2] hover:bg-[#EAECE7] text-[#737872] hover:text-[#242824] border border-[#DFE2DC]'
                      }`}
                    >
                      {idx === 0 && <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />}
                      {idx === 1 && <Layers className="w-3.5 h-3.5" aria-hidden="true" />}
                      {idx === 2 && <FileCheck className="w-3.5 h-3.5" aria-hidden="true" />}
                      {idx === 3 && <PenTool className="w-3.5 h-3.5" aria-hidden="true" />}
                      <span>{ex.title.split('&')[0].trim()}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#39765A] bg-[#EAF2ED] border border-[#BFD9CA] px-2.5 py-1 rounded-[2px] shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#39765A] animate-badge-dot" aria-hidden="true" />
                    <span>Ready</span>
                  </span>
                </div>
              </div>

              {/* Main Interactive Showcase Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Left: Interactive Before/After Split Slider Canvas with DIRECT DRAGGING */}
                <div className="lg:col-span-7 bg-[#F0F1ED] border border-[#DFE2DC] rounded-[3px] p-3 sm:p-4 flex flex-col justify-between relative select-none">
                  {/* Top Bar with Dimensions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#737872] pb-2 border-b border-[#DFE2DC] gap-1 sm:gap-2">
                    <span className="font-mono text-[10px] sm:text-[11px] truncate">
                      Original: {activeExample.originalDimensions} ({activeExample.originalSize})
                    </span>
                    <span className="font-mono font-medium text-[#34483E] text-[10px] sm:text-[11px] shrink-0">
                      Target: {activeExample.outputDimensions}
                    </span>
                  </div>

                  {/* Interactive Before/After Split Viewer Container (Click & Drag Directly On Image) */}
                  <div
                    ref={viewerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="my-3 sm:my-4 relative overflow-hidden rounded-[2px] bg-[#242824] h-64 sm:h-80 md:h-88 w-full flex items-center justify-center border border-[#DFE2DC] shadow-inner cursor-ew-resize touch-none"
                    title="Click and drag anywhere to slide before/after comparison"
                  >
                    {/* Background: Output Prepared Image */}
                    <img
                      src={activeExample.imageUrl}
                      alt={`SpecFit prepared result for ${activeExample.title}`}
                      className="absolute inset-0 w-full h-full object-cover filter contrast-[1.05] pointer-events-none"
                    />

                    {/* Foreground: Original Image with Dynamic Clip-Path Slider */}
                    <div
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={activeExample.imageUrl}
                        alt={`Original raw input for ${activeExample.title}`}
                        className="absolute inset-0 w-full h-full object-cover filter brightness-95 saturate-90"
                      />
                      {/* Original Badge */}
                      <span className="absolute top-3 left-3 bg-[#242824]/85 text-white text-[10px] font-mono px-2 py-0.5 rounded-[2px] backdrop-blur-xs border border-white/20">
                        RAW WEB ORIGINAL
                      </span>
                    </div>

                    {/* Output Badge */}
                    <span className="absolute top-3 right-3 bg-[#34483E]/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-[2px] backdrop-blur-xs border border-white/20 pointer-events-none">
                      SPECFIT PREPARED
                    </span>

                    {/* Draggable Vertical Divider Line */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Image comparison slider"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={sliderPosition}
                      aria-valuetext={`${sliderPosition}% split view between raw original and prepared output`}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') setSliderPosition((p) => Math.max(0, p - 5));
                        if (e.key === 'ArrowRight') setSliderPosition((p) => Math.min(100, p + 5));
                      }}
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border-2 border-[#34483E] shadow-xl flex items-center justify-center text-[#34483E] transition-all ${
                          isDraggingSlider ? 'scale-120 shadow-2xl bg-[#F5F5F2]' : 'hover:scale-110 animate-pulse-glow'
                        }`}
                      >
                        <SlidersHorizontal className="w-4 h-4 text-[#34483E]" aria-hidden="true" />
                      </div>
                    </div>

                    {/* Subtle Framing Grid Lines */}
                    <div className="absolute inset-0 pointer-events-none border border-white/15 grid grid-cols-3 grid-rows-3 opacity-30">
                      <div className="border-r border-b border-white/15" />
                      <div className="border-r border-b border-white/15" />
                      <div className="border-b border-white/15" />
                      <div className="border-r border-b border-white/15" />
                    </div>
                  </div>

                  {/* Interactive Slider Controller Bar (Responsive for Mobile & Desktop) */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#737872]">
                    <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                      <span className="text-[11px] font-medium font-mono text-[#737872]">Original: {100 - sliderPosition}%</span>
                      <span className="sm:hidden font-mono text-[11px] font-medium text-[#34483E]">Prepared: {sliderPosition}%</span>
                    </div>
                    <div className="flex-1 w-full sm:max-w-xs flex items-center gap-2">
                      <input
                        id="split-comparison-range"
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(+e.target.value)}
                        className="w-full accent-[#34483E] cursor-ew-resize h-2 bg-[#DFE2DC] rounded-lg transition-all"
                        aria-label="Direct comparison slider percentage"
                      />
                    </div>
                    <span className="hidden sm:inline text-[11px] text-[#34483E] font-medium font-mono">Prepared: {sliderPosition}%</span>
                  </div>
                </div>

                {/* Right: Technical Inspector & Action Panel */}
                <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#242824] uppercase tracking-wider">
                        {activeExample.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#39765A] bg-[#EAF2ED] px-2 py-0.5 rounded-[2px]">
                        {activeExample.reduction}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#242824]">
                      {activeExample.title}
                    </h3>
                    <p className="text-xs text-[#737872] leading-relaxed">
                      {activeExample.description}
                    </p>

                    {/* Metrics Table */}
                    <div className="bg-[#FAF9F6] border border-[#DFE2DC] p-3 rounded-[3px] space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-1.5 border-b border-[#DFE2DC]">
                        <span className="text-[#737872]">Output Dimensions:</span>
                        <span className="font-mono font-semibold text-[#242824]">{activeExample.outputDimensions}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-[#DFE2DC]">
                        <span className="text-[#737872]">Original Disk Size:</span>
                        <span className="font-mono text-[#737872] line-through">{activeExample.originalSize}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-[#DFE2DC]">
                        <span className="text-[#737872]">Prepared File Size:</span>
                        <span className="font-mono font-bold text-[#39765A]">{activeExample.outputSize}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-[#DFE2DC]">
                        <span className="text-[#737872]">Encoding Quality:</span>
                        <span className="font-mono text-[#242824]">Optimized (88%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#737872]">EXIF Metadata:</span>
                        <span className="font-mono text-[#39765A]">Cleaned</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this example */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => onLoadImageUrlIntoEditor(activeExample.imageUrl)}
                      className="w-full py-2.5 bg-[#34483E] hover:bg-[#26362E] active:scale-95 text-white text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 text-center flex items-center justify-center gap-2 shadow-2xs hover:shadow-md btn-tactile"
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Open This Image in Universal Editor</span>
                    </button>

                    <button
                      onClick={() => setSliderPosition((p) => (p > 50 ? 10 : 90))}
                      className="w-full py-2 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-medium rounded-[3px] cursor-pointer transition-all duration-150 text-center flex items-center justify-center gap-1.5 btn-tactile shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#34483E]" aria-hidden="true" />
                      <span>Toggle Full Comparison View</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. "Take Images From Any Source" Section with Visual Previews */}
        <section id="sources" aria-labelledby="sources-heading" className="scroll-mt-16 py-14 sm:py-20 border-b border-[#DFE2DC] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
              <span className="text-xs font-mono font-semibold text-[#34483E] uppercase tracking-wider bg-[#EAECE7] px-2 py-0.5 rounded-[2px]">
                Universal Input Architecture
              </span>
              <h2 id="sources-heading" className="font-serif text-3xl sm:text-4xl text-[#242824]">
                Take images from any source
              </h2>
              <p className="text-xs sm:text-sm text-[#737872]">
                Whether you have an image in your clipboard, stored on disk, hosted online, or on your mobile camera, SpecFit loads and processes it instantly in-memory.
              </p>
            </div>

            {/* 6 Input Channels Grid with Interactive Hover Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Source 1: Local Files & Drag-and-Drop */}
              <div
                onClick={onOpenEditor}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onOpenEditor()}
                className="p-5 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-3 flex flex-col justify-between cursor-pointer group interactive-card"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-[3px] bg-[#EAF2ED] text-[#34483E] flex items-center justify-center border border-[#BFD9CA] group-hover:bg-[#34483E] group-hover:text-white transition-colors duration-200">
                    <Upload className="w-5 h-5 text-[#39765A] group-hover:text-white transition-colors duration-200" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#242824] group-hover:text-[#34483E] transition-colors">
                    Local File & Drag-and-Drop
                  </h3>
                  <p className="text-xs text-[#737872] leading-relaxed">
                    Drag any JPEG, PNG, or WebP from Windows Explorer, macOS Finder, or desktop directly onto the workspace. Works seamlessly with files up to 50+ megapixels.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#DFE2DC] flex items-center justify-between text-[11px] text-[#737872]">
                  <span>Formats: JPG, PNG, WebP</span>
                  <span className="font-mono text-[#39765A] font-medium group-hover:underline">Open Workspace →</span>
                </div>
              </div>

              {/* Source 2: Direct Clipboard Paste */}
              <div
                onClick={onOpenEditor}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onOpenEditor()}
                className="p-5 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-3 flex flex-col justify-between cursor-pointer group interactive-card"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-[3px] bg-[#EAF2ED] text-[#34483E] flex items-center justify-center border border-[#BFD9CA] group-hover:bg-[#34483E] group-hover:text-white transition-colors duration-200">
                    <Clipboard className="w-5 h-5 text-[#39765A] group-hover:text-white transition-colors duration-200" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#242824] group-hover:text-[#34483E] transition-colors">
                    Direct Clipboard Paste (Ctrl + V)
                  </h3>
                  <p className="text-xs text-[#737872] leading-relaxed">
                    Captured a screenshot with Snipping Tool or copied an image from another tab? Simply press <kbd className="px-1.5 py-0.5 bg-white border border-[#DFE2DC] rounded-[2px] font-mono text-[10px]">Ctrl+V</kbd> anywhere on the page to instantly load it into the editor.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#DFE2DC] flex items-center justify-between text-[11px] text-[#737872]">
                  <span>Shortcut: Ctrl+V / Cmd+V</span>
                  <span className="font-mono text-[#39765A] font-medium group-hover:underline">Instant Load →</span>
                </div>
              </div>

              {/* Source 3: Web Image URL Import */}
              <div
                onClick={onOpenEditor}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onOpenEditor()}
                className="p-5 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-3 flex flex-col justify-between cursor-pointer group interactive-card"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-[3px] bg-[#EAF2ED] text-[#34483E] flex items-center justify-center border border-[#BFD9CA] group-hover:bg-[#34483E] group-hover:text-white transition-colors duration-200">
                    <Globe className="w-5 h-5 text-[#39765A] group-hover:text-white transition-colors duration-200" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#242824] group-hover:text-[#34483E] transition-colors">
                    Web Image URL Import
                  </h3>
                  <p className="text-xs text-[#737872] leading-relaxed">
                    Have an image hosted online? Paste its direct URL into the editor. SpecFit fetches and converts it into a local canvas element without storing it anywhere.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#DFE2DC] flex items-center justify-between text-[11px] text-[#737872]">
                  <span>Direct HTTPS import</span>
                  <span className="font-mono text-[#39765A] font-medium group-hover:underline">Fetch URL →</span>
                </div>
              </div>

              {/* Source 4: Curated Sample Gallery */}
              <div
                onClick={() => onLoadSampleIntoEditor('portrait')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onLoadSampleIntoEditor('portrait')}
                className="p-5 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-3 flex flex-col justify-between cursor-pointer group interactive-card"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-[3px] bg-[#EAF2ED] text-[#34483E] flex items-center justify-center border border-[#BFD9CA] group-hover:bg-[#34483E] group-hover:text-white transition-colors duration-200">
                    <Layers className="w-5 h-5 text-[#39765A] group-hover:text-white transition-colors duration-200" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#242824] group-hover:text-[#34483E] transition-colors">
                    One-Click Sample Fixtures
                  </h3>
                  <p className="text-xs text-[#737872] leading-relaxed">
                    Test the application without personal files. Includes generated high-res portrait, ink signature scan, official credential document, and landscape photography.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#DFE2DC] flex items-center justify-between text-[11px] text-[#737872]">
                  <span>4 Realistic Types</span>
                  <span className="font-mono text-[#39765A] font-medium group-hover:underline">Test Fixtures →</span>
                </div>
              </div>

              {/* Source 5: Mobile Device Camera Capture */}
              <div
                onClick={onOpenEditor}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onOpenEditor()}
                className="p-5 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-3 flex flex-col justify-between cursor-pointer group interactive-card"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-[3px] bg-[#EAF2ED] text-[#34483E] flex items-center justify-center border border-[#BFD9CA] group-hover:bg-[#34483E] group-hover:text-white transition-colors duration-200">
                    <Camera className="w-5 h-5 text-[#39765A] group-hover:text-white transition-colors duration-200" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#242824] group-hover:text-[#34483E] transition-colors">
                    Mobile Camera & Document Snap
                  </h3>
                  <p className="text-xs text-[#737872] leading-relaxed">
                    On a phone or tablet? Use the camera trigger to photograph physical paper forms, passports, or handwritten signatures and clean them up on the spot.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#DFE2DC] flex items-center justify-between text-[11px] text-[#737872]">
                  <span>Touch-Optimized</span>
                  <span className="font-mono text-[#39765A] font-medium group-hover:underline">Camera Trigger →</span>
                </div>
              </div>

              {/* Source 6: Batch File Ingestion */}
              <div
                onClick={onOpenBatch}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onOpenBatch()}
                className="p-5 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-3 flex flex-col justify-between cursor-pointer group interactive-card"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-[3px] bg-[#EAF2ED] text-[#34483E] flex items-center justify-center border border-[#BFD9CA] group-hover:bg-[#34483E] group-hover:text-white transition-colors duration-200">
                    <Files className="w-5 h-5 text-[#39765A] group-hover:text-white transition-colors duration-200" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#242824] group-hover:text-[#34483E] transition-colors">
                    Multi-File Queue Ingestion
                  </h3>
                  <p className="text-xs text-[#737872] leading-relaxed">
                    Drop 20+ images at once. SpecFit queues each item, applies custom constraints, and bundles everything into an uncorrupted ZIP archive with manifest.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#DFE2DC] flex items-center justify-between text-[11px] text-[#737872]">
                  <span>Multi-file Worker</span>
                  <span className="font-mono text-[#39765A] font-medium group-hover:underline">Batch Queue →</span>
                </div>
              </div>
            </div>

            {/* Interactive Sample Asset Launcher Bar */}
            <div className="mt-8 sm:mt-10 p-4 sm:p-5 bg-[#F0F1ED] border border-[#DFE2DC] rounded-[4px] shadow-2xs">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h4 className="text-xs font-semibold text-[#242824] uppercase tracking-wider">
                    Quick Sample Launch — Try SpecFit Instantly:
                  </h4>
                  <p className="text-[11px] text-[#737872]">
                    Click any sample fixture below to open the Universal Editor with that asset pre-loaded.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => onLoadSampleIntoEditor('portrait')}
                    className="px-3 py-1.5 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] text-xs font-medium cursor-pointer transition-all duration-150 shadow-2xs flex items-center gap-1.5 btn-tactile"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#34483E]" aria-hidden="true" />
                    <span>Portrait Photo</span>
                  </button>
                  <button
                    onClick={() => onLoadSampleIntoEditor('signature')}
                    className="px-3 py-1.5 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] text-xs font-medium cursor-pointer transition-all duration-150 shadow-2xs flex items-center gap-1.5 btn-tactile"
                  >
                    <PenTool className="w-3.5 h-3.5 text-[#34483E]" aria-hidden="true" />
                    <span>Ink Signature Scan</span>
                  </button>
                  <button
                    onClick={() => onLoadSampleIntoEditor('document')}
                    className="px-3 py-1.5 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] text-xs font-medium cursor-pointer transition-all duration-150 shadow-2xs flex items-center gap-1.5 btn-tactile"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#34483E]" aria-hidden="true" />
                    <span>Official Document</span>
                  </button>
                  <button
                    onClick={() => onLoadSampleIntoEditor('landscape')}
                    className="px-3 py-1.5 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] text-xs font-medium cursor-pointer transition-all duration-150 shadow-2xs flex items-center gap-1.5 btn-tactile"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#34483E]" aria-hidden="true" />
                    <span>Landscape Photo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE WEB SCREENSHOTS GALLERY */}
        <section aria-labelledby="gallery-heading" className="py-14 sm:py-20 border-b border-[#DFE2DC] bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
              <span className="text-xs font-mono font-semibold text-[#34483E] uppercase tracking-wider bg-[#EAECE7] px-2 py-0.5 rounded-[2px]">
                Real-World Gallery
              </span>
              <h2 id="gallery-heading" className="font-serif text-3xl sm:text-4xl text-[#242824]">
                High-resolution imagery prepared to exact specs
              </h2>
              <p className="text-xs sm:text-sm text-[#737872]">
                Inspect real web photographs and document specimens. Click any card to edit that image live in SpecFit.
              </p>
            </div>

            {/* 4 Interactive Visual Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {WEB_SHOWCASE_EXAMPLES.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#DFE2DC] rounded-[4px] overflow-hidden shadow-2xs flex flex-col justify-between group interactive-card"
                >
                  {/* Image Preview with Smooth Hover Zoom */}
                  <div className="relative h-44 sm:h-48 overflow-hidden bg-[#242824] flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={`Specimen preview for ${item.title}`}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-300 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#242824]/85 via-transparent to-transparent pointer-events-none" />

                    {/* Reduction Badge */}
                    <span className="absolute top-2.5 right-2.5 bg-[#34483E] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] shadow-2xs">
                      {item.reduction}
                    </span>

                    {/* Dimension Tag */}
                    <span className="absolute bottom-2.5 left-2.5 text-white font-mono text-[11px] font-medium drop-shadow-sm">
                      {item.outputDimensions}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-[#737872] tracking-wider mb-1">
                        {item.category}
                      </div>
                      <h4 className="text-sm font-bold text-[#242824] group-hover:text-[#34483E] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#737872] line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#DFE2DC] space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#737872]">
                        <span>Disk: {item.outputSize}</span>
                        <span>{item.format}</span>
                      </div>

                      <button
                        onClick={() => onLoadImageUrlIntoEditor(item.imageUrl)}
                        className="w-full py-1.5 bg-[#FAF9F6] hover:bg-[#34483E] hover:text-white active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5 btn-tactile shadow-2xs"
                      >
                        <span>Edit This Image</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Core Utility Modules Breakdown */}
        <section id="tools" aria-labelledby="tools-heading" className="scroll-mt-16 py-14 sm:py-20 border-b border-[#DFE2DC] bg-[#F5F5F2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-semibold text-[#34483E] uppercase tracking-wider bg-[#EAECE7] px-2 py-0.5 rounded-[2px]">
                Workhorse Utilities
              </span>
              <h2 id="tools-heading" className="font-serif text-3xl sm:text-4xl text-[#242824]">
                Engineered for utility, not novelty
              </h2>
              <p className="text-xs sm:text-sm text-[#737872]">
                Seven dedicated desktop workflows across image and PDF processing built to do their jobs reliably, 100% on-device.
              </p>
              <div className="pt-1">
                <button
                  onClick={onOpenDashboard}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#34483E] hover:bg-[#26362E] active:scale-95 text-white text-xs font-semibold rounded-[3px] shadow-2xs transition-all cursor-pointer btn-tactile"
                >
                  <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Explore Interactive Cards Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* SUITE 1: IMAGE SUITE */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFE2DC] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#34483E] bg-[#EAECE7] px-2.5 py-0.5 rounded-[2px]">
                    Image Suite
                  </span>
                  <h3 className="text-sm font-semibold text-[#242824]">Crop, Resize, Compress & Clean Signatures</h3>
                </div>
                <span className="text-[11px] text-[#737872]">4 Dedicated Tools</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Tool 1: Universal Image Editor */}
                <div className="bg-white border border-[#DFE2DC] rounded-[4px] p-5 sm:p-6 space-y-4 shadow-2xs flex flex-col justify-between interactive-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#EAF2ED] rounded-[3px] text-[#34483E]">
                          <ImageIcon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h4 className="text-base font-bold text-[#242824]">Universal Image Editor</h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#737872]">Flagship</span>
                    </div>
                    <p className="text-xs text-[#737872] leading-relaxed">
                      Crop freely or lock to any aspect ratio (1:1, 3:4, 4:5, 16:9, 3:2, or custom W:H). Set exact output pixel dimensions, pan and zoom interactively, rotate in 90° increments, and dial in strict target byte limits.
                    </p>
                    <ul className="text-xs text-[#242824] space-y-1.5 pt-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Bi-cubic canvas resampling with fit or stretch framing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Real-time Blob byte measurement with pass/fail badges</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Support for JPEG, PNG, and WebP exports</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-[#DFE2DC]">
                    <button
                      onClick={onOpenEditor}
                      className="w-full py-2 bg-[#34483E] hover:bg-[#26362E] active:scale-95 text-white text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 text-center btn-tactile shadow-2xs"
                    >
                      Open Image Editor →
                    </button>
                  </div>
                </div>

                {/* Tool 2: Focused Image Compressor */}
                <div className="bg-white border border-[#DFE2DC] rounded-[4px] p-5 sm:p-6 space-y-4 shadow-2xs flex flex-col justify-between interactive-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#EAF2ED] rounded-[3px] text-[#34483E]">
                          <Minimize2 className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h4 className="text-base font-bold text-[#242824]">Quick Image Compressor</h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#737872]">Byte Focused</span>
                    </div>
                    <p className="text-xs text-[#737872] leading-relaxed">
                      When you already have the right framing and just need a file strictly under 50 KB, 100 KB, or 200 KB. Encodes your image iteratively until the actual output matches your exact byte constraint.
                    </p>
                    <ul className="text-xs text-[#242824] space-y-1.5 pt-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Target byte inputs in Bytes, KB, or MB</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Calculates precise savings and byte reduction %</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Never produces blurry results through intelligent scaling fallback</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-[#DFE2DC]">
                    <button
                      onClick={onOpenCompressor}
                      className="w-full py-2 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 text-center btn-tactile shadow-2xs"
                    >
                      Open Quick Compressor →
                    </button>
                  </div>
                </div>

                {/* Tool 3: Signature & Document Cleaner */}
                <div className="bg-white border border-[#DFE2DC] rounded-[4px] p-5 sm:p-6 space-y-4 shadow-2xs flex flex-col justify-between interactive-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#EAF2ED] rounded-[3px] text-[#34483E]">
                          <PenTool className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h4 className="text-base font-bold text-[#242824]">Signature & Scan Cleaner</h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#737872]">Filter Engine</span>
                    </div>
                    <p className="text-xs text-[#737872] leading-relaxed">
                      Turn messy mobile camera photos of paper signatures and documents into crisp, publication-ready scans. Whitens yellowish lighting shadows while deepening ink pen strokes.
                    </p>
                    <ul className="text-xs text-[#242824] space-y-1.5 pt-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Stroke-preserving S-curve luminance filter</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Removes gray shadows and ambient room glare</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Transparent PNG or pure white JPEG backgrounds</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-[#DFE2DC]">
                    <button
                      onClick={onOpenSignature}
                      className="w-full py-2 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 text-center btn-tactile shadow-2xs"
                    >
                      Open Signature Cleaner →
                    </button>
                  </div>
                </div>

                {/* Tool 4: Parallel Batch Processing */}
                <div className="bg-white border border-[#DFE2DC] rounded-[4px] p-5 sm:p-6 space-y-4 shadow-2xs flex flex-col justify-between interactive-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#EAF2ED] rounded-[3px] text-[#34483E]">
                          <Files className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h4 className="text-base font-bold text-[#242824]">Batch Queue & ZIP Exporter</h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#737872]">Multi-File</span>
                    </div>
                    <p className="text-xs text-[#737872] leading-relaxed">
                      Process dozens of images simultaneously. Apply shared dimensions and file size targets across the whole queue, audit individual status badges, and download everything in one valid ZIP archive.
                    </p>
                    <ul className="text-xs text-[#242824] space-y-1.5 pt-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Parallel Web Worker execution without UI freezing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Automatic plain-text manifest generation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>One-click batch ZIP export</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-[#DFE2DC]">
                    <button
                      onClick={onOpenBatch}
                      className="w-full py-2 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 text-center btn-tactile shadow-2xs"
                    >
                      Open Batch Queue →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SUITE 2: PDF SUITE */}
            <div className="space-y-4 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFE2DC] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#34483E] bg-[#EAECE7] px-2.5 py-0.5 rounded-[2px]">
                    PDF Suite
                  </span>
                  <h3 className="text-sm font-semibold text-[#242824]">Images to PDF, Document Reducer & Page Extractor</h3>
                </div>
                <span className="text-[11px] text-[#737872]">3 Dedicated In-Browser Tools</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {/* PDF Tool 1: Images to PDF */}
                <div className="bg-white border border-[#DFE2DC] rounded-[4px] p-5 sm:p-6 space-y-4 shadow-2xs flex flex-col justify-between interactive-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#EAF2ED] rounded-[3px] text-[#34483E]">
                          <FilePlus className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h4 className="text-base font-bold text-[#242824]">Images to PDF</h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#737872]">Document Builder</span>
                    </div>
                    <p className="text-xs text-[#737872] leading-relaxed">
                      Combine multiple JPEG, PNG, or WebP images into a single standardized PDF document. Reorder pages, rotate 90°, and choose standard paper formats with custom margins.
                    </p>
                    <ul className="text-xs text-[#242824] space-y-1.5 pt-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>A4, US Letter, US Legal, or Fit-to-Image framing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Interactive page reordering & 90° rotation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Optional JPEG compression with live size estimate</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-[#DFE2DC]">
                    <button
                      onClick={onOpenImageToPdf}
                      className="w-full py-2 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 text-center btn-tactile shadow-2xs"
                    >
                      Open Images to PDF →
                    </button>
                  </div>
                </div>

                {/* PDF Tool 2: PDF Reducer */}
                <div className="bg-white border border-[#DFE2DC] rounded-[4px] p-5 sm:p-6 space-y-4 shadow-2xs flex flex-col justify-between interactive-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#EAF2ED] rounded-[3px] text-[#34483E]">
                          <FileDown className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h4 className="text-base font-bold text-[#242824]">PDF Reducer</h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#737872]">Byte Optimizer</span>
                    </div>
                    <p className="text-xs text-[#737872] leading-relaxed">
                      Shrink bloated PDF documents directly in your browser. Target strict portal limits (e.g., &lt; 500 KB or 1 MB) or pick balanced profiles with zero cloud uploads.
                    </p>
                    <ul className="text-xs text-[#242824] space-y-1.5 pt-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Exact target limit mode (KB / MB) or profile presets</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Resolution downsampling & stream quantization</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Savings breakdown with reduction percentage badge</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-[#DFE2DC]">
                    <button
                      onClick={onOpenPdfCompressor}
                      className="w-full py-2 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 text-center btn-tactile shadow-2xs"
                    >
                      Open PDF Reducer →
                    </button>
                  </div>
                </div>

                {/* PDF Tool 3: PDF to Images */}
                <div className="bg-white border border-[#DFE2DC] rounded-[4px] p-5 sm:p-6 space-y-4 shadow-2xs flex flex-col justify-between interactive-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#EAF2ED] rounded-[3px] text-[#34483E]">
                          <FileText className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h4 className="text-base font-bold text-[#242824]">PDF to Images</h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#737872]">Page Rasterizer</span>
                    </div>
                    <p className="text-xs text-[#737872] leading-relaxed">
                      Rasterize PDF pages into individual image files. Choose JPEG, PNG, or WebP with configurable DPI scaling. Download all pages in a ZIP or edit pages directly.
                    </p>
                    <ul className="text-xs text-[#242824] space-y-1.5 pt-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>High-DPI rendering (96, 150, 200 DPI) via PDF.js</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>One-click "Edit in Image Editor" direct handoff</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#39765A] shrink-0" aria-hidden="true" />
                        <span>Batch ZIP download for multi-page documents</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-[#DFE2DC]">
                    <button
                      onClick={onOpenPdfToImage}
                      className="w-full py-2 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 text-center btn-tactile shadow-2xs"
                    >
                      Open PDF to Images →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Mathematical Compression Engine Deep-Dive */}
        <section id="engine" aria-labelledby="engine-heading" className="scroll-mt-16 py-14 sm:py-20 border-b border-[#DFE2DC] bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-semibold text-[#34483E] uppercase tracking-wider bg-[#EAF2ED] px-2 py-0.5 rounded-[2px]">
                Deterministic Engine
              </span>
              <h2 id="engine-heading" className="font-serif text-3xl sm:text-4xl text-[#242824]">
                Compression verified by real bytes, not estimates
              </h2>
              <p className="text-xs sm:text-sm text-[#737872] max-w-2xl mx-auto">
                Many online resizers guess file sizes or apply generic quality levels that overshoot portal limits. SpecFit uses a binary-search encoder that measures actual encoded Blob bytes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-2 interactive-card">
                <span className="font-mono text-xs font-bold text-[#34483E] block">Phase 1: Binary Search</span>
                <h4 className="text-xs font-bold text-[#242824]">Quantization Optimization</h4>
                <p className="text-[11px] text-[#737872] leading-relaxed">
                  Iteratively sweeps quality factors between 0.10 and 0.98. In 5–7 iterations, finds the maximum quality factor that satisfies your target byte cap.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-2 interactive-card">
                <span className="font-mono text-xs font-bold text-[#34483E] block">Phase 2: Dimension Fallback</span>
                <h4 className="text-xs font-bold text-[#242824]">Proportional Rescaling</h4>
                <p className="text-[11px] text-[#737872] leading-relaxed">
                  If entropy is too high for extreme caps (e.g. 10 KB for a 4K photo), the engine scales dimensions down proportionally until the exact file size constraint is met.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-2 interactive-card">
                <span className="font-mono text-xs font-bold text-[#34483E] block">Phase 3: Blob Verification</span>
                <h4 className="text-xs font-bold text-[#242824]">Actual Byte Audit</h4>
                <p className="text-[11px] text-[#737872] leading-relaxed">
                  Never claims success based on uncompressed bitmap math. Measures the true disk byte size of the final encoded Blob before confirming optimal file size.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Zero-Cloud Privacy Guarantee */}
        <section id="privacy" aria-labelledby="privacy-heading" className="scroll-mt-16 py-14 sm:py-20 border-b border-[#DFE2DC] bg-[#F5F5F2]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-[4px] bg-[#EAF2ED] text-[#34483E] flex items-center justify-center mx-auto border border-[#BFD9CA]">
              <Lock className="w-6 h-6 text-[#39765A]" aria-hidden="true" />
            </div>
            <h2 id="privacy-heading" className="font-serif text-3xl sm:text-4xl text-[#242824]">
              Zero server uploads. 100% on-device privacy.
            </h2>
            <p className="text-xs sm:text-sm text-[#737872] max-w-2xl mx-auto leading-relaxed">
              Your identity photos, national passports, visa documents, and signatures should never be transmitted to third-party image conversion servers. SpecFit executes all canvas filters and compression algorithms directly in your browser's local sandbox memory.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
              <div className="p-4 bg-white border border-[#DFE2DC] rounded-[3px] space-y-1.5 shadow-2xs interactive-card">
                <span className="font-bold text-xs text-[#242824] block">Zero Outbound Bytes</span>
                <p className="text-[11px] text-[#737872]">
                  No images or document files are ever sent over HTTP, WebSockets, or beacons.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#DFE2DC] rounded-[3px] space-y-1.5 shadow-2xs interactive-card">
                <span className="font-bold text-xs text-[#242824] block">EXIF Cleansing</span>
                <p className="text-[11px] text-[#737872]">
                  Sensitive GPS location tags, camera serial numbers, and device data are stripped cleanly on export.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#DFE2DC] rounded-[3px] space-y-1.5 shadow-2xs interactive-card">
                <span className="font-bold text-xs text-[#242824] block">Works Offline</span>
                <p className="text-[11px] text-[#737872]">
                  Cached securely as a Progressive Web App (PWA). You can disconnect your internet and use all features.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Standards & Presets Directory (Secondary) */}
        <section id="standards" aria-labelledby="standards-heading" className="scroll-mt-16 py-14 sm:py-20 border-b border-[#DFE2DC] bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-mono font-semibold text-[#34483E] uppercase tracking-wider bg-[#EAECE7] px-2 py-0.5 rounded-[2px]">
                Reference Standards
              </span>
              <h2 id="standards-heading" className="font-serif text-3xl sm:text-4xl text-[#242824]">
                Verified dimensions & size benchmarks
              </h2>
              <p className="text-xs sm:text-sm text-[#737872]">
                Optional benchmarks for international passports, visas, and recruitment portals. You are never forced to choose a preset — enter any custom dimensions at any time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PORTAL_PRESETS.slice(0, 8).map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 bg-[#FAF9F6] border border-[#DFE2DC] rounded-[3px] space-y-2 flex flex-col justify-between interactive-card"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#34483E] bg-[#EAECE7] px-2 py-0.5 rounded-[2px] border border-[#DFE2DC]">
                        {preset.code}
                      </span>
                      <span className="text-[10px] text-[#737872]">{preset.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#242824]">{preset.name}</h4>
                    <p className="text-[11px] text-[#737872] line-clamp-2 mt-1">{preset.description}</p>
                  </div>
                  <div className="pt-2 border-t border-[#DFE2DC] text-[10px] text-[#737872] flex justify-between font-mono">
                    <span>Photo: {preset.photo.minSizeKb}–{preset.photo.maxSizeKb} KB</span>
                    <span>Sig: {preset.signature.minSizeKb}–{preset.signature.maxSizeKb} KB</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={onOpenPresets}
                className="px-4 py-2 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#242824] border border-[#DFE2DC] hover:border-[#34483E] text-xs font-semibold rounded-[3px] cursor-pointer transition-all duration-150 inline-flex items-center gap-1.5 shadow-2xs btn-tactile"
              >
                <span>Browse Full Directory with Official Citations</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* 10. Frequently Asked Questions (FAQ) with Animated Accordion */}
        <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-16 py-14 sm:py-20 border-b border-[#DFE2DC] bg-[#F5F5F2]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-semibold text-[#34483E] uppercase tracking-wider bg-[#EAECE7] px-2 py-0.5 rounded-[2px]">
                Questions & Answers
              </span>
              <h2 id="faq-heading" className="font-serif text-3xl sm:text-4xl text-[#242824]">
                Straightforward technical answers
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'Are my images ever transmitted or uploaded to a cloud server?',
                  a: 'Never. SpecFit operates entirely inside your local browser runtime. All canvas manipulations, S-curve ink enhancements, and binary-search file encodings occur in your device’s local memory using HTML5 Canvas and Web Workers. You can verify this anytime via our built-in Network Inspector or your browser’s DevTools.'
                },
                {
                  q: 'How does SpecFit guarantee that an image meets both minimum and maximum file size targets?',
                  a: 'Unlike tools that simply guess a single quality slider, SpecFit runs an iterative binary-search loop directly on encoded Blob bytes. If an image is too large, it steps down the JPEG/WebP quantization table; if minimum byte padding is required, it preserves high-frequency detail at optimal quantization until your exact byte range is satisfied.'
                },
                {
                  q: 'Can I use custom pixel dimensions without picking an exam or visa preset?',
                  a: 'Yes, completely. Custom editing is the default mode of SpecFit. You can enter any custom width, any custom height, lock or unlock aspect ratios, crop freely, or choose whole-image resizing with fit-inside or stretch framing.'
                },
                {
                  q: 'Can I paste images directly from my clipboard or take them from my camera?',
                  a: 'Yes. SpecFit supports five distinct input channels: local drag-and-drop, standard file selector, global clipboard paste (Ctrl+V), web image URL import, mobile camera capture, and one-click sample fixtures.'
                },
                {
                  q: 'Does SpecFit work without an internet connection?',
                  a: 'Yes. Once loaded, SpecFit is fully cached by its Service Worker as a Progressive Web App (PWA). You can disconnect Wi-Fi or go into Airplane Mode, and every feature — including image cropping, filtering, and batch ZIP export — continues functioning normally.'
                },
                {
                  q: 'Can SpecFit convert, compress, and extract PDF files without uploading them?',
                  a: 'Yes, 100%. SpecFit uses pure client-side PDF engines (pdf-lib and pdfjs-dist) running entirely inside your web browser. When you convert images to PDF, compress PDF documents to meet strict application portal KB limits, or extract pages as high-resolution images, your documents never leave your computer or touch any remote server.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#DFE2DC] hover:border-[#34483E] rounded-[3px] overflow-hidden transition-colors shadow-2xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={activeFaq === idx}
                    aria-controls={`faq-answer-${idx}`}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF9F6] transition-colors focus:outline-none"
                  >
                    <span className="text-xs font-semibold text-[#242824]">{item.q}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-[#737872] shrink-0 transition-transform duration-200 ${
                        activeFaq === idx ? 'rotate-90 text-[#34483E]' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {activeFaq === idx && (
                    <div
                      id={`faq-answer-${idx}`}
                      className="px-4 pb-3.5 pt-1 text-xs text-[#737872] leading-relaxed border-t border-[#DFE2DC]/50 bg-[#FAF9F6]/50 animate-fade-in"
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 11. Final Launch Action Banner */}
        <section aria-label="Get Started" className="py-14 bg-[#34483E] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <h2 className="font-serif text-3xl sm:text-4xl text-white">
              Ready to prepare your images and documents?
            </h2>
            <p className="text-xs sm:text-sm text-[#DFE2DC] max-w-xl mx-auto leading-relaxed">
              No account creation. No subscriptions. No tracking cookies. Load SpecFit and start editing immediately.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenEditor}
                className="px-6 py-3 bg-white hover:bg-[#FAF9F6] active:scale-95 text-[#34483E] text-xs font-bold uppercase tracking-wider rounded-[3px] cursor-pointer transition-all duration-150 shadow-sm hover:shadow-lg inline-flex items-center gap-2 btn-tactile"
              >
                <span>Launch Universal Image Editor</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 12. Footer */}
      <footer role="contentinfo" className="py-8 bg-[#F5F5F2] border-t border-[#DFE2DC] text-xs text-[#737872]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <SpecFitLogo size="xs" />
            <span className="font-semibold text-[#242824]">SpecFit</span>
            <span>— Universal Image &amp; Document Preparation Utility.</span>
          </div>

          <div className="flex items-center justify-center gap-6">
            <span>Runs locally on your device</span>
            <span>•</span>
            <button
              onClick={onOpenEditor}
              className="text-[#34483E] font-semibold hover:underline cursor-pointer"
            >
              Open Workspace →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
