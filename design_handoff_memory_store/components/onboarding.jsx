// Onboarding flow — 4 steps

const Onboarding = () => {
  const [step, setStep] = React.useState(0);
  const totalSteps = 4;

  return (
    <div className="paper" style={{
      minHeight: 720,
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      position: 'relative',
    }}>
      {/* Top */}
      <header style={{ padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo/>
        <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>건너뛰기</button>
      </header>

      {/* Body */}
      <div style={{ padding: '20px 48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <React.Fragment key={i}>
              <div style={{
                width: i === step ? 28 : 8,
                height: 8,
                borderRadius: 999,
                background: i <= step ? 'var(--glow)' : 'var(--paper-3)',
                transition: 'all 0.3s',
              }}></div>
              {i < totalSteps - 1 && (
                <div style={{ width: 16, height: 1, background: 'var(--paper-line)' }}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ width: '100%', maxWidth: 720 }}>
          {step === 0 && <OnboardWelcome/>}
          {step === 1 && <OnboardCategories/>}
          {step === 2 && <OnboardKey/>}
          {step === 3 && <OnboardConnect/>}
        </div>
      </div>

      {/* Footer nav */}
      <footer style={{
        padding: '20px 48px',
        borderTop: '1px solid var(--paper-line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--paper-0)',
      }}>
        <button className="btn btn-ghost"
          style={{ padding: '10px 18px', fontSize: 13, visibility: step === 0 ? 'hidden' : 'visible' }}
          onClick={() => setStep(s => Math.max(0, s - 1))}>
          ← 이전
        </button>
        <span style={{ fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
          {step + 1} / {totalSteps}
        </span>
        <button className="btn btn-glow"
          style={{ padding: '10px 22px', fontSize: 13 }}
          onClick={() => setStep(s => Math.min(totalSteps - 1, s + 1))}>
          {step === totalSteps - 1 ? '대시보드로' : '다음'} →
        </button>
      </footer>
    </div>
  );
};

const OnboardWelcome = () => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <radialGradient id="ob-glow">
            <stop offset="0%" stopColor="var(--glow-soft)"/>
            <stop offset="60%" stopColor="var(--glow)"/>
            <stop offset="100%" stopColor="var(--glow-deep)"/>
          </radialGradient>
        </defs>
        <NeuralLink x1={60} y1={60} x2={20} y2={30}/>
        <NeuralLink x1={60} y1={60} x2={100} y2={30}/>
        <NeuralLink x1={60} y1={60} x2={20} y2={90}/>
        <NeuralLink x1={60} y1={60} x2={100} y2={90}/>
        <NeuralLink x1={60} y1={60} x2={60} y2={10}/>
        <NeuralLink x1={60} y1={60} x2={60} y2={110}/>
        <circle cx="20" cy="30" r="4" fill="var(--sepia)"/>
        <circle cx="100" cy="30" r="4" fill="var(--sepia)"/>
        <circle cx="20" cy="90" r="4" fill="var(--sepia)"/>
        <circle cx="100" cy="90" r="4" fill="var(--sepia)"/>
        <circle cx="60" cy="10" r="4" fill="var(--sepia)"/>
        <circle cx="60" cy="110" r="4" fill="var(--sepia)"/>
        <circle cx="60" cy="60" r="20" fill="url(#ob-glow)" opacity="0.3"/>
        <circle cx="60" cy="60" r="12" fill="url(#ob-glow)">
          <animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 600, color: 'var(--ink-1)', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
      환영합니다.
    </h1>
    <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-3)', maxWidth: 520, margin: '0 auto' }}>
      Memory Store는 AI들이 당신을 잊지 않게 도와주는 두 번째 두뇌입니다.<br/>
      앞으로 4분 정도, 함께 설정해 볼게요.
    </p>
    <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48, fontSize: 13, color: 'var(--ink-4)' }}>
      {['카테고리 선택', 'API 키 발급', 'AI 연결'].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%',
            border: '1px dashed var(--paper-line)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)',
          }}>{i + 1}</span>
          {s}
        </div>
      ))}
    </div>
  </div>
);

