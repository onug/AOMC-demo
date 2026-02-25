'use client';

interface ContainerStatusProps {
  wsConnected: boolean;
}

const CONTAINERS = [
  'postgres', 'redis', 'control-plane', 'gateway',
  'customer-db-api', 'metrics-api', 'tools-api',
  'infra-monitor', 'noc-responder', 'data-analyst',
  'partner-api', 'rogue-7749', 'dashboard',
];

export default function ContainerStatus({ wsConnected }: ContainerStatusProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-900/80 border-t border-gray-800">
      <span className="text-[10px] text-gray-600 uppercase font-bold">Containers</span>
      <div className="flex gap-1">
        {CONTAINERS.map((name) => (
          <div key={name} className="flex items-center gap-0.5" title={name}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[8px] text-gray-600">{name.split('-').pop()}</span>
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        <span className="text-[10px] text-gray-500">
          {wsConnected ? 'WS Connected' : 'WS Disconnected'}
        </span>
      </div>
    </div>
  );
}
