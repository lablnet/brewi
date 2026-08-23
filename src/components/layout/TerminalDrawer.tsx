import React, { useEffect, useRef, useState } from 'react';
import { Terminal, X, Trash2, StopCircle, ArrowDown, CheckCircle } from 'lucide-react';
import { stripAnsi } from '../../utils/ansi';

interface TerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: string[];
  isRunning: boolean;
  taskName: string;
  onCancelTask: () => void;
  onClearLogs: () => void;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  isRunning,
  taskName,
  onCancelTask,
  onClearLogs,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  return (
    <div className="h-64 w-full border-t border-white/10 glass-panel flex flex-col shrink-0 z-30 shadow-2xl transition-all">
      {/* Drawer Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-white/10 bg-slate-950/80 select-none">
        <div className="flex items-center space-x-2.5">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-medium text-slate-200">
            {taskName || 'Brew Console Output'}
          </span>
          {isRunning ? (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Running...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Ready</span>
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {isRunning && (
            <button
              onClick={onCancelTask}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[11px] font-medium transition cursor-pointer"
              title="Cancel current task"
            >
              <StopCircle className="w-3 h-3 text-red-400" />
              <span>Cancel</span>
            </button>
          )}

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-xs transition cursor-pointer ${autoScroll ? 'bg-white/10 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            title="Auto-scroll"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClearLogs}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 text-xs transition cursor-pointer"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 text-xs transition cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Output Terminal Screen */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed select-text space-y-0.5"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 italic">
            No command output yet. Run any brew task to see real-time output.
          </div>
        ) : (
          logs.map((rawLine, idx) => {
            const line = stripAnsi(rawLine);
            const isError = line.toLowerCase().includes('error') || line.includes('Error:');
            const isWarning = line.toLowerCase().includes('warning') || line.includes('Warning:');
            const isSuccess = line.includes('==>') || line.includes('🚀') || line.includes('🍺') || line.includes('✔');

            return (
              <div
                key={idx}
                className={`break-all ${isError
                    ? 'text-red-400 font-semibold'
                    : isWarning
                      ? 'text-amber-300'
                      : isSuccess
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                  }`}
              >
                {line}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
