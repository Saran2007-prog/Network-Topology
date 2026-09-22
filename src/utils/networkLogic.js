// IP string to 32-bit integer
function ipToLong(ip) {
  if (!ip) return 0;
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

function getNetworkAddress(ip, subnet) {
  if (!ip || !subnet) return '';
  const ipL = ipToLong(ip);
  const subL = ipToLong(subnet);
  return [
    (ipL & subL) >>> 24,
    (ipL & subL) >>> 16 & 0xFF,
    (ipL & subL) >>> 8 & 0xFF,
    (ipL & subL) & 0xFF
  ].join('.');
}

function isSameSubnet(ip1, ip2, subnet) {
  if (!ip1 || !ip2 || !subnet) return false;
  return getNetworkAddress(ip1, subnet) === getNetworkAddress(ip2, subnet);
}

// Multi-hop pathfinding supporting congestion avoidance (avoiding busy edges)
function findPath(startId, endId, nodes, edges, avoidBusy = false) {
  const adjacencyList = {};
  
  // Build graph from edges
  edges.forEach(edge => {
    // If avoidBusy is true and edge currently carries active traffic, skip it to simulate congestion avoidance
    if (avoidBusy && edge.data?.isBusy) {
      return;
    }

    if (!adjacencyList[edge.source]) adjacencyList[edge.source] = [];
    if (!adjacencyList[edge.target]) adjacencyList[edge.target] = [];
    
    // undirected edges
    adjacencyList[edge.source].push({ neighborId: edge.target, edgeId: edge.id });
    adjacencyList[edge.target].push({ neighborId: edge.source, edgeId: edge.id });
  });

  const queue = [{ currentId: startId, path: [] }];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const { currentId, path } = queue.shift();

    if (currentId === endId) {
      return path;
    }

    if (adjacencyList[currentId]) {
      for (const { neighborId, edgeId } of adjacencyList[currentId]) {
        if (!visited.has(neighborId)) {
          const neighborNode = nodes.find(n => n.id === neighborId);
          if (!neighborNode) continue;
          
          visited.add(neighborId);
          queue.push({
            currentId: neighborId,
            path: [...path, edgeId]
          });
        }
      }
    }
  }
  return []; // No path found
}

// Track active stream counter for multi-color stream visualization
let streamCounter = 0;
const STREAM_COLORS = ['#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#06b6d4'];

export function runPingSimulation(sourceNode, targetNode, nodes, edges, setNodes, setEdges, addLog) {
  const sourceData = sourceNode.data;
  const targetData = targetNode.data;
  const streamColor = STREAM_COLORS[streamCounter % STREAM_COLORS.length];
  streamCounter++;

  addLog(`--- [Data Stream] ${sourceData.name} -> ${targetData.name} ---`, 'info');

  if (!sourceData.ip || !targetData.ip) {
    addLog(`Error: Source or Destination missing IP configuration.`, 'error');
    setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: 'fail' } } : n));
    return;
  }

  // 1. Try finding a path that avoids busy/congested edges
  let path = findPath(sourceNode.id, targetNode.id, nodes, edges, true);
  let isRerouted = false;

  // 2. If no non-busy path exists, fall back to shortest path
  if (path.length === 0) {
    path = findPath(sourceNode.id, targetNode.id, nodes, edges, false);
  } else {
    const shortestPath = findPath(sourceNode.id, targetNode.id, nodes, edges, false);
    if (path.length > shortestPath.length) {
      isRerouted = true;
    }
  }

  const sameSubnet = isSameSubnet(sourceData.ip, targetData.ip, sourceData.subnet);
  if (sameSubnet) {
    addLog(`[ARP Request] Who has ${targetData.ip}? Tell ${sourceData.ip}`, 'sys');
  } else {
    addLog(`Different subnets detected. Gateway routing active...`, 'sys');
  }

  if (path.length === 0) {
    addLog(`Destination host unreachable. All physical routes congested or down.`, 'error');
    setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: 'fail' } } : n));
    setTimeout(() => {
       setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: null } } : n));
    }, 2000);
    return;
  }

  if (isRerouted) {
    addLog(`⚠️ [Traffic Congestion Reroute] Direct link is BUSY with active traffic. Stream dynamically rerouted via alternate path (${path.length} hops)...`, 'warning');
  } else if (path.length > 1) {
    addLog(`Multi-hop route identified (${path.length} hops). Intermediate node packet forwarding active.`, 'info');
  }

  // Mark all edges in this stream path as BUSY so concurrent pings avoid them
  setEdges(eds => eds.map(e => {
    if (path.includes(e.id)) {
      return { ...e, data: { ...e.data, isBusy: true } };
    }
    return e;
  }));

  // Animate the path hop-by-hop with multiple packet bursts for extended demo visibility
  let currentStep = 0;
  let burstCount = 0;
  const maxBursts = 4; // 4 packet bursts = ~5-7s active stream duration
  
  const animateNext = () => {
    if (currentStep >= path.length) {
      burstCount++;
      if (burstCount < maxBursts) {
        currentStep = 0; // restart path for next packet burst in this stream
      } else {
        // Stream Complete - Clear edge animation and busy status for this stream's path
        setEdges(eds => eds.map(e => {
          if (path.includes(e.id)) {
            return { ...e, data: { ...e.data, isAnimating: false, isBusy: false } };
          }
          return e;
        }));

        const hopCount = path.length;
        addLog(`[ICMP Echo Reply] ${targetData.name} -> ${sourceData.name} (Success, ${hopCount} hop${hopCount > 1 ? 's' : ''}${isRerouted ? ' - Rerouted' : ''})`, 'success');
        setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: 'success' } } : n));
        setTimeout(() => {
           setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: null } } : n));
        }, 2000);
        return;
      }
    }

    const currentEdgeId = path[currentStep];
    const edge = edges.find(e => e.id === currentEdgeId);
    
    if (edge) {
      const nodeObj = nodes.find(n => n.id === edge.target || n.id === edge.source);
      
      if (nodeObj && nodeObj.id !== sourceNode.id && nodeObj.id !== targetNode.id) {
        const nodeType = nodeObj.data.type;
        const nodeName = nodeObj.data.name;

        if (['switch', 'hub', 'ap'].includes(nodeType)) {
          addLog(`[Switch ${nodeName}] Forwarding frame to next hop...`, 'sys');
        } else if (['router', 'firewall', 'cloud'].includes(nodeType)) {
          addLog(`[Router/Gateway ${nodeName}] Routing packet to destination subnet...`, 'sys');
        } else {
          // Intermediate P2P Host Forwarding
          addLog(`[P2P Relay - ${nodeName}] Intermediate node received packet. Forwarding to ${targetData.name}...`, 'info');
          setNodes(nds => nds.map(n => n.id === nodeObj.id ? { ...n, data: { ...n.data, pingResult: 'relay' } } : n));
          setTimeout(() => {
            setNodes(nds => nds.map(n => n.id === nodeObj.id ? { ...n, data: { ...n.data, pingResult: null } } : n));
          }, 1200);
        }
      }

      setEdges(eds => eds.map(e => {
        if (e.id === currentEdgeId) {
          return { ...e, data: { ...e.data, isAnimating: true, isBusy: true, packetColor: streamColor } };
        }
        return e;
      }));
    }

    currentStep++;
    setTimeout(animateNext, 1200); 
  };

  animateNext();
}
