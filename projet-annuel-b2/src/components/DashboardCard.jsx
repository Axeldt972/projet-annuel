import React from 'react';

export default function DashboardCard({ icon, title, value, color }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-white rounded-xl shadow p-6 min-w-[160px] min-h-[120px] transition hover:shadow-lg border-t-4 ${color}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-500 mt-1 text-sm">{title}</div>
    </div>
  );
}
