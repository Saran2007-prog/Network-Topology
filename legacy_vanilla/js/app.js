import { PC, Server, Switch, Router, Link } from './models.js';
import { NetworkCanvas } from './canvas.js';
import { UIManager } from './ui.js';
import { Simulator } from './simulator.js';

class AppState {
    constructor() {
        this.nodes = [];
        this.links = [];
        this.packets = [];
        this.nodeCounter = 1;
        this.linkCounter = 1;
        
        this.currentMode = 'select'; // select, connect, ping
        this.selectedNode = null;
        this.selectedLink = null;
        this.pingSource = null;
        
        this.canvas = null;
        this.ui = null;
        this.simulator = null;
        
        this.animationFrameId = null;
        this.needsRedraw = true;
    }
    
    init() {
        this.ui = new UIManager(this);
        this.canvas = new NetworkCanvas('network-canvas', this);
        this.simulator = new Simulator(this);
        
        this.renderLoop();
    }
    
    setMode(mode) {
        this.currentMode = mode;
        this.pingSource = null; // reset ping state
        this.ui.updateActiveTool(mode);
        this.canvas.canvas.style.cursor = mode === 'connect' ? 'crosshair' : 'default';
        if (mode === 'ping') {
             this.canvas.canvas.style.cursor = 'crosshair';
        }
    }
    
    addNode(type, x, y) {
        let node;
        const id = this.nodeCounter++;
        const name = `${type.toUpperCase()}${id}`;
        
        switch (type) {
            case 'pc': node = new PC(id, name, x, y); break;
            case 'server': node = new Server(id, name, x, y); break;
            case 'switch': node = new Switch(id, name, x, y); break;
            case 'router': node = new Router(id, name, x, y); break;
        }
        
        if (node) {
            this.nodes.push(node);
            this.selectNode(node);
            this.ui.log(`Added ${name} to workspace.`);
        }
        this.requestRedraw();
    }
    
    addLink(source, target) {
        // Prevent duplicate or self links
        if (source === target) return;
        const exists = this.links.some(l => 
            (l.source === source && l.target === target) ||
            (l.source === target && l.target === source)
        );
        if (exists) return;
        
        const link = new Link('L' + this.linkCounter++, source, target);
        this.links.push(link);
        this.selectLink(link);
        this.ui.log(`Connected ${source.name} to ${target.name}.`);
        this.requestRedraw();
    }
    
    selectNode(node) {
        if (this.currentMode === 'ping') {
            if (!this.pingSource) {
                this.pingSource = node;
                this.ui.log(`Ping source selected: ${node.name}. Now select destination.`, 'info');
            } else {
                if (this.pingSource !== node) {
                    this.simulator.ping(this.pingSource, node);
                }
                this.pingSource = null;
                this.setMode('select');
            }
        } else {
            this.selectedNode = node;
            this.selectedLink = null;
            this.ui.showProperties(node);
        }
        this.requestRedraw();
    }
    
    selectLink(link) {
        this.selectedLink = link;
        this.selectedNode = null;
        this.ui.showProperties(link);
        this.requestRedraw();
    }
    
    clearSelection() {
        this.selectedNode = null;
        this.selectedLink = null;
        this.ui.showProperties(null);
        this.requestRedraw();
    }
    
    deleteSelected() {
        if (this.selectedNode) {
            // Remove connected links
            this.links = this.links.filter(l => l.source !== this.selectedNode && l.target !== this.selectedNode);
            // Remove node
            this.nodes = this.nodes.filter(n => n !== this.selectedNode);
            this.ui.log(`Deleted node ${this.selectedNode.name}.`);
            this.clearSelection();
        } else if (this.selectedLink) {
            this.links = this.links.filter(l => l !== this.selectedLink);
            this.ui.log(`Deleted link.`);
            this.clearSelection();
        }
    }
    
    requestRedraw() {
        this.needsRedraw = true;
    }
    
    renderLoop() {
        if (this.needsRedraw || this.packets.length > 0) {
            this.canvas.draw();
            this.needsRedraw = false;
        }
        requestAnimationFrame(() => this.renderLoop());
    }
    
    // --- Presets ---
    loadPreset(presetName) {
        this.nodes = [];
        this.links = [];
        this.packets = [];
        this.nodeCounter = 1;
        this.linkCounter = 1;
        this.clearSelection();
        this.ui.log(`--- Loaded Preset: ${presetName} ---`, 'info');
        
        if (presetName === 'simple-lan') {
            const pc1 = new PC(this.nodeCounter++, 'PC1', 200, 200);
            pc1.ip = '192.168.1.10';
            const pc2 = new PC(this.nodeCounter++, 'PC2', 600, 200);
            pc2.ip = '192.168.1.11';
            const sw1 = new Switch(this.nodeCounter++, 'SW1', 400, 200);
            
            this.nodes.push(pc1, pc2, sw1);
            this.addLink(pc1, sw1);
            this.addLink(pc2, sw1);
        } 
        else if (presetName === 'inter-vlan') {
            const pc1 = new PC(this.nodeCounter++, 'PC1', 200, 300);
            pc1.ip = '192.168.1.10'; pc1.gateway = '192.168.1.1';
            const sw1 = new Switch(this.nodeCounter++, 'SW1', 350, 300);
            
            const router = new Router(this.nodeCounter++, 'Core-Router', 500, 200);
            router.addPort('192.168.1.1', '255.255.255.0', 'L1');
            router.addPort('192.168.2.1', '255.255.255.0', 'L2');
            
            const sw2 = new Switch(this.nodeCounter++, 'SW2', 650, 300);
            const srv1 = new Server(this.nodeCounter++, 'Web-Server', 800, 300);
            srv1.ip = '192.168.2.10'; srv1.gateway = '192.168.2.1';
            
            this.nodes.push(pc1, sw1, router, sw2, srv1);
            this.addLink(pc1, sw1);
            this.addLink(sw1, router); // 'L1'
            this.addLink(router, sw2); // 'L2'
            this.addLink(sw2, srv1);
        }
        else if (presetName === 'star') {
            const sw1 = new Switch(this.nodeCounter++, 'Core-SW', 500, 300);
            this.nodes.push(sw1);
            
            const positions = [{x:300, y:150}, {x:700, y:150}, {x:300, y:450}, {x:700, y:450}];
            for (let i = 0; i < 4; i++) {
                const pc = new PC(this.nodeCounter++, `PC${i+1}`, positions[i].x, positions[i].y);
                pc.ip = `192.168.1.${10+i}`;
                this.nodes.push(pc);
                this.addLink(pc, sw1);
            }
        }
        
        this.requestRedraw();
    }
}

// Start application
window.onload = () => {
    const app = new AppState();
    app.init();
};
