import React from 'react';
import { X, Network, HardDrive } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

export default function Inspector({ node, onClose }) {
  const { setNodes } = useReactFlow();

  const handleChange = (field, value) => {
    setNodes(nds => nds.map(n => {
      if (n.id === node.id) {
        return { ...n, data: { ...n.data, [field]: value } };
      }
      return n;
    }));
  };

  const isHost = ['pc', 'server', 'laptop', 'printer', 'smartphone', 'web_server', 'db_server', 'dns_server', 'dhcp_server', 'iot_camera'].includes(node.data.type);
  const isRouter = ['router', 'firewall', 'cloud_wan'].includes(node.data.type);
  
  return (
    <div className="absolute top-4 left-4 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-30 overflow-hidden flex flex-col">
      <div className="bg-slate-800 text-white p-3 flex justify-between items-center">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <HardDrive size={16} /> Properties
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Device Name</label>
          <input 
            type="text" 
            className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={node.data.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        {isHost && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">IP Address</label>
              <input 
                type="text" 
                className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                value={node.data.ip || ''}
                onChange={(e) => handleChange('ip', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Subnet Mask</label>
              <input 
                type="text" 
                className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                value={node.data.subnet || ''}
                onChange={(e) => handleChange('subnet', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Default Gateway</label>
              <input 
                type="text" 
                className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                value={node.data.gateway || ''}
                onChange={(e) => handleChange('gateway', e.target.value)}
              />
            </div>
          </>
        )}

        {isRouter && (
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
             <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
               <Network size={14} /> Router Interfaces
             </div>
             <p className="text-xs text-slate-600">
               In this simple simulation, routers automatically route traffic between connected subnets.
             </p>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200">
          <button
            onClick={() => {
              setNodes(nds => nds.filter(n => n.id !== node.id));
              onClose();
            }}
            className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Delete Component
          </button>
        </div>
      </div>
    </div>
  );
}
