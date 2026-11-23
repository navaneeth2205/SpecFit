import React from 'react';
import { Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { ProcessedDocument } from '../../types';
import { Badge } from '../common/Badge';

interface ValidationPanelProps {
  photoDoc: ProcessedDocument | null;
  signatureDoc: ProcessedDocument | null;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  photoDoc,
  signatureDoc
}) => {
  const hasDocuments = !!photoDoc || !!signatureDoc;
  const allValidated =
    photoDoc?.validation.passed && signatureDoc?.validation.passed;

  return (
    <div className="bg-white border border-[#E6E8E4] rounded-xs p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E6E8E4]">
        <div>
          <h3 className="text-sm font-semibold text-[#1E2320] tracking-tight">
            Target Size & Format Verification
          </h3>
          <p className="text-xs text-[#676F69] mt-0.5">
            Real-time checks to ensure your outputs stay strictly inside target parameters.
          </p>
        </div>

        <div>
          {!hasDocuments ? (
            <Badge variant="neutral" size="sm">
              Waiting for files
            </Badge>
          ) : allValidated ? (
            <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5 text-[#2E7252]" />}>
              All Criteria Satisfied
            </Badge>
          ) : (
            <Badge variant="warning" size="sm" icon={<AlertCircle className="w-3.5 h-3.5 text-[#9B6A28]" />}>
              Adjustments Needed
            </Badge>
          )}
        </div>
      </div>

      {!hasDocuments ? (
        <div className="py-6 text-center text-xs text-[#676F69]">
          Upload or select sample files above to view automatic size and dimension verification.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Photo Verification */}
          <div className="border border-[#E6E8E4] rounded-xs p-3.5 bg-[#FAF9F6]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E6E8E4]">
              <span className="text-xs font-semibold text-[#1E2320] uppercase tracking-wider">
                Photo / Image Status
              </span>
              {photoDoc ? (
                photoDoc.validation.passed ? (
                  <Badge variant="success" size="sm">
                    4/4 Checks Passed
                  </Badge>
                ) : (
                  <Badge variant="error" size="sm">
                    Out of range
                  </Badge>
                )
              ) : (
                <Badge variant="neutral" size="sm">
                  Pending
                </Badge>
              )}
            </div>

            {photoDoc ? (
              <div className="space-y-2">
                {photoDoc.validation.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between text-xs py-1 border-b border-[#E6E8E4]/50 last:border-0"
                  >
                    <div className="flex items-start gap-1.5">
                      {item.passed ? (
                        <Check className="w-3.5 h-3.5 text-[#2E7252] shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#B54238] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-medium text-[#1E2320] block">{item.label}</span>
                        <span className="text-[11px] text-[#676F69]">Target: {item.required}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono text-[11px] font-medium ${
                          item.passed ? 'text-[#2E7252]' : 'text-[#B54238]'
                        }`}
                      >
                        {item.actual}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#676F69] py-4 text-center">
                No image added yet.
              </p>
            )}
          </div>

          {/* Signature Verification */}
          <div className="border border-[#E6E8E4] rounded-xs p-3.5 bg-[#FAF9F6]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E6E8E4]">
              <span className="text-xs font-semibold text-[#1E2320] uppercase tracking-wider">
                Signature / Ink Status
              </span>
              {signatureDoc ? (
                signatureDoc.validation.passed ? (
                  <Badge variant="success" size="sm">
                    4/4 Checks Passed
                  </Badge>
                ) : (
                  <Badge variant="error" size="sm">
                    Out of range
                  </Badge>
                )
              ) : (
                <Badge variant="neutral" size="sm">
                  Pending
                </Badge>
              )}
            </div>

            {signatureDoc ? (
              <div className="space-y-2">
                {signatureDoc.validation.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between text-xs py-1 border-b border-[#E6E8E4]/50 last:border-0"
                  >
                    <div className="flex items-start gap-1.5">
                      {item.passed ? (
                        <Check className="w-3.5 h-3.5 text-[#2E7252] shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#B54238] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-medium text-[#1E2320] block">{item.label}</span>
                        <span className="text-[11px] text-[#676F69]">Target: {item.required}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono text-[11px] font-medium ${
                          item.passed ? 'text-[#2E7252]' : 'text-[#B54238]'
                        }`}
                      >
                        {item.actual}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#676F69] py-4 text-center">
                No signature added yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
