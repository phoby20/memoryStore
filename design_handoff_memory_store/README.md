# Handoff: Memory Store

## Overview

Memory Store는 모든 AI 채팅 서비스를 가로지르는 단일 메모리(기억) 저장소입니다. 사용자가 한 번 발급받은 API 키를 즐겨 쓰는 AI 서비스에 등록하면, 어느 AI를 사용하더라도 "내가 누구인지"를 알 수 있게 합니다. 대화 중 검색되거나 학습된 사실은 자동으로 Memory Store에 쌓이며, 사용자는 이를 신경망 그래프 형태로 열람·검색·관리할 수 있습니다.

## About the Design Files

이 번들에 포함된 HTML 파일들은 **디자인 레퍼런스**입니다 — 의도한 모양새와 동작을 보여주는 프로토타입이지, 그대로 가져다 쓰는 프로덕션 코드가 아닙니다.

작업의 핵심은 **이 HTML 디자인들을 Claude Code 작업 중인 코드베이스의 기존 환경(React/Next.js/Vue/Svelte 등)에서, 그 코드베이스가 이미 사용 중인 패턴·라이브러리·디자인 시스템을 따라 재구현하는 것**입니다. 만약 아직 프레임워크가 정해지지 않았다면 프로젝트에 가장 적합한 프레임워크를 선택해 구현하세요.

특히 다음 요소들은 코드베이스에 맞게 적응시키세요:

- **CSS**: 현재는 vanilla CSS + CSS variables를 씁니다. 코드베이스가 Tailwind, CSS Modules, styled-components, vanilla-extract 등을 쓴다면 그쪽으로 변환하세요.
- **컴포넌트 구조**: Babel inline JSX로 작성되어 있고 한 파일에 여러 React 컴포넌트가 들어 있습니다. 실제 코드에서는 각 컴포넌트를 별개의 `.tsx` 파일로 분리하고 적절한 디렉토리 구조(예: `components/`, `screens/`, `pages/`)로 정리하세요.
- **데이터**: `components/data.jsx`의 SAMPLE_MEMORIES, CATEGORIES, AI_SERVICES는 디자인 검토용 더미입니다. 실제로는 API/DB에서 가져와야 합니다.
- **라우팅**: 데모는 모든 화면을 design canvas로 한 페이지에 늘어놓았습니다. 실제 앱에서는 Next.js App Router, React Router 등을 써서 별개 라우트로 분리하세요. 권장 라우트는 아래 "Routes" 섹션 참조.

## Fidelity

**High-fidelity (hifi)** — 색상, 타이포그래피, 간격, 인터랙션이 모두 확정되어 있습니다. 픽셀 레벨로 그대로 재현하되, 코드베이스의 기존 디자인 토큰 시스템(있다면)에 맞춰 토큰화하세요.

## Design System

### 컨셉

**"종이 위에 그려진 신경망"** — 따뜻한 베이지/세피아 일기장 톤(따뜻함·친근함·개인적인 느낌)과 두뇌/신경망 메타포(노드·연결선·기억 지도)의 결합. 손글씨 같은 부드러움과 기술적 명료함의 균형.

### 컬러 토큰

라이트 모드 (`:root`):

```css
/* Paper / Background scale */
--paper-0: #FBF6EC;  /* 카드 배경, 가장 밝음 */
--paper-1: #F5EDE0;  /* 메인 배경 */
--paper-2: #EEE3D0;  /* 호버, 헤더 */
--paper-3: #E5D6BC;  /* 비활성 상태 */
--paper-line: #D9C7A8; /* 보더, 디바이더 */

/* Ink / Foreground scale */
--ink-1: #2A1F18;  /* 가장 진한 텍스트, 헤딩 */
--ink-2: #3A2E26;  /* 본문 텍스트 */
--ink-3: #5C4A3D;  /* 보조 텍스트 */
--ink-4: #8B7560;  /* 약한 텍스트, 라벨 */
--ink-5: #B5A289;  /* 가장 약함, 메타데이터 */

/* Sepia accents (브랜드 보조색) */
--sepia: #8B6F47;
--sepia-deep: #6B5235;
--sepia-soft: #C2A57F;

/* Glow (메인 액센트 - "구리" 프리셋) */
--glow: #C97B4A;
--glow-soft: #E8A87C;
--glow-deep: #9C5A30;

/* 액센트 프리셋 (사용자 선택 가능) */
/* copper: #C97B4A / #E8A87C / #9C5A30 */
/* sage:   #7A9C6B / #A8C39B / #557048 */
/* ink:    #5C7A8B / #94B0BE / #3E5664 */
/* rose:   #B5705F / #D89E8C / #8A4A3D */

/* Functional */
--success: #6B8E5A;
--warn:    #C9943C;
--danger:  #B14B3E;

/* Category colors (메모리 카테고리별) */
/* 식습관: #6B8E5A / 직업: #8B6F47 / 가족: #B14B3E */
/* 생활:   #C97B4A / 독서: #9C5A30 / 성향: #C9943C */
/* 관심사: #5C7E6A / 건강: #A87C5A */
```

