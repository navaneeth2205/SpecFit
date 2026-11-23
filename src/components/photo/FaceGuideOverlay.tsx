import React from 'react';
import { FaceGuideSettings } from '../../types';

interface FaceGuideOverlayProps {
  settings: FaceGuideSettings;
  width: number;
  height: number;
}

export const FaceGuideOverlay: React.FC<FaceGuideOverlayProps> = ({
  settings,
  width,
  height
}) => {
  if (!settings.visible || width <= 0 || height <= 0) return null;

  const { headOvalScale, verticalOffset } = settings;

  const centerX = width / 2;
  // Standard passport photo framing: center of face is typically ~45% from top
  const centerY = height * 0.45 + verticalOffset;
  const radiusX = (width * 0.28) * headOvalScale;
  const radiusY = (height * 0.28) * headOvalScale;

  // Guidelines positions
  const topMarginY = height * 0.08;
  const crownY = centerY - radiusY;
  const eyeLineY = centerY - radiusY * 0.15;
  const chinLineY = centerY + radiusY * 0.85;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(38, 59, 53, 0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Subtle grid */}
        <rect width="100%" height="100%" fill="url(#gridPattern)" />

        {/* Vertical Center Midline */}
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={height}
          stroke="#263B35"
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeOpacity="0.6"
        />

        {/* Top Margin Boundary */}
        <line
          x1={width * 0.1}
          y1={topMarginY}
          x2={width * 0.9}
          y2={topMarginY}
          stroke="#263B35"
          strokeWidth="1"
          strokeDasharray="2 2"
          strokeOpacity="0.4"
        />
        <text
          x={width * 0.12}
          y={topMarginY - 4}
          fill="#263B35"
          fontSize="10"
          fontFamily="Inter, sans-serif"
          opacity="0.75"
        >
          TOP CLEARANCE (8-10%)
        </text>

        {/* Head Crown Boundary */}
        <line
          x1={centerX - radiusX * 0.8}
          y1={crownY}
          x2={centerX + radiusX * 0.8}
          y2={crownY}
          stroke="#39765A"
          strokeWidth="1"
          strokeOpacity="0.8"
        />
        <text
          x={centerX}
          y={crownY - 5}
          fill="#39765A"
          fontSize="9"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
        >
          CROWN OF HEAD
        </text>

        {/* Eye Level Line */}
        <line
          x1={centerX - radiusX * 1.2}
          y1={eyeLineY}
          x2={centerX + radiusX * 1.2}
          y2={eyeLineY}
          stroke="#263B35"
          strokeWidth="1"
          strokeDasharray="3 3"
          strokeOpacity="0.7"
        />
        <text
          x={centerX + radiusX * 1.25}
          y={eyeLineY + 3}
          fill="#263B35"
          fontSize="9"
          fontFamily="Inter, sans-serif"
          opacity="0.7"
        >
          EYE LEVEL
        </text>

        {/* Chin Line */}
        <line
          x1={centerX - radiusX * 0.7}
          y1={chinLineY}
          x2={centerX + radiusX * 0.7}
          y2={chinLineY}
          stroke="#A87532"
          strokeWidth="1"
          strokeOpacity="0.8"
        />
        <text
          x={centerX}
          y={chinLineY + 12}
          fill="#A87532"
          fontSize="9"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
        >
          CHIN BASELINE (60-70% COVERAGE)
        </text>

        {/* Anthropometric Head & Face Oval */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={radiusX}
          ry={radiusY}
          fill="none"
          stroke="#263B35"
          strokeWidth="1.5"
          strokeOpacity="0.75"
        />

        {/* Shoulder indicator arcs */}
        <path
          d={`M ${centerX - radiusX * 1.8} ${height} Q ${centerX - radiusX * 1.2} ${centerY + radiusY * 1.4} ${centerX - radiusX * 0.5} ${centerY + radiusY * 1.1}`}
          fill="none"
          stroke="#263B35"
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeOpacity="0.4"
        />
        <path
          d={`M ${centerX + radiusX * 1.8} ${height} Q ${centerX + radiusX * 1.2} ${centerY + radiusY * 1.4} ${centerX + radiusX * 0.5} ${centerY + radiusY * 1.1}`}
          fill="none"
          stroke="#263B35"
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeOpacity="0.4"
        />

        {/* Outer Corner Frame Marks */}
        <path
          d={`M 15 25 L 15 15 L 25 15 M ${width - 25} 15 L ${width - 15} 15 L ${width - 15} 25 M 15 ${height - 25} L 15 ${height - 15} L 25 ${height - 15} M ${width - 25} ${height - 15} L ${width - 15} ${height - 15} L ${width - 15} ${height - 25}`}
          fill="none"
          stroke="#263B35"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
      </svg>
    </div>
  );
};
