// src/components/driver/DriverStatusToggle.jsx
import React from 'react';

const DriverStatusToggle = ({ isOnline, onToggle }) => {
  return (
    <div className="flex items-center space-x-4 mt-4">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isOnline}
          onChange={onToggle}
          className="sr-only peer"
        />
        <div className={`
          w-11 h-6 bg-gray-600 rounded-full peer 
          peer-checked:bg-green-600
          peer-focus:ring-4 peer-focus:ring-green-300
          after:content-[''] after:absolute after:top-0.5 after:left-[2px]
          after:bg-white after:border-gray-300 after:border 
          after:rounded-full after:h-5 after:w-5 after:transition-all
          ${isOnline ? 'after:translate-x-full' : ''}
        `}></div>
        <span className="ml-3 text-sm font-medium text-gray-700">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </label>
    </div>
  );
};

export default DriverStatusToggle;