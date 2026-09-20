import { 
  Monitor, Laptop, Smartphone, Printer, Webcam,
  Server, Database, Globe, Network, 
  GitMerge, Router, Wifi, ShieldCheck, Cloud
} from 'lucide-react';

export const CATEGORIES = {
  END_DEVICES: 'End User Devices (Hosts)',
  SERVERS: 'Servers & Data Center',
  INFRASTRUCTURE: 'Network Infrastructure'
};

export const DEVICE_CATALOG = [
  // --- END DEVICES ---
  {
    id: 'pc',
    type: 'pc',
    category: CATEGORIES.END_DEVICES,
    label: 'Desktop PC',
    icon: Monitor,
    color: 'bg-blue-100 text-blue-700 border-blue-500',
    requiresIp: true,
    ports: ['Eth0'],
    osiLayer: 'Layer 7 (Application)',
    description: 'A standard general-purpose computing host.',
    forwardingLogic: 'Initiates and receives traffic. Uses ARP to find local MAC addresses or sends traffic to its Default Gateway for remote destinations.'
  },
  {
    id: 'laptop',
    type: 'pc',
    category: CATEGORIES.END_DEVICES,
    label: 'Laptop',
    icon: Laptop,
    color: 'bg-blue-100 text-blue-700 border-blue-500',
    requiresIp: true,
    ports: ['Eth0', 'Wlan0'],
    osiLayer: 'Layer 7 (Application)',
    description: 'A portable computing host with wired and wireless interfaces.',
    forwardingLogic: 'Similar to a Desktop PC, capable of connecting to local LANs or Wi-Fi APs.'
  },
  {
    id: 'smartphone',
    type: 'pc',
    category: CATEGORIES.END_DEVICES,
    label: 'Smartphone',
    icon: Smartphone,
    color: 'bg-blue-100 text-blue-700 border-blue-500',
    requiresIp: true,
    ports: ['Wlan0'],
    osiLayer: 'Layer 7 (Application)',
    description: 'A wireless mobile client.',
    forwardingLogic: 'Communicates entirely over wireless frequencies to an Access Point.'
  },
  {
    id: 'printer',
    type: 'pc',
    category: CATEGORIES.END_DEVICES,
    label: 'Network Printer',
    icon: Printer,
    color: 'bg-slate-100 text-slate-700 border-slate-500',
    requiresIp: true,
    ports: ['Eth0'],
    osiLayer: 'Layer 7 (Application)',
    description: 'A shared office LAN endpoint for document printing.',
    forwardingLogic: 'Listens for incoming print jobs on specific TCP ports (like 9100 or IPP).'
  },
  {
    id: 'iot',
    type: 'pc',
    category: CATEGORIES.END_DEVICES,
    label: 'IoT Camera',
    icon: Webcam,
    color: 'bg-teal-100 text-teal-700 border-teal-500',
    requiresIp: true,
    ports: ['Wlan0'],
    osiLayer: 'Layer 7 (Application)',
    description: 'A lightweight IP device providing telemetry or video streams.',
    forwardingLogic: 'Streams UDP/TCP packets to a designated server.'
  },

  // --- SERVERS ---
  {
    id: 'web_server',
    type: 'server',
    category: CATEGORIES.SERVERS,
    label: 'Web Server',
    icon: Server,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-500',
    requiresIp: true,
    ports: ['Eth0'],
    osiLayer: 'Layer 7 (Application)',
    description: 'Hosts websites and responds to HTTP/HTTPS requests.',
    forwardingLogic: 'Listens on TCP Port 80/443. When it receives an HTTP GET, it replies with the requested web page data.'
  },
  {
    id: 'db_server',
    type: 'server',
    category: CATEGORIES.SERVERS,
    label: 'Database Server',
    icon: Database,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-500',
    requiresIp: true,
    ports: ['Eth0'],
    osiLayer: 'Layer 7 (Application)',
    description: 'Internal host for backend transactions and data storage.',
    forwardingLogic: 'Responds to query requests (e.g., SQL) typically from Web Servers on the same LAN.'
  },
  {
    id: 'dns_server',
    type: 'server',
    category: CATEGORIES.SERVERS,
    label: 'DNS Server',
    icon: Globe,
    color: 'bg-purple-100 text-purple-700 border-purple-500',
    requiresIp: true,
    ports: ['Eth0'],
    osiLayer: 'Layer 7 (Application)',
    description: 'Resolves human-readable domain names (like example.com) into IP addresses.',
    forwardingLogic: 'Listens on UDP Port 53. Checks its zone records and returns the corresponding IP address.'
  },
  {
    id: 'dhcp_server',
    type: 'server',
    category: CATEGORIES.SERVERS,
    label: 'DHCP Server',
    icon: Network,
    color: 'bg-purple-100 text-purple-700 border-purple-500',
    requiresIp: true,
    ports: ['Eth0'],
    osiLayer: 'Layer 7 (Application)',
    description: 'Automatically assigns IP addresses to devices joining the network.',
    forwardingLogic: 'Listens for DHCP Discover broadcasts and replies with an IP lease (Offer/Ack).'
  },

  // --- INFRASTRUCTURE ---
  {
    id: 'hub',
    type: 'hub',
    category: CATEGORIES.INFRASTRUCTURE,
    label: 'Hub',
    icon: GitMerge,
    color: 'bg-slate-200 text-slate-800 border-slate-600',
    requiresIp: false,
    ports: ['Port1', 'Port2', 'Port3', 'Port4'],
    osiLayer: 'Layer 1 (Physical)',
    description: 'A legacy physical layer multiport repeater.',
    forwardingLogic: 'Dumb device: Whatever comes in one port gets broadcasted out to ALL other ports, creating a single collision domain.'
  },
  {
    id: 'switch',
    type: 'switch',
    category: CATEGORIES.INFRASTRUCTURE,
    label: 'Managed Switch',
    icon: GitMerge,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-500',
    requiresIp: false,
    ports: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Gi0/1'],
    osiLayer: 'Layer 2 (Data Link)',
    description: 'Connects devices within the same network/subnet.',
    forwardingLogic: 'Reads the Destination MAC address of incoming frames. Learns MACs automatically and forwards frames only to the port where the destination MAC lives.'
  },
  {
    id: 'router',
    type: 'router',
    category: CATEGORIES.INFRASTRUCTURE,
    label: 'Core Router',
    icon: Router,
    color: 'bg-orange-100 text-orange-700 border-orange-500',
    requiresIp: true, // Needs IPs for interfaces
    ports: ['Gi0/0', 'Gi0/1', 'Gi0/2'],
    osiLayer: 'Layer 3 (Network)',
    description: 'A multi-interface gateway that routes traffic between different subnets/networks.',
    forwardingLogic: 'Reads the Destination IP of incoming packets. Looks up the IP in its Routing Table and forwards it out the appropriate interface.'
  },
  {
    id: 'ap',
    type: 'switch', // acts like a switch for sim
    category: CATEGORIES.INFRASTRUCTURE,
    label: 'Wi-Fi AP',
    icon: Wifi,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-400',
    requiresIp: false,
    ports: ['Eth0', 'Wlan (Antenna)'],
    osiLayer: 'Layer 2 (Data Link)',
    description: 'Bridges wireless clients to the wired Ethernet network.',
    forwardingLogic: 'Converts 802.11 wireless frames into 802.3 Ethernet frames and passes them to the uplink switch.'
  },
  {
    id: 'firewall',
    type: 'firewall',
    category: CATEGORIES.INFRASTRUCTURE,
    label: 'Hardware Firewall',
    icon: ShieldCheck,
    color: 'bg-red-100 text-red-700 border-red-500',
    requiresIp: true,
    ports: ['Inside', 'Outside'],
    osiLayer: 'Layer 4-7 (Transport/App)',
    description: 'Packet-filtering security gateway.',
    forwardingLogic: 'Inspects packets (IPs, Ports, Protocols) against configured security rules. Can DROP (block) or ALLOW traffic passing through it.'
  },
  {
    id: 'cloud',
    type: 'router', // behaves like a router for sim
    category: CATEGORIES.INFRASTRUCTURE,
    label: 'WAN / Internet',
    icon: Cloud,
    color: 'bg-sky-100 text-sky-700 border-sky-500',
    requiresIp: true,
    ports: ['Link'],
    osiLayer: 'Layer 3 (Network)',
    description: 'External uplink node simulating the public internet.',
    forwardingLogic: 'Acts as the default route of last resort. Forwards external traffic to simulated remote servers.'
  }
];
