import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSnowflake, FaVideo, FaChalkboard, FaCheck, FaTimes } from 'react-icons/fa';

export default function SalleCard({ salle }) {
  const navigate = useNavigate();
  const [showSignal, setShowSignal] = useState(false);

  // Equipements attendus dans chaque salle
  const EQUIPEMENTS = [
    { key: 'clim', label: 'Climatisation', icon: <FaSnowflake className="inline mr-1 text-blue-400" /> },
    { key: 'videoprojecteur', label: 'Vidéoprojecteur', icon: <FaVideo className="inline mr-1 text-purple-500" /> },
    { key: 'tableau', label: 'Tableau', icon: <FaChalkboard className="inline mr-1 text-green-600" /> },
  ];

  return (
    <div className="bg-white/80 rounded-2xl shadow-xl p-6 flex flex-col gap-2 items-start border border-blue-100">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl font-bold text-blue-900">{salle.nom}</span>
        <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1">Étage {salle.etage || '?'}</span>
      </div>
      <div className="flex flex-wrap gap-3 mb-2">
        {EQUIPEMENTS.map(eq => (
          <span key={eq.key} className="flex items-center gap-1 text-sm">
            {eq.icon}
            {eq.label} :
            {salle[eq.key] === true ? (
              <FaCheck className="text-green-500 ml-1" />
            ) : (
              <FaTimes className="text-red-400 ml-1" />
            )}
          </span>
        ))}
      </div>
      <button
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
        onClick={() => navigate(`/signalement?salle=${encodeURIComponent(salle.nom)}`)}
      >
        Signaler un problème
      </button>
    </div>
  );
}
