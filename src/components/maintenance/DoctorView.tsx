import { Stethoscope, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { BrewDoctorIssue } from '../../types';
import { Spinner } from '../common/Spinner';
import { useTranslation } from '../../i18n';

interface DoctorViewProps {
  issues: BrewDoctorIssue[] | null;
  loading: boolean;
  onRunDoctor: () => void;
}

export const DoctorView: React.FC<DoctorViewProps> = ({ issues, loading, onRunDoctor }) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 glass-panel flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.doctor.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.doctor.subtitle}</p>
          </div>
        </div>

        <button
          onClick={onRunDoctor}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs cursor-pointer disabled:opacity-50 shadow-md shadow-amber-500/10"
        >
          {loading ? <Spinner size="sm" className="text-slate-950" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{loading ? t.doctor.diagnosing : t.doctor.runDiagnostics}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Spinner size="lg" label={t.doctor.running} />
          </div>
        ) : issues === null ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-3">
            <Stethoscope className="w-10 h-10 text-slate-400 dark:text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.doctor.noDiagnosticsYet}</p>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              {t.doctor.noDiagnosticsDesc}
            </p>
            <button
              onClick={onRunDoctor}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs cursor-pointer"
            >
              {t.doctor.runDiagnostics}
            </button>
          </div>
        ) : issues.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.doctor.allGoodTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.doctor.allGoodDesc}</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl pb-8">
            <div className="p-3.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between shadow-xs">
              <span className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>{t.doctor.issuesFound} ({issues.length} {t.doctor.potentialWarnings})</span>
              </span>
            </div>

            <div className="space-y-3">
              {issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl glass-card border border-slate-200 dark:border-white/10 space-y-2.5 text-xs shadow-sm"
                >
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{issue.title}</span>
                  </div>
                  <pre
                    dir="ltr"
                    className="text-left whitespace-pre-wrap font-mono text-[11px] text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-300 dark:border-white/5 leading-relaxed"
                  >
                    {issue.message}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
