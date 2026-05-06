// Connected AI Services page

const Services = () => {
  const [services, setServices] = React.useState(AI_SERVICES);

  const toggle = (name) => {
    setServices(s => s.map(svc => svc.name === name
      ? { ...svc, status: svc.status === 'connected' ? 'paused' : 'connected' }
      : svc));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '256px 1fr', minHeight: 800, background: 'var(--paper-1)' }}>
      <Sidebar active="services"/>
      <main style={{ padding: '28px 48px', maxWidth: 1100 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 6 }}>
            연동
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink-1)', margin: 0, fontWeight: 600 }}>
            연결된 AI 서비스
          </h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', maxWidth: 640, margin: '8px 0 32px' }}>
          Memory Store API를 지원하는 AI 채팅 서비스 목록입니다. 토글로 일시 정지하거나 다시 연결할 수 있습니다.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {services.map(s => (
            <div key={s.name} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: 'var(--paper-2)',
                    border: '1px solid var(--paper-line)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, color: 'var(--sepia-deep)',
                    fontFamily: 'var(--font-serif)',
                  }}>{s.glyph}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 2 }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{s.desc}</div>
                  </div>
                </div>
                <Toggle on={s.status === 'connected'} onChange={() => toggle(s.name)} disabled={s.status === 'available' || s.status === 'pending'}/>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12, padding: '14px 0',
                borderTop: '1px dashed var(--paper-line)',
                borderBottom: '1px dashed var(--paper-line)',
              }}>
                <Stat label="상태" value={
                  s.status === 'connected' ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>● 연결됨</span> :
                  s.status === 'paused' ? <span style={{ color: 'var(--warn)', fontWeight: 600 }}>● 정지</span> :
                  s.status === 'pending' ? <span style={{ color: 'var(--ink-4)' }}>● 인증 대기</span> :
                  <span style={{ color: 'var(--ink-5)' }}>○ 미연결</span>
                }/>
                <Stat label="마지막 동기화" value={s.lastSync}/>
                <Stat label="수집된 기억" value={s.collected}/>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {s.status === 'available' ? (
                  <button className="btn btn-glow" style={{ padding: '8px 14px', fontSize: 12, flex: 1 }}>
                    연결하기
                  </button>
                ) : s.status === 'pending' ? (
                  <button className="btn" style={{ padding: '8px 14px', fontSize: 12, flex: 1 }}>
                    인증 마저하기
                  </button>
                ) : (
                  <>
                    <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12, flex: 1 }}>
                      통합 가이드 보기
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
                      ⋯
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Request more */}
        <div className="card" style={{
          marginTop: 24,
          padding: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--paper-2)',
          borderStyle: 'dashed',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 4 }}>
              찾는 서비스가 없으신가요?
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              연동 요청을 남기시면 우선순위에 반영합니다. 또는 직접 통합도 가능합니다.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>요청 남기기</button>
            <button className="btn" style={{ padding: '10px 16px', fontSize: 13 }}>API 문서</button>
          </div>
        </div>
      </main>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{value}</div>
  </div>
);

const Toggle = ({ on, onChange, disabled }) => (
  <button onClick={() => !disabled && onChange()}
    disabled={disabled}
    style={{
      width: 42, height: 24, borderRadius: 999,
      background: disabled ? 'var(--paper-2)' : (on ? 'var(--glow)' : 'var(--paper-3)'),
      border: '1px solid var(--paper-line)',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.2s',
      opacity: disabled ? 0.5 : 1,
    }}>
    <span style={{
      position: 'absolute', top: 2, left: on ? 20 : 2,
      width: 18, height: 18, borderRadius: '50%',
      background: 'var(--paper-0)',
      boxShadow: 'var(--shadow-1)',
      transition: 'left 0.2s',
    }}></span>
  </button>
);

Object.assign(window, { Services, Toggle });
