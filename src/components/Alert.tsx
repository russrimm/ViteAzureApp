import { XCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';

/**
 * Alert Component
 * 
 * Displays colored notification messages to the user
 * Can show success messages (green), errors (red), warnings (yellow), or info (blue)
 * Optionally includes a close button
 * 
 * Example usage:
 * <Alert type="success" title="Success!" message="Your changes were saved" />
 * <Alert type="error" message="Something went wrong" onClose={() => setError(null)} />
 */

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';  // Type of alert determines the color
  title?: string;                                     // Optional title text
  message: string;                                    // The main message (required)
  onClose?: () => void;                               // Optional function to call when close button is clicked
}

const Alert: React.FC<AlertProps> = ({ type = 'info', title, message, onClose }) => {
  // Object mapping alert types to their Tailwind CSS color classes
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    // Apply the appropriate color classes based on the type
    <div className={`border rounded-md p-4 ${typeClasses[type]}`}>
      <div className="flex">
        <div className="flex-1">
          {/* Only show title if one was provided */}
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {/* Only show close button if onClose function was provided */}
        {onClose && (
          <button onClick={onClose} className="ml-3 shrink-0" aria-label="Close alert">
            <XCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
