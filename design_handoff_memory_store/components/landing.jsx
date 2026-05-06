// Landing page

const Landing = () => {
  // generate neural background nodes
  const nodes = React.useMemo(() => {
    const arr = [];
    const seed = (i) => ((i * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 22; i++) {
      arr.push({
        x: 80 + seed(i) * 1080,
        y: 60 + seed(i + 100) * 480,
        r: 3 + seed(i + 200) * 4,
      });
    }
    return arr;
  }, []);

  const links = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 240 && Math.random() > 0.5) {
          arr.push({ a: i, b: j, d });
        }
      }
    }
    return arr;
  }, [nodes]);

  return (
    <div className="paper" style={{ minHeight: 720, position: 'relative', overflow: 'hidden' }}>
      {/* Top nav */}
      <header style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 48px',
        borderBottom: '1px solid var(--paper-line)',
      }}>
        <Logo/>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, color: 'var(--ink-3)' }}>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>작동 방식</a>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>연결 가능한 AI</a>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>프라이버시</a>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>요금제</a>
          <a className="btn-ghost btn" style={{ padding: '8px 14px', fontSize: 13 }}>로그인</a>
          <a className="btn" style={{ padding: '8px 16px', fontSize: 13 }}>시작하기</a>
        </nav>
      </header>

      {/* Hero */}
      <section style={{
        position: 'relative',
        padding: '80px 48px 100px',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        gap: 60,
        alignItems: 'center',
      }}>
        {/* neural background — decorative, sits behind both columns */}
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18, pointerEvents: 'none' }}>
          {links.map((l, i) => (
            <NeuralLink key={i} x1={nodes[l.a].x} y1={nodes[l.a].y} x2={nodes[l.b].x} y2={nodes[l.b].y} opacity={0.5}/>
          ))}
          {nodes.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="var(--sepia)" opacity="0.4"/>
          ))}
        </svg>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="chip chip-glow" style={{ marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--glow)' }}></span>
            모든 AI를 가로지르는 단 하나의 기억
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 58,
            lineHeight: 1.12,
            fontWeight: 600,
            color: 'var(--ink-1)',
            letterSpacing: '-0.02em',
            margin: '0 0 28px',
            wordBreak: 'keep-all',
          }}>
            당신을 기억하는<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--sepia-deep)', whiteSpace: 'nowrap' }}>두 번째 두뇌.</span>
            <span style={{ display: 'block', marginTop: 4 }}>
              <HandUnderline width={300}/>
            </span>
          </h1>
          <p style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: 'var(--ink-3)',
            maxWidth: 520,
            margin: '0 0 36px',
            wordBreak: 'keep-all',
          }}>
            한 번 등록한 API 키로 Aria든, Nova든, Sage든 — 어느 AI를 쓰더라도 <em>"내가 누구인지"</em>를 알게 됩니다. Memory Store는 당신의 대화에서 의미 있는 사실들을 추출해 일기처럼 보관합니다.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a className="btn btn-glow" style={{ padding: '14px 24px', fontSize: 15 }}>
              무료로 시작하기
              <span style={{ fontSize: 16, marginLeft: 4 }}>→</span>
            </a>
            <a className="btn btn-ghost" style={{ padding: '13px 22px', fontSize: 15 }}>
              데모 보기
            </a>
          </div>
          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 18, fontSize: 12, color: 'var(--ink-4)' }}>
            <span>✓ 30일 무료</span>
            <span>✓ 카드 등록 불필요</span>
            <span>✓ 언제든 데이터 내보내기</span>
          </div>
        </div>

        {/* Right: visualization preview */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <LandingPreview/>
        </div>
      </section>

      {/* "How it works" strip */}
      <section style={{ padding: '40px 48px 80px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 12 }}>
              작동 방식
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--ink-1)', margin: 0, fontWeight: 600 }}>
              세 단계면 충분합니다
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { n: '01', t: 'API 키 발급', d: 'Memory Store에 가입하고 개인 API 키를 하나 발급받습니다. 30초면 끝납니다.', i: 'key' },
              { n: '02', t: 'AI 서비스에 연결', d: '키를 즐겨 쓰는 AI 채팅 서비스의 통합 설정에 등록합니다.', i: 'plug' },
              { n: '03', t: '대화하면 자동 저장', d: '대화 중 AI가 검색하거나 학습한 사실은 자동으로 Memory Store에 쌓입니다.', i: 'archive' },
            ].map(s => (
              <div key={s.n} className="card" style={{ padding: 28, position: 'relative' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--glow)', marginBottom: 16, letterSpacing: '0.05em' }}>
                  STEP / {s.n}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink-1)', margin: '0 0 10px', fontWeight: 600 }}>
                  {s.t}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-3)', margin: 0 }}>
                  {s.d}
                </p>
                {/* tiny illustration */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px dashed var(--paper-line)' }}>
                  <StepGlyph kind={s.i}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer ribbon */}
      <footer style={{
        padding: '32px 48px',
        borderTop: '1px solid var(--paper-line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
        color: 'var(--ink-4)',
      }}>
        <Logo/>
        <span>© 2026 Memory Store · 당신의 기억은 당신의 것입니다.</span>
      </footer>
    </div>
  );
};

