import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { DEVICE_CATALOG } from '../utils/networkCatalogData';
import { Monitor } from 'lucide-react';

export default function DeviceNode({ data, selected }) {
  // Find catalog data
  const catalogEntry = useMemo(() => {
    return DEVICE_CATALOG.find(d => d.id === data.type || d.id === data.catalogId) || DEVICE_CATALOG[0];
  }, [data.type, data.catalogId]);

  const Icon = catalogEntry.icon || Monitor;
  const colorClass = catalogEntry.color || 'bg-slate-100 text-slate-700 border-slate-500';

  // Calculate Handles (Pins)
  const ports = catalogEntry.ports || ['Eth0'];
  
  return (
    <div className={`
      relative bg-white rounded-lg shadow-sm border-2 w-32 pb-2
      transition-all duration-200 group
      ${selected ? 'ring-4 ring-blue-200 border-blue-500 shadow-lg' : colorClass}
      ${data.isSimulating ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}
    `}>
      
      {/* Dynamic Port Terminals based on device spec */}
      {ports.map((portName, index) => {
        // Distribute pins across top and bottom based on index
        const isTop = index % 2 === 0;
        const position = isTop ? Position.Top : Position.Bottom;
        const offset = Math.floor(index / 2) * 20; // space them out
        
        return (
          <div key={portName} className="group/pin">
            <Handle 
              type={isTop ? 'target' : 'source'} 
              position={position} 
              id={portName} 
              style={{ left: `calc(50% + ${offset}px)` }}
              className="!bg-slate-300 !w-3 !h-3 hover:!bg-blue-500 hover:!scale-125 hover:!z-50 transition-transform" 
            />
            {/* Tooltip for pin name visible on hover */}
            <div className={`absolute ${isTop ? '-top-6' : '-bottom-6'} left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50`}>
              {portName}
            </div>
          </div>
        );
      })}

      {/* For switches and routers, add explicit left/right handlers for aesthetic wiring */}
      {['switch', 'router', 'firewall', 'hub'].includes(catalogEntry.type) && (
        <>
          <Handle type="source" position={Position.Left} id="left-link" className="!bg-slate-300 !w-3 !h-3 hover:!bg-blue-500 hover:!scale-125" />
          <Handle type="source" position={Position.Right} id="right-link" className="!bg-slate-300 !w-3 !h-3 hover:!bg-blue-500 hover:!scale-125" />
        </>
      )}

      {/* Header / Graphic Area */}
      <div className="flex flex-col items-center pt-4 pb-2 relative">
        <Icon size={32} className="mb-2" strokeWidth={1.5} />
        <span className="text-xs font-bold text-slate-800 text-center px-1 block truncate w-full">
          {data.name}
        </span>
      </div>

      {/* Info Area */}
      <div className="px-2 text-center min-h-[16px]">
        {data.ip && (
          <div className="text-[9px] font-mono text-slate-600 bg-slate-100 border border-slate-200 rounded px-1 py-0.5 inline-block">
            {data.ip}
          </div>
        )}
      </div>

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
