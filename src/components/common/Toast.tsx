import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-150">
      <div
        className={`px-4 py-2.5 rounded-xl glass-modal border text-xs font-medium flex items-center space-x-2.5 shadow-2xl ${
          isSuccess
            ? 'border-emerald-500/40 text-emerald-300'
            : isError
            ? 'border-red-500/40 text-red-300'
            : 'border-amber-500/40 text-amber-300'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