const StepGlyph = ({ kind }) => {
  if (kind === 'key') {
    return (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', background: 'var(--paper-2)', padding: '10px 12px', borderRadius: 6, border: '1px dashed var(--paper-line)' }}>
        <span style={{ color: 'var(--ink-5)' }}>ms_key_</span>
        <span>4f8a·d3b9·····7c2e</span>
      </div>
    );
  }
  if (kind === 'plug') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {['✦', '◇', '◈', '○', '△'].map((g, i) => (
          <span key={i} style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--paper-2)', border: '1px solid var(--paper-line)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--sepia-deep)', fontSize: 14,
          }}>{g}</span>
        ))}
      </div>
    );
  }
  return (
    <svg width="100%" height="48" viewBox="0 0 280 48">
      <path d="M 10 24 Q 70 8, 140 24 T 270 24" fill="none" stroke="var(--ink-4)" strokeWidth="0.8" strokeDasharray="3 3"/>
      {[10, 70, 140, 210, 270].map((x, i) => (
        <circle key={i} cx={x} cy={24 - (i % 2 === 0 ? 0 : -8)} r="3.5" fill={i === 4 ? 'var(--glow)' : 'var(--sepia)'}/>
      ))}
    </svg>
  );
};

// Mini graph preview shown in the hero
const LandingPreview = () => {
  return (
    <div className="card" style={{
      padding: 22,
      background: 'var(--paper-0)',
      transform: 'rotate(0.5deg)',
      boxShadow: 'var(--shadow-3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--glow)', flexShrink: 0 }}></span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>나의 기억 지도</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>104 nodes</span>
      </div>
      <svg viewBox="0 0 440 360" style={{ width: '100%', height: 360, display: 'block' }}>
        {/* graph paper grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--paper-line)" strokeWidth="0.4" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="440" height="360" fill="url(#grid)"/>

        {/* connections */}
        <NeuralLink x1={220} y1={180} x2={120} y2={90}/>
        <NeuralLink x1={220} y1={180} x2={340} y2={100}/>
        <NeuralLink x1={220} y1={180} x2={90} y2={220}/>
        <NeuralLink x1={220} y1={180} x2={360} y2={240}/>
        <NeuralLink x1={220} y1={180} x2={180} y2={310}/>
        <NeuralLink x1={220} y1={180} x2={300} y2={300}/>
        <NeuralLink x1={120} y1={90} x2={60} y2={140}/>
        <NeuralLink x1={340} y1={100} x2={400} y2={170}/>
        <NeuralLink x1={90} y1={220} x2={60} y2={140}/>
        <NeuralLink x1={180} y1={310} x2={300} y2={300}/>

        {/* satellite nodes */}
        <NeuralNode x={120} y={90} r={5} label="식습관" color="#6B8E5A"/>
        <NeuralNode x={340} y={100} r={5} label="직업" color="#8B6F47"/>
        <NeuralNode x={90} y={220} r={5} label="독서" color="#9C5A30"/>
        <NeuralNode x={360} y={240} r={5} label="가족" color="#B14B3E"/>
        <NeuralNode x={180} y={310} r={5} label="생활" color="#C97B4A"/>
        <NeuralNode x={300} y={300} r={5} label="성향" color="#C9943C"/>
        <NeuralNode x={60} y={140} r={3} color="#6B8E5A"/>
        <NeuralNode x={400} y={170} r={3} color="#8B6F47"/>

        {/* central self-node */}
        <g>
          <circle cx="220" cy="180" r="22" fill="var(--glow)" opacity="0.12"/>
          <circle cx="220" cy="180" r="14" fill="var(--glow)" opacity="0.25"/>
          <circle cx="220" cy="180" r="9" fill="var(--glow)" stroke="var(--ink-2)" strokeWidth="0.8">
            <animate attributeName="r" values="9;10;9" dur="3s" repeatCount="indefinite"/>
          </circle>
          <text x="220" y="158" textAnchor="middle" fontSize="10" fill="var(--ink-2)"
            fontFamily="var(--font-serif)" fontStyle="italic">나</text>
        </g>
      </svg>
      <div style={{
        marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--paper-line)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)',
      }}>
        <span>마지막 갱신 · 12분 전 · Aria</span>
        <span>↗ 전체 그래프 보기</span>
      </div>
    </div>
  );
};

Object.assign(window, { Landing });
