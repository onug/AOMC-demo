'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TopologyState, ControlKey } from '@/lib/types';

interface NetworkTopologyProps {
  topology: TopologyState;
  aomcActive: boolean;
  quarantined: Set<string>;
}

// Trust domain rectangles
const DOMAINS = [
  { id: 'private-dc', label: 'Private DC', x: 40, y: 80, w: 240, h: 500, color: '#3b82f6', bg: 'rgba(59,130,246,0.04)' },
  { id: 'cloud-vpc', label: 'Cloud VPC', x: 350, y: 80, w: 240, h: 500, color: '#8b5cf6', bg: 'rgba(139,92,246,0.04)' },
  { id: 'external', label: 'External / Partner', x: 660, y: 80, w: 220, h: 500, color: '#ef4444', bg: 'rgba(239,68,68,0.04)' },
];

function nodeStroke(type: string, quarantined: boolean): string {
  if (quarantined) return '#ef4444';
  switch (type) {
    case 'rogue': return '#ef4444';
    case 'agent': return '#3b82f6';
    case 'datastore': return '#8b5cf6';
    case 'tool': return '#f59e0b';
    default: return '#6b7280';
  }
}

function nodeFill(type: string): string {
  switch (type) {
    case 'rogue': return 'rgba(239,68,68,0.15)';
    case 'agent': return 'rgba(59,130,246,0.1)';
    case 'datastore': return 'rgba(139,92,246,0.1)';
    case 'tool': return 'rgba(245,158,11,0.1)';
    default: return 'rgba(107,114,128,0.1)';
  }
}

function edgeStroke(type: string): string {
  switch (type) {
    case 'malicious': return '#ef4444';
    case 'blocked': return '#22c55e';
    case 'a2a': return '#3b82f6';
    case 'data': return '#eab308';
    default: return '#6b7280';
  }
}

function edgeDash(type: string): string {
  switch (type) {
    case 'malicious': return '8,4';
    case 'blocked': return '4,8';
    case 'a2a': return '10,5';
    case 'data': return '6,3';
    default: return 'none';
  }
}

function edgeAnimClass(type: string): string {
  if (type === 'malicious') return 'animate-dash-malicious';
  if (type === 'blocked') return '';
  return 'animate-dash';
}

function NodeIcon({ type, x, y }: { type: string; x: number; y: number }) {
  const size = 9;
  switch (type) {
    case 'rogue':
      return <text x={x} y={y + 4} textAnchor="middle" fontSize={size * 2} className="select-none">{'\u2620'}</text>;
    case 'datastore':
      return (
        <g>
          <ellipse cx={x} cy={y - 5} rx={10} ry={4} fill="none" stroke="#8b5cf6" strokeWidth={1.2} />
          <rect x={x - 10} y={y - 5} width={20} height={12} fill="rgba(139,92,246,0.1)" stroke="none" />
          <line x1={x - 10} y1={y - 5} x2={x - 10} y2={y + 7} stroke="#8b5cf6" strokeWidth={1.2} />
          <line x1={x + 10} y1={y - 5} x2={x + 10} y2={y + 7} stroke="#8b5cf6" strokeWidth={1.2} />
          <ellipse cx={x} cy={y + 7} rx={10} ry={4} fill="none" stroke="#8b5cf6" strokeWidth={1.2} />
        </g>
      );
    case 'tool':
      return (
        <polygon
          points={`${x},${y - 10} ${x + 9},${y - 5} ${x + 9},${y + 5} ${x},${y + 10} ${x - 9},${y + 5} ${x - 9},${y - 5}`}
          fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth={1.2}
        />
      );
    default:
      return null;
  }
}

