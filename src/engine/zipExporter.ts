import JSZip from 'jszip';
import { ProcessedDocument, PortalPreset } from '../types';

/**
 * Downloads a single Blob with a given filename using an ephemeral anchor tag
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Packages validated photo and signature into a structured ZIP archive with a verification certificate
 */
export async function createZipArchive(
  preset: PortalPreset,
  photoDoc: ProcessedDocument | null,
  signatureDoc: ProcessedDocument | null
): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `${preset.code}_Prepared_Documents`;
  const folder = zip.folder(folderName) || zip;

  const timestamp = new Date().toISOString();

  // Verification report content
  let reportText = `======================================================\n`;
  reportText += `SPECFIT VERIFICATION & SPECIFICATION CONFORMANCE AUDIT\n`;
  reportText += `======================================================\n\n`;
  reportText += `Portal Preset:        ${preset.name} (${preset.code})\n`;
  reportText += `Category:             ${preset.category}\n`;
  reportText += `Cycle:                ${preset.applicationCycle}\n`;
  reportText += `Verification Basis:   ${preset.lastVerifiedDate}\n`;
  reportText += `Timestamp:            ${timestamp}\n`;
  reportText += `Privacy Guarantee:    100% On-Device Processing (Zero Server Upload)\n\n`;

  if (photoDoc && photoDoc.blob) {
    const ext = photoDoc.format === 'image/jpeg' ? 'jpg' : 'png';
    const photoFileName = `${preset.code.toLowerCase()}_photograph.${ext}`;
    folder.file(photoFileName, photoDoc.blob);

    reportText += `--- PHOTOGRAPH SPECIFICATION CONFORMANCE ---\n`;
    reportText += `File Name:            ${photoFileName}\n`;
    reportText += `Pixel Dimensions:     ${photoDoc.width} × ${photoDoc.height} px (Req: ${preset.photo.aspectRatioLabel})\n`;
    reportText += `Actual File Size:     ${photoDoc.sizeKb} KB (${photoDoc.sizeBytes.toLocaleString()} bytes)\n`;
    reportText += `Size Limits:          ${preset.photo.minSizeKb} KB to ${preset.photo.maxSizeKb} KB\n`;
    reportText += `File Format:          ${photoDoc.format}\n`;
    reportText += `Validation Result:    ${photoDoc.validation.passed ? 'PASSED - ALL PORTAL CRITERIA SATISFIED' : 'WARNING/FAILED'}\n\n`;
  }

  if (signatureDoc && signatureDoc.blob) {
    const ext = signatureDoc.format === 'image/jpeg' ? 'jpg' : 'png';
    const sigFileName = `${preset.code.toLowerCase()}_signature.${ext}`;
    folder.file(sigFileName, signatureDoc.blob);

    reportText += `--- SIGNATURE SPECIFICATION CONFORMANCE ---\n`;
    reportText += `File Name:            ${sigFileName}\n`;
    reportText += `Pixel Dimensions:     ${signatureDoc.width} × ${signatureDoc.height} px (Req: ${preset.signature.aspectRatioLabel})\n`;
    reportText += `Actual File Size:     ${signatureDoc.sizeKb} KB (${signatureDoc.sizeBytes.toLocaleString()} bytes)\n`;
    reportText += `Size Limits:          ${preset.signature.minSizeKb} KB to ${preset.signature.maxSizeKb} KB\n`;
    reportText += `File Format:          ${signatureDoc.format}\n`;
    reportText += `Validation Result:    ${signatureDoc.validation.passed ? 'PASSED - ALL PORTAL CRITERIA SATISFIED' : 'WARNING/FAILED'}\n\n`;
  }

  reportText += `Notice: Generated using SpecFit client-side document engine. No copies or telemetry were stored.\n`;

  folder.file('specfit_conformance_report.txt', reportText);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
}
