import React from 'react';
import { AlertTriangle, ArrowUpCircle, Trash2, X } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  details?: string[];
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'warning',
  details,
}) => {
  const { t, dir } = useTranslation();
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const resolvedConfirmText = confirmText || t.common.confirm;
  const resolvedCancelText = cancelText || t.common.cancel;
  const isUpgrade = type === 'info' || resolvedConfirmText.toLowerCase().includes('upgrade');

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md glass-modal rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                isDanger
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : isUpgrade
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                  : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
              }`}
            >
              {isDanger ? (
                <Trash2 className="w-4 h-4" />
              ) : isUpgrade ? (
                <ArrowUpCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message & Details */}
        <div className="p-5 space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed text-slate-200">{message}</p>

          {details && details.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1 font-mono text-[11px]">
              <span className="text-slate-400 font-sans text-[10px] uppercase tracking-wider font-semibold">
                {t.common.affectedItems}:
              </span>
              <div className="max-h-24 overflow-y-auto space-y-0.5 text-amber-300">
                {details.map((d, i) => (
                  <div key={i} className="truncate">
                    • {d}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition cursor-pointer"
          >
            {resolvedCancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl font-semibold text-xs transition cursor-pointer shadow-md ${
              isDanger
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
