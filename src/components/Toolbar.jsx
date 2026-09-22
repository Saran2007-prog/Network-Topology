import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, RotateCw, Trash2, Undo, Redo, Download, Upload, ChevronDown, FileJson, Image, FileCode } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';

const PRESETS = {
  lan: {
    title: 'Simple LAN Topology',
    nodes: [
      {
        id: 'node_switch1',
        type: 'device',
        position: { x: 350, y: 150 },
        data: { type: 'switch', catalogId: 'switch', name: 'Managed Switch', ip: '', gateway: '', osiLayer: 'Layer 2 (Data Link)' }
      },
      {
        id: 'node_pc1',
        type: 'device',
        position: { x: 150, y: 300 },
        data: { type: 'pc', catalogId: 'pc', name: 'Desktop PC 1', ip: '192.168.1.10', gateway: '192.168.1.1', osiLayer: 'Layer 7 (Application)' }
      },
      {
        id: 'node_pc2',
        type: 'device',
        position: { x: 350, y: 330 },
        data: { type: 'pc', catalogId: 'pc', name: 'Desktop PC 2', ip: '192.168.1.11', gateway: '192.168.1.1', osiLayer: 'Layer 7 (Application)' }
      },
      {
        id: 'node_server1',
        type: 'device',
        position: { x: 550, y: 300 },
        data: { type: 'web_server', catalogId: 'web_server', name: 'Web Server', ip: '192.168.1.50', gateway: '192.168.1.1', osiLayer: 'Layer 7 (Application)' }
      }
    ],
    edges: [
      { id: 'e-pc1-switch', source: 'node_pc1', target: 'node_switch1', type: 'wire', data: { color: '#22c55e' } },
      { id: 'e-pc2-switch', source: 'node_pc2', target: 'node_switch1', type: 'wire', data: { color: '#22c55e' } },
      { id: 'e-server1-switch', source: 'node_server1', target: 'node_switch1', type: 'wire', data: { color: '#22c55e' } }
    ]
  },
  router: {
    title: 'Router Gateway Topology',
    nodes: [
      {
        id: 'node_router',
        type: 'device',
        position: { x: 400, y: 100 },
        data: { type: 'router', catalogId: 'router', name: 'Core Router', ip: '192.168.1.1', gateway: '', osiLayer: 'Layer 3 (Network)' }
      },
      {
        id: 'node_switch_lan',
        type: 'device',
        position: { x: 220, y: 240 },
        data: { type: 'switch', catalogId: 'switch', name: 'LAN Switch', ip: '', gateway: '', osiLayer: 'Layer 2 (Data Link)' }
      },
      {
        id: 'node_switch_dmz',
        type: 'device',
        position: { x: 580, y: 240 },
        data: { type: 'switch', catalogId: 'switch', name: 'DMZ Switch', ip: '', gateway: '', osiLayer: 'Layer 2 (Data Link)' }
      },
      {
        id: 'node_client1',
        type: 'device',
        position: { x: 120, y: 380 },
        data: { type: 'pc', catalogId: 'pc', name: 'Host PC', ip: '192.168.1.100', gateway: '192.168.1.1', osiLayer: 'Layer 7 (Application)' }
      },
      {
        id: 'node_web',
        type: 'device',
        position: { x: 680, y: 380 },
        data: { type: 'web_server', catalogId: 'web_server', name: 'Public Web Server', ip: '10.0.0.50', gateway: '10.0.0.1', osiLayer: 'Layer 7 (Application)' }
      }
    ],
    edges: [
      { id: 'e-router-swlan', source: 'node_router', target: 'node_switch_lan', type: 'wire', data: { color: '#22c55e' } },
      { id: 'e-router-swdmz', source: 'node_router', target: 'node_switch_dmz', type: 'wire', data: { color: '#3b82f6' } },
      { id: 'e-swlan-client1', source: 'node_switch_lan', target: 'node_client1', type: 'wire', data: { color: '#22c55e' } },
      { id: 'e-swdmz-web', source: 'node_switch_dmz', target: 'node_web', type: 'wire', data: { color: '#3b82f6' } }
    ]
  },
  ring: {
    title: 'Serverless P2P 3-Node Ring',
    nodes: [
      {
        id: 'node_ring_a',
        type: 'device',
        position: { x: 380, y: 120 },
        data: {
          type: 'pc',
          catalogId: 'pc',
          name: 'Node_A',
          ip: '10.0.0.1',
          gateway: '',
          subnet: '255.255.255.0',
          osiLayer: 'Layer 7 (Application)'
        }
      },
      {
        id: 'node_ring_b',
        type: 'device',
        position: { x: 550, y: 320 },
        data: {
          type: 'laptop',
          catalogId: 'laptop',
          name: 'Node_B',
          ip: '10.0.0.2',
          gateway: '',
          subnet: '255.255.255.0',
          osiLayer: 'Layer 7 (Application)'
        }
      },
      {
        id: 'node_ring_c',
        type: 'device',
        position: { x: 210, y: 320 },
        data: {
          type: 'pc',
          catalogId: 'pc',
          name: 'Node_C',
          ip: '10.0.0.3',
          gateway: '',
          subnet: '255.255.255.0',
          osiLayer: 'Layer 7 (Application)'
        }
      }
    ],
    edges: [
      { id: 'e-ring-a-b', source: 'node_ring_a', target: 'node_ring_b', type: 'wire', data: { color: '#22c55e' } },
      { id: 'e-ring-b-c', source: 'node_ring_b', target: 'node_ring_c', type: 'wire', data: { color: '#3b82f6' } },
      { id: 'e-ring-c-a', source: 'node_ring_c', target: 'node_ring_a', type: 'wire', data: { color: '#eab308' } }
    ]
  },
  p2p_relay: {
    title: 'P2P Multi-Hop Packet Forwarding',
    nodes: [
      {
        id: 'node_relay_a',
        type: 'device',
        position: { x: 180, y: 220 },
        data: {
          type: 'pc',
          catalogId: 'pc',
          name: 'Source Node_A',
          ip: '10.0.0.1',
          gateway: '',
          subnet: '255.255.255.0',
          osiLayer: 'Layer 7 (Application)'
        }
      },
      {
        id: 'node_relay_b',
        type: 'device',
        position: { x: 420, y: 220 },
        data: {
          type: 'laptop',
          catalogId: 'laptop',
          name: 'Relay Node_B',
          ip: '10.0.0.2',
          gateway: '',
          subnet: '255.255.255.0',
          osiLayer: 'Layer 7 (Application)'
        }
      },
      {
        id: 'node_relay_c',
        type: 'device',
        position: { x: 660, y: 220 },
        data: {
          type: 'pc',
          catalogId: 'pc',
          name: 'Dest Node_C',
          ip: '10.0.0.3',
          gateway: '',
          subnet: '255.255.255.0',
          osiLayer: 'Layer 7 (Application)'
        }
      }
    ],
    edges: [
      { id: 'e-relay-a-b', source: 'node_relay_a', target: 'node_relay_b', type: 'wire', data: { color: '#22c55e' } },
      { id: 'e-relay-b-c', source: 'node_relay_b', target: 'node_relay_c', type: 'wire', data: { color: '#3b82f6' } }
    ]
  },
  congestion_demo: {
    title: 'Traffic Congestion & Dynamic Rerouting',
    nodes: [
      {
        id: 'node_cong_a',
        type: 'device',
        position: { x: 380, y: 100 },
        data: {
          type: 'pc',
          catalogId: 'pc',
          name: 'Source Node_A',
          ip: '10.0.0.1',
          gateway: '',
          subnet: '255.255.255.0',
          osiLayer: 'Layer 7 (Application)'
        }
      },
      {
        id: 'node_cong_b',
        type: 'device',
        position: { x: 570, y: 280 },
        data: {
          type: 'laptop',
          catalogId: 'laptop',
          name: 'Alt Relay Node_B',
          ip: '10.0.0.2',
          gateway: '',
          subnet: '255.255.255.0',
          osiLayer: 'Layer 7 (Application)'
        }
      },
      {
        id: 'node_cong_c',
        type: 'device',
        position: { x: 190, y: 280 },
        data: {
          type: 'pc',
          catalogId: 'pc',
          name: 'Dest Node_C',
          ip: '10.0.0.3',
          gateway: '',
          subnet: '255.255.255.0',
          osiLayer: 'Layer 7 (Application)'
        }
      }
    ],
    edges: [
      { id: 'e-cong-a-c', source: 'node_cong_a', target: 'node_cong_c', type: 'wire', data: { color: '#ef4444' } },
      { id: 'e-cong-a-b', source: 'node_cong_a', target: 'node_cong_b', type: 'wire', data: { color: '#22c55e' } },
      { id: 'e-cong-b-c', source: 'node_cong_b', target: 'node_cong_c', type: 'wire', data: { color: '#3b82f6' } }
    ]
  }
};

