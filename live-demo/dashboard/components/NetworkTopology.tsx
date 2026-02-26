'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ControlKey, TopologyNode, TopologyEdge } from '@/lib/types';
import { CONTROL_BADGE_POSITIONS, ControlBadgePosition } from '@/lib/data';

interface NetworkTopologyProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  aomcActive: boolean;
  quarantined: Set<string>;
  compromised: Map<string, string>;
  activeEdges: Set<string>;
  controls: Record<ControlKey, boolean>;
  enforcingControl: ControlKey | null;
}

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
    case 'blocked': return '#ef4444';
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

function nodeOffset(type: string): number {
  switch (type) {
    case 'agent': case 'rogue': return 24;
    case 'datastore': return 16;
    case 'tool': return 14;
    default: return 16;
  }
}

function shortenLine(x1: number, y1: number, x2: number, y2: number, fromOffset: number, toOffset: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { x1, y1, x2, y2 };
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: x1 + ux * fromOffset,
    y1: y1 + uy * fromOffset,
    x2: x2 - ux * toOffset,
    y2: y2 - uy * toOffset,
  };
}

function NodeIcon({ type, x, y }: { type: string; x: number; y: number }) {
  switch (type) {
    case 'rogue':
      return <text x={x} y={y + 4} textAnchor="middle" fontSize={18} className="select-none">{'\u2620'}</text>;
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

function ControlBadge({ badge, active, enforcing }: { badge: ControlBadgePosition; active: boolean; enforcing: boolean }) {
  const w = 56;
  const h = 18;
  const circleR = 7;

  const bgFill = enforcing ? '#15803d' : active ? '#15803d' : '#374151';
  const borderColor = enforcing ? '#22c55e' : active ? '#22c55e' : '#4b5563';
  const textColor = active || enforcing ? '#ffffff' : '#9ca3af';
  const opacity = active || enforcing ? 1 : 0.6;

  return (
    <g opacity={opacity}>
      {/* Pulse ring when enforcing */}
      {enforcing && (
        <motion.rect
          x={badge.x - w / 2 - 3} y={badge.y - h / 2 - 3}
          width={w + 6} height={h + 6} rx={11}
          fill="none" stroke="#22c55e" strokeWidth={1.5}
          animate={{ opacity: [0.8, 0.2, 0.8], scale: [1, 1.08, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          filter="url(#glow-green-strong)"
        />
      )}
      {/* Pill background */}
      <rect
        x={badge.x - w / 2} y={badge.y - h / 2}
        width={w} height={h} rx={9}
        fill={bgFill} stroke={borderColor} strokeWidth={1}
      />
      {/* Number circle */}
      <circle
        cx={badge.x - w / 2 + circleR + 3} cy={badge.y}
        r={circleR}
        fill={enforcing ? '#22c55e' : active ? '#22c55e' : '#4b5563'}
      />
      <text
        x={badge.x - w / 2 + circleR + 3} y={badge.y + 3.5}
        textAnchor="middle" fill={active || enforcing ? '#ffffff' : '#d1d5db'}
        fontSize={9} fontWeight="bold"
        fontFamily="var(--font-mono), monospace"
      >
        {badge.number}
      </text>
      {/* Short label */}
      <text
        x={badge.x + 6} y={badge.y + 3.5}
        textAnchor="middle" fill={textColor}
        fontSize={8} fontWeight="bold"
        fontFamily="var(--font-mono), monospace"
      >
        {badge.shortLabel}
      </text>
    </g>
  );
}

export default function NetworkTopology({ nodes, edges, aomcActive, quarantined, compromised, activeEdges, controls, enforcingControl }: NetworkTopologyProps) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return (
    <div className="h-full w-full relative rounded-lg border border-gray-800 bg-gray-900/30 overflow-hidden">
      <svg viewBox="0 0 920 680" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
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
          <filter id="glow-green-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#22c55e" floodOpacity="0.8" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Arrowhead markers for each edge color */}
          <marker id="arrow-data" viewBox="0 0 10 6" refX="9" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#eab308" />
          </marker>
          <marker id="arrow-a2a" viewBox="0 0 10 6" refX="9" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#3b82f6" />
          </marker>
          <marker id="arrow-malicious" viewBox="0 0 10 6" refX="9" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#ef4444" />
          </marker>
          <marker id="arrow-blocked" viewBox="0 0 10 6" refX="9" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#22c55e" />
          </marker>
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
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x={20} y={40} width={880} height={600} rx={16}
                fill="none" stroke="#f97316" strokeWidth={2.5} strokeDasharray="12,6"
                className="animate-pulse-orange"
              />
              <rect x={380} y={44} width={100} height={22} rx={4} fill="#f97316" />
              <text x={430} y={59} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">AOMC</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Control enforcement badges */}
        {CONTROL_BADGE_POSITIONS.map(badge => (
          <ControlBadge
            key={badge.key}
            badge={badge}
            active={controls[badge.key]}
            enforcing={enforcingControl === badge.key}
          />
        ))}

        {/* Edges */}
        <AnimatePresence>
          {edges.filter(e => e.visible).map(edge => {
            // Data/a2a edges only render when active (traffic detected)
            const isTrafficEdge = edge.type === 'data' || edge.type === 'a2a';
            if (isTrafficEdge && !activeEdges.has(edge.id)) return null;

            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            const stroke = edgeStroke(edge.type);
            const dash = edgeDash(edge.type);
            const width = edge.type === 'malicious' ? 2.5 : edge.type === 'blocked' ? 2 : 1.5;
            const markerId = `arrow-${edge.type}`;

            // Shorten line so arrowhead doesn't overlap nodes
            const line = shortenLine(
              fromNode.x, fromNode.y, toNode.x, toNode.y,
              nodeOffset(fromNode.type), nodeOffset(toNode.type),
            );

            // For blocked edges, stop the line at the midpoint (no arrow reaching the target)
            const midX = (line.x1 + line.x2) / 2;
            const midY = (line.y1 + line.y2) / 2;

            return (
              <motion.g key={edge.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {edge.type === 'blocked' ? (
                  <>
                    {/* Red line from attacker to midpoint only — no arrow */}
                    <line
                      x1={line.x1} y1={line.y1} x2={midX} y2={midY}
                      stroke={stroke} strokeWidth={width} strokeDasharray={dash}
                      opacity={0.5}
                    />
                    {/* Big red X at the midpoint */}
                    <circle
                      cx={midX} cy={midY}
                      r={14} fill="rgba(239,68,68,0.9)" stroke="#fca5a5" strokeWidth={1.5}
                      filter="url(#glow-red)"
                    />
                    <text
                      x={midX} y={midY + 5}
                      textAnchor="middle" fill="white" fontSize={18} fontWeight="bold"
                    >{'\u2715'}</text>
                  </>
                ) : (
                  <>
                    <line
                      x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                      stroke={stroke} strokeWidth={width} strokeDasharray={dash}
                      markerEnd={`url(#${markerId})`}
                      className={edge.animated ? edgeAnimClass(edge.type) : ''}
                      opacity={0.8}
                    />
                    {edge.type === 'malicious' && edge.animated && (
                      <circle r={3} fill="#ef4444" filter="url(#glow-red)">
                        <animate attributeName="cx" values={`${fromNode.x};${toNode.x};${fromNode.x}`} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="cy" values={`${fromNode.y};${toNode.y};${fromNode.y}`} dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Nodes */}
        <AnimatePresence>
          {nodes.filter(n => n.visible).map(node => {
            const isQuarantined = quarantined.has(node.id);
            const isCompromised = compromised.has(node.id);
            const compromiseLabel = compromised.get(node.id);
            const stroke = isCompromised ? '#ef4444' : nodeStroke(node.type, isQuarantined);
            const fill = isCompromised ? 'rgba(239,68,68,0.2)' : nodeFill(node.type);
            const isRogue = node.type === 'rogue';
            const labelY = node.type === 'datastore' ? 22 : node.type === 'tool' ? 22 : 36;

            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4 }}
              >
                {/* Compromised pulse ring (for non-rogue nodes) */}
                {isCompromised && !isRogue && (
                  <circle
                    cx={node.x} cy={node.y} r={28}
                    fill="none" stroke="#ef4444" strokeWidth={1.5}
                    filter="url(#glow-red)"
                  >
                    <animate attributeName="r" values="28;36;28" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {(node.type === 'agent' || node.type === 'rogue') && (
                  <>
                    {isRogue && (
                      <circle
                        cx={node.x} cy={node.y} r={28}
                        fill="none" stroke="#ef4444" strokeWidth={1}
                      >
                        <animate attributeName="r" values="28;34;28" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={node.x} cy={node.y} r={22}
                      fill={fill} stroke={stroke} strokeWidth={2}
                      filter={isRogue || isCompromised ? 'url(#glow-red)' : 'url(#glow-blue)'}
                    />
                    <NodeIcon type={node.type} x={node.x} y={node.y} />
                    {!isRogue && (
                      <text x={node.x} y={node.y + 4} textAnchor="middle" fill={stroke} fontSize={10}>
                        {'\u2b22'}
                      </text>
                    )}
                  </>
                )}
                {node.type === 'datastore' && (
                  <g filter={isCompromised ? 'url(#glow-red)' : undefined}>
                    <NodeIcon type="datastore" x={node.x} y={node.y} />
                  </g>
                )}
                {node.type === 'tool' && (
                  <g filter={isCompromised ? 'url(#glow-red)' : undefined}>
                    <NodeIcon type="tool" x={node.x} y={node.y} />
                  </g>
                )}

                {/* Label */}
                <text
                  x={node.x} y={node.y + labelY}
                  textAnchor="middle" fill={isCompromised ? '#ef4444' : '#9ca3af'} fontSize={9}
                  fontFamily="var(--font-mono), monospace"
                >
                  {node.label}
                </text>

                {/* Compromise badge */}
                {isCompromised && compromiseLabel && (
                  <g>
                    <rect
                      x={node.x - compromiseLabel.length * 3.2}
                      y={node.y + labelY + 4}
                      width={compromiseLabel.length * 6.4}
                      height={16}
                      rx={3}
                      fill="#ef4444"
                      opacity={0.9}
                    />
                    <text
                      x={node.x}
                      y={node.y + labelY + 15}
                      textAnchor="middle"
                      fill="white"
                      fontSize={8}
                      fontWeight="bold"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {compromiseLabel}
                    </text>
                  </g>
                )}

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
