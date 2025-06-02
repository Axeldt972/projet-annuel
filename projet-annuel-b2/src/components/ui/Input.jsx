import React from 'react';

const base =
  'w-full px-4 py-2 rounded-lg border border-gray-200 bg-white/60 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 placeholder-gray-400';

export default function Input({ type = 'text', className = '', ...props }) {
  return (
    <input
      type={type}
      className={`${base} ${className}`}
      {...props}
    />
  );
}
