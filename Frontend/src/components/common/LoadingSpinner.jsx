// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  message = 'Loading...',
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <Loader className="h-full w-full text-blue-600" />
      </div>
      {message && <p className="text-gray-600 font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${overlay ? 'bg-black/30 backdrop-blur-sm' : 'bg-gray-50'}`}>
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

export default LoadingSpinner;