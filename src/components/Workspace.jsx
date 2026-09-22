import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
} from '@xyflow/react';
import DeviceNode from './DeviceNode';
import AnimatedWire from './AnimatedWire';

// Define custom types
const nodeTypes = { device: DeviceNode };
const edgeTypes = { wire: AnimatedWire };

// simple id generator
const getId = () => `node_${Math.random().toString(36).substr(2, 9)}`;

export default function Workspace({ 
  isSimulating, 
  wireColor, 
  onSelectNode, 
  pingSource, 
  setPingSource,
  addLog,
  runPingSimulation
}) {
  const reactFlowWrapper = useRef(null);
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Add device helper (used by click-to-add as well as drag-and-drop)
  const addDeviceToWorkspace = useCallback((type, clientPos = null) => {
    let position = { x: 250 + (nodes.length * 20) % 200, y: 150 + (nodes.length * 20) % 200 };
    if (clientPos && reactFlowWrapper.current) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      position = {
        x: clientPos.x - reactFlowBounds.left,
        y: clientPos.y - reactFlowBounds.top,
      };
    }

    const isHostType = [
      'pc', 'laptop', 'smartphone', 'printer', 'iot', 'iot_camera',
      'web_server', 'db_server', 'dns_server', 'dhcp_server', 'server'
    ].includes(type);

    const isRouterType = ['router', 'firewall', 'cloud'].includes(type);

    let defaultIp = '';
    let defaultGateway = '';
    let defaultSubnet = '255.255.255.0';

    if (isHostType) {
      defaultIp = `192.168.1.${10 + nodes.length}`;
      defaultGateway = '192.168.1.1';
    } else if (isRouterType) {
      defaultIp = '192.168.1.1';
    }

    const newNode = {
      id: getId(),
      type: 'device',
      position,
      data: { 
        type, 
        name: `${type.toUpperCase()}_${nodes.length + 1}`,
        ip: defaultIp,
        gateway: defaultGateway,
        subnet: defaultSubnet,
        isPingSource: false,
        pingResult: null,
        isSimulating: isSimulating
      },
    };

    setNodes((nds) => nds.concat(newNode));
    addLog(`Added component: ${type.toUpperCase()}_${nodes.length + 1} (${defaultIp ? 'IP: ' + defaultIp : 'Layer 2'})`, 'info');
  }, [nodes, setNodes, isSimulating, addLog]);

  // Expose click-to-add for catalog items
  React.useEffect(() => {
    window.onAddComponentFromCatalog = (deviceId) => {
      addDeviceToWorkspace(deviceId);
    };
    return () => {
      delete window.onAddComponentFromCatalog;
    };
  }, [addDeviceToWorkspace]);

  // Handle Drag & Drop
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      addDeviceToWorkspace(type, { x: event.clientX, y: event.clientY });
    },
    [addDeviceToWorkspace]
  );

  // Sync isSimulating flag to nodes so they can change cursor
  React.useEffect(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, isSimulating, isPingSource: n.id === pingSource?.id }
    })));
  }, [isSimulating, pingSource, setNodes]);

  // Handle Connections
  const onConnect = useCallback(
    (params) => {
      if (isSimulating) return; // Disable wiring during sim
      const newEdge = { 
        ...params, 
        id: `e-${params.source}-${params.target}`,
        type: 'wire',
        data: { color: wireColor, isAnimating: false }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, wireColor, isSimulating]
  );

  // Node Click handler
  const onNodeClick = (_, node) => {
    if (!isSimulating) {
      onSelectNode(node);
    } else {
      // In Simulation Mode
      if (!pingSource) {
        setPingSource(node);
        addLog(`Selected Source: ${node.data.name}`);
      } else if (pingSource.id !== node.id) {
        addLog(`Selected Destination: ${node.data.name}. Starting Ping...`, 'info');
        // Trigger ping
        runPingSimulation(pingSource, node, nodes, edges, setNodes, setEdges, addLog);
        setPingSource(null); // Reset for next ping
      }
    }
  };

  const onPaneClick = () => {
    onSelectNode(null);
  };

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        elementsSelectable={!isSimulating}
        nodesDraggable={!isSimulating}
        nodesConnectable={!isSimulating}
        fitView
      >
        <Background gap={16} size={1} color="#cbd5e1" variant="dots" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
