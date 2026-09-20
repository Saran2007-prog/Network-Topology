export class UIManager {
    constructor(stateManager) {
        this.state = stateManager;
        
        this.sidebar = document.getElementById('properties-sidebar');
        this.content = document.getElementById('properties-content');
        this.consoleOut = document.getElementById('console-output');
        
        // Mode buttons
        this.btnSelect = document.getElementById('btn-select');
        this.btnConnect = document.getElementById('btn-connect');
        this.btnDelete = document.getElementById('btn-delete');
        this.btnPing = document.getElementById('btn-ping');
        
        this.initEvents();
    }
    
    initEvents() {
        this.btnSelect.addEventListener('click', () => this.state.setMode('select'));
        this.btnConnect.addEventListener('click', () => this.state.setMode('connect'));
        this.btnDelete.addEventListener('click', () => this.state.deleteSelected());
        this.btnPing.addEventListener('click', () => this.state.setMode('ping'));
        
        document.getElementById('btn-clear-log').addEventListener('click', () => {
            this.consoleOut.innerHTML = '';
        });
        
        // Draggable setup
        document.querySelectorAll('.device-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('node-type', item.dataset.type);
            });
        });

        // Keyboard events
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                // Check if not typing in input
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
                    this.state.deleteSelected();
                }
            } else if (e.key === 'Escape') {
                this.state.setMode('select');
                this.state.clearSelection();
            }
        });
        
        // Presets
        document.getElementById('preset-selector').addEventListener('change', (e) => {
            if (e.target.value) {
                this.state.loadPreset(e.target.value);
                e.target.value = ''; // Reset select
            }
        });
    }
    
    updateActiveTool(mode) {
        this.btnSelect.classList.toggle('active', mode === 'select');
        this.btnConnect.classList.toggle('active', mode === 'connect');
        this.btnPing.classList.toggle('active', mode === 'ping');
        
        if (mode === 'ping') {
            this.log('Ping tool selected. Click a source node, then a destination node.', 'info');
        }
    }
    
    log(msg, type = 'sys-log') {
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        div.textContent = `[${timestamp}] ${msg}`;
        
        this.consoleOut.appendChild(div);
        this.consoleOut.scrollTop = this.consoleOut.scrollHeight;
    }
    
    showProperties(obj) {
        if (!obj) {
            this.sidebar.classList.add('hidden');
            return;
        }
        this.sidebar.classList.remove('hidden');
        this.content.innerHTML = '';
        
        if (obj.source && obj.target) {
            // It's a link
            this.content.innerHTML = `<p><strong>Link</strong></p>
                <p class="text-muted">${obj.source.name} &harr; ${obj.target.name}</p>`;
        } else {
            // It's a node
            let html = `<div class="prop-group">
                <label>Name</label>
                <input type="text" id="prop-name" value="${obj.name}">
            </div>`;
            
            if (obj.ip !== undefined) {
                html += `
                <div class="prop-group">
                    <label>IP Address</label>
                    <input type="text" id="prop-ip" value="${obj.ip}">
                </div>
                <div class="prop-group">
                    <label>Subnet Mask</label>
                    <input type="text" id="prop-subnet" value="${obj.subnet}">
                </div>
                `;
                if (obj.gateway !== undefined) {
                    html += `
                    <div class="prop-group">
                        <label>Default Gateway</label>
                        <input type="text" id="prop-gateway" value="${obj.gateway}">
                    </div>`;
                }
            }
            
            if (obj.type === 'switch') {
                html += `<div class="prop-group">
                    <label>MAC Table</label>
                    <table class="routing-table">
                        <tr><th>MAC</th><th>Port/Link</th></tr>
                        ${Object.keys(obj.macTable).map(mac => `<tr><td>${mac}</td><td>${obj.macTable[mac]}</td></tr>`).join('')}
                    </table>
                </div>`;
            }
            
            if (obj.type === 'router') {
                html += `<div class="prop-group">
                    <label>Routing Table</label>
                    <table class="routing-table">
                        <tr><th>Network</th><th>Next Hop</th></tr>
                        ${obj.routingTable.map(rt => `<tr><td>${rt.network}/${rt.subnet}</td><td>${rt.nextHop}</td></tr>`).join('')}
                    </table>
                </div>`;
            }
            
            this.content.innerHTML = html;
            
            // Attach event listeners for inputs
            const idName = document.getElementById('prop-name');
            if (idName) idName.addEventListener('change', (e) => { obj.name = e.target.value; this.state.requestRedraw(); });
            
            const idIp = document.getElementById('prop-ip');
            if (idIp) idIp.addEventListener('change', (e) => { obj.ip = e.target.value; this.state.requestRedraw(); });
            
            const idSubnet = document.getElementById('prop-subnet');
            if (idSubnet) idSubnet.addEventListener('change', (e) => { obj.subnet = e.target.value; });
            
            const idGateway = document.getElementById('prop-gateway');
            if (idGateway) idGateway.addEventListener('change', (e) => { obj.gateway = e.target.value; });
        }
    }
}