export default function NetworkTopology({ topology, aomcActive, quarantined }: NetworkTopologyProps) {
  const nodeMap = new Map(topology.nodes.map(n => [n.id, n]));

  return (
    <div className="h-full w-full relative rounded-lg border border-gray-800 bg-gray-900/30 overflow-hidden">
      <svg viewBox="0 0 920 660" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Glow filters */}
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#ef4444" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#22c55e" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#3b82f6" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Trust domain rectangles */}
        {DOMAINS.map(d => (
          <g key={d.id}>
            <rect
              x={d.x} y={d.y} width={d.w} height={d.h} rx={12}
              fill={d.bg} stroke={d.color} strokeWidth={1.5} strokeDasharray="8,4" opacity={0.6}
            />
            <text x={d.x + d.w / 2} y={d.y + 20} textAnchor="middle"
              fill={d.color} fontSize={11} fontWeight="bold" opacity={0.7}>
              {d.label}
            </text>
          </g>
        ))}

        {/* AOMC overlay */}
        <AnimatePresence>
          {aomcActive && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <rect x={20} y={40} width={880} height={600} rx={16}
                fill="none" stroke="#f97316" strokeWidth={2.5} strokeDasharray="12,6"
                className="animate-pulse-orange"
              />
              <rect x={380} y={44} width={100} height={22} rx={4} fill="#f97316" />
              <text x={430} y={59} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">
                AOMC
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Edges */}
        <AnimatePresence>
          {topology.edges.filter(e => e.visible).map(edge => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            const stroke = edgeStroke(edge.type);
            const dash = edgeDash(edge.type);
            const width = edge.type === 'malicious' ? 2.5 : edge.type === 'blocked' ? 2 : 1.5;

            return (
              <motion.g key={edge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <line
                  x1={fromNode.x} y1={fromNode.y}
                  x2={toNode.x} y2={toNode.y}
                  stroke={stroke} strokeWidth={width}
                  strokeDasharray={dash}
                  className={edge.animated ? edgeAnimClass(edge.type) : ''}
                  opacity={edge.type === 'blocked' ? 0.6 : 0.8}
                />
                {/* Blocked X mark */}
                {edge.type === 'blocked' && (
                  <g>
                    <circle
                      cx={(fromNode.x + toNode.x) / 2}
                      cy={(fromNode.y + toNode.y) / 2}
                      r={10} fill="#16a34a" opacity={0.9}
                    />
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 + 4}
                      textAnchor="middle" fill="white" fontSize={12} fontWeight="bold"
                    >
                      {'\u2715'}
                    </text>
                  </g>
                )}
                {/* Animated packet for malicious */}
                {edge.type === 'malicious' && edge.animated && (
                  <motion.circle
                    r={3} fill="#ef4444"
                    initial={{ cx: fromNode.x, cy: fromNode.y }}
                    animate={{
                      cx: [fromNode.x, toNode.x, fromNode.x],
                      cy: [fromNode.y, toNode.y, fromNode.y],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    filter="url(#glow-red)"
                  />
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Nodes */}
        <AnimatePresence>
          {topology.nodes.filter(n => n.visible).map(node => {
            const isQuarantined = quarantined.has(node.id);
            const stroke = nodeStroke(node.type, isQuarantined);
            const fill = nodeFill(node.type);
            const isRogue = node.type === 'rogue';

            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4 }}
              >
                {/* Agent circle */}
                {(node.type === 'agent' || node.type === 'rogue') && (
                  <>
                    {isRogue && (
                      <motion.circle
                        cx={node.x} cy={node.y} r={28}
                        fill="none" stroke="#ef4444" strokeWidth={1}
                        animate={{ r: [28, 34, 28], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <circle
                      cx={node.x} cy={node.y} r={22}
                      fill={fill} stroke={stroke} strokeWidth={2}
                      filter={isRogue ? 'url(#glow-red)' : 'url(#glow-blue)'}
                    />
                    <NodeIcon type={node.type} x={node.x} y={node.y} />
                    {!isRogue && (
                      <text x={node.x} y={node.y + 4} textAnchor="middle" fill={stroke} fontSize={10}>
                        {'\u2b22'}
                      </text>
                    )}
                  </>
                )}

                {/* Datastore cylinder icon */}
                {node.type === 'datastore' && (
                  <NodeIcon type="datastore" x={node.x} y={node.y} />
                )}

                {/* Tool hexagon */}
                {node.type === 'tool' && (
                  <NodeIcon type="tool" x={node.x} y={node.y} />
                )}

                {/* Label */}
                <text
                  x={node.x} y={node.y + (node.type === 'datastore' ? 22 : node.type === 'tool' ? 22 : 36)}
                  textAnchor="middle" fill="#9ca3af" fontSize={9}
                  fontFamily="var(--font-mono), monospace"
                >
                  {node.label}
                </text>

                {/* Quarantined badge */}
                {isQuarantined && (
                  <g>
                    <rect x={node.x + 14} y={node.y - 30} width={60} height={14} rx={3} fill="#ef4444" />
                    <text x={node.x + 44} y={node.y - 20} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">
                      QUARANTINED
                    </text>
                  </g>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>
    </div>
  );
}
