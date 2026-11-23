import { PortalPreset } from '../types';

export const PORTAL_PRESETS: PortalPreset[] = [
  {
    id: 'universal-quick',
    name: 'Universal Image & Document Resizer',
    code: 'UNIVERSAL',
    category: 'Universal & General',
    applicationCycle: 'All-Purpose Formatting',
    lastVerifiedDate: 'Standard Web & Print Spec (ISO/IEC 10918-1)',
    sourceAuthority: 'Universal Digital Asset Standard',
    sourceUrl: '',
    description: 'Easily resize, crop, and compress any photograph, scan, or image to standard file sizes with optimal quality preservation.',
    photo: {
      minWidth: 200,
      maxWidth: 2400,
      minHeight: 200,
      maxHeight: 2400,
      exactWidth: 800,
      exactHeight: 1000,
      aspectRatio: 4 / 5,
      aspectRatioLabel: '4 : 5 (800 × 1000 px)',
      minSizeKb: 10,
      maxSizeKb: 200,
      formats: ['image/jpeg', 'image/png'],
      background: 'Preserves original or transparent background',
      specialInstructions: [
        'Works with any portrait, document scan, or general image',
        'Automatically compresses under 200 KB without pixelation',
        'Use the crop and zoom controls to frame your subject cleanly'
      ]
    },
    signature: {
      minWidth: 100,
      maxWidth: 1200,
      minHeight: 50,
      maxHeight: 600,
      exactWidth: 600,
      exactHeight: 200,
      aspectRatio: 3 / 1,
      aspectRatioLabel: '3 : 1 (600 × 200 px)',
      minSizeKb: 5,
      maxSizeKb: 50,
      formats: ['image/jpeg', 'image/png'],
      background: 'Clean paper or whitened background',
      specialInstructions: [
        'Whitens paper shadows and deepens ink strokes',
        'Works for handwritten signatures, stamps, and cursive initials',
        'Automatically compresses under 50 KB'
      ]
    }
  },
  {
    id: 'quick-100kb',
    name: 'Strict Compression: Under 100 KB',
    code: 'MAX-100KB',
    category: 'Universal & General',
    applicationCycle: 'Web Uploads & Fast Forms',
    lastVerifiedDate: 'Standard Web Upload Benchmark',
    sourceAuthority: 'High Compression Ceiling',
    sourceUrl: '',
    description: 'Compresses any file to strictly below 100 KB while retaining crisp visual resolution for email attachments, online forms, and document uploaders.',
    photo: {
      minWidth: 300,
      maxWidth: 1600,
      minHeight: 300,
      maxHeight: 1600,
      exactWidth: 600,
      exactHeight: 800,
      aspectRatio: 3 / 4,
      aspectRatioLabel: '3 : 4 (600 × 800 px)',
      minSizeKb: 5,
      maxSizeKb: 100,
      formats: ['image/jpeg'],
      background: 'Any background',
      specialInstructions: [
        'Guarantees output stays under 100 KB',
        'Adaptive binary-search compression preserves fine edges'
      ]
    },
    signature: {
      minWidth: 150,
      maxWidth: 600,
      minHeight: 60,
      maxHeight: 250,
      exactWidth: 400,
      exactHeight: 150,
      aspectRatio: 8 / 3,
      aspectRatioLabel: '8 : 3 (400 × 150 px)',
      minSizeKb: 4,
      maxSizeKb: 30,
      formats: ['image/jpeg'],
      background: 'White paper',
      specialInstructions: [
        'Compresses signature cleanly under 30 KB'
      ]
    }
  },
  {
    id: 'quick-50kb',
    name: 'Strict Compression: Under 50 KB',
    code: 'MAX-50KB',
    category: 'Universal & General',
    applicationCycle: 'Lightweight Form Uploads',
    lastVerifiedDate: 'Ultra-Lightweight Web Standard',
    sourceAuthority: 'Strict Byte Limit Mode',
    sourceUrl: '',
    description: 'Designed for strict upload limits (20 KB to 50 KB) commonly required on older administrative portals and fast web forms.',
    photo: {
      minWidth: 200,
      maxWidth: 500,
      minHeight: 240,
      maxHeight: 600,
      exactWidth: 350,
      exactHeight: 450,
      aspectRatio: 350 / 450,
      aspectRatioLabel: '3.5 : 4.5 (350 × 450 px)',
      minSizeKb: 15,
      maxSizeKb: 50,
      formats: ['image/jpeg'],
      background: 'Light background',
      specialInstructions: [
        'Strictly between 15 KB and 50 KB',
        'Optimized for rapid portal server validation'
      ]
    },
    signature: {
      minWidth: 140,
      maxWidth: 300,
      minHeight: 60,
      maxHeight: 120,
      exactWidth: 200,
      exactHeight: 80,
      aspectRatio: 2.5 / 1,
      aspectRatioLabel: '5 : 2 (200 × 80 px)',
      minSizeKb: 5,
      maxSizeKb: 20,
      formats: ['image/jpeg'],
      background: 'White paper',
      specialInstructions: [
        'Compressed under 20 KB'
      ]
    }
  },
  {
    id: 'profile-resume',
    name: 'Professional Profile & Resume Headshot',
    code: 'PROFILE',
    category: 'Professional & Web',
    applicationCycle: 'Professional Identity Standards',
    lastVerifiedDate: 'Industry Standard 2025/2026',
    sourceAuthority: 'Professional Digital Identity',
    sourceUrl: '',
    description: 'Square 1:1 and 3:4 aspect ratios optimized for LinkedIn profiles, company directories, resumes, and curriculum vitae.',
    photo: {
      minWidth: 400,
      maxWidth: 1200,
      minHeight: 400,
      maxHeight: 1200,
      exactWidth: 600,
      exactHeight: 600,
      aspectRatio: 1,
      aspectRatioLabel: '1 : 1 Square (600 × 600 px)',
      minSizeKb: 20,
      maxSizeKb: 500,
      formats: ['image/jpeg', 'image/png'],
      background: 'Professional office, outdoor, or neutral studio',
      specialInstructions: [
        'Head and shoulders centered with friendly natural expression',
        'Ideal for LinkedIn, Slack avatars, and CV header photos',
        'High clarity with file size balanced under 500 KB'
      ]
    },
    signature: {
      minWidth: 200,
      maxWidth: 600,
      minHeight: 80,
      maxHeight: 250,
      exactWidth: 400,
      exactHeight: 150,
      aspectRatio: 8 / 3,
      aspectRatioLabel: '8 : 3 (400 × 150 px)',
      minSizeKb: 5,
      maxSizeKb: 100,
      formats: ['image/jpeg', 'image/png'],
      background: 'Clean paper or transparent background',
      specialInstructions: [
        'Digital signature for PDFs, contracts, and letters of recommendation'
      ]
    }
  },
  {
    id: 'passport-us',
    name: 'US Passport & Visa (Department of State)',
    code: 'US-VISA',
    category: 'Passports & Visas',
    applicationCycle: 'US Dept of State Consular Standard (DS-160 / Diversity Visa)',
    lastVerifiedDate: 'Verified October 2024 (US Travel Regulations 22 CFR 51.26)',
    sourceAuthority: 'U.S. Department of State - Bureau of Consular Affairs',
    sourceUrl: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html',
    description: 'Exact 2 × 2 inches (51 × 51 mm, 600 × 600 px at 300 DPI) standard for US Passports, DS-160 online visa applications, and Green Card Lottery.',
    photo: {
      minWidth: 600,
      maxWidth: 1200,
      minHeight: 600,
      maxHeight: 1200,
      exactWidth: 600,
      exactHeight: 600,
      aspectRatio: 1,
      aspectRatioLabel: '1 : 1 (2 × 2 inches / 600 × 600 px)',
      physicalWidthMm: 51,
      physicalHeightMm: 51,
      dpi: 300,
      minSizeKb: 10,
      maxSizeKb: 240,
      formats: ['image/jpeg'],
      background: 'Plain white or off-white background',
      specialInstructions: [
        'Head height must be between 50% and 69% of overall image height (1 to 1 3/8 inches)',
        'Eye height must be between 56% and 69% from bottom of image',
        'Neutral facial expression with both eyes directly open; no glasses permitted',
        'Maximum file size capped at 240 KB; dimensions must be square'
      ]
    },
    signature: {
      minWidth: 200,
      maxWidth: 500,
      minHeight: 80,
      maxHeight: 200,
      exactWidth: 350,
      exactHeight: 140,
      aspectRatio: 2.5 / 1,
      aspectRatioLabel: '5 : 2 (350 × 140 px)',
      minSizeKb: 5,
      maxSizeKb: 100,
      formats: ['image/jpeg'],
      background: 'Clean white background',
      specialInstructions: [
        'Signed in dark black or blue ink pen'
      ]
    }
  },
  {
    id: 'passport-schengen',
    name: 'Schengen European Visa (EU Consulate)',
    code: 'SCHENGEN',
    category: 'Passports & Visas',
    applicationCycle: 'ICAO Standard 9303 / Visa Code Regulation (EC) No 810/2009',
    lastVerifiedDate: 'Verified September 2024 (European Commission Visa Policy)',
    sourceAuthority: 'European Commission Directorate-General for Migration and Home Affairs',
    sourceUrl: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en',
    description: 'Standard 35 × 45 mm biometric photograph for European Schengen travel visas (France, Germany, Italy, Switzerland, Spain, etc.).',
    photo: {
      minWidth: 350,
      maxWidth: 600,
      minHeight: 450,
      maxHeight: 800,
      exactWidth: 413,
      exactHeight: 531,
      aspectRatio: 35 / 45,
      aspectRatioLabel: '3.5 : 4.5 (35 × 45 mm at 300 DPI)',
      physicalWidthMm: 35,
      physicalHeightMm: 45,
      dpi: 300,
      minSizeKb: 10,
      maxSizeKb: 300,
      formats: ['image/jpeg'],
      background: 'Light grey or neutral light background without patterns',
      specialInstructions: [
        'Face must cover 70% to 80% of photo from chin baseline to crown (32 to 36 mm)',
        'No reflections on eyeglasses; mouth closed with neutral expression',
        'Strictly within 10 KB to 300 KB; captured within previous 6 months'
      ]
    },
    signature: {
      minWidth: 200,
      maxWidth: 400,
      minHeight: 80,
      maxHeight: 160,
      exactWidth: 300,
      exactHeight: 120,
      aspectRatio: 2.5 / 1,
      aspectRatioLabel: '5 : 2 (300 × 120 px)',
      minSizeKb: 5,
      maxSizeKb: 100,
      formats: ['image/jpeg'],
      background: 'White paper',
      specialInstructions: [
        'Signed in black ink on clean white unlined sheet'
      ]
    }
  },
  {
    id: 'gate-2025',
    name: 'GATE (IIT Roorkee / GATE Committee)',
    code: 'GATE',
    category: 'Application Portals',
    applicationCycle: '2025 - 2026 Examination Notification Cycle',
    lastVerifiedDate: 'Verified September 2024 (IIT Roorkee Information Brochure Section 4.4.7)',
    sourceAuthority: 'Indian Institute of Technology Roorkee & National Coordination Board (NCB-GATE)',
    sourceUrl: 'https://gate2025.iitr.ac.in',
    description: 'Exact dimensions and byte boundaries enforced by the GOAPS application portal for postgraduate engineering admissions.',
    photo: {
      minWidth: 480,
      maxWidth: 480,
      minHeight: 640,
      maxHeight: 640,
      exactWidth: 480,
      exactHeight: 640,
      aspectRatio: 480 / 640,
      aspectRatioLabel: '3 : 4 (480 × 640 px)',
      physicalWidthMm: 35,
      physicalHeightMm: 45,
      dpi: 300,
      minSizeKb: 5,
      maxSizeKb: 200,
      formats: ['image/jpeg'],
      background: 'Plain white or very light background',
      specialInstructions: [
        'Face must occupy 60% to 70% of photograph height',
        'Both ears, forehead, and chin clearly visible without dark shadows',
        'Spectacles allowed only if without tinted glasses or glare reflections',
        'File size strictly between 5 KB and 200 KB'
      ]
    },
    signature: {
      minWidth: 280,
      maxWidth: 560,
      minHeight: 80,
      maxHeight: 160,
      exactWidth: 560,
      exactHeight: 160,
      aspectRatio: 560 / 160,
      aspectRatioLabel: '7 : 2 (560 × 160 px)',
      minSizeKb: 5,
      maxSizeKb: 200,
      formats: ['image/jpeg'],
      background: 'White paper without lines or grids',
      specialInstructions: [
        'Signed in dark black or blue ink pen only',
        'Block / capital letter signatures will be rejected by the portal'
      ]
    }
  },
  {
    id: 'upsc-cse',
    name: 'UPSC (Civil Services / One Time Registration)',
    code: 'UPSC',
    category: 'Application Portals',
    applicationCycle: '2025 Examination Notifications (Civil Services CSE / NDA / CDS)',
    lastVerifiedDate: 'Verified January 2025 (UPSC OTR Portal Technical Guidelines Annexure I)',
    sourceAuthority: 'Union Public Service Commission (Govt. of India)',
    sourceUrl: 'https://upsconline.nic.in',
    description: 'One-Time Registration (OTR) standard mandating 1:1 square ratio with candidate name and date stamp at the bottom.',
    photo: {
      minWidth: 350,
      maxWidth: 1000,
      minHeight: 350,
      maxHeight: 1000,
      exactWidth: 500,
      exactHeight: 500,
      aspectRatio: 1,
      aspectRatioLabel: '1 : 1 (350 × 350 to 1000 × 1000 px)',
      minSizeKb: 20,
      maxSizeKb: 300,
      formats: ['image/jpeg'],
      background: 'Plain light grey or pure white background',
      specialInstructions: [
        'Photograph must not be older than 10 days from opening of application window',
        'Name of candidate and date of photograph capture must appear clearly at the bottom',
        'Face must cover 3/4th of photograph area; frontal pose with neutral expression',
        'File size strictly between 20 KB and 300 KB'
      ]
    },
    signature: {
      minWidth: 350,
      maxWidth: 1000,
      minHeight: 350,
      maxHeight: 1000,
      exactWidth: 500,
      exactHeight: 500,
      aspectRatio: 1,
      aspectRatioLabel: '1 : 1 (350 × 350 to 1000 × 1000 px)',
      minSizeKb: 20,
      maxSizeKb: 300,
      formats: ['image/jpeg'],
      background: 'Plain white unlined paper',
      specialInstructions: [
        'Signed with black ink ballpoint or gel pen',
        'Running cursive handwriting only; block capital signatures will be invalidated',
        'File size strictly between 20 KB and 300 KB'
      ]
    }
  },
  {
    id: 'custom-spec',
    name: 'Custom Dimensions & Weight',
    code: 'CUSTOM',
    category: 'Custom',
    applicationCycle: 'Freely Configurable',
    lastVerifiedDate: 'User-Defined Settings',
    sourceAuthority: 'Manual User Configuration',
    sourceUrl: '',
    description: 'Tailor any custom width, height, aspect ratio, and file size boundary for your specific workflow or portal.',
    isCustom: true,
    photo: {
      minWidth: 100,
      maxWidth: 3000,
      minHeight: 100,
      maxHeight: 3000,
      exactWidth: 800,
      exactHeight: 800,
      aspectRatio: 1,
      aspectRatioLabel: 'Custom Dimensions',
      minSizeKb: 5,
      maxSizeKb: 500,
      formats: ['image/jpeg', 'image/png'],
      background: 'Any background',
      specialInstructions: [
        'Freely adjust width and height in the custom settings'
      ]
    },
    signature: {
      minWidth: 100,
      maxWidth: 1200,
      minHeight: 40,
      maxHeight: 600,
      exactWidth: 400,
      exactHeight: 150,
      aspectRatio: 8 / 3,
      aspectRatioLabel: 'Custom Dimensions',
      minSizeKb: 5,
      maxSizeKb: 100,
      formats: ['image/jpeg', 'image/png'],
      background: 'Any background',
      specialInstructions: [
        'Freely adjust signature sizing'
      ]
    }
  }
];

export const DEFAULT_PRESET_ID = 'universal-quick';
