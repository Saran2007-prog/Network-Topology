import { isSameSubnet } from './models.js';

export class Simulator {
    constructor(stateManager) {
        this.state = stateManager;
    }

    // Ping logic: attempts to find a path and creates packets for animation
    ping(sourceNode, targetNode) {
        this.state.ui.log(`--- Ping started: ${sourceNode.name} -> ${targetNode.name} ---`, 'info');
        
        if (!sourceNode.ip || !targetNode.ip) {
            this.state.ui.log(`Error: Source or Destination missing IP address.`, 'error');
            return;
        }

        const sameSubnet = isSameSubnet(sourceNode.ip, targetNode.ip, sourceNode.subnet);
        
        if (sameSubnet) {
            this.state.ui.log(`Nodes are on the same subnet. Attempting local delivery.`, 'sys-log');
            const path = this.findPath(sourceNode, targetNode, false);
            if (path.length > 0) {
                this.animatePath(path, 'icmp', 'success');
            } else {
                this.state.ui.log(`Destination host unreachable. No physical path found.`, 'error');
            }
        } else {
            this.state.ui.log(`Different subnets. Forwarding to default gateway (${sourceNode.gateway}).`, 'sys-log');
            if (!sourceNode.gateway) {
                this.state.ui.log(`Error: No default gateway configured on ${sourceNode.name}.`, 'error');
                return;
            }
            
            // Find path to router
            const gatewayNode = this.state.nodes.find(n => n.type === 'router' && n.ports.some(p => p.ip === sourceNode.gateway));
            
            if (!gatewayNode) {
                // If not found by explicit ports, just try to find ANY router on the path that acts as gateway
                // For simplicity in this demo, let's just find a path to the target allowing routers
                const path = this.findPath(sourceNode, targetNode, true);
                if (path.length > 0) {
                    this.state.ui.log(`Path found via router.`, 'sys-log');
                    this.animatePath(path, 'icmp', 'success');
                } else {
                    this.state.ui.log(`Destination host unreachable. Route not found.`, 'error');
                }
            } else {
                 const path = this.findPath(sourceNode, targetNode, true);
                 if (path.length > 0) {
                     this.state.ui.log(`Path found through gateway ${gatewayNode.name}.`, 'sys-log');
                     this.animatePath(path, 'icmp', 'success');
                 } else {
                     this.state.ui.log(`Destination host unreachable.`, 'error');
                 }
            }
        }
    }

    // Simple BFS to find path between nodes
    findPath(start, end, allowRouters) {
        const queue = [{ node: start, path: [] }];
        const visited = new Set([start.id]);

        while (queue.length > 0) {
            const { node, path } = queue.shift();

            if (node === end) {
                return path;
            }

            const connectedLinks = node.getConnectedLinks(this.state.links);

            for (const link of connectedLinks) {
                const neighbor = link.source === node ? link.target : link.source;
                
                if (!visited.has(neighbor.id)) {
                    // Restrict traversal based on node types
                    // We only traverse through Switches, or Routers if allowRouters is true.
                    // We don't traverse through other PCs.
                    if (neighbor === end || neighbor.type === 'switch' || (neighbor.type === 'router' && allowRouters)) {
                        visited.add(neighbor.id);
                        
                        // Record hop direction
                        const direction = link.source === node ? 'forward' : 'backward';
                        
                        queue.push({
                            node: neighbor,
                            path: [...path, { link, direction, from: node, to: neighbor }]
                        });
                    }
                }
            }
        }
        return []; // No path found
    }

    animatePath(path, type = 'icmp', status = 'success') {
        if (path.length === 0) return;
        
        let currentHop = 0;
        
        const nextHop = () => {
            if (currentHop >= path.length) {
                this.state.ui.log(`Packet successfully reached destination.`, 'success');
                return;
            }
            
            const hop = path[currentHop];
            
            // Log the hop
            if (hop.to.type === 'switch') {
                this.state.ui.log(`[Switch ${hop.to.name}] Forwarding frame...`, 'sys-log');
                hop.to.macTable['MAC-' + hop.from.id] = hop.link.id; // Mock MAC learning
                if (this.state.selectedNode === hop.to) this.state.ui.showProperties(hop.to);
            } else if (hop.to.type === 'router') {
                this.state.ui.log(`[Router ${hop.to.name}] Routing packet to next hop...`, 'sys-log');
            } else {
                this.state.ui.log(`[${hop.to.name}] Received packet.`, 'sys-log');
            }
            
            // Create packet for animation
            const packet = {
                link: hop.link,
                direction: hop.direction,
                progress: 0,
                type,
                status
            };
            
            this.state.packets.push(packet);
            
            const animate = () => {
                packet.progress += 0.02; // Speed
                if (packet.progress >= 1) {
                    // Remove packet
                    this.state.packets = this.state.packets.filter(p => p !== packet);
                    currentHop++;
                    setTimeout(nextHop, 100); // Small delay before next hop
                } else {
                    requestAnimationFrame(animate);
                }
                this.state.requestRedraw();
            };
            
            requestAnimationFrame(animate);
        };
        
        nextHop();
    }
}
