# SpecFit — Universal Image Preparation & Compression Utility

> **"Your image. Your dimensions. Your file size. Your control."**  
> A desktop-grade, privacy-first image utility for cropping freely, setting exact pixel dimensions, and dialling in strict kilobyte constraints. Runs 100% in-browser with zero server uploads.

🌐 **Live Application:** [https://specfit-tfch.onrender.com/](https://specfit-tfch.onrender.com/)

[![Status](https://img.shields.io/badge/status-production--ready-34483E?style=flat-square)](https://specfit-tfch.onrender.com/)
[![Tests](https://img.shields.io/badge/tests-40%2F40%20passing-39765A?style=flat-square)](https://github.com/navaneeth2205/SpecFit)
[![Privacy](https://img.shields.io/badge/privacy-100%25%20on--device-39765A?style=flat-square)](https://specfit-tfch.onrender.com/)
[![License](https://img.shields.io/badge/license-MIT-737872?style=flat-square)](LICENSE)

---

## 1. Product Identity & Overview

SpecFit is a universal image preparation application built for students, photographers, office workers, designers, and everyday users. It replaces generic AI-bloated SaaS dashboards with a dependable, classic desktop utility workflow.

You never need to choose a preset before editing. Custom editing is the default experience:
1. **Upload or ingest an image from any source** (local disk, clipboard paste `Ctrl+V`, web URL, or mobile camera).
2. **Crop or resize freely** with custom width and height in pixels.
3. **Lock or unlock aspect ratios** (1:1, 3:4, 4:5, 16:9, 3:2, or custom ratio).
4. **Set exact file-size constraints** (minimum KB, maximum KB, or exact range).
5. **Select output format** (JPEG, PNG, WebP) and download the verified Blob.

---

## 2. Core Workhorse Tools

###  Universal Image Editor (Flagship)
- **Frictionless Ingestion**: Drag-and-drop local files, paste directly from clipboard (`Ctrl+V`), fetch any image URL, snap via mobile camera, or load curated sample fixtures.
- **Genuine Dimensional Freedom**: Enter arbitrary pixel width and height without artificial limits.
- **Aspect Ratio Control**: Free crop, locked aspect ratio, original ratio, or custom W:H ratio.
- **Framing Modes**: Crop viewport & scale to fit, fit inside (letterbox background), or resample entire image.
- **Rotation & Zoom**: Smooth interactive zoom (50%–300%) and 90° clockwise/counter-clockwise stepping.
- **Live Encoded Blob Audit**: Encodes actual JPEG/PNG/WebP blobs in real time, verifying true byte size before download.

###  Quick Image Compressor
- **Binary Search Convergence**: Sweeps quantization tables iteratively to hit an exact maximum kilobyte budget without blurry downscaling.
- **Multi-Unit Precision**: Set limits in Bytes, KB, or MB.
- **Visual Reduction Metric**: Live calculation of byte savings and reduction percentage.

### ✍️ Signature & Scan Cleaner
- **Stroke-Preserving Filter Engine**: S-curve luminance processing whitens yellowish room glare and paper shadows while deepening ink pen strokes.
- **Dual Export**: Export with pure white background (JPEG) or transparent alpha channel (PNG).

### 📦 Parallel Batch Processing & ZIP Exporter
- **Multi-File Queue**: Ingest dozens of files simultaneously.
- **Shared Parameters**: Apply uniform target dimensions and file-size constraints across the queue.
- **Verified ZIP Archive**: Bundles all processed assets into a clean ZIP archive with an automated plain-text conformance manifest (`specfit_batch_manifest.txt`).

### 📚 Standards & Presets Directory (Secondary)
- Optional benchmarks for international passports, visas, and recruitment portals (GATE, UPSC, SSC, IBPS, Schengen, US Visa).
- Selecting a preset pre-fills the editor but **never permanently restricts custom editing**.

---

## 3. Zero-Upload Privacy Architecture

SpecFit has no backend database, no upload servers, and no tracking telemetry.

```text
[User Device]
  │
  ├── File API / Clipboard / Web Camera
  ├── In-Memory HTML5 Canvas Sandbox
  ├── Adaptive Binary-Search Quantization Engine
  ├── Automatic EXIF Geodata Stripping
  └── JSZip In-Memory Archiver
  │
  └── [Network Wire] ──► 0 BYTES TRANSMITTED
```

- **EXIF Cleansing**: Rendering to canvas automatically purges embedded camera serial numbers, device metadata, and GPS geolocations.
- **Offline PWA**: Fully functional offline via Service Worker caching (`public/sw.js`).
- **Live Network Inspector**: Built-in network audit modal monitors all outbound connections and confirms zero image bytes are transmitted.

---

## 4. Design & Accessibility Standards

- **Classic Desktop Utility Aesthetic**: Neutral backgrounds (`#F5F5F2`), restrained spruce accents (`#34483E`), thin borders (`#DFE2DC`), and compact controls.
- **Distinctive Typography**: Instrument Serif for editorial headlines, Plus Jakarta Sans for UI controls, and JetBrains Mono for metrics and byte measurements.
- **Tactile Interactions**: Deep card elevation (`-5px`), active button compression (`scale(0.96)`), breathing live status indicator (`.animate-badge-dot`), and interactive before/after split slider (`.animate-pulse-glow`).
- **WCAG 2.1 AA Accessibility**:
  - Explicit `<label htmlFor="...">` bindings on all form inputs.
  - `aria-pressed` states on all toggle buttons.
  - Full keyboard accessibility with high-contrast `2px solid #34483E` focus rings (`*:focus-visible`).
  - Screen reader live announcements via `aria-live="polite"`.
- **Responsive Across All Viewports**: Cleanly adapts from 320px mobile screens to multi-monitor 4K displays. Desktop sidebar collapses to an accessible mobile drawer on screens `< 768px`.

---

## 5. Development & Testing

### Prerequisites
- Node.js 18+
- npm 9+

### Quick Start
```bash
# Clone the repository
git clone https://github.com/navaneeth2205/SpecFit.git
cd SpecFit

# Install dependencies
npm install

# Start local development server
npm run dev

# Run Vitest test suite (40 tests across 8 suites)
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Deployment

SpecFit compiles to a 100% static client-side bundle in `dist/`.

### Live Deployment
- **Render**: [https://specfit-tfch.onrender.com/](https://specfit-tfch.onrender.com/) (configured via [render.yaml](render.yaml))
- **Cloudflare Pages**: Run `npx wrangler pages deploy dist --project-name=specfit`
- **Vercel**: Run `npx vercel --prod`
- **Netlify**: Drag and drop `dist/` into [app.netlify.com/drop](https://app.netlify.com/drop)

---

## 7. License

MIT License. Designed and engineered for dependable everyday image preparation.
