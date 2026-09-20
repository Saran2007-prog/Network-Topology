// Base class for all network nodes
export class Node {
    constructor(id, type, name, x, y) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 60;
        this.interfaces = []; // Array of link references or port info
    }

    // Helper to get connected nodes (useful for traversal)
    getConnectedLinks(links) {
        return links.filter(l => l.source.id === this.id || l.target.id === this.id);
    }
}

export class PC extends Node {
    constructor(id, name, x, y) {
        super(id, 'pc', name, x, y);
        this.ip = '192.168.1.10';
        this.subnet = '255.255.255.0';
        this.gateway = '192.168.1.1';
        this.mac = 'MAC-' + id;
    }
}

export class Server extends Node {
    constructor(id, name, x, y) {
        super(id, 'server', name, x, y);
        this.ip = '192.168.1.100';
        this.subnet = '255.255.255.0';
        this.gateway = '192.168.1.1';
        this.mac = 'MAC-' + id;
    }
}

export class Switch extends Node {
    constructor(id, name, x, y) {
        super(id, 'switch', name, x, y);
        this.macTable = {}; // Maps MAC address to Link ID
    }
}

export class Router extends Node {
    constructor(id, name, x, y) {
        super(id, 'router', name, x, y);
        // Router has multiple interfaces, we can mock this by giving it a routing table
        // Map of Subnet -> Next Hop IP or Directly Connected Link ID
        this.routingTable = []; 
        // Array of {ip, subnet, linkId} for directly connected interfaces
        this.ports = []; 
    }
    
    addPort(ip, subnet, linkId) {
        this.ports.push({ip, subnet, linkId});
        // Auto-add to routing table
        const networkId = getNetworkAddress(ip, subnet);
        this.routingTable.push({
            network: networkId,
            subnet: subnet,
            nextHop: 'Directly Connected',
            interface: linkId
        });
    }
}

export class Link {
    constructor(id, source, target) {
        this.id = id;
        this.source = source;
        this.target = target;
    }
}

// Network Math Helpers
export function ipToLong(ip) {
    if (!ip) return 0;
    return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

export function longToIp(int) {
    return [
        (int >>> 24) & 0xFF,
        (int >>> 16) & 0xFF,
        (int >>> 8) & 0xFF,
        int & 0xFF
    ].join('.');
}

export function getNetworkAddress(ip, subnet) {
    if (!ip || !subnet) return '';
    const ipL = ipToLong(ip);
    const subL = ipToLong(subnet);
    return longToIp(ipL & subL);
}

export function isSameSubnet(ip1, ip2, subnet) {
    if (!ip1 || !ip2 || !subnet) return false;
    return getNetworkAddress(ip1, subnet) === getNetworkAddress(ip2, subnet);
}
