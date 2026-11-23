export type DocumentType = 'photo' | 'signature';

export type SupportedFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export type FileSizeUnit = 'Bytes' | 'KB' | 'MB';

export type FileSizeMode = 'max_only' | 'min_max' | 'quality_only';

export type AspectRatioOption = 'free' | 'original' | '1:1' | '3:4' | '4:5' | '16:9' | '3:2' | 'custom';

export type ResizeMode = 'crop_to_fit' | 'resize_stretch' | 'fit_inside';

export interface DocumentSpec {
  exactWidth?: number;
  exactHeight?: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  aspectRatio: number; // width / height
  aspectRatioLabel: string;
  physicalWidthMm?: number;
  physicalHeightMm?: number;
  dpi?: number;
  minSizeKb: number;
  maxSizeKb: number;
  formats: SupportedFormat[];
  background: string;
  specialInstructions: string[];
}

export type PortalCategory = 
  | 'Universal & General'
  | 'Social Media & Web'
  | 'Profile & Resume'
  | 'Professional & Web'
  | 'Documents & Scans'
  | 'Signatures & Stamps'
  | 'Passports & Visas'
  | 'Application Portals'
  | 'Custom';

export interface PortalPreset {
  id: string;
  name: string;
  code: string;
  category: PortalCategory;
  applicationCycle: string;
  lastVerifiedDate: string;
  sourceAuthority: string;
  sourceUrl: string;
  description: string;
  photo: DocumentSpec;
  signature: DocumentSpec;
  isCustom?: boolean;
}

export interface ValidationItem {
  key: string;
  label: string;
  passed: boolean;
  actual: string;
  required: string;
  severity: 'error' | 'warning' | 'info';
}

export interface DocumentValidationResult {
  passed: boolean;
  items: ValidationItem[];
}

export interface ProcessedDocument {
  originalFile: File | null;
  originalUrl: string | null;
  canvas: HTMLCanvasElement | null;
  blob: Blob | null;
  objectUrl: string | null;
  fileName: string;
  width: number;
  height: number;
  sizeBytes: number;
  sizeKb: number;
  format: SupportedFormat;
  quality: number;
  validation: DocumentValidationResult;
  isDemo?: boolean;
  lastModified: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignatureFilterSettings {
  grayscale: boolean;
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  threshold: number;  // 0 to 255
  inkEnhancement: boolean;
  backgroundWhitening: boolean;
}

export interface FaceGuideSettings {
  visible: boolean;
  headOvalScale: number;
  verticalOffset: number;
}

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  originalWidth: number;
  originalHeight: number;
  originalSizeBytes: number;
  status: 'idle' | 'processing' | 'ready' | 'error';
  processedBlob?: Blob;
  processedUrl?: string;
  processedWidth?: number;
  processedHeight?: number;
  processedSizeBytes?: number;
  processedSizeKb?: number;
  errorMessage?: string;
  validationPassed?: boolean;
}
