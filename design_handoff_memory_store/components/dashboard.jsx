// Main Dashboard — neural memory graph

const Dashboard = () => {
  const [selected, setSelected] = React.useState('m3');
  const selectedMemory = SAMPLE_MEMORIES.find(m => m.id === selected) || SAMPLE_MEMORIES[2];

  // Layout nodes around a center
  const nodes = React.useMemo(() => {
    return SAMPLE_MEMORIES.map((m, i) => {
      const angle = (i / SAMPLE_MEMORIES.length) * Math.PI * 2 - Math.PI / 2;
      const ringRadius = 180 + (i % 2) * 60;
      return {
        ...m,
        x: 420 + Math.cos(angle) * ringRadius,
        y: 320 + Math.sin(angle) * ringRadius * 0.78,
      };
    });
  }, []);

  // Inter-memory links (semantic clusters)
  const memoryLinks = [
    ['m1', 'm5'], ['m1', 'm6'], // food + family
    ['m2', 'm8'], ['m2', 'm7'], // life + travel
    ['m3', 'm7'], ['m3', 'm4'], // work + reading
    ['m6', 'm7'], ['m4', 'm5'],
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '256px 1fr 360px', minHeight: 800, background: 'var(--paper-1)' }}>
      <Sidebar active="dashboard"/>

      <main style={{ padding: '28px 36px', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 6 }}>
              나의 기억
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink-1)', margin: 0, fontWeight: 600 }}>
              안녕하세요, 지우님
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
              <span>↓</span> 내보내기
            </button>
            <button className="btn" style={{ padding: '8px 14px', fontSize: 13 }}>
              + 수동 추가
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { k: '저장된 기억', v: '104', s: '+7 이번 주', glow: true },
            { k: '연결된 AI', v: '4', s: '/ 6 가능' },
            { k: '카테고리', v: '8', s: '활성' },
            { k: '이번 달 동기화', v: '312', s: '회' },
          ].map(s => (
            <div key={s.k} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 6, letterSpacing: '0.05em' }}>{s.k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 28,
                  fontWeight: 600,
                  color: s.glow ? 'var(--glow-deep)' : 'var(--ink-1)',
                  lineHeight: 1,
                }}>{s.v}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{s.s}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Graph canvas */}
        <div className="card" style={{ padding: 0, position: 'relative', overflow: 'hidden', height: 580 }}>
          <div style={{
            position: 'absolute', top: 16, left: 20, zIndex: 5,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink-2)', fontWeight: 600 }}>
              기억의 지도
            </div>
            <span className="chip">전체 보기</span>
          </div>
          <div style={{
            position: 'absolute', top: 16, right: 20, zIndex: 5,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--paper-1)',
            padding: 4,
            borderRadius: 8,
            border: '1px solid var(--paper-line)',
          }}>
            {['그래프', '클러스터', '타임라인'].map((m, i) => (
              <button key={m} style={{
                padding: '6px 12px',
                fontSize: 12,
                background: i === 0 ? 'var(--paper-0)' : 'transparent',
                border: 'none',
                borderRadius: 5,
                color: i === 0 ? 'var(--ink-1)' : 'var(--ink-4)',
                fontWeight: i === 0 ? 600 : 400,
                boxShadow: i === 0 ? 'var(--shadow-1)' : 'none',
              }}>{m}</button>
            ))}
          </div>

          <svg viewBox="0 0 840 580" style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <pattern id="dash-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="0.6" fill="var(--paper-line)" opacity="0.6"/>
              </pattern>
            </defs>
            <rect width="840" height="580" fill="url(#dash-grid)"/>

            {/* memory-to-memory links */}
            {memoryLinks.map(([a, b], i) => {
              const na = nodes.find(n => n.id === a);
              const nb = nodes.find(n => n.id === b);
              if (!na || !nb) return null;
              return <NeuralLink key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} dashed opacity={0.3}/>;
            })}

            {/* center-to-each */}
            {nodes.map(n => (
              <NeuralLink key={'c' + n.id} x1={420} y1={320} x2={n.x} y2={n.y} opacity={selected === n.id ? 0.85 : 0.35}/>
            ))}

            {/* satellite nodes */}
            {nodes.map(n => (
              <NeuralNode
                key={n.id}
                x={n.x}
                y={n.y}
                r={selected === n.id ? 9 : 6}
                color={n.categoryColor}
                label={n.category}
                pulse={selected === n.id}
                selected={selected === n.id}
                onClick={() => setSelected(n.id)}
              />
            ))}

            {/* center self node */}
            <g>
              <circle cx="420" cy="320" r="36" fill="var(--glow)" opacity="0.08"/>
              <circle cx="420" cy="320" r="24" fill="var(--glow)" opacity="0.18"/>
              <circle cx="420" cy="320" r="14" fill="var(--glow)" stroke="var(--ink-2)" strokeWidth="1">
                <animate attributeName="r" values="14;16;14" dur="3.5s" repeatCount="indefinite"/>
              </circle>
              <text x="420" y="294" textAnchor="middle" fontSize="13" fill="var(--ink-1)"
                fontFamily="var(--font-serif)" fontStyle="italic" fontWeight="600">지우</text>
            </g>

            {/* legend in corner */}
            <g transform="translate(20, 480)">
              <rect width="170" height="84" fill="var(--paper-0)" rx="6" stroke="var(--paper-line)" strokeWidth="0.6"/>
              <text x="12" y="20" fontSize="10" fill="var(--ink-4)" fontFamily="var(--font-mono)">CATEGORIES</text>
              {CATEGORIES.slice(0, 4).map((c, i) => (
                <g key={c.name} transform={`translate(12, ${36 + i * 12})`}>
                  <circle cx="4" cy="0" r="3.5" fill={c.color}/>
                  <text x="14" y="3" fontSize="11" fill="var(--ink-3)">{c.name}</text>
                  <text x="142" y="3" fontSize="10" fill="var(--ink-5)" textAnchor="end" fontFamily="var(--font-mono)">{c.count}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </main>

      {/* Right rail — selected memory inspector */}
      <aside style={{
        borderLeft: '1px solid var(--paper-line)',
        padding: '28px 24px',
        background: 'var(--paper-0)',
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 16 }}>
          선택한 기억
        </div>
        <MemoryCard memory={selectedMemory}/>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 12 }}>
            연결된 기억 ({selectedMemory.linked})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SAMPLE_MEMORIES.filter(m => m.id !== selectedMemory.id).slice(0, 3).map(m => (
              <div key={m.id} onClick={() => setSelected(m.id)} style={{
                padding: 12,
                border: '1px solid var(--paper-line)',
                borderRadius: 6,
                background: 'var(--paper-1)',
                cursor: 'pointer',
                display: 'flex',
                gap: 10,
              }}>
                <TagDot color={m.categoryColor}/>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5, fontFamily: 'var(--font-serif)' }}>
                  {m.text.length > 60 ? m.text.slice(0, 58) + '…' : m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px dashed var(--paper-line)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 12 }}>
            최근 활동
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: 'var(--ink-3)' }}>
            {[
              { t: 'Aria가 이 기억을 참조함', d: '2시간 전' },
              { t: 'Sage에서 갱신됨', d: '어제' },
              { t: '카테고리 변경: 직업', d: '3일 전' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sepia)', marginTop: 6, flexShrink: 0 }}></span>
                <div>
                  <div>{a.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-5)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{a.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

// Sidebar shared across the dashboard-style screens
const Sidebar = ({ active }) => {
  const items = [
    { id: 'dashboard', label: '기억 지도', icon: '◉' },
    { id: 'browse', label: '열람 & 검색', icon: '⌕' },
    { id: 'services', label: '연결된 AI', icon: '◇' },
    { id: 'apikeys', label: 'API 키', icon: '⚷' },
    { id: 'settings', label: '설정', icon: '⚙' },
  ];
  return (
    <nav style={{
      padding: '28px 18px',
      borderRight: '1px solid var(--paper-line)',
      background: 'var(--paper-0)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ padding: '0 8px 24px' }}>
        <Logo/>
      </div>

      <div style={{ fontSize: 10, color: 'var(--ink-4)', padding: '12px 12px 6px', letterSpacing: '0.1em' }}>
        WORKSPACE
      </div>

      {items.map(it => (
        <a key={it.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          fontSize: 13,
          color: active === it.id ? 'var(--ink-1)' : 'var(--ink-3)',
          background: active === it.id ? 'var(--paper-2)' : 'transparent',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: active === it.id ? 600 : 400,
          cursor: 'pointer',
        }}>
          <span style={{ width: 16, textAlign: 'center', color: active === it.id ? 'var(--glow)' : 'var(--ink-4)' }}>{it.icon}</span>
          {it.label}
        </a>
      ))}

      <div style={{ marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px dashed var(--paper-line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'var(--sepia-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--paper-0)', fontWeight: 600,
          }}>지</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>이지우</div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>jiwoo@example.com</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

Object.assign(window, { Dashboard, Sidebar });
