import React from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;
  const color =
    type === 'success' ? 'bg-green-600' :
    type === 'error' ? 'bg-red-600' :
    type === 'warning' ? 'bg-yellow-600' :
    'bg-blue-600';
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold ${color} animate-fade-in-out`}
      role="alert"
      aria-live="assertive"
    >
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-white font-bold" aria-label="Fermer la notification">×</button>
      )}
    </div>
  );
}

// Animation CSS à ajouter dans Tailwind config ou global.css :
// @keyframes fade-in-out { 0% { opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { opacity: 0; } }
// .animate-fade-in-out { animation: fade-in-out 3s both; }
