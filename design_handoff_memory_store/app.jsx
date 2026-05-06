// Main app — wires up all screens into a design canvas with tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "memoryDisplay": "graph",
  "accentHue": "copper"
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  copper: { glow: '#C97B4A', glowSoft: '#E8A87C', glowDeep: '#9C5A30' },
  sage:   { glow: '#7A9C6B', glowSoft: '#A8C39B', glowDeep: '#557048' },
  ink:    { glow: '#5C7A8B', glowSoft: '#94B0BE', glowDeep: '#3E5664' },
  rose:   { glow: '#B5705F', glowSoft: '#D89E8C', glowDeep: '#8A4A3D' },
};

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme + accent
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    const a = ACCENT_PRESETS[tweaks.accentHue] || ACCENT_PRESETS.copper;
    document.documentElement.style.setProperty('--glow', a.glow);
    document.documentElement.style.setProperty('--glow-soft', a.glowSoft);
    document.documentElement.style.setProperty('--glow-deep', a.glowDeep);
  }, [tweaks.theme, tweaks.accentHue]);

  return (
    <>
      <DesignCanvas
        title="Memory Store"
        subtitle="당신을 기억하는 두 번째 두뇌 — 모든 AI를 가로지르는 단 하나의 메모리"
      >
        <DCSection id="entry" title="진입 화면">
          <DCArtboard id="landing" label="랜딩 페이지" width={1280} height={1400}>
            <Landing/>
          </DCArtboard>
          <DCArtboard id="onboarding" label="온보딩 (4 스텝)" width={1100} height={760}>
            <Onboarding/>
          </DCArtboard>
        </DCSection>

        <DCSection id="core" title="핵심 워크스페이스">
          <DCArtboard id="dashboard" label="대시보드 — 기억 지도" width={1440} height={900}>
            <Dashboard memoryDisplay={tweaks.memoryDisplay}/>
          </DCArtboard>
          <DCArtboard id="browse" label="열람 & 검색" width={1440} height={900}>
            <Browse/>
          </DCArtboard>
        </DCSection>

        <DCSection id="manage" title="연동 & 관리">
          <DCArtboard id="services" label="연결된 AI 서비스" width={1280} height={900}>
            <Services/>
          </DCArtboard>
          <DCArtboard id="apikeys" label="API 키 관리" width={1280} height={900}>
            <ApiKeys/>
          </DCArtboard>
          <DCArtboard id="settings" label="설정 — 프라이버시" width={1280} height={900}>
            <Settings/>
          </DCArtboard>
        </DCSection>

        <DCSection id="mobile" title="모바일 (반응형)">
          <DCArtboard id="mobile-dashboard" label="모바일 — 기억 지도" width={390} height={800}>
            <MobileDashboard/>
          </DCArtboard>
          <DCArtboard id="mobile-detail" label="모바일 — 기억 상세" width={390} height={800}>
            <MobileDetail/>
          </DCArtboard>
          <DCArtboard id="mobile-services" label="모바일 — 연결" width={390} height={800}>
            <MobileServices/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection title="테마">
          <TweakRadio
            label="모드"
            value={tweaks.theme}
            onChange={(v) => setTweak('theme', v)}
            options={[
              { value: 'light', label: '라이트' },
              { value: 'dark', label: '다크' },
            ]}
          />
          <TweakRadio
            label="액센트"
            value={tweaks.accentHue}
            onChange={(v) => setTweak('accentHue', v)}
            options={[
              { value: 'copper', label: '구리' },
              { value: 'sage', label: '세이지' },
              { value: 'ink', label: '잉크' },
              { value: 'rose', label: '로즈' },
            ]}
          />
        </TweakSection>
        <TweakSection title="기억 표시">
          <TweakRadio
            label="대시보드 시각화"
            value={tweaks.memoryDisplay}
            onChange={(v) => setTweak('memoryDisplay', v)}
            options={[
              { value: 'graph', label: '그래프' },
              { value: 'card', label: '카드' },
              { value: 'timeline', label: '타임라인' },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
