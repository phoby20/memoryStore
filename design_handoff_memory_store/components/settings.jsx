// Settings page (privacy + categories)

const Settings = () => {
  const [tab, setTab] = React.useState('privacy');

  const tabs = [
    { id: 'privacy', label: '프라이버시' },
    { id: 'categories', label: '카테고리' },
    { id: 'profile', label: '프로필' },
    { id: 'export', label: '데이터 관리' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '256px 1fr', minHeight: 800, background: 'var(--paper-1)' }}>
      <Sidebar active="settings"/>
      <main style={{ padding: '28px 48px', maxWidth: 980 }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 6 }}>
            워크스페이스
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink-1)', margin: 0, fontWeight: 600 }}>
            설정
          </h1>
        </div>

        {/* Tab strip */}
        <div style={{ display: 'flex', gap: 4, marginTop: 24, marginBottom: 28, borderBottom: '1px solid var(--paper-line)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              fontSize: 14,
              color: tab === t.id ? 'var(--ink-1)' : 'var(--ink-4)',
              fontWeight: tab === t.id ? 600 : 400,
              borderBottom: tab === t.id ? '2px solid var(--glow)' : '2px solid transparent',
              marginBottom: -1,
              cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'privacy' && <PrivacyTab/>}
        {tab === 'categories' && <CategoriesTab/>}
        {tab === 'profile' && <ProfileTab/>}
        {tab === 'export' && <ExportTab/>}
      </main>
    </div>
  );
};

const PrivacyTab = () => {
  const [settings, setSettings] = React.useState({
    autoCollect: true,
    sensitiveBlock: true,
    encrypt: true,
    aiTraining: false,
    sharedSummary: false,
  });

  const items = [
    { id: 'autoCollect', t: '자동 수집', d: 'AI 대화 중 의미 있는 사실이 감지되면 Memory Store에 자동 저장합니다.' },
    { id: 'sensitiveBlock', t: '민감 정보 차단', d: '비밀번호·카드번호·주민등록번호 등은 자동으로 저장에서 제외합니다.' },
    { id: 'encrypt', t: '엔드투엔드 암호화', d: '저장된 모든 기억은 당신만 가진 키로 암호화됩니다. 우리도 읽을 수 없습니다.' },
    { id: 'aiTraining', t: 'AI 학습 기여 (옵션)', d: '익명화된 패턴이 모델 개선에 사용되도록 허용합니다. 언제든 끌 수 있습니다.' },
    { id: 'sharedSummary', t: '서비스 간 요약 공유', d: '한 AI에서 만든 요약을 다른 AI들도 참조할 수 있게 합니다.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(it => (
        <div key={it.id} className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 4 }}>
              {it.t}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55 }}>{it.d}</div>
          </div>
          <Toggle on={settings[it.id]} onChange={() => setSettings(s => ({ ...s, [it.id]: !s[it.id] }))}/>
        </div>
      ))}
    </div>
  );
};

const CategoriesTab = () => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, maxWidth: 540 }}>
          카테고리는 Memory Store가 기억을 자동으로 분류하는 기준입니다. 색은 그래프와 카드에 그대로 반영됩니다.
        </p>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>+ 새 카테고리</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {CATEGORIES.map(c => (
          <div key={c.name} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: c.color, border: '1px solid var(--paper-line)', flexShrink: 0 }}></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, color: 'var(--ink-1)' }}>
                {c.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{c.count}개의 기억</div>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--ink-4)', fontSize: 16, cursor: 'pointer' }}>⋯</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileTab = () => (
  <div className="card" style={{ padding: 28 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 24, borderBottom: '1px dashed var(--paper-line)', marginBottom: 24 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 12,
        background: 'var(--sepia-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--paper-0)', fontWeight: 600,
      }}>지</div>
      <div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink-1)' }}>이지우</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>jiwoo@example.com</div>
      </div>
      <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '8px 14px', fontSize: 12 }}>편집</button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <Field label="언어" value="한국어"/>
      <Field label="시간대" value="Asia/Seoul (UTC+9)"/>
      <Field label="가입일" value="2026.02.10"/>
      <Field label="요금제" value="Free · 100/일"/>
    </div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{value}</div>
  </div>
);

const ExportTab = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div className="card" style={{ padding: 22 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 6 }}>
        전체 기억 내보내기
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>
        JSON, Markdown, 또는 PDF 형식으로 모든 기억과 메타데이터를 다운로드할 수 있습니다.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>JSON</button>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Markdown</button>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>PDF (인쇄용)</button>
      </div>
    </div>
    <div className="card" style={{ padding: 22, borderColor: 'rgba(177, 75, 62, 0.25)' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>
        모든 기억 영구 삭제
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>
        이 작업은 되돌릴 수 없습니다. 연결된 모든 AI 서비스의 학습 기록도 함께 삭제됩니다.
      </div>
      <button className="btn" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', padding: '8px 14px', fontSize: 12 }}>
        영구 삭제 요청…
      </button>
    </div>
  </div>
);

Object.assign(window, { Settings });
