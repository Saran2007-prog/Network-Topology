import React from 'react';
import { Monitor, Server, GitMerge, Router } from 'lucide-react';

const DEVICE_TYPES = [
  { id: 'pc', type: 'pc', label: 'PC / Workstation', icon: Monitor, color: 'bg-blue-100 text-blue-600' },
  { id: 'server', type: 'server', label: 'Server', icon: Server, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'switch', type: 'switch', label: 'Switch (L2)', icon: GitMerge, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'router', type: 'router', label: 'Router (L3)', icon: Router, color: 'bg-orange-100 text-orange-600' },
];

export default function ComponentDrawer() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-bold text-slate-800">Components</h2>
        <p className="text-xs text-slate-500 mt-1">Drag and drop devices onto the workplane</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">End Devices</h3>
          <div className="space-y-2">
            {DEVICE_TYPES.filter(d => ['pc', 'server'].includes(d.type)).map((device) => (
              <div
                key={device.id}
                className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-md transition-all active:cursor-grabbing"
                draggable
                onDragStart={(e) => onDragStart(e, device.type)}
              >
                <div className={`p-2 rounded-md ${device.color}`}>
                  <device.icon size={20} />
                </div>
                <span className="text-sm font-medium text-slate-700">{device.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Network Hardware</h3>
          <div className="space-y-2">
            {DEVICE_TYPES.filter(d => ['switch', 'router'].includes(d.type)).map((device) => (
              <div
                key={device.id}
                className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-md transition-all active:cursor-grabbing"
                draggable
                onDragStart={(e) => onDragStart(e, device.type)}
              >
                <div className={`p-2 rounded-md ${device.color}`}>
                  <device.icon size={20} />
                </div>
                <span className="text-sm font-medium text-slate-700">{device.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
