import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Package } from 'lucide-react';
import Toolbar from './components/Toolbar';
import ComponentDrawer from './components/ComponentDrawer';
import Workspace from './components/Workspace';
import Inspector from './components/Inspector';
import DebugConsole from './components/DebugConsole';
import { runPingSimulation } from './utils/networkLogic';

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

function AppContent() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [wireColor, setWireColor] = useState('#22c55e'); // Green default
  const [selectedNode, setSelectedNode] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [logs, setLogs] = useState([
    { type: 'info', msg: 'Workspace initialized. Drag or tap components to begin.' }
  ]);
  
  // For Ping Tool
  const [pingSource, setPingSource] = useState(null);

  const addLog = useCallback((msg, type = 'sys') => {
    setLogs((prev) => [...prev, { type, msg }]);
  }, []);

  const handleSimulateToggle = () => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      addLog('Simulation Mode Started. Click a source device then a destination to Ping.', 'success');
      setIsMobileDrawerOpen(false);
    } else {
      addLog('Simulation Mode Stopped. Returned to Design Mode.', 'info');
      setPingSource(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      {/* Top Toolbar */}
      <Toolbar 
        isSimulating={isSimulating} 
        onSimulateToggle={handleSimulateToggle} 
        wireColor={wireColor}
        setWireColor={setWireColor}
        addLog={addLog}
        isMobileDrawerOpen={isMobileDrawerOpen}
        setIsMobileDrawerOpen={setIsMobileDrawerOpen}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Canvas Workspace */}
        <div className="flex-1 relative">
          <Workspace 
            isSimulating={isSimulating}
            wireColor={wireColor}
            onSelectNode={setSelectedNode}
            pingSource={pingSource}
            setPingSource={setPingSource}
            addLog={addLog}
            runPingSimulation={runPingSimulation}
          />
          
          {/* Inspector Overlay (Appears when node selected in design mode) */}
          {!isSimulating && selectedNode && (
            <Inspector 
              node={selectedNode} 
              onClose={() => setSelectedNode(null)} 
            />
          )}

          {/* Floating Mobile Component Catalog FAB Button */}
          {!isSimulating && (
            <button 
              className="md:hidden fixed bottom-14 right-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3.5 py-2.5 rounded-full shadow-xl z-30 flex items-center gap-2 font-bold text-xs transition-transform active:scale-95"
              onClick={() => setIsMobileDrawerOpen(true)}
              title="Open Component Catalog"
            >
              <Package size={18} />
              <span>Components</span>
            </button>
          )}
        </div>
        
        {/* Component Drawer (Sidebar on Desktop, Slide-over Overlay on Mobile) */}
        {!isSimulating && (
          <ComponentDrawer 
            isOpenOnMobile={isMobileDrawerOpen}
            onCloseMobile={() => setIsMobileDrawerOpen(false)}
          />
        )}
      </div>

      {/* Bottom Console */}
      <DebugConsole logs={logs} onClear={() => setLogs([])} />
    </div>
  );
}
