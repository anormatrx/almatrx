import React from 'react';

interface CyberBadgeProps {
  label: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

const CyberBadge: React.FC<CyberBadgeProps> = ({ label, type, className = '' }) => {
  const styles = {
    success: 'bg-green-500/10 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-[#00A3FF]/10 text-[#00A3FF] border-[#00A3FF]/30',
    neutral: 'bg-gray-800 text-gray-400 border-gray-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${styles[type]} ${className}`}>
      {label}
    </span>
  );
};

export default CyberBadge;