다크 모드 (`[data-theme="dark"]`): paper와 ink가 반전되며 `--paper-0: #1B1611`, `--ink-1: #F5EDE0` 등으로 매핑.

### 타이포그래피

```
--font-serif: "Noto Serif KR", "Source Serif Pro", Georgia, serif;
--font-sans:  "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono:  "JetBrains Mono", "SF Mono", Consolas, monospace;
```

**사용 규칙:**
- **Serif (Noto Serif KR)**: 헤딩, 메모리 본문, 강조하고 싶은 인용/제목. 일기장 느낌의 핵심.
- **Sans (Noto Sans KR)**: 일반 본문, UI 라벨, 버튼, 내비게이션.
- **Mono (JetBrains Mono)**: API 키, 날짜, 카운터, 통계 숫자, 메타 정보.

**스케일:**
- Hero: 58px / serif 600 / line-height 1.12 / letter-spacing -0.02em
- H1: 32px / serif 600
- H2: 28px / serif 600
- 카드 제목: 16-18px / serif 600
- 본문: 14-15px / sans 400
- 라벨/메타: 11-12px / sans 400-600
- 모노 메타: 11-12px / mono 400 / letter-spacing 0.02em

**한글 처리**: 모든 한글 본문에 `word-break: keep-all`을 적용해 단어 중간 줄바꿈 방지.

### 간격 / 모서리 / 그림자

```
--r-sm: 4px;
--r-md: 8px;
--r-lg: 14px;

--shadow-1: 0 1px 2px rgba(58, 46, 38, 0.06), 0 2px 8px rgba(58, 46, 38, 0.04);
--shadow-2: 0 2px 4px rgba(58, 46, 38, 0.08), 0 8px 24px rgba(58, 46, 38, 0.06);
--shadow-3: 0 4px 8px rgba(58, 46, 38, 0.10), 0 16px 48px rgba(58, 46, 38, 0.10);
```

전반적으로 **둥근 모서리는 절제** — 8px 이하 권장. 카드는 14px까지.

### 텍스처 (선택사항)

`.paper` 유틸리티 클래스는 미세한 SVG noise 텍스처를 배경에 깔아 종이 느낌을 줍니다. `styles.css`에서 그대로 가져가 쓰거나 생략 가능. 핵심 비주얼은 아니므로 성능이 부담되면 빼도 됩니다.

## Routes

권장 라우트 구조:

```
/                       랜딩 페이지 (비로그인)
/onboarding             4스텝 온보딩 플로우 (가입 직후)
/dashboard              메인 대시보드 — 기억 지도
/memories               열람 & 검색
/memories/[id]          기억 상세 (모바일)
/services               연결된 AI 서비스 목록
/api-keys               API 키 발급 및 관리
/settings               설정 (탭: privacy / categories / profile / export)
```

## Screens / Views

### 1. 랜딩 페이지 (`Landing.tsx`)

**목적**: 비로그인 방문자에게 서비스를 소개하고 가입을 유도.

**레이아웃**:
- 폭 1280px 기준 (반응형으로 적응)
- 헤더(48px 좌우 패딩 / 로고 + nav + CTA 버튼들)
- Hero 섹션: 2 컬럼 그리드(1.05fr 1fr), gap 60px, padding 80px 48px 100px
  - 좌: chip → h1(58px) → p(17px) → CTA 버튼 2개 → 보조 텍스트
  - 우: 종이 느낌의 미니 그래프 카드 (살짝 회전 0.5deg, shadow-3)
- 배경에는 SVG 신경망(불투명도 0.18, pointer-events: none) 깔림
- "How it works" 섹션: 3컬럼 카드 그리드, 각 카드에 STEP / 01 같은 모노 라벨

