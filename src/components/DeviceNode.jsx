import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Monitor, Server, GitMerge, Router } from 'lucide-react';

const icons = {
  pc: Monitor,
  server: Server,
  switch: GitMerge,
  router: Router
};

const colors = {
  pc: 'border-blue-500 text-blue-600',
  server: 'border-indigo-500 text-indigo-600',
  switch: 'border-emerald-500 text-emerald-600',
  router: 'border-orange-500 text-orange-600'
};

export default function DeviceNode({ data, selected, type }) {
  const Icon = icons[data.type] || Monitor;
  const colorClass = colors[data.type] || 'border-slate-500 text-slate-600';

  return (
    <div className={`
      relative bg-white rounded-lg shadow-md border-2 w-32 pb-2
      transition-all duration-200 
      ${selected ? 'ring-4 ring-blue-200 border-blue-500 shadow-lg' : colorClass}
      ${data.isSimulating ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}
    `}>
      {/* Top Handles */}
      <Handle type="target" position={Position.Top} id="top" className="!bg-slate-400 !w-3 !h-3 hover:!bg-blue-500 hover:!scale-125" />
      
      {/* Header / Graphic Area */}
      <div className="flex flex-col items-center pt-4 pb-2">
        <Icon size={32} className="mb-2" strokeWidth={1.5} />
        <span className="text-xs font-bold text-slate-800 text-center px-1 block truncate w-full">
          {data.name}
        </span>
      </div>

      {/* Info Area */}
      <div className="px-2 text-center">
        {data.ip && (
          <div className="text-[9px] font-mono text-slate-500 bg-slate-100 rounded px-1 py-0.5 inline-block">
            {data.ip}
          </div>
        )}
      </div>

      {/* Bottom Handles */}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-slate-400 !w-3 !h-3 hover:!bg-blue-500 hover:!scale-125" />
      
      {/* Left/Right Handles for Routers/Switches to allow more connections visually */}
      {(data.type === 'switch' || data.type === 'router') && (
        <>
          <Handle type="source" position={Position.Left} id="left" className="!bg-slate-400 !w-3 !h-3 hover:!bg-blue-500 hover:!scale-125" />
          <Handle type="source" position={Position.Right} id="right" className="!bg-slate-400 !w-3 !h-3 hover:!bg-blue-500 hover:!scale-125" />
        </>
      )}

      {/* Ping Target Overlay (Simulation Mode) */}
      {data.isPingSource && (
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow animate-bounce">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
      
      {/* Simulation Result Overlays */}
      {data.pingResult === 'success' && (
        <div className="absolute inset-0 border-4 border-emerald-500 rounded-lg pointer-events-none animate-pulse opacity-75"></div>
      )}
      {data.pingResult === 'fail' && (
        <div className="absolute inset-0 border-4 border-red-500 rounded-lg pointer-events-none animate-pulse opacity-75"></div>
      )}
    </div>
  );
}
