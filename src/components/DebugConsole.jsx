import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function DebugConsole({ logs, onClear }) {
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  return (
    <div className={`bg-slate-900 border-t border-slate-700 flex flex-col transition-all duration-300 ${isOpen ? 'h-36 sm:h-48' : 'h-9 sm:h-10'}`}>
      {/* Header */}
      <div 
        className="h-9 sm:h-10 px-3 sm:px-4 flex items-center justify-between cursor-pointer hover:bg-slate-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs sm:text-sm">
          <Terminal size={15} className="text-blue-400" />
          Serial Monitor
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            className="text-slate-400 hover:text-white p-1"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            title="Clear Logs"
          >
            <Trash2 size={15} />
          </button>
          <div className="text-slate-400">
            {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
        </div>
      </div>

      {/* Log Content */}
      {isOpen && (
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-2.5 sm:p-4 bg-[#0d1117] font-mono text-xs sm:text-sm leading-relaxed"
        >
          {logs.map((log, i) => {
            let color = 'text-slate-300';
            if (log.type === 'success') color = 'text-green-400';
            if (log.type === 'error') color = 'text-red-400';
            if (log.type === 'info') color = 'text-blue-400';
            if (log.type === 'warn') color = 'text-yellow-400';

            return (
              <div key={i} className={`mb-1 ${color}`}>
                <span className="text-slate-600 mr-3">[{new Date().toLocaleTimeString()}]</span>
                {log.msg}
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="text-slate-600 italic">No output. Start a simulation to see logs.</div>
          )}
        </div>
      )}
    </div>
  );
}