**핵심 카피**:
- Chip: "모든 AI를 가로지르는 단 하나의 기억"
- H1: "당신을 기억하는 / *두 번째 두뇌.*" (두 번째 줄은 italic + sepia-deep + 손글씨 언더라인)
- 본문: "한 번 등록한 API 키로 Aria든, Nova든, Sage든 — 어느 AI를 쓰더라도 *"내가 누구인지"*를 알게 됩니다..."
- CTA: "무료로 시작하기" (btn-glow) / "데모 보기" (btn-ghost)

**컴포넌트**:
- `<HandUnderline width={300}/>` — 손으로 그은 듯한 SVG 곡선 언더라인
- `<LandingPreview/>` — 신경망 미니맵 카드 (펄스 애니메이션 포함)
- `<StepGlyph kind="key|plug|archive"/>` — 각 스텝의 작은 일러스트

### 2. 온보딩 (`Onboarding.tsx`)

**목적**: 신규 사용자가 4스텝으로 카테고리·키·연결을 마치도록 안내.

**구조**: 상단 헤더(로고 + 건너뛰기) → 중앙 컨텐츠(stepper + step 본문) → 하단 푸터(이전 / N/4 / 다음)

**4 스텝**:
1. **Welcome** — 큰 신경망 SVG + "환영합니다." + 다음 단계 미리보기
2. **Categories** — 4×2 그리드의 카테고리 선택 카드 (선택 시 카테고리 컬러로 보더 강조)
3. **Key** — 발급된 API 키를 큰 박스로 표시 + "이 화면을 닫으면 다시 볼 수 없습니다" 경고
4. **Connect** — 3×2 그리드로 AI 서비스 선택 (Aria, Nova, Sage, Lumen, Echo, Pith)

**Stepper**: 활성 도트는 28px wide pill, 비활성은 8px circle. 활성 사이엔 16px 디바이더 라인.

### 3. 대시보드 (`Dashboard.tsx`)

**목적**: 사용자의 기억 전체를 신경망 그래프로 시각화. 기억을 클릭해 상세 보기.

**레이아웃**: 3컬럼 그리드 `256px 1fr 360px`
- 좌: `<Sidebar/>` (워크스페이스 내비)
- 중: 헤더 → 4컬럼 통계 strip → 큰 그래프 캔버스(580px)
- 우: 선택된 메모리 인스펙터 + 연결된 기억 + 최근 활동

**그래프 인터랙션**:
- 8개의 메모리가 중앙 "지우" 노드 주위에 타원 궤도로 배치 (반지름 180/240px)
- 클릭 시 선택 노드는 r=9에 펄스 + 점선 링, 선택 안 된 노드는 r=6
- 메모리 간 추가 연결선(점선, opacity 0.3)으로 의미 클러스터 표현
- 그래프 모드 토글: 그래프 / 클러스터 / 타임라인 (탭 형태)

**우측 인스펙터 카드**: `<MemoryCard/>` 사용 — 카테고리 도트, 본문(serif), 태그 chip, 출처 + 연결 카운트.

### 4. 열람 & 검색 (`Browse.tsx`)

**목적**: 모든 기억을 필터링/검색해서 리스트로 보기.

**레이아웃**: 3컬럼 `256px 240px 1fr`
- Sidebar
- 필터 레일: 카테고리 / 출처(AI) / 기간 — 각 항목은 `filterBtnStyle` 토글 버튼
- 메인: 검색 입력 → 필터 chip 표시 + 정렬 셀렉트 → 2컬럼 메모리 카드 그리드

**검색 입력**: 큰 폰트(16px serif), 좌측 ⌕ 아이콘, 우측 ⌘K 단축키 표시.

### 5. 연결된 AI 서비스 (`Services.tsx`)

**목적**: 통합된 AI 서비스를 토글로 관리.

**레이아웃**: 2컬럼 카드 그리드. 각 카드:
- 헤더: 글리프 박스(48px) + 이름/설명 + Toggle
- 통계 행 (3컬럼): 상태 / 마지막 동기화 / 수집 수
- 액션 버튼들 (가이드 / ⋯)

**상태별 색**: connected = success / paused = warn / pending = ink-4 / available = ink-5

**하단**: "찾는 서비스가 없으신가요?" 점선 카드.

### 6. API 키 (`ApiKeys.tsx`)

**목적**: 키 발급, 마스킹/표시 토글, 복사, 폐기, 사용량 조회.