export default function Toolbar({ isSimulating, onSimulateToggle, wireColor, setWireColor, addLog }) {
  const { deleteElements, getNodes, getEdges, setNodes, setEdges, fitView } = useReactFlow();
  const [networkTitle, setNetworkTitle] = useState('Untitled Network');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Undo / Redo history state
  const pastRef = useRef([]);
  const futureRef = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isInternalChangeRef = useRef(false);

  // Helper to record history snapshot
  const saveSnapshot = () => {
    if (isInternalChangeRef.current) return;
    const snapshot = { nodes: getNodes(), edges: getEdges() };
    pastRef.current.push(snapshot);
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  };

  const handleUndo = () => {
    if (pastRef.current.length === 0) return;
    isInternalChangeRef.current = true;
    const current = { nodes: getNodes(), edges: getEdges() };
    futureRef.current.push(current);
    const prev = pastRef.current.pop();
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(true);
    if (addLog) addLog('Undo performed', 'info');
    setTimeout(() => { isInternalChangeRef.current = false; }, 100);
  };

  const handleRedo = () => {
    if (futureRef.current.length === 0) return;
    isInternalChangeRef.current = true;
    const current = { nodes: getNodes(), edges: getEdges() };
    pastRef.current.push(current);
    const next = futureRef.current.pop();
    setNodes(next.nodes);
    setEdges(next.edges);
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
    if (addLog) addLog('Redo performed', 'info');
    setTimeout(() => { isInternalChangeRef.current = false; }, 100);
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRotate = () => {
    const selectedNodes = getNodes().filter(n => n.selected);
    if (selectedNodes.length === 0) {
      if (addLog) addLog('Select a node to rotate', 'info');
      return;
    }
    saveSnapshot();
    setNodes((nds) =>
      nds.map((node) => {
        if (node.selected) {
          const currentRotation = node.data?.rotation || 0;
          const nextRotation = (currentRotation + 90) % 360;
          return {
            ...node,
            style: { ...node.style, transform: `rotate(${nextRotation}deg)` },
            data: { ...node.data, rotation: nextRotation },
          };
        }
        return node;
      })
    );
    if (addLog) addLog(`Rotated selected device(s)`, 'info');
  };

  const handleDelete = () => {
    const nodes = getNodes().filter(n => n.selected);
    const edges = getEdges().filter(e => e.selected);
    if (nodes.length > 0 || edges.length > 0) {
      saveSnapshot();
      deleteElements({ nodes, edges });
    }
  };

  const handleExportJson = () => {
    setShowExportMenu(false);
    try {
      const nodes = getNodes();
      const edges = getEdges();
      const exportData = {
        title: networkTitle,
        version: '1.0',
        timestamp: new Date().toISOString(),
        nodes,
        edges,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `${networkTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'network_topology'}.json`;
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      if (addLog) addLog(`Exported network topology to ${filename}`, 'success');
    } catch (err) {
      console.error('Export JSON error:', err);
      if (addLog) addLog(`Export JSON failed: ${err.message}`, 'error');
    }
  };

  const handleExportPng = async () => {
    setShowExportMenu(false);
    try {
      const el = document.querySelector('.react-flow');
      if (!el) {
        alert('Canvas element not found.');
        return;
      }
      if (addLog) addLog('Generating PNG image export...', 'info');
      const dataUrl = await toPng(el, {
        backgroundColor: '#f8fafc',
        cacheBust: true,
        filter: (node) => {
          if (node.classList && node.classList.contains('react-flow__controls')) {
            return false;
          }
          return true;
        }
      });
      const link = document.createElement('a');
      const filename = `${networkTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'network_topology'}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
      if (addLog) addLog(`Exported network image (${filename})`, 'success');
    } catch (err) {
      console.error('Export PNG error:', err);
      if (addLog) addLog(`Export PNG failed: ${err.message}`, 'error');
    }
  };

  const handleExportSvg = async () => {
    setShowExportMenu(false);
    try {
      const el = document.querySelector('.react-flow');
      if (!el) return;
      if (addLog) addLog('Generating SVG vector export...', 'info');
      const dataUrl = await toSvg(el, {
        backgroundColor: '#f8fafc',
        cacheBust: true,
        filter: (node) => {
          if (node.classList && node.classList.contains('react-flow__controls')) {
            return false;
          }
          return true;
        }
      });
      const link = document.createElement('a');
      const filename = `${networkTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'network_topology'}.svg`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
      if (addLog) addLog(`Exported vector SVG (${filename})`, 'success');
    } catch (err) {
      console.error('Export SVG error:', err);
      if (addLog) addLog(`Export SVG failed: ${err.message}`, 'error');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          saveSnapshot();
          setNodes(parsed.nodes);
          setEdges(parsed.edges || []);
          if (parsed.title) setNetworkTitle(parsed.title);
          if (fitView) setTimeout(() => fitView({ padding: 0.2 }), 100);
          if (addLog) addLog(`Successfully imported ${file.name}`, 'success');
        } else {
          alert('Invalid JSON file. Must contain a "nodes" array.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSelectPreset = (e) => {
    const val = e.target.value;
    if (!val || !PRESETS[val]) return;
    const preset = PRESETS[val];
    saveSnapshot();
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setNetworkTitle(preset.title);
    if (fitView) setTimeout(() => fitView({ padding: 0.2 }), 100);
    if (addLog) addLog(`Loaded preset: ${preset.title}`, 'success');
    e.target.value = '';
  };

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-30 relative select-none">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
          N
        </div>
        <input 
          type="text" 
          value={networkTitle}
          onChange={(e) => setNetworkTitle(e.target.value)}
          className="text-lg font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:ring-0 outline-none w-56 transition-all px-1 rounded"
        />
      </div>

      {/* Center: Tools */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button 
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded shadow-sm transition" 
          title="Rotate Selected (Ctrl+R)"
          onClick={handleRotate}
        >
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
        <button 
          className={`p-1.5 rounded shadow-sm transition ${
            canUndo ? 'text-slate-700 hover:text-slate-900 hover:bg-white cursor-pointer' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <Undo size={18} />
        </button>
        <button 
          className={`p-1.5 rounded shadow-sm transition ${
            canRedo ? 'text-slate-700 hover:text-slate-900 hover:bg-white cursor-pointer' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
          onClick={handleRedo}
          disabled={!canRedo}
        >
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
        {/* Import JSON File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImportFile} 
          accept=".json" 
          className="hidden" 
        />
        <button 
          className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition"
          onClick={() => fileInputRef.current?.click()}
          title="Import JSON Topology File"
        >
          <Upload size={16} /> Import
        </button>

        {/* Export Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button 
            className="text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-1.5 transition shadow-sm"
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export Topology"
          >
            <Download size={16} />
            <span>Export</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition"
                onClick={handleExportJson}
              >
                <FileJson size={16} className="text-blue-500" />
                <div>
                  <div className="font-semibold text-slate-800">Export JSON</div>
                  <div className="text-[10px] text-slate-400">Save topology as JSON file</div>
                </div>
              </button>
              
              <div className="border-t border-slate-100 my-1"></div>

              <button
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition"
                onClick={handleExportPng}
              >
                <Image size={16} className="text-emerald-500" />
                <div>
                  <div className="font-semibold text-slate-800">Export PNG Image</div>
                  <div className="text-[10px] text-slate-400">Save high-res PNG screenshot</div>
                </div>
              </button>

              <button
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition"
                onClick={handleExportSvg}
              >
                <FileCode size={16} className="text-purple-500" />
                <div>
                  <div className="font-semibold text-slate-800">Export SVG Vector</div>
                  <div className="text-[10px] text-slate-400">Save scalable vector image</div>
                </div>
              </button>
            </div>
          )}
        </div>
        
        {/* Presets Selector */}
        <select 
          className="text-sm border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onChange={handleSelectPreset}
          defaultValue=""
        >
          <option value="" disabled>Load Preset...</option>
          <option value="lan">Simple LAN</option>
          <option value="router">Router Gateway Demo</option>
          <option value="ring">Serverless P2P 3-Node Ring</option>
          <option value="p2p_relay">P2P Multi-Hop Packet Forwarding</option>
          <option value="congestion_demo">Traffic Congestion & Rerouting</option>
        </select>

        {/* Simulation Toggle */}
        <button 
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-all ${
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
