import { useState } from 'react';
import { FileCode, Download, Copy, Check, Save, Share2, QrCode, X, Sparkles } from 'lucide-react';
import { useBrewfile } from '../../hooks/useBrewfile';
import { Spinner } from '../common/Spinner';
import { useTranslation } from '../../i18n';

export const BrewfileView: React.FC = () => {
  const { t } = useTranslation();
  const { content, loading, copied, savedPath, exportBrewfile, saveToFile, copyToClipboard } =
    useBrewfile();
  const [saving, setSaving] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShareCmd, setCopiedShareCmd] = useState<boolean>(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveToFile();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const getShareCommand = (): string => {
    if (!content) return '';
    // Single line terminal command to restore packages on any Mac
    const lines = content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .join('; ');
    return `brew install ${lines.replace(/brew /g, '').replace(/cask /g, '--cask ')}`;
  };

  const copyShareCommand = () => {
    const cmd = getShareCommand();
    navigator.clipboard.writeText(cmd);
    setCopiedShareCmd(true);
    setTimeout(() => setCopiedShareCmd(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 glass-panel flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.brewfile.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.brewfile.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {content && (
            <>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 font-semibold dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 dark:text-indigo-300 dark:border-indigo-500/30 text-xs transition cursor-pointer shadow-xs"
                title="1-Click Share & Duplicate setup for another Mac"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
                <span>{t.brewfile.shareSetup}</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-semibold dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-emerald-300 dark:border-emerald-500/30 text-xs transition cursor-pointer disabled:opacity-50 shadow-xs"
                title="Save Brewfile to your Home directory (~/Brewfile)"
              >
                {saving ? (
                  <Spinner size="sm" className="text-emerald-700 dark:text-emerald-300" />
                ) : savedPath ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                )}
                <span>{savedPath ? t.brewfile.saved : t.brewfile.saveBrewfile}</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 font-semibold dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 dark:border-white/10 text-xs transition cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.brewfile.copied : t.brewfile.copy}</span>
              </button>
            </>
          )}

          <button
            onClick={exportBrewfile}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Spinner size="sm" className="text-slate-950" /> : <Download className="w-3.5 h-3.5" />}
            <span>{loading ? t.brewfile.generating : content ? t.brewfile.regenerate : t.brewfile.generateBrewfile}</span>
          </button>
        </div>
      </div>

      {/* Saved Path Banner */}
      {savedPath && (
        <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-500/10 border-b border-emerald-300 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{t.brewfile.savedTo} {savedPath}</span>
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Spinner size="lg" label={t.brewfile.generating} />
          </div>
        ) : content === null ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-3">
            <FileCode className="w-10 h-10 text-slate-400 dark:text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.brewfile.noBrewfileYet}</p>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              {t.brewfile.noBrewfileDesc}
            </p>
            <button
              onClick={exportBrewfile}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs cursor-pointer"
            >
              {t.brewfile.generateBrewfile}
            </button>
          </div>
        ) : (
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t.brewfile.brewfileOutput} ({content.split('\n').filter(Boolean).length} entries):</span>
            </div>
            <pre
              dir="ltr"
              className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-white/10 font-mono text-xs text-slate-900 dark:text-emerald-400/90 leading-relaxed overflow-x-auto select-text shadow-inner text-left"
            >
              {content}
            </pre>
          </div>
        )}
      </div>

      {/* 1-Click Multi-Mac Setup Exporter & QR Share Modal */}
      {showShareModal && content && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in">
          <div
            className="w-full max-w-md glass-modal rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">{t.brewfile.duplicateMacSetup}</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                {t.brewfile.duplicateMacDesc}
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-amber-300 break-all select-all flex items-center justify-between gap-2" dir="ltr">
                <span className="truncate flex-1 text-left">{getShareCommand()}</span>
                <button
                  onClick={copyShareCommand}
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 shrink-0 transition cursor-pointer"
                  title="Copy 1-line setup command"
                >
                  {copiedShareCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* QR Code section */}
              <div className="pt-3 border-t border-white/5 flex flex-col items-center text-center space-y-2">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                  {t.brewfile.scanQrCode}
                </span>
                <div className="p-2 bg-white rounded-xl shadow-lg border border-white/20">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      getShareCommand()
                    )}`}
                    alt="Brewfile Setup QR Code"
                    className="w-36 h-36 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
