import React from 'react';

export default function Checkbox({ className = '', ...props }) {
  return (
    <input
      type="checkbox"
      className={`rounded border-gray-300 text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 ${className}`}
      {...props}
    />
  );
}