**컴포넌트**:
- 새 키 발급 패널
- 키 리스트 카드: 좌측에 컬러 밴드(4px wide pill) + 이름/scope chip + 마스킹된 모노 키 박스 + 발급/최근 사용 시각 + 액션 버튼들 (보기/복사/폐기)
- 복사 시 1.5초간 "✓ 복사됨" 피드백
- 하단: 30일 사용량 막대그래프 (`<UsageGraph/>`)

**키 마스킹**: 처음 11자 + `·` + `•` × 20 + `·` + 마지막 4자.

### 7. 설정 (`Settings.tsx`)

**목적**: 프라이버시, 카테고리, 프로필, 데이터 관리.

**구조**: 상단 탭 스트립 (밑줄로 활성 표시) + 탭별 본문.

**Privacy 탭**: 5개의 토글 카드 — 자동 수집 / 민감 정보 차단 / E2E 암호화 / AI 학습 기여 / 서비스 간 요약 공유.
**Categories 탭**: 카테고리별 카드 (색 칩 + 이름 + 카운트 + ⋯ 메뉴) + "+ 새 카테고리" 버튼.
**Profile 탭**: 아바타 + 이름/이메일 + 2×2 필드 그리드 (언어/시간대/가입일/요금제).
**Export 탭**: JSON/MD/PDF 내보내기 + danger 색의 영구 삭제 카드.

### 8. 모바일 뷰 (`Mobile*.tsx`)

세 개의 모바일 화면 — 390×800 기준:
- `MobileDashboard` — 인사말 + 통계 2칸 + 미니 그래프 카드 + 최근 메모리
- `MobileDetail` — 기억 상세 페이지 (← 지도로 / 본문 / 태그 / 출처 / 연결 / 편집·삭제)
- `MobileServices` — AI 서비스 리스트 + Toggle

**공통**: `<MobileFrame title showTab>` — 상태 바 + 헤더(타이틀+아바타) + 본문 + 하단 탭 바(◉ 지도 / ⌕ 검색 / ◇ AI / ⚙ 설정).

## Shared Components

### `<Logo/>`
SVG 로고 — 중앙 코어(radial gradient glow) + 4방향 위성 도트 + 크로스 신경 암.

### `<NeuralNode x y r color label pulse selected onClick/>`
인터랙티브 그래프 노드. r에 따라 outer halo, 글로우 링, 메인 도트, 라벨 텍스트가 자동 배치. `pulse`면 SMIL animate 애니메이션, `selected`면 점선 링.

### `<NeuralLink x1 y1 x2 y2 dashed animated opacity/>`
손으로 그은 듯한 곡선 path (Q-curve, 약간의 sine wobble).

### `<HandUnderline width color/>`
손글씨 같은 SVG 곡선 언더라인.

### `<MemoryCard memory compact/>`
메모리 카드 표준. 카테고리 도트 + 라벨 + 날짜 / serif 본문 / 태그 chip / 점선 디바이더 / 출처·연결 메타.

### `<Toggle on onChange disabled/>`
42×24 pill toggle. on이면 `--glow` 배경 + 노브가 우측으로 슬라이드.

### `<Sidebar active/>`
워크스페이스 좌측 내비. items: dashboard / browse / services / apikeys / settings + 하단 사용자 카드.

### `<Logo/>`, `<TagDot color/>` 등 작은 atoms는 `components/shared.jsx` 참조.

## Interactions & Behavior

- **그래프 노드 클릭**: 우측 인스펙터가 즉시 갱신. 선택 노드는 r 증가 + 펄스 + 점선 링.
- **필터 토글**: Browse 페이지에서 카테고리/출처 칩은 같은 항목 재클릭 시 해제.
- **API 키 복사**: clipboard.writeText + 1.5초 "✓ 복사됨" 텍스트 토글.
- **API 키 마스킹**: 기본은 마스킹, "보기" 버튼으로 토글.
- **Onboarding stepper**: 도트가 부드럽게 폭 변환 (transition 0.3s).
- **Toggle**: 노브 left 위치 transition 0.2s.

**애니메이션 (CSS keyframes — `styles.css`)**:
- `pulse-glow` — 그래프 중앙 노드 등 강조용
- `draw-line` — 신경 연결선 그리기 효과
- `float` — 부드러운 부유

**다크/라이트 토글**: `document.documentElement.setAttribute('data-theme', 'light' | 'dark')` — CSS variables가 자동 갱신.

**액센트 컬러 변경**: 4개 프리셋 중 선택 시 `--glow`, `--glow-soft`, `--glow-deep`만 동적으로 set property.

## State Management

