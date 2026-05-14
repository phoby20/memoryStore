import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

// Deterministic neural background node positions
const seed = (i: number) => ((i * 9301 + 49297) % 233280) / 233280;
const BG_NODES = Array.from({ length: 22 }, (_, i) => ({
  x: 80 + seed(i) * 1080,
  y: 60 + seed(i + 100) * 480,
  r: 3 + seed(i + 200) * 4,
}));

const BG_LINKS: { a: number; b: number }[] = [];
for (let i = 0; i < BG_NODES.length; i++) {
  for (let j = i + 1; j < BG_NODES.length; j++) {
    const dx = BG_NODES[i].x - BG_NODES[j].x;
    const dy = BG_NODES[i].y - BG_NODES[j].y;
    if (Math.sqrt(dx * dx + dy * dy) < 240 && seed(i * 23 + j) > 0.5) {
      BG_LINKS.push({ a: i, b: j });
    }
  }
}

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div style={{ background: "var(--paper-1)", minHeight: "100vh" }}>
      {/* Header */}
      <header className="landing-header" style={{
        position: "relative",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 48px",
        borderBottom: "1px solid var(--paper-line)",
        background: "var(--paper-1)",
      }}>
        <Logo />
        <nav className="landing-nav" style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 14, color: "var(--ink-3)" }}>
          <Link className="landing-nav-start" href="/sign-in" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 8, border: "1px solid var(--paper-line)",
            background: "transparent", color: "var(--ink-2)", textDecoration: "none",
            fontSize: 13, fontWeight: 500, transition: "background 0.15s",
          }}>
            로그인
          </Link>
          <Link href="/sign-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 18px", borderRadius: 8, border: "1px solid var(--ink-2)",
            background: "var(--ink-2)", color: "var(--paper-0)", textDecoration: "none",
            fontSize: 13, fontWeight: 500,
          }}>
            시작하기
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero-section" style={{
        position: "relative",
        padding: "80px 48px 100px",
        display: "grid",
        gridTemplateColumns: "1.05fr 1fr",
        gap: 60,
        alignItems: "center",
        overflow: "hidden",
      }}>
        {/* Neural background */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15, pointerEvents: "none" }}
        >
          {BG_LINKS.map((l, i) => {
            const a = BG_NODES[l.a], b = BG_NODES[l.b];
            const mx = (a.x + b.x) / 2 + Math.sin(a.x * 0.3) * 4;
            const my = (a.y + b.y) / 2 + Math.cos(a.y * 0.3) * 4;
            return (
              <path key={i} d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                fill="none" stroke="var(--ink-3)" strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
            );
          })}
          {BG_NODES.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="var(--sepia)" opacity="0.4" />
          ))}
        </svg>

        {/* Left: copy */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
            background: "rgba(201,123,74,0.1)", color: "var(--glow-deep)",
            border: "1px solid rgba(201,123,74,0.25)", marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--glow)", display: "inline-block" }} />
            모든 AI를 가로지르는 단 하나의 기억
          </div>

          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 54,
            lineHeight: 1.12,
            fontWeight: 600,
            color: "var(--ink-1)",
            letterSpacing: "-0.02em",
            margin: "0 0 28px",
            wordBreak: "keep-all",
          }}>
            당신을 기억하는<br />
            <span style={{ fontStyle: "italic", color: "var(--sepia-deep)" }}>두 번째 두뇌.</span>
          </h1>
          <svg width={280} height={6} viewBox="0 0 280 6" style={{ display: "block", marginTop: -16, marginBottom: 28 }}>
            <path d="M 2 4 Q 84 1, 140 3 T 278 3" fill="none" stroke="var(--glow)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <p style={{
            fontSize: 17, lineHeight: 1.65, color: "var(--ink-3)",
            maxWidth: 520, margin: "0 0 36px", wordBreak: "keep-all",
          }}>
            한 번 등록한 API 키로 Claude든, ChatGPT든 — 어느 AI를 쓰더라도{" "}
            <em>&ldquo;내가 누구인지&rdquo;</em>를 알게 됩니다.
            Memory Store는 당신의 취향·목표·인간관계를 안전하게 보관합니다.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/sign-up" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "14px 24px", borderRadius: 8,
              background: "var(--glow)", border: "1px solid var(--glow)",
              color: "var(--paper-0)", textDecoration: "none",
              fontSize: 15, fontWeight: 500,
            }}>
              무료로 시작하기 →
            </Link>
            <Link href="/sign-in" style={{
              display: "inline-flex", alignItems: "center",
              padding: "13px 22px", borderRadius: 8,
              background: "transparent", border: "1px solid var(--paper-line)",
              color: "var(--ink-2)", textDecoration: "none",
              fontSize: 15, fontWeight: 500,
            }}>
              로그인
            </Link>
          </div>

          <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 20, fontSize: 12, color: "var(--ink-4)" }}>
            <span>✓ 무료로 시작</span>
            <span>✓ Google 계정 연동</span>
            <span>✓ 언제든 데이터 내보내기</span>
          </div>
        </div>

        {/* Right: mini graph preview */}
        <div className="hero-right" style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            background: "var(--paper-0)",
            border: "1px solid var(--paper-line)",
            borderRadius: 14,
            boxShadow: "var(--shadow-3)",
            padding: 22,
            transform: "rotate(0.5deg)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--glow)", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>나의 기억 지도</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>104 nodes</span>
            </div>
            <svg viewBox="0 0 440 320" style={{ width: "100%", height: 320, display: "block" }}>
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--paper-line)" strokeWidth="0.4" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="440" height="320" fill="url(#grid)" />
              {/* links */}
              {[
                [220,160,120,80],[220,160,340,90],[220,160,90,200],
                [220,160,360,210],[220,160,180,280],[220,160,300,270],
                [120,80,60,130],[340,90,400,160],[90,200,60,130],
              ].map(([x1,y1,x2,y2],i) => {
                const mx = (x1+x2)/2 + Math.sin(x1*0.3)*4;
                const my = (y1+y2)/2 + Math.cos(y1*0.3)*4;
                return <path key={i} d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                  fill="none" stroke="var(--ink-3)" strokeWidth="0.8" opacity="0.4" strokeLinecap="round"/>;
              })}
              {/* satellite nodes */}
              {[
                {x:120,y:80,r:5,label:"식습관",color:"#6B8E5A"},
                {x:340,y:90,r:5,label:"직업",color:"#8B6F47"},
                {x:90,y:200,r:5,label:"독서",color:"#9C5A30"},
                {x:360,y:210,r:5,label:"가족",color:"#B14B3E"},
                {x:180,y:280,r:5,label:"생활",color:"#C97B4A"},
                {x:300,y:270,r:5,label:"성향",color:"#C9943C"},
              ].map((n) => (
                <g key={n.label}>
                  <circle cx={n.x} cy={n.y} r={n.r+3} fill={n.color} opacity="0.15"/>
                  <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} stroke="var(--ink-2)" strokeWidth="0.6"/>
                  <text x={n.x} y={n.y+n.r+13} textAnchor="middle" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-sans)">{n.label}</text>
                </g>
              ))}
              {/* center node */}
              <circle cx="220" cy="160" r="22" fill="var(--glow)" opacity="0.12"/>
              <circle cx="220" cy="160" r="14" fill="var(--glow)" opacity="0.25"/>
              <circle cx="220" cy="160" r="9" fill="var(--glow)" stroke="var(--ink-2)" strokeWidth="0.8"/>
              <text x="220" y="140" textAnchor="middle" fontSize="10" fill="var(--ink-2)" fontFamily="var(--font-serif)" fontStyle="italic">나</text>
            </svg>
            <div style={{
              marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--paper-line)",
              display: "flex", justifyContent: "space-between",
              fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)",
            }}>
              <span>마지막 갱신 · 12분 전</span>
              <span>↗ 전체 그래프 보기</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-steps" style={{ padding: "60px 48px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 12 }}>
              작동 방식
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 34, color: "var(--ink-1)", margin: 0, fontWeight: 600 }}>
              세 단계면 충분합니다
            </h2>
          </div>
          <div className="landing-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[
              {
                n: "01", t: "API 키 발급",
                d: "Memory Store에 가입하고 개인 API 키를 발급받습니다. 30초면 끝납니다.",
                preview: (
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--ink-3)", background:"var(--paper-2)", padding:"10px 12px", borderRadius:6, border:"1px dashed var(--paper-line)" }}>
                    <span style={{color:"var(--ink-5)"}}>mem_</span><span>4f8a·d3b9·····7c2e</span>
                  </div>
                ),
              },
              {
                n: "02", t: "AI 서비스에 연결",
                d: "API 키를 즐겨 쓰는 AI 서비스의 MCP 설정에 등록합니다.",
                preview: (
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    {["✦","◇","◈","○","△"].map((g,i) => (
                      <span key={i} style={{ width:32,height:32,borderRadius:8,background:"var(--paper-2)",border:"1px solid var(--paper-line)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"var(--sepia-deep)",fontSize:14 }}>{g}</span>
                    ))}
                  </div>
                ),
              },
              {
                n: "03", t: "대화하면 자동 저장",
                d: "AI가 참조하거나 학습한 사실이 자동으로 Memory Store에 쌓입니다.",
                preview: (
                  <svg width="100%" height="40" viewBox="0 0 260 40">
                    <path d="M 10 20 Q 65 6, 130 20 T 250 20" fill="none" stroke="var(--ink-4)" strokeWidth="0.8" strokeDasharray="3 3"/>
                    {[10,65,130,195,250].map((x,i) => (
                      <circle key={i} cx={x} cy={20-(i%2===0?0:-6)} r="3.5" fill={i===4?"var(--glow)":"var(--sepia)"}/>
                    ))}
                  </svg>
                ),
              },
            ].map((s) => (
              <div key={s.n} style={{
                background: "var(--paper-0)", border: "1px solid var(--paper-line)",
                borderRadius: 14, boxShadow: "var(--shadow-1)", padding: 28,
              }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--glow)", marginBottom:16, letterSpacing:"0.05em" }}>
                  STEP / {s.n}
                </div>
                <h3 style={{ fontFamily:"var(--font-serif)", fontSize:20, color:"var(--ink-1)", margin:"0 0 10px", fontWeight:600 }}>
                  {s.t}
                </h3>
                <p style={{ fontSize:13, lineHeight:1.6, color:"var(--ink-3)", margin:"0 0 20px" }}>
                  {s.d}
                </p>
                <div style={{ paddingTop:16, borderTop:"1px dashed var(--paper-line)" }}>
                  {s.preview}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{
        padding: "32px 48px",
        borderTop: "1px solid var(--paper-line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
        color: "var(--ink-4)",
      }}>
        <Logo size={20} />
        <span>© 2026 Memory Store · 당신의 기억은 당신의 것입니다.</span>
        <div className="landing-footer-links" style={{ display: "flex", gap: 20 }}>
          <Link href="/terms" style={{ color: "var(--ink-4)", textDecoration: "none" }}>이용약관</Link>
          <Link href="/privacy" style={{ color: "var(--ink-4)", textDecoration: "none" }}>개인정보 처리방침</Link>
        </div>
      </footer>
    </div>
  );
}