const OnboardCategories = () => {
  const [picked, setPicked] = React.useState(['식습관', '직업', '가족', '관심사']);
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600, color: 'var(--ink-1)', margin: '0 0 8px' }}>
        무엇을 기억해 둘까요?
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 28px' }}>
        AI가 자동으로 정리할 카테고리를 선택해 주세요. 나중에 추가하거나 바꿀 수 있어요.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {CATEGORIES.map(c => {
          const on = picked.includes(c.name);
          return (
            <button key={c.name}
              onClick={() => setPicked(p => on ? p.filter(x => x !== c.name) : [...p, c.name])}
              style={{
                padding: '20px 16px',
                background: on ? 'var(--paper-0)' : 'transparent',
                border: on ? `1.5px solid ${c.color}` : '1px solid var(--paper-line)',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.15s',
              }}>
              <span style={{
                display: 'block',
                width: 18, height: 18, borderRadius: '50%',
                background: c.color, opacity: on ? 1 : 0.4,
                margin: '0 auto 10px',
              }}></span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: on ? 'var(--ink-1)' : 'var(--ink-3)', fontWeight: on ? 600 : 400 }}>
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 20, fontSize: 12, color: 'var(--ink-4)', textAlign: 'center' }}>
        {picked.length}개 선택됨 · 권장 4–8개
      </div>
    </div>
  );
};

const OnboardKey = () => (
  <div>
    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600, color: 'var(--ink-1)', margin: '0 0 8px' }}>
      당신의 첫 API 키입니다.
    </h2>
    <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 28px' }}>
      이 키를 AI 채팅 서비스에 등록하세요. <strong>이 화면을 닫으면 다시 볼 수 없습니다.</strong>
    </p>
    <div style={{
      padding: 28,
      background: 'var(--paper-0)',
      borderRadius: 12,
      border: '2px solid var(--glow)',
      position: 'relative',
    }}>
      <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
        <span>PRIMARY KEY</span>
        <span style={{ color: 'var(--success)' }}>● 새로 발급됨</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 15,
        color: 'var(--ink-1)',
        background: 'var(--paper-2)',
        padding: '14px 16px',
        borderRadius: 6,
        wordBreak: 'break-all',
        border: '1px dashed var(--paper-line)',
        letterSpacing: '0.02em',
      }}>
        ms_live_4f8a9d3b71c2e6f0a8b4c9d2e7f1
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12, flex: 1 }}>
          📋 복사
        </button>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12, flex: 1 }}>
          ↓ .env 파일로 내려받기
        </button>
      </div>
    </div>
    <div style={{
      marginTop: 16,
      padding: '14px 18px',
      background: 'rgba(201, 148, 60, 0.08)',
      borderRadius: 6,
      borderLeft: '3px solid var(--warn)',
      fontSize: 13,
      color: 'var(--ink-2)',
      lineHeight: 1.55,
    }}>
      <strong style={{ color: 'var(--warn)' }}>⚠ 안전 보관</strong> — 이 키는 비밀번호와 같습니다. 깃허브 등 공개된 곳에 절대 올리지 마세요.
    </div>
  </div>
);

const OnboardConnect = () => {
  const [connected, setConnected] = React.useState(['Aria']);
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600, color: 'var(--ink-1)', margin: '0 0 8px' }}>
        어떤 AI에 연결할까요?
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 28px' }}>
        한 가지부터 시작해도 좋아요. 모든 AI에서 같은 키를 쓰면 기억이 자연스럽게 합쳐집니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {AI_SERVICES.slice(0, 6).map(s => {
          const on = connected.includes(s.name);
          return (
            <button key={s.name}
              onClick={() => setConnected(c => on ? c.filter(x => x !== s.name) : [...c, s.name])}
              style={{
                padding: 18,
                background: on ? 'var(--paper-0)' : 'transparent',
                border: on ? '1.5px solid var(--glow)' : '1px solid var(--paper-line)',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 22, color: 'var(--sepia-deep)' }}>{s.glyph}</span>
                {on && <span style={{ color: 'var(--glow)', fontSize: 14 }}>✓</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, color: 'var(--ink-1)' }}>
                {s.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{s.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

Object.assign(window, { Onboarding });
