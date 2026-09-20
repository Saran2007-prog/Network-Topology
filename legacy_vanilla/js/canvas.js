export class NetworkCanvas {
    constructor(canvasId, stateManager) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.state = stateManager; // holds nodes, links, selections, etc.
        
        this.transform = { x: 0, y: 0, scale: 1 };
        this.isDraggingBg = false;
        this.isDraggingNode = false;
        this.draggedNode = null;
        this.lastMouse = { x: 0, y: 0 };
        
        // Connect Line temp state
        this.isConnecting = false;
        this.connectStartNode = null;
        this.currentMousePos = { x: 0, y: 0 };
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initEvents();
    }
    
    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this.draw();
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    // Transform screen coords to world coords
    toWorld(screenX, screenY) {
        return {
            x: (screenX - this.transform.x) / this.transform.scale,
            y: (screenY - this.transform.y) / this.transform.scale
        };
    }
    
    initEvents() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        
        // Handle drag and drop from sidebar
        this.canvas.addEventListener('dragover', (e) => e.preventDefault());
        this.canvas.addEventListener('drop', this.onDrop.bind(this));
    }
    
    onDrop(e) {
        e.preventDefault();
        const type = e.dataTransfer.getData('node-type');
        if (type) {
            const pos = this.getMousePos(e);
            const worldPos = this.toWorld(pos.x, pos.y);
            this.state.addNode(type, worldPos.x, worldPos.y);
            this.draw();
        }
    }
    
    onMouseDown(e) {
        const pos = this.getMousePos(e);
        const worldPos = this.toWorld(pos.x, pos.y);
        
        const clickedNode = this.getNodeAt(worldPos.x, worldPos.y);
        
        if (this.state.currentMode === 'select') {
            if (clickedNode) {
                this.state.selectNode(clickedNode);
                this.isDraggingNode = true;
                this.draggedNode = clickedNode;
            } else {
                // Check if link is clicked
                const clickedLink = this.getLinkAt(worldPos.x, worldPos.y);
                if (clickedLink) {
                    this.state.selectLink(clickedLink);
                } else {
                    this.state.clearSelection();
                    this.isDraggingBg = true;
                }
            }
        } else if (this.state.currentMode === 'connect') {
            if (clickedNode) {
                this.isConnecting = true;
                this.connectStartNode = clickedNode;
                this.currentMousePos = pos;
            }
        }
        
        this.lastMouse = pos;
        this.draw();
    }
    
    onMouseMove(e) {
        const pos = this.getMousePos(e);
        
        if (this.isDraggingBg) {
            this.transform.x += (pos.x - this.lastMouse.x);
            this.transform.y += (pos.y - this.lastMouse.y);
        } else if (this.isDraggingNode && this.draggedNode) {
            const dx = (pos.x - this.lastMouse.x) / this.transform.scale;
            const dy = (pos.y - this.lastMouse.y) / this.transform.scale;
            this.draggedNode.x += dx;
            this.draggedNode.y += dy;
        } else if (this.isConnecting) {
            this.currentMousePos = pos;
        }
        
        this.lastMouse = pos;
        this.draw();
    }
    
    onMouseUp(e) {
        this.isDraggingBg = false;
        this.isDraggingNode = false;
        this.draggedNode = null;
        
        if (this.isConnecting) {
            const pos = this.getMousePos(e);
            const worldPos = this.toWorld(pos.x, pos.y);
            const targetNode = this.getNodeAt(worldPos.x, worldPos.y);
            
            if (targetNode && targetNode !== this.connectStartNode) {
                this.state.addLink(this.connectStartNode, targetNode);
            }
            this.isConnecting = false;
            this.connectStartNode = null;
        }
        
        this.draw();
    }
    
    onWheel(e) {
        e.preventDefault();
        const pos = this.getMousePos(e);
        const zoomIntensity = 0.1;
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * zoomIntensity);
        
        const worldPos = this.toWorld(pos.x, pos.y);
        
        this.transform.scale *= zoom;
        // Clamp scale
        this.transform.scale = Math.min(Math.max(0.2, this.transform.scale), 5);
        
        this.transform.x = pos.x - worldPos.x * this.transform.scale;
        this.transform.y = pos.y - worldPos.y * this.transform.scale;
        
        this.draw();
    }
    
    getNodeAt(x, y) {
        // Reverse iterate to click topmost
        for (let i = this.state.nodes.length - 1; i >= 0; i--) {
            const node = this.state.nodes[i];
            const dist = Math.hypot(node.x - x, node.y - y);
            if (dist <= node.width / 2 + 10) {
                return node;
            }
        }
        return null;
    }
    
    getLinkAt(x, y) {
        for (const link of this.state.links) {
            const d = this.distToSegmentSquared({x, y}, {x: link.source.x, y: link.source.y}, {x: link.target.x, y: link.target.y});
            if (d < 100) return link; // hit radius
        }
        return null;
    }

    distToSegmentSquared(p, v, w) {
        const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
        if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return (p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Grid
        this.drawGrid();
        
        this.ctx.save();
        this.ctx.translate(this.transform.x, this.transform.y);
        this.ctx.scale(this.transform.scale, this.transform.scale);
        
        // Draw Links
        for (const link of this.state.links) {
            this.drawLink(link);
        }
        
        // Draw Active Connection Line
        if (this.isConnecting && this.connectStartNode) {
            const worldMouse = this.toWorld(this.currentMousePos.x, this.currentMousePos.y);
            this.ctx.beginPath();
            this.ctx.moveTo(this.connectStartNode.x, this.connectStartNode.y);
            this.ctx.lineTo(worldMouse.x, worldMouse.y);
            this.ctx.strokeStyle = '#94a3b8';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // Draw Nodes
        for (const node of this.state.nodes) {
            this.drawNode(node);
        }
        
        // Draw Packets
        for (const packet of this.state.packets) {
            this.drawPacket(packet);
        }
        
        this.ctx.restore();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        const gridSize = 50 * this.transform.scale;
        
        const offsetX = this.transform.x % gridSize;
        const offsetY = this.transform.y % gridSize;
        
        this.ctx.beginPath();
        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        for (let y = offsetY; y < this.canvas.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.stroke();
    }
    
    drawLink(link) {
        const isSelected = this.state.selectedLink === link;
        this.ctx.beginPath();
        this.ctx.moveTo(link.source.x, link.source.y);
        this.ctx.lineTo(link.target.x, link.target.y);
        this.ctx.strokeStyle = isSelected ? '#3b82f6' : '#475569';
        this.ctx.lineWidth = isSelected ? 4 : 2;
        this.ctx.stroke();
    }
    
    drawNode(node) {
        const isSelected = this.state.selectedNode === node;
        
        this.ctx.save();
        this.ctx.translate(node.x, node.y);
        
        // Glow if selected
        if (isSelected) {
            this.ctx.shadowColor = '#3b82f6';
            this.ctx.shadowBlur = 15;
        }
        
        // Background
        this.ctx.beginPath();
        this.ctx.arc(0, 0, node.width / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = isSelected ? '#3b82f6' : '#64748b';
        if (node.type === 'switch') this.ctx.strokeStyle = '#10b981';
        if (node.type === 'router') this.ctx.strokeStyle = '#f59e0b';
        this.ctx.stroke();
        
        // Draw Icon / Label
        this.ctx.shadowBlur = 0; // reset shadow for text
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        let icon = '💻';
        if (node.type === 'server') icon = '🖥️';
        if (node.type === 'switch') icon = '🔀';
        if (node.type === 'router') icon = '🌐';
        this.ctx.fillText(icon, 0, 0);
        
        // Node Name Label
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.fillText(node.name, 0, node.height / 2 + 15);
        
        // IP Label (if applicable)
        if (node.ip) {
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.font = '10px Fira Code, monospace';
            this.ctx.fillText(node.ip, 0, node.height / 2 + 30);
        }
        
        this.ctx.restore();
    }
    
    drawPacket(packet) {
        this.ctx.save();
        
        // Current position based on progress (0 to 1) along the link
        const dx = packet.link.target.x - packet.link.source.x;
        const dy = packet.link.target.y - packet.link.source.y;
        
        let x, y;
        if (packet.direction === 'forward') {
            x = packet.link.source.x + dx * packet.progress;
            y = packet.link.source.y + dy * packet.progress;
        } else {
            x = packet.link.target.x - dx * packet.progress;
            y = packet.link.target.y - dy * packet.progress;
        }
        
        this.ctx.translate(x, y);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
        
        let color = '#3b82f6'; // default blue
        if (packet.type === 'arp') color = '#f59e0b'; // yellow
        if (packet.status === 'error') color = '#ef4444'; // red
        if (packet.status === 'success') color = '#10b981'; // green
        
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        
        this.ctx.restore();
    }
}
