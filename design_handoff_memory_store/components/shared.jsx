// Shared UI atoms for Memory Store

const Logo = ({ size = 26 }) => (
  <span className="logo-mark">
    <svg className="dot" width={size} height={size} viewBox="0 0 26 26">
      <defs>
        <radialGradient id="ms-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="var(--glow-soft)" stopOpacity="1"/>
          <stop offset="60%" stopColor="var(--glow)" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="var(--glow-deep)" stopOpacity="1"/>
        </radialGradient>
      </defs>
      {/* outer ring */}
      <circle cx="13" cy="13" r="11.5" fill="none" stroke="var(--ink-2)" strokeWidth="0.8"/>
      {/* neural arms */}
      <path d="M 13 1.5 L 13 6 M 24.5 13 L 20 13 M 13 24.5 L 13 20 M 1.5 13 L 6 13 M 21 5 L 18 8 M 21 21 L 18 18 M 5 21 L 8 18 M 5 5 L 8 8"
        stroke="var(--ink-3)" strokeWidth="0.7" strokeLinecap="round"/>
      {/* satellite dots */}
      <circle cx="13" cy="1.5" r="1.2" fill="var(--sepia)"/>
      <circle cx="24.5" cy="13" r="1.2" fill="var(--sepia)"/>
      <circle cx="13" cy="24.5" r="1.2" fill="var(--sepia)"/>
      <circle cx="1.5" cy="13" r="1.2" fill="var(--sepia)"/>
      {/* core */}
      <circle cx="13" cy="13" r="5" fill="url(#ms-glow)"/>
      <circle cx="13" cy="13" r="2" fill="var(--paper-0)" opacity="0.6"/>
    </svg>
    <span>Memory Store</span>
  </span>
);

// Hand-drawn neural node
const NeuralNode = ({ x, y, r = 6, label, color = "var(--glow)", pulse = false, onClick, selected }) => (
  <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    {selected && (
      <circle cx={x} cy={y} r={r + 6} fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.7"/>
    )}
    <circle cx={x} cy={y} r={r + 3} fill={color} opacity="0.15"/>
    <circle cx={x} cy={y} r={r} fill={color} stroke="var(--ink-2)" strokeWidth="0.6">
      {pulse && <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>}
    </circle>
    {label && (
      <text x={x} y={y + r + 14} textAnchor="middle" fontSize="11" fill="var(--ink-3)"
        fontFamily="var(--font-sans)" style={{ pointerEvents: 'none' }}>
        {label}
      </text>
    )}
  </g>
);

// Hand-drawn neural link (with slight wobble)
const NeuralLink = ({ x1, y1, x2, y2, opacity = 0.4, dashed = false, animated = false }) => {
  // Slight curve for hand-drawn feel
  const mx = (x1 + x2) / 2 + (Math.sin(x1 * 0.3) * 4);
  const my = (y1 + y2) / 2 + (Math.cos(y1 * 0.3) * 4);
  return (
    <path
      d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
      fill="none"
      stroke="var(--ink-3)"
      strokeWidth="0.8"
      strokeDasharray={dashed ? "3 3" : "none"}
      opacity={opacity}
      strokeLinecap="round"
    />
  );
};

// Hand-drawn underline emphasis
const HandUnderline = ({ width = 100, color = "var(--glow)" }) => (
  <svg width={width} height="6" viewBox={`0 0 ${width} 6`} style={{ display: 'block' }}>
    <path d={`M 2 4 Q ${width * 0.3} 1, ${width * 0.5} 3 T ${width - 2} 3`}
      fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Tag/Category dot
const TagDot = ({ color }) => (
  <span style={{
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }}/>
);

// Memory card item
const MemoryCard = ({ memory, compact = false }) => {
  const sourceIcon = {
    'Aria': '✦',
    'Nova': '◇',
    'Sage': '◈',
    'Lumen': '○',
    'Echo': '△',
  }[memory.source] || '•';

  return (
    <div className="card" style={{
      padding: compact ? 14 : 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TagDot color={memory.categoryColor}/>
          <span style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {memory.category}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--ink-5)', fontFamily: 'var(--font-mono)' }}>
          {memory.date}
        </span>
      </div>

      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: compact ? 14 : 15,
        lineHeight: 1.55,
        color: 'var(--ink-2)',
      }}>
        {memory.text}
      </div>

      {!compact && memory.tags && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {memory.tags.map(t => (
            <span key={t} className="chip" style={{ fontSize: 11, padding: '2px 8px' }}>#{t}</span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTop: '1px dashed var(--paper-line)',
        fontSize: 11,
        color: 'var(--ink-4)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--glow)', fontSize: 13 }}>{sourceIcon}</span>
          <span>{memory.source}에서 수집</span>
        </span>
        {memory.linked > 0 && (
          <span>{memory.linked}개 연결</span>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { Logo, NeuralNode, NeuralLink, HandUnderline, TagDot, MemoryCard });
