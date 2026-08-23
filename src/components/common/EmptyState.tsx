import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconClassName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconClassName = 'w-10 h-10 text-slate-600 stroke-[1.5]',
}) => {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-3">
      <Icon className={iconClassName} />
      <p className="text-sm font-medium text-slate-300">{title}</p>
      <p className="text-xs text-slate-500 max-w-sm text-center">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
