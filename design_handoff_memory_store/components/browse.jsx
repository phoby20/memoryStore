// Browse & Search page

const Browse = () => {
  const [query, setQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState(null);
  const [activeSource, setActiveSource] = React.useState(null);

  const filtered = SAMPLE_MEMORIES.filter(m => {
    if (activeCategory && m.category !== activeCategory) return false;
    if (activeSource && m.source !== activeSource) return false;
    if (query && !m.text.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '256px 240px 1fr', minHeight: 800, background: 'var(--paper-1)' }}>
      <Sidebar active="browse"/>

      {/* Filter rail */}
      <aside style={{ borderRight: '1px solid var(--paper-line)', background: 'var(--paper-0)', padding: '28px 20px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 14 }}>
          카테고리
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 28 }}>
          <button onClick={() => setActiveCategory(null)} style={filterBtnStyle(activeCategory === null)}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink-4)' }}></span>
            <span style={{ flex: 1, textAlign: 'left' }}>전체</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>104</span>
          </button>
          {CATEGORIES.map(c => (
            <button key={c.name} onClick={() => setActiveCategory(c.name === activeCategory ? null : c.name)}
              style={filterBtnStyle(activeCategory === c.name)}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }}></span>
              <span style={{ flex: 1, textAlign: 'left' }}>{c.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>{c.count}</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 14 }}>
          출처 (AI)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 28 }}>
          {AI_SERVICES.filter(s => s.collected > 0).map(s => (
            <button key={s.name} onClick={() => setActiveSource(s.name === activeSource ? null : s.name)}
              style={filterBtnStyle(activeSource === s.name)}>
              <span style={{ color: 'var(--glow)', width: 14, textAlign: 'center' }}>{s.glyph}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{s.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>{s.collected}</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 14 }}>
          기간
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {['오늘', '이번 주', '이번 달', '올해', '전체'].map((p, i) => (
            <button key={p} style={filterBtnStyle(i === 4)}>
              <span style={{ flex: 1, textAlign: 'left', paddingLeft: 16 }}>{p}</span>
            </button>
          ))}
        </div>
      </aside>

      <main style={{ padding: '28px 36px' }}>
        {/* Search header */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="기억을 검색하세요. 예: 좋아하는 음식, 가족, 작년 여행…"
            style={{
              width: '100%',
              padding: '16px 20px 16px 50px',
              fontSize: 16,
              fontFamily: 'var(--font-serif)',
              background: 'var(--paper-0)',
              border: '1px solid var(--paper-line)',
              borderRadius: 10,
              color: 'var(--ink-1)',
              outline: 'none',
            }}/>
          <span style={{
            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--ink-4)', fontSize: 18,
          }}>⌕</span>
          <span style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            fontSize: 11, color: 'var(--ink-5)', fontFamily: 'var(--font-mono)',
          }}>⌘K</span>
        </div>

        {/* Active filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{filtered.length}개의 기억</span>
          {activeCategory && (
            <span className="chip" style={{ gap: 8 }}>
              카테고리 · {activeCategory}
              <button onClick={() => setActiveCategory(null)} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, fontSize: 14 }}>×</button>
            </span>
          )}
          {activeSource && (
            <span className="chip" style={{ gap: 8 }}>
              출처 · {activeSource}
              <button onClick={() => setActiveSource(null)} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, fontSize: 14 }}>×</button>
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>정렬:</span>
            <select style={{
              fontSize: 12,
              padding: '4px 8px',
              background: 'var(--paper-0)',
              border: '1px solid var(--paper-line)',
              borderRadius: 4,
              color: 'var(--ink-2)',
            }}>
              <option>최신순</option>
              <option>관련도순</option>
              <option>연결 많은 순</option>
            </select>
          </div>
        </div>

        {/* Memory list — masonry-ish */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtered.map(m => <MemoryCard key={m.id} memory={m}/>)}
        </div>

        {filtered.length === 0 && (
          <div style={{
            padding: 60,
            textAlign: 'center',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            color: 'var(--ink-4)',
          }}>
            해당하는 기억이 없습니다.
          </div>
        )}
      </main>
    </div>
  );
};

const filterBtnStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 10px',
  background: active ? 'var(--paper-2)' : 'transparent',
  border: 'none',
  borderRadius: 5,
  fontSize: 13,
  color: active ? 'var(--ink-1)' : 'var(--ink-3)',
  fontWeight: active ? 600 : 400,
  cursor: 'pointer',
  width: '100%',
});

Object.assign(window, { Browse });
