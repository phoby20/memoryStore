// API Keys page

const ApiKeys = () => {
  const [showSecret, setShowSecret] = React.useState({});
  const [copied, setCopied] = React.useState(null);

  const keys = [
    { id: 'k1', name: 'Aria 통합', key: 'ms_live_4f8a9d3b71c2e6f0a8b4c9d2e7f1', created: '2026.04.12', lastUsed: '12분 전', scope: '읽기/쓰기', color: 'var(--glow)' },
    { id: 'k2', name: 'Nova 워크스페이스', key: 'ms_live_8c1d6e2a93f5b7d4e0c8a1f6b9e3', created: '2026.03.28', lastUsed: '1시간 전', scope: '읽기/쓰기', color: 'var(--sepia)' },
    { id: 'k3', name: 'Sage (개발용)', key: 'ms_live_2b7f9e4c81a3d6f0b5c2e8a1d4f7', created: '2026.03.15', lastUsed: '3시간 전', scope: '쓰기 전용', color: 'var(--sepia-deep)' },
    { id: 'k4', name: '실험용 — 폐기 예정', key: 'ms_live_9d3a6b1e7c4f0b8a2d5e9c1f4a7b', created: '2026.02.10', lastUsed: '2주 전', scope: '읽기 전용', color: 'var(--ink-5)', expiring: true },
  ];

  const mask = (k) => k.slice(0, 11) + '·' + '•'.repeat(20) + '·' + k.slice(-4);

  const copy = (id, key) => {
    navigator.clipboard?.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '256px 1fr', minHeight: 800, background: 'var(--paper-1)' }}>
      <Sidebar active="apikeys"/>

      <main style={{ padding: '28px 48px', maxWidth: 1100 }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 6 }}>
            인증
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink-1)', margin: 0, fontWeight: 600 }}>
            API 키
          </h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', maxWidth: 640, margin: '8px 0 28px' }}>
          AI 채팅 서비스의 통합 설정에 이 키를 등록하면, 그 서비스가 당신의 기억을 안전하게 읽고 쓸 수 있게 됩니다.
        </p>

        {/* Generate panel */}
        <div className="card" style={{ padding: 24, marginBottom: 32, background: 'var(--paper-0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink-1)', fontWeight: 600, marginBottom: 6 }}>
                새 키 발급
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 520 }}>
                연결할 AI 서비스마다 고유한 키를 발급하시는 것을 권장합니다. 출처가 분리되면 추적과 폐기가 쉬워집니다.
              </div>
            </div>
            <button className="btn btn-glow" style={{ padding: '12px 20px', flexShrink: 0 }}>
              + 새 키 만들기
            </button>
          </div>
        </div>

        {/* Key list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {keys.map(k => (
            <div key={k.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
                {/* color band */}
                <div style={{ width: 4, height: 44, background: k.color, borderRadius: 999, flexShrink: 0 }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink-1)', fontWeight: 600 }}>
                      {k.name}
                    </span>
                    <span className="chip">{k.scope}</span>
                    {k.expiring && <span className="chip" style={{ background: 'rgba(177, 75, 62, 0.1)', color: 'var(--danger)', borderColor: 'rgba(177, 75, 62, 0.25)' }}>곧 폐기</span>}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--ink-3)',
                    background: 'var(--paper-2)',
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid var(--paper-line)',
                    display: 'inline-block',
                    letterSpacing: '0.02em',
                  }}>
                    {showSecret[k.id] ? k.key : mask(k.key)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', minWidth: 120 }}>
                  <span>발급 · {k.created}</span>
                  <span>최근 · {k.lastUsed}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setShowSecret(s => ({ ...s, [k.id]: !s[k.id] }))}
                    className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 12 }}>
                    {showSecret[k.id] ? '숨기기' : '보기'}
                  </button>
                  <button onClick={() => copy(k.id, k.key)}
                    className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 12, minWidth: 70 }}>
                    {copied === k.id ? '✓ 복사됨' : '복사'}
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '8px 10px', fontSize: 12, color: 'var(--danger)' }}>
                    폐기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage strip */}
        <div className="card" style={{ padding: 22, marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink-1)' }}>
              지난 30일 사용량
            </div>
            <span style={{ fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>3,128 / 10,000 호출</span>
          </div>
          <UsageGraph/>
        </div>
      </main>
    </div>
  );
};

const UsageGraph = () => {
  // simulated 30 days
  const data = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      const seed = ((i * 17) % 23) / 23;
      arr.push(20 + Math.floor(seed * 180) + (i > 22 ? 60 : 0));
    }
    return arr;
  }, []);
  const max = Math.max(...data);

  return (
    <svg viewBox="0 0 720 140" style={{ width: '100%', height: 140, display: 'block' }}>
      {data.map((v, i) => {
        const h = (v / max) * 110;
        const x = i * 23 + 8;
        return (
          <g key={i}>
            <rect x={x} y={130 - h} width={14} height={h} fill="var(--sepia-soft)" rx="2" opacity={i > 22 ? 1 : 0.55}/>
          </g>
        );
      })}
      {/* axis */}
      <line x1="0" y1="130" x2="720" y2="130" stroke="var(--paper-line)" strokeWidth="0.6"/>
    </svg>
  );
};

Object.assign(window, { ApiKeys });
