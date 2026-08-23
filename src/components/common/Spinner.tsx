import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const SIZE_CLASSES = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = 'text-amber-400',
  label,
}) => {
  const icon = <Loader2 className={`animate-spin ${SIZE_CLASSES[size]} ${className}`} />;

  if (!label) return icon;

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {icon}
      <span className="text-xs text-slate-400 font-medium">{label}</span>
    </div>
  );
};
