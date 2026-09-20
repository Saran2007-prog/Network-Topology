import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
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
  const [logs, setLogs] = useState([
    { type: 'info', msg: 'Workspace initialized. Drag components to begin.' }
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
    } else {
      addLog('Simulation Mode Stopped. Returned to Design Mode.', 'info');
      setPingSource(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar 
        isSimulating={isSimulating} 
        onSimulateToggle={handleSimulateToggle} 
        wireColor={wireColor}
        setWireColor={setWireColor}
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
        </div>
        
        {/* Right Sidebar (Component Drawer) - Hidden during simulation */}
        {!isSimulating && (
          <ComponentDrawer />
        )}
      </div>

      {/* Bottom Console */}
      <DebugConsole logs={logs} onClear={() => setLogs([])} />
    </div>
  );
}
