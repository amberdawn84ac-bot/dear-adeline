
'use client';

import React from 'react';

//================================================================================
// Type Definitions
//================================================================================

interface HandDrawnIllustrationProps {
  src: string;
  alt: string;
}

//================================================================================
// HandDrawnIllustration Component
//================================================================================

/**
 * A simple placeholder component for displaying hand-drawn illustrations.
 * In the future, this might integrate with RoughJS or other libraries
 * to apply a hand-drawn aesthetic to any image.
 */
export const HandDrawnIllustration: React.FC<HandDrawnIllustrationProps> = ({ src, alt }) => {
  return (
    <div className="flex justify-center my-4 p-2 bg-cream rounded-lg border-2 border-forest-dark transform rotate-1 shadow-md">
      {/* 
        TODO: Implement RoughJS for actual hand-drawn effect.
        For now, it's a regular image with some playful styling.
      */}
      <img src={src} alt={alt} className="max-w-full h-auto rounded-sm" style={{ transform: 'rotate(-2deg)' }} />
    </div>
  );
};
