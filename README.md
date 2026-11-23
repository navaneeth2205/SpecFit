# SpecFit — Zero-Upload Document Formatting Platform

> **Documents prepared to exact specifications.**  
> A production-ready, client-side document preparation platform designed for government examinations, university entrance tests, recruitment portals, and passport authorities.

---

## 1. Product Overview

Online recruitment and governmental portals (including **GATE, UPSC, SSC, IBPS, Passport Seva, and CUET**) enforce rigid automated image validation rules. Uploads are rejected if file sizes differ by even a fraction of a kilobyte or if pixel dimensions, aspect ratios, or lighting fail automated checks.

**SpecFit** solves this with an exact, browser-based preparation suite:
- **Zero Server Uploads**: 100% of image decoding, cropping, filter math, and adaptive compression occurs on-device in browser memory.
- **Adaptive Binary-Search Compression**: Never assumes linear compression; dynamically converges on the mandated kilobyte envelope.
- **Anthropometric Face Alignment**: SVG facial guide aligns head crown, eye line, and chin baseline to guarantee official coverage ratios (60%–70% or 70%–80%).
- **Stroke-Preserving Signature Enhancer**: Whitens background camera shadows while preserving fine hairline pen stroke tapers.
- **Live Specification Validator**: Performs byte-level checks against official exam cycle notifications.
- **JSZip Combined Export**: Packages validated documents with a cryptographic verification audit report.

---

## 2. Design Philosophy

SpecFit is designed following **Swiss editorial typography** and desktop productivity software principles:
- **Restrained Color Palette**:
  - Main Background: `#FAFAF8`
  - Main Surface: `#FFFFFF`
  - Primary Text: `#202522`
  - Secondary Text: `#747A75`
  - Primary Accent: `#263B35` (Deep spruce)
  - Border: `#E5E7E3`
  - Muted Surface: `#F2F3F0`
  - Semantic Status: `#39765A` (Success), `#A87532` (Warning), `#B44B43` (Error)
- **Clear Typography Hierarchy**: Inter for all user interface controls and metrics; DM Serif Display for editorial headlines; JetBrains Mono for dimensions and byte values.
- **No AI Aesthetic Gimmicks**: No neon gradients, glowing cards, glassmorphism, floating decorative blobs, or fake metrics.

---

## 3. Supported Portal Presets

| Portal Code | Organization / Exam | Photo Target | Signature Target | Official Citation Basis |
| :--- | :--- | :--- | :--- | :--- |
| **GATE** | IITs / GATE Committee | `480 × 640 px` (5–200 KB) | `560 × 160 px` (5–200 KB) | IIT Roorkee Brochure Sec 4.4 |
| **UPSC** | Union Public Service Commission | `350–1000 px` sq (20–300 KB) | `350–1000 px` sq (20–300 KB) | UPSC OTR Portal Guidelines |
| **SSC** | Staff Selection Commission (CGL/CHSL) | `3.5 × 4.5 cm` (20–50 KB) | `4.0 × 2.0 cm` (10–20 KB) | SSC Notice Annexure III |
| **IBPS** | Banking Personnel Selection (PO/Clerk) | `200 × 230 px` (20–50 KB) | `140 × 60 px` (10–20 KB) | IBPS CRP Common Guidelines |
| **PSK** | Passport Seva Kendra (MEA) | `450 × 600 px` (10–300 KB) | `300 × 120 px` (10–100 KB) | MEA Passport Application Rules |
| **CUET** | National Testing Agency (NTA) | `400 × 500 px` (10–200 KB) | `200 × 100 px` (4–30 KB) | NTA Information Bulletin |
| **NSP** | National Scholarship Portal | `250 × 300 px` (10–100 KB) | `200 × 80 px` (5–50 KB) | NSP Student Guidelines |
| **CUSTOM** | User-Configurable Spec Builder | Custom dimensions & bounds | Custom dimensions & bounds | Configured per recruitment ad |

---

## 4. Privacy & Zero-Upload Architecture

```text
[User Device]
  │
  ├── File API / Drag & Drop
  ├── HTML5 Canvas Sandbox
  ├── Adaptive Binary-Search Compressor
  ├── Automatic EXIF Geodata Stripping
  └── JSZip In-Memory Archiver
  │
  └── [Network Wire] ──► 0 BYTES TRANSMITTED
```

- **Runtime Network Interceptor**: SpecFit monitors all outbound network traffic and displays a live network audit log verifying 0 bytes transmitted.
- **Autonomous PWA**: Service Worker (`public/sw.js`) caches the entire application shell for full offline functionality.
- **EXIF Cleansing**: Rendering to canvas purges camera serials, timestamps, and GPS coordinates automatically.

---

## 5. Development & Testing

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit and integration tests
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Deployment Guide

The production build in `dist/` is 100% static and requires no backend server or database:
- **Cloudflare Pages**: Connect Git repository, set build command `npm run build`, and output directory `dist`.
- **Vercel**: Pre-configured with `vercel.json` for SPA rewrites and strict HTTP security headers.
- **Netlify**: Pre-configured with `public/_redirects` for client-side routing.
