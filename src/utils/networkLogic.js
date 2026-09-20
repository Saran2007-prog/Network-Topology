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

// Very basic pathfinding for the UI simulation
function findPath(startId, endId, nodes, edges, allowRouters) {
  const adjacencyList = {};
  
  // Build graph from edges
  edges.forEach(edge => {
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
          
          // Only traverse switches or allowed routers. Don't traverse through other PCs.
          if (neighborId === endId || neighborNode.data.type === 'switch' || (neighborNode.data.type === 'router' && allowRouters)) {
            visited.add(neighborId);
            queue.push({
              currentId: neighborId,
              path: [...path, edgeId]
            });
          }
        }
      }
    }
  }
  return []; // No path found
}

export function runPingSimulation(sourceNode, targetNode, nodes, edges, setNodes, setEdges, addLog) {
  const sourceData = sourceNode.data;
  const targetData = targetNode.data;

  addLog(`--- [ICMP Echo Request] ${sourceData.name} -> ${targetData.name} ---`, 'info');

  if (!sourceData.ip || !targetData.ip) {
    addLog(`Error: Source or Destination missing IP configuration.`, 'error');
    setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: 'fail' } } : n));
    return;
  }

  const sameSubnet = isSameSubnet(sourceData.ip, targetData.ip, sourceData.subnet);
  let path = [];

  if (sameSubnet) {
    addLog(`[ARP Request] Who has ${targetData.ip}? Tell ${sourceData.ip}`, 'sys');
    addLog(`[ARP Reply] ${targetData.ip} is at MAC-${targetNode.id.substring(0,6)}`, 'sys');
    
    path = findPath(sourceNode.id, targetNode.id, nodes, edges, false);
    if (path.length === 0) {
      addLog(`Destination host unreachable. No physical path found.`, 'error');
    }
  } else {
    addLog(`Different subnets detected. Using default gateway ${sourceData.gateway}`, 'sys');
    if (!sourceData.gateway) {
      addLog(`Error: No default gateway configured on ${sourceData.name}`, 'error');
      path = [];
    } else {
      // Find path allowing routers
      path = findPath(sourceNode.id, targetNode.id, nodes, edges, true);
      if (path.length > 0) {
        addLog(`Path found via router(s).`, 'sys');
      } else {
        addLog(`Destination network unreachable.`, 'error');
      }
    }
  }

  if (path.length === 0) {
    // Fail visually
    setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: 'fail' } } : n));
    setTimeout(() => {
       setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: null } } : n));
    }, 2000);
    return;
  }

  // Animate the path
  let currentStep = 0;
  
  const animateNext = () => {
    // Clear previous edge animation
    setEdges(eds => eds.map(e => ({ ...e, data: { ...e.data, isAnimating: false } })));

    if (currentStep >= path.length) {
      // Success!
      addLog(`[ICMP Echo Reply] ${targetData.name} -> ${sourceData.name} (Success)`, 'success');
      setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: 'success' } } : n));
      setTimeout(() => {
         setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, pingResult: null } } : n));
      }, 2000);
      return;
    }

    const currentEdgeId = path[currentStep];
    const edge = edges.find(e => e.id === currentEdgeId);
    
    if (edge) {
      const nodeObj = nodes.find(n => n.id === edge.target || n.id === edge.source);
      if (nodeObj && nodeObj.data.type === 'switch') {
         addLog(`[Switch ${nodeObj.data.name}] Forwarding packet...`, 'sys');
      } else if (nodeObj && nodeObj.data.type === 'router') {
         addLog(`[Router ${nodeObj.data.name}] Routing to next hop...`, 'sys');
      }

      setEdges(eds => eds.map(e => {
        if (e.id === currentEdgeId) {
          return { ...e, data: { ...e.data, isAnimating: true, packetColor: '#3b82f6' } };
        }
        return e;
      }));
    }

    currentStep++;
    // Adjust timing based on CSS animation speed (approx 1s)
    setTimeout(animateNext, 1200); 
  };

  animateNext();
}
