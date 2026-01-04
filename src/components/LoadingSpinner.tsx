import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * Displays an animated spinning circle to indicate something is loading
 * Available in 3 sizes: small (sm), medium (md), and large (lg)
 * 
 * Example usage:
 * - <LoadingSpinner /> for default medium size
 * - <LoadingSpinner size="sm" /> for small size
 * - <LoadingSpinner size="lg" /> for large size
 */

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  // Map size names to Tailwind CSS classes for height and width
  const sizeClasses = {
    sm: 'h-4 w-4',   // 16px square
    md: 'h-8 w-8',   // 32px square
    lg: 'h-12 w-12', // 48px square
  };

  return (
    <div className="flex justify-center items-center">
      {/* 
        The spinner itself: a circle with a border
        - animate-spin makes it rotate continuously
        - rounded-full makes it a perfect circle
        - border-gray-200 is the background ring color
        - border-t-primary-600 colors just the top border (creates the spinning effect)
      */}
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
