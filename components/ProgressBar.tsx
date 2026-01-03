
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3">
        <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">{label || 'Progress'}</span>
        <span className="text-2xl font-black text-blue-600 tabular-nums">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden border-4 border-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/50">
        <div 
          className="bg-blue-600 h-full transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          style={{ width: `${Math.max(3, percentage)}%` }}
        />
      </div>
    </div>
  );
};
