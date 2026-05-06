// Mobile screens — phone-frame versions of the main views

const MobileFrame = ({ children, title, showTab = true }) => (
  <div style={{
    width: '100%', height: '100%',
    background: 'var(--paper-1)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    fontSize: 14,
  }}>
    {/* Status bar */}
    <div style={{
      padding: '14px 20px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)',
      background: 'var(--paper-0)',
    }}>
      <span style={{ fontWeight: 600 }}>9:41</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 10 }}>
        <span>●●●●</span><span>5G</span><span>▮▮▮</span>
      </span>
    </div>
    {/* Header */}
    <div style={{
      padding: '12px 20px',
      borderBottom: '1px solid var(--paper-line)',
      background: 'var(--paper-0)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink-1)' }}>
        {title}
      </span>
      <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sepia-soft)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-serif)', color: 'var(--paper-0)', fontSize: 13, fontWeight: 600 }}>지</span>
    </div>
    <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
    {showTab && <MobileTabBar/>}
  </div>
);

const MobileTabBar = () => {
  const tabs = [
    { i: '◉', l: '지도', a: true },
    { i: '⌕', l: '검색' },
    { i: '◇', l: 'AI' },
    { i: '⚙', l: '설정' },
  ];
  return (
    <div style={{
      borderTop: '1px solid var(--paper-line)',
      background: 'var(--paper-0)',
      padding: '8px 0 16px',
      display: 'flex',
    }}>
      {tabs.map(t => (
        <div key={t.l} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: t.a ? 'var(--glow)' : 'var(--ink-4)',
          fontSize: 10, fontWeight: t.a ? 600 : 400,
        }}>
          <span style={{ fontSize: 18 }}>{t.i}</span>
          {t.l}
        </div>
      ))}
    </div>
  );
};

const MobileDashboard = () => {
  return (
    <MobileFrame title="기억 지도">
      <div style={{ padding: 20 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 4 }}>
            오늘 · 04.28
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink-1)' }}>
            104개의 기억이 모였어요.
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { k: '연결된 AI', v: '4', s: '/ 6' },
            { k: '이번 주', v: '+7', s: '신규' },
          ].map(s => (
            <div key={s.k} className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 4 }}>{s.k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink-1)' }}>{s.v}</span>
                <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>{s.s}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mini graph */}
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>나의 신경망</div>
          <svg viewBox="0 0 320 200" style={{ width: '100%', height: 200 }}>
            <NeuralLink x1={160} y1={100} x2={60} y2={50}/>
            <NeuralLink x1={160} y1={100} x2={260} y2={60}/>
            <NeuralLink x1={160} y1={100} x2={50} y2={150}/>
            <NeuralLink x1={160} y1={100} x2={270} y2={160}/>
            <NeuralLink x1={160} y1={100} x2={130} y2={180}/>
            <NeuralLink x1={160} y1={100} x2={210} y2={180}/>
            <NeuralNode x={60} y={50} r={5} color="#6B8E5A" label="식습관"/>
            <NeuralNode x={260} y={60} r={5} color="#8B6F47" label="직업"/>
            <NeuralNode x={50} y={150} r={5} color="#9C5A30" label="독서"/>
            <NeuralNode x={270} y={160} r={5} color="#B14B3E" label="가족"/>
            <NeuralNode x={130} y={180} r={4} color="#C97B4A"/>
            <NeuralNode x={210} y={180} r={4} color="#C9943C"/>
            <circle cx="160" cy="100" r="20" fill="var(--glow)" opacity="0.15"/>
            <circle cx="160" cy="100" r="12" fill="var(--glow)" opacity="0.3"/>
            <circle cx="160" cy="100" r="7" fill="var(--glow)" stroke="var(--ink-2)" strokeWidth="0.6"/>
          </svg>
        </div>

        {/* Recent */}
        <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>최근 추가됨</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SAMPLE_MEMORIES.slice(0, 3).map(m => (
            <MemoryCard key={m.id} memory={m} compact/>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
};

const MobileDetail = () => {
  const m = SAMPLE_MEMORIES[2];
  return (
    <MobileFrame title="기억 상세" showTab={false}>
      <div style={{ padding: 20 }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 13, padding: 0, marginBottom: 18, cursor: 'pointer' }}>
          ← 지도로
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <TagDot color={m.categoryColor}/>
          <span style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            {m.category}
          </span>
        </div>

        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 19, lineHeight: 1.55, color: 'var(--ink-1)',
          marginBottom: 24,
        }}>
          {m.text}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {m.tags.map(t => <span key={t} className="chip">#{t}</span>)}
        </div>

        <div style={{ paddingTop: 18, borderTop: '1px dashed var(--paper-line)', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>출처</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-2)' }}>
            <span style={{ fontSize: 18, color: 'var(--glow)' }}>✦</span>
            <div>
              <div style={{ fontWeight: 600 }}>{m.source}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{m.date}</div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 18, borderTop: '1px dashed var(--paper-line)', marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
            연결된 기억 ({m.linked})
          </div>
          {SAMPLE_MEMORIES.filter(x => x.id !== m.id).slice(0, 2).map(rm => (
            <div key={rm.id} style={{
              padding: 12, background: 'var(--paper-2)', borderRadius: 6, marginBottom: 8,
              fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-serif)', lineHeight: 1.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <TagDot color={rm.categoryColor}/>
                <span style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase' }}>{rm.category}</span>
              </div>
              {rm.text.slice(0, 70)}…
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1, padding: '12px', fontSize: 13 }}>편집</button>
          <button className="btn btn-ghost" style={{ flex: 1, padding: '12px', fontSize: 13, color: 'var(--danger)' }}>삭제</button>
        </div>
      </div>
    </MobileFrame>
  );
};

const MobileServices = () => {
  return (
    <MobileFrame title="연결된 AI">
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18, lineHeight: 1.55 }}>
          토글로 각 AI 서비스의 동기화를 켜고 끌 수 있어요.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AI_SERVICES.slice(0, 5).map(s => (
            <div key={s.name} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: 'var(--paper-2)', border: '1px solid var(--paper-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'var(--sepia-deep)', flexShrink: 0,
              }}>{s.glyph}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, color: 'var(--ink-1)' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                  {s.status === 'connected' ? `${s.collected}개 · ${s.lastSync}` :
                   s.status === 'pending' ? '인증 대기 중' : '미연결'}
                </div>
              </div>
              <Toggle on={s.status === 'connected'} disabled={s.status !== 'connected' && s.status !== 'paused'} onChange={() => {}}/>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 20, padding: 16, background: 'var(--paper-2)', borderStyle: 'dashed' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--ink-1)' }}>팁 —</strong> 같은 키를 여러 AI에 등록하면 기억이 자연스럽게 합쳐집니다.
          </div>
        </div>
      </div>
    </MobileFrame>
  );
};

Object.assign(window, { MobileDashboard, MobileDetail, MobileServices });
