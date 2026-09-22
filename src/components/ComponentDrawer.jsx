import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES, DEVICE_CATALOG } from '../utils/networkCatalogData';

export default function ComponentDrawer({ isOpenOnMobile, onCloseMobile }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredInfo, setHoveredInfo] = useState(null);

  const onDragStart = (event, deviceId) => {
    event.dataTransfer.setData('application/reactflow', deviceId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleMouseEnter = (e, device) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredInfo({
      device,
      rect: {
        top: rect.top,
        left: rect.left,
        height: rect.height,
      },
    });
  };

  const handleMouseLeave = () => {
    setHoveredInfo(null);
  };

  const filteredDevices = DEVICE_CATALOG.filter(device => 
    device.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    device.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.osiLayer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <div className={`
        bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-40 select-none transition-all duration-300
        md:relative md:w-72 md:translate-x-0 md:static md:shadow-none
        fixed inset-y-0 right-0 w-80 max-w-[85vw]
        ${isOpenOnMobile ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'}
      `}>
        
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg">Components</h2>
            {onCloseMobile && (
              <button 
                className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-md"
                onClick={onCloseMobile}
              >
                <X size={20} />
              </button>
            )}
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search components..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Scrollable Catalog List */}
        <div 
          className="flex-1 overflow-y-auto p-3 space-y-5"
          onScroll={() => setHoveredInfo(null)}
        >
          {Object.values(CATEGORIES).map(category => {
            const devicesInCategory = filteredDevices.filter(d => d.category === category);
            
            if (devicesInCategory.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">{category}</h3>
                <div className="space-y-2">
                  {devicesInCategory.map((device) => {
                    const Icon = device.icon;
                    return (
                      <div
                        key={device.id}
                        className="relative flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-md active:bg-blue-50/50 transition-all active:cursor-grabbing group"
                        draggable
                        onDragStart={(e) => onDragStart(e, device.id)}
                        onMouseEnter={(e) => handleMouseEnter(e, device)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => {
                          if (window.onAddComponentFromCatalog) {
                            window.onAddComponentFromCatalog(device.id);
                          }
                          if (onCloseMobile) {
                            onCloseMobile();
                          }
                        }}
                      >
                      <div className={`p-2 rounded-md ${device.color} group-hover:scale-105 transition-transform`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-semibold text-slate-700">{device.label}</span>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5">{device.osiLayer}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredDevices.length === 0 && (
          <div className="text-center text-sm text-slate-400 mt-10">
            No components found for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Unclipped Floating Tooltip Rendered at Viewport Level */}
      {hoveredInfo && (
        <div 
          className="fixed w-72 p-3.5 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl z-50 flex flex-col gap-2 border border-slate-700/80 pointer-events-none transition-all duration-150"
          style={{
            top: `${Math.max(12, Math.min(hoveredInfo.rect.top, window.innerHeight - 220))}px`,
            right: `${window.innerWidth - hoveredInfo.rect.left + 12}px`
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${hoveredInfo.device.color}`}>
                {React.createElement(hoveredInfo.device.icon, { size: 16 })}
              </div>
              <span className="font-bold text-xs text-blue-400">{hoveredInfo.device.label}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 rounded-full text-slate-300 border border-slate-700">
              {hoveredInfo.device.osiLayer}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {hoveredInfo.device.description}
          </p>

          {hoveredInfo.device.forwardingLogic && (
            <div className="text-[10px] text-slate-400 bg-slate-800/90 p-2 rounded-lg border border-slate-700/60 mt-0.5">
              <span className="font-semibold text-blue-300 block mb-0.5">Forwarding Logic:</span>
              {hoveredInfo.device.forwardingLogic}
            </div>
          )}

          {hoveredInfo.device.ports && (
            <div className="flex items-center gap-1 mt-0.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
              <span className="font-semibold text-slate-400">Ports:</span>
              <div className="flex flex-wrap gap-1">
                {hoveredInfo.device.ports.map((port) => (
                  <span key={port} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-mono">
                    {port}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

