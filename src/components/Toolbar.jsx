import React from 'react';
import { Settings, Play, Square, RotateCw, Trash2, Undo, Redo, Code, Download } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

export default function Toolbar({ isSimulating, onSimulateToggle, wireColor, setWireColor }) {
  const { deleteElements, getNodes, getEdges } = useReactFlow();

  const handleDelete = () => {
    const nodes = getNodes().filter(n => n.selected);
    const edges = getEdges().filter(e => e.selected);
    deleteElements({ nodes, edges });
  };

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-20">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
          N
        </div>
        <input 
          type="text" 
          defaultValue="Untitled Network *" 
          className="text-lg font-semibold text-slate-800 bg-transparent border-none focus:ring-0 outline-none w-48"
        />
      </div>

      {/* Center: Tools */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded shadow-sm transition" title="Rotate (Ctrl+R)">
          <RotateCw size={18} />
        </button>
        <button 
          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-white rounded shadow-sm transition" 
          title="Delete Selected (Del)"
          onClick={handleDelete}
        >
          <Trash2 size={18} />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded shadow-sm transition" title="Undo">
          <Undo size={18} />
        </button>
        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded shadow-sm transition" title="Redo">
          <Redo size={18} />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        
        {/* Wire Color Picker */}
        <select 
          className="bg-transparent text-sm font-medium outline-none text-slate-700 ml-1 cursor-pointer"
          value={wireColor}
          onChange={(e) => setWireColor(e.target.value)}
        >
          <option value="#22c55e">Green Wire</option>
          <option value="#3b82f6">Blue Wire</option>
          <option value="#ef4444">Red Wire</option>
          <option value="#eab308">Yellow Wire</option>
          <option value="#1e293b">Black Wire</option>
        </select>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button 
          className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
          title="Export JSON"
        >
          <Download size={16} /> Export
        </button>
        
        <select className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-700 outline-none">
          <option value="">Load Preset...</option>
          <option value="lan">Simple LAN</option>
          <option value="router">Router Gateway Demo</option>
        </select>

        <button 
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors ${
            isSimulating ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
          onClick={onSimulateToggle}
        >
          {isSimulating ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
        </button>
      </div>
    </div>
  );
}
