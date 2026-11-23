import { DocumentSpec, DocumentValidationResult, ValidationItem, ProcessedDocument } from '../types';

/**
 * Validates a processed document against the strict portal specification
 */
export function validateDocument(
  doc: Pick<ProcessedDocument, 'width' | 'height' | 'sizeKb' | 'sizeBytes' | 'format'>,
  spec: DocumentSpec
): DocumentValidationResult {
  const items: ValidationItem[] = [];

  // 1. File Format
  const formatPassed = spec.formats.includes(doc.format);
  const getFormatName = (f: string) => (f === 'image/jpeg' ? 'JPEG' : f === 'image/webp' ? 'WebP' : 'PNG');
  const formatLabel = getFormatName(doc.format);
  const requiredFormatLabel = spec.formats.map(getFormatName).join(' or ');

  items.push({
    key: 'format',
    label: 'File Format',
    passed: formatPassed,
    actual: formatLabel,
    required: requiredFormatLabel,
    severity: formatPassed ? 'info' : 'error'
  });

  // 2. Pixel Dimensions
  let dimensionsPassed = false;
  let requiredDimensionsLabel = '';

  if (spec.exactWidth && spec.exactHeight) {
    dimensionsPassed = doc.width === spec.exactWidth && doc.height === spec.exactHeight;
    requiredDimensionsLabel = `${spec.exactWidth} × ${spec.exactHeight} px`;
  } else {
    dimensionsPassed =
      doc.width >= spec.minWidth &&
      doc.width <= spec.maxWidth &&
      doc.height >= spec.minHeight &&
      doc.height <= spec.maxHeight;
    requiredDimensionsLabel = `${spec.minWidth}–${spec.maxWidth} × ${spec.minHeight}–${spec.maxHeight} px`;
  }

  items.push({
    key: 'dimensions',
    label: 'Dimensions',
    passed: dimensionsPassed,
    actual: `${doc.width} × ${doc.height} px`,
    required: requiredDimensionsLabel,
    severity: dimensionsPassed ? 'info' : 'error'
  });

  // 3. Aspect Ratio
  const currentRatio = doc.width / doc.height;
  const targetRatio = spec.aspectRatio;
  // Allow ±3% tolerance for pixel grid rounding
  const ratioPassed = Math.abs(currentRatio - targetRatio) / targetRatio < 0.03;

  items.push({
    key: 'aspectRatio',
    label: 'Aspect Ratio',
    passed: ratioPassed,
    actual: currentRatio.toFixed(3),
    required: `${targetRatio.toFixed(3)} (${spec.aspectRatioLabel})`,
    severity: ratioPassed ? 'info' : 'warning'
  });

  // 4. File Size (KB & Bytes)
  const minBytes = (spec.minSizeKb ?? 0) * 1024;
  const maxBytes = spec.maxSizeKb * 1024;
  const sizePassed = doc.sizeBytes >= minBytes && doc.sizeBytes <= maxBytes;
  const requiredSizeLabel =
    (spec.minSizeKb ?? 0) > 0
      ? `${spec.minSizeKb} KB – ${spec.maxSizeKb} KB`
      : `≤ ${spec.maxSizeKb} KB`;

  items.push({
    key: 'fileSize',
    label: 'File Size',
    passed: sizePassed,
    actual: `${doc.sizeKb} KB (${doc.sizeBytes.toLocaleString()} B)`,
    required: requiredSizeLabel,
    severity: sizePassed ? 'info' : 'error'
  });

  // All must pass
  const passed = items.every((item) => item.passed);

  return {
    passed,
    items
  };
}