각 페이지 단위로 React useState만 사용. 실제 앱에서는:
- **인증/사용자 정보**: 글로벌 (Context, Zustand, Redux Toolkit, Jotai 등 코드베이스 컨벤션 따름)
- **메모리 데이터**: 서버 상태 → React Query / SWR 권장. 키:
  - `['memories']` — 전체 리스트
  - `['memories', { category, source, period, query }]` — 필터링된 리스트
  - `['memory', id]` — 단일 기억
  - `['categories']` — 카테고리 목록
  - `['services']` — AI 서비스 연동 상태
  - `['api-keys']` — API 키 목록
  - `['usage', { days: 30 }]` — 사용량 통계
- **UI 상태(로컬)**: 선택된 노드, 검색 쿼리, 필터, 토글 등은 useState/URL state.

## Responsive Behavior

- **데스크톱 (≥ 1280px)**: 위 데스크톱 레이아웃 그대로.
- **태블릿 (768–1279px)**: 사이드바 256px 유지, 필터 레일은 collapse 가능, 우측 인스펙터는 모달/드로어로 전환.
- **모바일 (≤ 767px)**: `MobileFrame` 패턴 — 상단 헤더, 하단 탭 바, 풀 폭 카드 스택. 그래프는 본문에 fit하는 미니 버전.

## Files

이 핸드오프 폴더에 포함된 파일:

```
Memory Store.html         — 메인 진입점 (모든 화면을 design canvas로 연결)
styles.css                — 디자인 토큰 + 유틸리티 + 애니메이션
app.jsx                   — App 컴포넌트 (캔버스 + tweaks 패널 wiring)
components/
  shared.jsx              — Logo, NeuralNode, NeuralLink, HandUnderline, MemoryCard, TagDot
  data.jsx                — SAMPLE_MEMORIES, CATEGORIES, AI_SERVICES (더미 데이터)
  landing.jsx             — Landing + LandingPreview + StepGlyph
  dashboard.jsx           — Dashboard + Sidebar
  browse.jsx              — Browse
  apikeys.jsx             — ApiKeys + UsageGraph
  services.jsx            — Services + Toggle + Stat
  settings.jsx            — Settings + 4 sub-tabs
  onboarding.jsx          — Onboarding + 4 sub-steps
  mobile.jsx              — MobileFrame, MobileDashboard, MobileDetail, MobileServices
design-canvas.jsx         — 디자인 검토용 캔버스 (프로덕션엔 불필요)
tweaks-panel.jsx          — 디자인 검토용 토글 패널 (프로덕션엔 불필요)
```

## Implementation Tips

1. **먼저 디자인 토큰부터** — `styles.css`의 CSS variables를 코드베이스의 토큰 시스템(Tailwind config / theme.ts / CSS Modules variables)으로 옮기세요.
2. **타이포그래피 매핑** — Noto Serif KR / Noto Sans KR / JetBrains Mono를 프로젝트의 폰트 로딩 방식(next/font, Google Fonts, self-host)에 맞게 등록하세요.
3. **공통 atoms 먼저** — `Logo`, `MemoryCard`, `Toggle`, `NeuralNode/Link`, `Sidebar`를 별개 컴포넌트로 만든 뒤 페이지에 합치세요.
4. **그래프 시각화** — 현재 SVG는 정적 좌표 계산입니다. 노드 수가 늘어나면 d3-force 같은 라이브러리로 시뮬레이션을 돌리는 게 좋습니다.
5. **신경망 SVG 미세 흔들림** — `NeuralLink`의 sin/cos wobble은 손글씨 느낌을 위한 것. 노드 좌표를 받아 deterministic하게 같은 wobble이 나오게 유지하세요(랜덤 X).
6. **카테고리 컬러** — 8개의 컬러는 토큰화해서 `category.color` 필드에 저장. UI는 그 컬러를 그대로 dot/border/badge에 사용.
7. **다크 모드** — `[data-theme="dark"]` 패턴은 CSS variable swap 방식. Tailwind를 쓰면 `dark:` variant + class strategy로 옮길 수 있습니다.
8. **한글 줄바꿈** — `word-break: keep-all`을 글로벌하게 적용하거나, 본문 텍스트 컴포넌트의 디폴트로 설정하세요.

## Out of Scope

- 실제 백엔드 API 스펙 / 인증 플로우
- 결제 / 요금제 화면
- 관리자 대시보드
- 이메일 템플릿
- 토스트, 모달 시스템 (코드베이스 기존 것 사용)
