"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type ApiKey = {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
};

type Tab = "apikeys" | "connect" | "account";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("apikeys");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreated, setNewlyCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();

  async function fetchKeys() {
    const res = await fetch("/api/apikeys");
    if (res.ok) {
      const data = await res.json();
      setApiKeys(data.keys);
    }
    setLoading(false);
  }

  useEffect(() => { fetchKeys(); }, []);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    const res = await fetch("/api/apikeys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    const data = await res.json();
    if (data.apiKey) {
      setNewlyCreated(data.apiKey.key);
      setNewKeyName("");
      fetchKeys();
    }
  }

  async function handleDeleteKey(id: string) {
    await fetch(`/api/apikeys?id=${id}`, { method: "DELETE" });
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    if (newlyCreated) setNewlyCreated(null);
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (res.ok) {
        await signOut();
        router.push("/");
      }
    } catch {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "apikeys", label: "API 키" },
    { id: "connect", label: "연결 방법" },
    { id: "account", label: "계정 & 개인정보" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--paper-1)" }}>
      <Sidebar />

      <main className="app-main settings-main" style={{ flex: 1, padding: "28px 48px", maxWidth: 900 }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 6 }}>
            워크스페이스
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 30, color: "var(--ink-1)", margin: 0, fontWeight: 600 }}>
            설정
          </h1>
        </div>

        {/* Tab strip */}
        <div style={{ display: "flex", gap: 4, marginTop: 24, marginBottom: 28, borderBottom: "1px solid var(--paper-line)" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              fontSize: 13,
              color: tab === t.id ? "var(--ink-1)" : "var(--ink-4)",
              fontWeight: tab === t.id ? 600 : 400,
              borderBottom: tab === t.id ? "2px solid var(--glow)" : "2px solid transparent",
              marginBottom: -1,
              cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>

        {/* API 키 탭 */}
        {tab === "apikeys" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, maxWidth: 580 }}>
              AI 채팅 서비스의 MCP 설정에 이 키를 등록하면, 그 서비스가 당신의 기억을 안전하게 읽고 쓸 수 있게 됩니다.
            </p>

            {/* Generate panel */}
            <div style={{ background: "var(--paper-0)", border: "1px solid var(--paper-line)", borderRadius: 12, padding: 24 }}>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>새 키 발급</p>
              <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 16px" }}>연결할 AI 서비스마다 고유한 키를 발급하시는 것을 권장합니다.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="키 이름 (예: Claude Desktop)"
                  maxLength={50}
                  style={{
                    flex: 1, minWidth: 0, padding: "10px 14px",
                    background: "var(--paper-1)", border: "1px solid var(--paper-line)",
                    borderRadius: 8, fontSize: 13, color: "var(--ink-1)", outline: "none",
                  }}
                />
                <button onClick={handleCreate} style={{
                  padding: "10px 20px",
                  background: "var(--glow)", border: "1px solid var(--glow)",
                  color: "var(--paper-0)", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>
                  + 발급
                </button>
              </div>
            </div>

            {/* New key display */}
            {newlyCreated && (
              <div style={{ background: "rgba(107,142,90,0.08)", border: "1px solid rgba(107,142,90,0.3)", borderRadius: 12, padding: 20 }}>
                <p style={{ color: "var(--success)", fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>✓ 새 API 키가 발급됐습니다</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)", background: "var(--paper-2)", padding: "6px 10px", borderRadius: 5, flex: 1, wordBreak: "break-all" }}>
                    {newlyCreated}
                  </code>
                  <button onClick={() => copyKey(newlyCreated)} style={{
                    padding: "6px 14px", background: "var(--paper-2)", border: "1px solid var(--paper-line)",
                    borderRadius: 6, fontSize: 12, color: "var(--ink-2)", cursor: "pointer", whiteSpace: "nowrap",
                  }}>
                    {copied ? "✓ 복사됨" : "복사"}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "var(--warn)", margin: 0 }}>⚠ 지금만 표시됩니다. 반드시 복사해서 보관하세요.</p>
              </div>
            )}

            {/* Key list */}
            {loading ? (
              <p style={{ color: "var(--ink-4)", fontSize: 13, fontStyle: "italic" }}>불러오는 중…</p>
            ) : apiKeys.length === 0 ? (
              <p style={{ color: "var(--ink-4)", fontSize: 13, fontFamily: "var(--font-serif)", fontStyle: "italic" }}>발급된 API 키가 없습니다.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {apiKeys.map((key) => (
                  <div key={key.id} style={{
                    background: "var(--paper-0)", border: "1px solid var(--paper-line)",
                    borderRadius: 10, padding: "16px 20px",
                    display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  }}>
                    <div style={{ width: 4, height: 36, background: "var(--glow)", borderRadius: 999, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 4px" }}>{key.name}</p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", margin: 0 }}>{key.keyPreview}</p>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--ink-5)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                      {new Date(key.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                    <button onClick={() => handleDeleteKey(key.id)} style={{
                      padding: "6px 12px", background: "transparent",
                      border: "1px solid rgba(177,75,62,0.25)", borderRadius: 6,
                      color: "var(--danger)", fontSize: 12, cursor: "pointer",
                    }}>
                      폐기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 연결 방법 탭 */}
        {tab === "connect" && <ConnectGuide />}

        {/* 계정 & 개인정보 탭 */}
        {tab === "account" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "var(--paper-0)", border: "1px solid var(--paper-line)", borderRadius: 12, padding: 24 }}>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 8px" }}>개인정보 처리방침</p>
              <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 16px" }}>서비스 이용과 관련된 개인정보 처리 방침을 확인하세요.</p>
              <a href="/privacy" target="_blank" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, color: "var(--glow-deep)", textDecoration: "none", fontWeight: 500,
              }}>
                개인정보 처리방침 보기 →
              </a>
            </div>

            <div style={{
              background: "rgba(177,75,62,0.04)",
              border: "1px solid rgba(177,75,62,0.2)",
              borderRadius: 12, padding: 24,
            }}>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "var(--danger)", margin: "0 0 8px" }}>회원 탈퇴</p>
              <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 16px" }}>
                탈퇴 시 모든 메모리 데이터와 API 키가 <strong style={{ color: "var(--ink-1)" }}>즉시 영구 삭제</strong>됩니다.
                이 작업은 되돌릴 수 없습니다.
              </p>

              {!deleteConfirm ? (
                <button onClick={() => setDeleteConfirm(true)} style={{
                  padding: "9px 18px",
                  background: "rgba(177,75,62,0.08)",
                  border: "1px solid rgba(177,75,62,0.3)",
                  borderRadius: 7, color: "var(--danger)", fontSize: 13, cursor: "pointer",
                }}>
                  회원 탈퇴
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{
                    background: "rgba(201,148,60,0.1)",
                    border: "1px solid rgba(201,148,60,0.3)",
                    borderRadius: 8, padding: "12px 16px",
                    fontSize: 13, color: "var(--warn)",
                  }}>
                    정말로 탈퇴하시겠습니까? 저장된 모든 데이터가 삭제됩니다.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleDeleteAccount} disabled={deleting} style={{
                      padding: "9px 18px", background: "var(--danger)",
                      border: "1px solid var(--danger)", borderRadius: 7,
                      color: "var(--paper-0)", fontSize: 13, fontWeight: 500,
                      cursor: "pointer", opacity: deleting ? 0.5 : 1,
                    }}>
                      {deleting ? "삭제 중…" : "네, 탈퇴합니다"}
                    </button>
                    <button onClick={() => setDeleteConfirm(false)} style={{
                      padding: "9px 18px", background: "var(--paper-2)",
                      border: "1px solid var(--paper-line)", borderRadius: 7,
                      color: "var(--ink-3)", fontSize: 13, cursor: "pointer",
                    }}>
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── 연결 방법 가이드 ──────────────────────────────────────────────────────────

type ServiceId = "claude-desktop" | "claude-code" | "gemini-cli" | "vscode-copilot" | "cursor" | "chatgpt" | "rest-api";

const SERVICES: { id: ServiceId; glyph: string; name: string; badge: string; free?: boolean; desc: string }[] = [
  { id: "claude-desktop", glyph: "✦", name: "Claude Desktop",  badge: "MCP",  free: true,  desc: "Anthropic Claude 데스크탑 앱 (무료 계정 가능)" },
  { id: "gemini-cli",     glyph: "◆", name: "Gemini CLI",      badge: "MCP",  free: true,  desc: "Google Gemini CLI — 완전 무료" },
  { id: "claude-code",    glyph: "✦", name: "Claude Code",     badge: "MCP",               desc: "터미널용 Claude CLI" },
  { id: "vscode-copilot", glyph: "○", name: "VS Code Copilot", badge: "MCP",               desc: "GitHub Copilot Chat (VS Code)" },
  { id: "cursor",         glyph: "◈", name: "Cursor",          badge: "MCP",               desc: "AI 코드 에디터 Cursor" },
  { id: "chatgpt",        glyph: "◇", name: "ChatGPT",         badge: "REST",              desc: "OpenAI Custom GPT Actions (Plus 이상)" },
  { id: "rest-api",       glyph: "△", name: "REST API",        badge: "API",               desc: "직접 통합 · 개발자용" },
];

function CodeBlock({ children, label }: { children: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: "relative", marginTop: 10, maxWidth: "100%", minWidth: 0 }}>
      {label && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", marginBottom: 4 }}>{label}</div>
      )}
      <pre style={{
        fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)",
        background: "var(--paper-2)", border: "1px solid var(--paper-line)",
        borderRadius: 8, padding: "14px 16px", margin: 0,
        overflowX: "auto", lineHeight: 1.65, whiteSpace: "pre",
        maxWidth: "100%",
      }}>{children}</pre>
      <button
        onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
        style={{
          position: "absolute", top: label ? 30 : 8, right: 8,
          padding: "3px 10px", background: "var(--paper-0)",
          border: "1px solid var(--paper-line)", borderRadius: 5,
          fontSize: 11, color: copied ? "var(--success)" : "var(--ink-4)", cursor: "pointer",
        }}
      >
        {copied ? "✓" : "복사"}
      </button>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 16, paddingBottom: 24, borderBottom: "1px dashed var(--paper-line)" }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "var(--glow)", color: "var(--paper-0)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
        flexShrink: 0, marginTop: 1,
      }}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-1)", margin: "0 0 10px" }}>{title}</p>
        {children}
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: 10, padding: "10px 14px",
      background: "rgba(201,123,74,0.07)", border: "1px solid rgba(201,123,74,0.2)",
      borderRadius: 6, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7,
    }}>{children}</div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: 10, padding: "10px 14px",
      background: "rgba(107,142,90,0.07)", border: "1px solid rgba(107,142,90,0.2)",
      borderRadius: 6, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7,
    }}>{children}</div>
  );
}

function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--paper-2)", padding: "1px 6px", borderRadius: 3 }}>
      {children}
    </code>
  );
}

function ConnectGuide() {
  const [selected, setSelected] = useState<ServiceId>("claude-desktop");
  const [serviceUrl, setServiceUrl] = useState("https://your-memory-store-url.com");
  useEffect(() => { setServiceUrl(window.location.origin); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 무료 안내 배너 */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px",
        background: "rgba(107,142,90,0.08)", border: "1px solid rgba(107,142,90,0.25)",
        borderRadius: 8, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6,
      }}>
        <span style={{ color: "var(--success)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓ 무료 시작</span>
        <span>
          <strong style={{ color: "var(--ink-1)" }}>Claude Desktop</strong>과{" "}
          <strong style={{ color: "var(--ink-1)" }}>Gemini CLI</strong>는 무료로 즉시 테스트할 수 있습니다.
          시작 전에 <strong style={{ color: "var(--ink-1)" }}>API 키</strong> 탭에서 키를 먼저 발급해 두세요.
        </span>
      </div>

      {/* Service selector */}
      <div className="connect-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {SERVICES.map((s) => (
          <button key={s.id} onClick={() => setSelected(s.id)} style={{
            padding: "12px 14px",
            background: selected === s.id ? "var(--paper-0)" : "var(--paper-2)",
            border: selected === s.id ? "1px solid var(--glow)" : "1px solid var(--paper-line)",
            borderRadius: 10, textAlign: "left", cursor: "pointer",
            boxShadow: selected === s.id ? "var(--shadow-1)" : "none",
            transition: "all 0.15s", position: "relative",
          }}>
            {s.free && (
              <span style={{
                position: "absolute", top: 8, right: 8,
                fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700,
                padding: "1px 5px", borderRadius: 3,
                background: "rgba(107,142,90,0.15)", color: "var(--success)",
              }}>FREE</span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span style={{ fontSize: 14, color: "var(--sepia-deep)" }}>{s.glyph}</span>
              <span style={{
                fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600,
                padding: "1px 5px", borderRadius: 3,
                background: s.badge === "MCP" ? "rgba(201,123,74,0.12)" : s.badge === "REST" ? "rgba(107,142,90,0.12)" : "rgba(139,111,71,0.12)",
                color: s.badge === "MCP" ? "var(--glow-deep)" : s.badge === "REST" ? "var(--success)" : "var(--sepia)",
              }}>{s.badge}</span>
            </div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: 13, fontWeight: 600, color: selected === s.id ? "var(--ink-1)" : "var(--ink-2)", margin: "0 0 3px" }}>{s.name}</p>
            <p style={{ fontSize: 10, color: "var(--ink-4)", margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Guide */}
      <div style={{ background: "var(--paper-0)", border: "1px solid var(--paper-line)", borderRadius: 12, padding: 28 }}>
        {selected === "claude-desktop" && <GuideClaudeDesktop serviceUrl={serviceUrl} />}
        {selected === "claude-code"    && <GuideClaudeCode serviceUrl={serviceUrl} />}
        {selected === "gemini-cli"     && <GuideGeminiCli serviceUrl={serviceUrl} />}
        {selected === "vscode-copilot" && <GuideVSCodeCopilot serviceUrl={serviceUrl} />}
        {selected === "cursor"         && <GuideCursor serviceUrl={serviceUrl} />}
        {selected === "chatgpt"        && <GuideChatGPT serviceUrl={serviceUrl} />}
        {selected === "rest-api"       && <GuideRestApi serviceUrl={serviceUrl} />}
      </div>
    </div>
  );
}

// ── 공통 MCP 서버 준비 안내 ──────────────────────────────────────────────────

function McpServerPrepSection({ serviceUrl }: { serviceUrl: string }) {
  return (
    <>
      <Step n={1} title="API 키 준비">
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
          위의 <strong>API 키</strong> 탭을 클릭해서 새 키를 발급하고, 복사해 두세요.
          발급 직후에만 전체 키를 볼 수 있습니다.
        </p>
        <Tip>💡 서비스별로 키를 별도로 발급하면, 나중에 특정 서비스만 차단하기 쉽습니다. (예: &ldquo;Claude Desktop용 키&rdquo;)</Tip>
      </Step>

      <Step n={2} title="Node.js 설치 — 처음이라면 필수">
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
          Node.js는 Memory Store와 AI를 연결해주는 중간 프로그램(MCP 서버)을 실행하기 위해 반드시 필요합니다.
          이미 설치되어 있다면 이 단계를 건너뛰어도 됩니다.
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "0 0 4px" }}>① 아래 사이트에 접속해 LTS 버전을 다운로드합니다.</p>
        <div style={{ background: "var(--paper-2)", border: "1px solid var(--paper-line)", borderRadius: 6, padding: "10px 14px", fontSize: 13, margin: "4px 0 10px" }}>
          🌐 <a href="https://nodejs.org" target="_blank" rel="noreferrer" style={{ color: "var(--glow-deep)", fontWeight: 600 }}>nodejs.org</a>
          <span style={{ color: "var(--ink-4)", marginLeft: 8 }}>→ &ldquo;LTS&rdquo; 버튼 클릭 → 설치 파일 다운로드</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "0 0 4px" }}>② 다운로드한 파일을 실행해 설치를 완료합니다.</p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "8px 0 4px" }}>③ 설치 확인 — 터미널에서 아래 명령을 실행해 버전 번호가 나오면 성공입니다.</p>
        <CodeBlock label="터미널">{`node --version`}</CodeBlock>
        <Note>
          ⓘ <strong>터미널이란?</strong> 컴퓨터에 텍스트 명령을 입력하는 프로그램입니다.<br />
          • <strong>Mac:</strong> Spotlight 검색(⌘+Space) → &ldquo;터미널&rdquo; 입력 → Enter<br />
          • <strong>Windows:</strong> 시작 버튼 → &ldquo;PowerShell&rdquo; 검색 → 클릭
        </Note>
      </Step>

      <Step n={3} title="MCP 서버 파일 다운로드">
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
          MCP 서버는 Memory Store와 AI 앱 사이에서 데이터를 주고받는 작은 프로그램입니다.
          아래 GitHub 저장소에서 다운로드합니다.
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "0 0 4px" }}>① GitHub에 접속합니다.</p>
        <div style={{ background: "var(--paper-2)", border: "1px solid var(--paper-line)", borderRadius: 6, padding: "10px 14px", fontSize: 13, margin: "4px 0 10px" }}>
          🌐 <a href="https://github.com/phoby20/memoryStore" target="_blank" rel="noreferrer" style={{ color: "var(--glow-deep)", fontWeight: 600 }}>github.com/phoby20/memoryStore</a>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "0 0 4px" }}>② 초록색 <strong>Code</strong> 버튼 클릭 → <strong>Download ZIP</strong> 클릭</p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "8px 0 4px" }}>③ 다운로드된 ZIP 파일의 압축을 풀고, 폴더를 <strong>영구적인 위치</strong>로 이동합니다.</p>
        <Tip>
          💡 <strong>Documents(문서) 폴더 안에 보관하길 권장합니다.</strong><br />
          나중에 폴더를 옮기면 연결이 끊기므로 처음부터 고정된 위치에 두세요.<br />
          예시 경로 (Mac): <Inline>/Users/사용자이름/Documents/memoryStore-main</Inline>
        </Tip>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "10px 0 4px" }}>④ 압축 해제된 폴더 안의 <Inline>mcp-server</Inline> 폴더를 확인합니다.</p>
      </Step>

      <Step n={4} title="MCP 서버 의존성 설치">
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
          MCP 서버가 동작하는 데 필요한 추가 파일들을 설치합니다. 한 번만 하면 됩니다.
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "0 0 4px" }}>① 터미널을 열고 아래 명령을 입력합니다.</p>
        <Note>
          ⓘ <strong>mcp-server 폴더 경로를 찾는 방법</strong><br />
          • <strong>Mac:</strong> Finder에서 <Inline>mcp-server</Inline> 폴더를 터미널 창으로 <strong>드래그</strong>하면 경로가 자동으로 입력됩니다.<br />
          • <strong>Windows:</strong> mcp-server 폴더를 Shift+마우스 우클릭 → &ldquo;경로로 복사&rdquo;
        </Note>
        <CodeBlock label="터미널 — mcp-server 폴더로 이동">{`cd /Users/사용자이름/Documents/memoryStore-main/mcp-server`}</CodeBlock>
        <p style={{ fontSize: 12, color: "var(--ink-4)", margin: "6px 0 4px" }}>위 경로는 예시입니다. 실제 경로로 바꿔 입력하세요.</p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "10px 0 4px" }}>② 이어서 아래 명령을 실행합니다. (인터넷 연결 필요, 1~2분 소요)</p>
        <CodeBlock label="터미널">{`npm install`}</CodeBlock>
        <Tip>💡 &ldquo;added XX packages&rdquo; 라고 나오면 성공입니다.</Tip>
      </Step>

      <Step n={5} title="mcp-server/index.js 의 전체 경로 확인">
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
          다음 단계에서 설정 파일에 이 파일의 <strong>전체 경로</strong>를 입력해야 합니다. 아래 방법으로 미리 확인해 두세요.
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "0 0 4px" }}>• Mac — 터미널에서 아래 명령을 실행하면 경로가 출력됩니다.</p>
        <CodeBlock label="터미널 (mcp-server 폴더 안에서 실행)">{`echo "$(pwd)/index.js"`}</CodeBlock>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "10px 0 4px" }}>• Windows — PowerShell에서 실행합니다.</p>
        <CodeBlock label="PowerShell (mcp-server 폴더 안에서 실행)">{`echo "$((Get-Location).Path)\\index.js"`}</CodeBlock>
        <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 8 }}>
          출력된 경로(예: <Inline>/Users/홍길동/Documents/memoryStore-main/mcp-server/index.js</Inline>)를 복사해 두세요.
        </p>
      </Step>
    </>
  );
}

// ── Claude Desktop ────────────────────────────────────────────────────────────

function GuideClaudeDesktop({ serviceUrl }: { serviceUrl: string }) {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: 0 }}>Claude Desktop 연결 가이드</h2>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(107,142,90,0.15)", color: "var(--success)" }}>무료 가능</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 10px", lineHeight: 1.7 }}>
          Claude Desktop에 Memory Store를 연결하면, 평소처럼 Claude와 대화하는 것만으로 당신의 기억이 자동으로 저장되고 불러와집니다.
          한 번 설정하면 이후에는 별도 조작 없이 Claude가 알아서 기억을 활용합니다.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "var(--ink-4)", padding: "10px 14px", background: "var(--paper-2)", borderRadius: 6 }}>
          <span>⏱ 예상 소요 시간: 약 10~15분</span>
          <span>💻 필요 환경: Mac 또는 Windows PC</span>
          <span>💰 비용: 무료 (Claude 계정 필요)</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Step n={1} title="Claude Desktop 앱 설치">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            아직 Claude Desktop이 없다면 먼저 설치합니다. 이미 설치되어 있으면 건너뛰세요.
          </p>
          <div style={{ background: "var(--paper-2)", border: "1px solid var(--paper-line)", borderRadius: 6, padding: "10px 14px", fontSize: 13, margin: "4px 0 10px" }}>
            🌐 <a href="https://claude.ai/download" target="_blank" rel="noreferrer" style={{ color: "var(--glow-deep)", fontWeight: 600 }}>claude.ai/download</a>
            <span style={{ color: "var(--ink-4)", marginLeft: 8 }}>→ 운영체제에 맞는 버전 다운로드 → 설치</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7, margin: 0 }}>
            설치 후 앱을 실행하고 Claude 계정으로 로그인합니다. 계정이 없다면 <strong>무료로 가입</strong>할 수 있습니다.
          </p>
        </Step>

        <McpServerPrepSection serviceUrl={serviceUrl} />

        <Step n={6} title="Claude Desktop 설정 파일 열기">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 12px", lineHeight: 1.7 }}>
            Claude Desktop의 설정 파일에 Memory Store 연결 정보를 추가합니다.
            파일이 없으면 직접 만들어야 합니다.
          </p>

          <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 700, margin: "0 0 6px" }}>🍎 Mac 사용자</p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px", lineHeight: 1.7 }}>
            ① Finder를 열고 상단 메뉴에서 <strong>이동 → 폴더로 이동</strong>을 클릭합니다. (단축키: ⌘⇧G)
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px", lineHeight: 1.7 }}>
            ② 아래 경로를 그대로 복사해서 붙여넣고 Enter를 누릅니다.
          </p>
          <CodeBlock label="경로 (그대로 복사해서 붙여넣기)">{`~/Library/Application Support/Claude`}</CodeBlock>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "8px 0 4px", lineHeight: 1.7 }}>
            ③ 폴더 안에 <Inline>claude_desktop_config.json</Inline> 파일이 있으면 텍스트 편집기로 열고,
            없으면 새로 만듭니다.
          </p>
          <Tip>💡 텍스트 편집기: Mac 기본 앱 &ldquo;텍스트 편집기(TextEdit)&rdquo; 사용 가능. 단, 파일을 열면 상단 메뉴 &ldquo;포맷 → 일반 텍스트 만들기&rdquo;를 먼저 클릭하세요.</Tip>

          <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 700, margin: "16px 0 6px" }}>🪟 Windows 사용자</p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px", lineHeight: 1.7 }}>
            ① Windows 탐색기 주소창에 아래 경로를 입력하고 Enter를 누릅니다.
          </p>
          <CodeBlock label="탐색기 주소창">{`%APPDATA%\Claude`}</CodeBlock>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "8px 0 4px", lineHeight: 1.7 }}>
            ② 폴더 안에 <Inline>claude_desktop_config.json</Inline> 파일이 있으면 메모장으로 열고,
            없으면 새 텍스트 파일을 만들고 이름을 <Inline>claude_desktop_config.json</Inline>으로 변경합니다.
          </p>
          <Note>⚠ 파일 이름을 바꿀 때 확장자가 <Inline>.json</Inline>인지 확인하세요. 탐색기에서 &ldquo;파일 이름 확장명 표시&rdquo;를 켜두면 확인하기 쉽습니다.</Note>
        </Step>

        <Step n={7} title="설정 파일에 연결 정보 입력">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            파일 안의 내용을 모두 지우고 아래 내용을 붙여넣은 뒤, <strong>3곳</strong>을 수정합니다.
          </p>
          <CodeBlock label="claude_desktop_config.json">{`{
  "mcpServers": {
    "memory-store": {
      "command": "node",
      "args": ["여기에_mcp-server/index.js_의_전체경로"],
      "env": {
        "MEMORY_STORE_URL": "${serviceUrl}",
        "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
      }
    }
  }
}`}</CodeBlock>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ padding: "10px 14px", background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 6, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--glow-deep)" }}>① args 경로</strong> — 5단계에서 복사해 둔 경로로 교체합니다.<br />
              예시 (Mac): <Inline>/Users/홍길동/Documents/memoryStore-main/mcp-server/index.js</Inline><br />
              예시 (Windows): <Inline>C:\Users\홍길동\Documents\memoryStore-main\mcp-server\index.js</Inline>
            </div>
            <div style={{ padding: "10px 14px", background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 6, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--glow-deep)" }}>② MEMORY_STORE_URL</strong> — 이미 올바르게 입력되어 있습니다: <Inline>{serviceUrl}</Inline>
            </div>
            <div style={{ padding: "10px 14px", background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 6, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--glow-deep)" }}>③ MEMORY_STORE_API_KEY</strong> — 1단계에서 발급한 API 키를 입력합니다.
            </div>
          </div>
          <Note>⚠ Windows 경로의 역슬래시(<Inline>\</Inline>)는 <Inline>\\</Inline> 두 개로 써야 합니다. 예: <Inline>C:\\Users\\홍길동\\...</Inline></Note>
        </Step>

        <Step n={8} title="Claude Desktop 재시작 및 연결 확인">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            설정 파일을 저장한 뒤, Claude Desktop을 <strong>완전히 종료</strong>하고 다시 실행합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px", lineHeight: 1.7 }}>
            <strong>연결 확인 방법:</strong> 채팅 입력창 하단에 작은 🔧 아이콘 또는 <strong>memory-store</strong>가 표시되면 연결 성공입니다.
          </p>
          <Tip>
            💡 연결이 잘 됐는지 테스트하려면 Claude에게 이렇게 말해보세요:<br />
            <em style={{ color: "var(--ink-2)" }}>&ldquo;내 Memory Store에 저장된 기억을 불러와줘&rdquo;</em>
          </Tip>
          <Note>
            ⚠ <strong>연결이 안 된다면 확인할 것들:</strong><br />
            • 설정 파일의 경로에 오타가 없는지 확인 (복사·붙여넣기 권장)<br />
            • Windows 경로의 역슬래시가 <Inline>\\</Inline>로 되어 있는지 확인<br />
            • Node.js가 설치되어 있는지 확인 (<Inline>node --version</Inline> 명령 실행)<br />
            • <Inline>mcp-server</Inline> 폴더에서 <Inline>npm install</Inline>을 실행했는지 확인
          </Note>
        </Step>
      </div>
    </>
  );
}

// ── Gemini CLI ────────────────────────────────────────────────────────────────

function GuideGeminiCli({ serviceUrl }: { serviceUrl: string }) {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: 0 }}>Gemini CLI 연결 가이드</h2>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(107,142,90,0.15)", color: "var(--success)" }}>완전 무료</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 10px", lineHeight: 1.7 }}>
          Google의 무료 AI 도구입니다. Google 계정만 있으면 별도 결제 없이 터미널에서 Gemini를 사용할 수 있으며,
          Memory Store와 연결하면 대화 내용을 자동으로 기억에 저장합니다.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "var(--ink-4)", padding: "10px 14px", background: "var(--paper-2)", borderRadius: 6 }}>
          <span>⏱ 예상 소요 시간: 약 10분</span>
          <span>💻 필요 환경: Mac 또는 Windows PC (터미널 사용)</span>
          <span>💰 비용: 완전 무료 (Google 계정 필요)</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <McpServerPrepSection serviceUrl={serviceUrl} />

        <Step n={6} title="Gemini CLI 설치">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            터미널에서 아래 명령을 실행합니다. (인터넷 연결 필요)
          </p>
          <CodeBlock label="터미널">{`npm install -g @google/gemini-cli`}</CodeBlock>
          <Tip>💡 설치 후 <Inline>gemini --version</Inline>을 실행해서 버전 번호가 나오면 설치 성공입니다.</Tip>
        </Step>

        <Step n={7} title="Google 계정으로 로그인">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            터미널에서 <Inline>gemini</Inline>를 입력해 실행합니다.
            처음 실행하면 브라우저가 자동으로 열리며 Google 계정 로그인을 요청합니다.
          </p>
          <CodeBlock label="터미널">{`gemini`}</CodeBlock>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "8px 0 0", lineHeight: 1.7 }}>
            Google 계정으로 로그인하면 로그인 완료 메시지가 표시됩니다. 터미널로 돌아와 <strong>Ctrl+C</strong>로 종료합니다.
          </p>
        </Step>

        <Step n={8} title="Memory Store 연결 설정">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            Gemini CLI 설정 파일에 Memory Store 연결 정보를 추가합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "0 0 4px" }}>① 설정 파일을 열어 수정합니다.</p>
          <CodeBlock label="Mac / Linux — 터미널">{`open ~/.gemini/settings.json`}</CodeBlock>
          <p style={{ fontSize: 12, color: "var(--ink-4)", margin: "4px 0 8px" }}>파일이 없으면 텍스트 편집기에서 새로 만들고 위 경로에 저장하세요.</p>
          <p style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, margin: "0 0 4px" }}>② 아래 내용을 붙여넣고 2곳을 수정합니다.</p>
          <CodeBlock label="~/.gemini/settings.json">{`{
  "mcpServers": {
    "memory-store": {
      "command": "node",
      "args": ["여기에_mcp-server/index.js_의_전체경로"],
      "env": {
        "MEMORY_STORE_URL": "${serviceUrl}",
        "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
      }
    }
  }
}`}</CodeBlock>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ padding: "8px 12px", background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 6, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--glow-deep)" }}>① args 경로</strong> — 5단계에서 확인한 index.js 전체 경로로 교체
            </div>
            <div style={{ padding: "8px 12px", background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 6, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--glow-deep)" }}>② MEMORY_STORE_API_KEY</strong> — 1단계에서 발급한 API 키 입력
            </div>
          </div>
        </Step>

        <Step n={9} title="연결 확인">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            터미널에서 Gemini CLI를 다시 실행합니다.
          </p>
          <CodeBlock label="터미널">{`gemini`}</CodeBlock>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "8px 0 4px", lineHeight: 1.7 }}>실행 후 대화창에서 아래 메시지를 입력해 테스트합니다.</p>
          <CodeBlock>{`내 Memory Store에 저장된 기억을 불러와줘`}</CodeBlock>
          <Tip>💡 <Inline>/mcp</Inline>를 입력하면 연결된 MCP 서버 목록과 사용 가능한 도구를 확인할 수 있습니다.</Tip>
        </Step>
      </div>
    </>
  );
}

// ── Claude Code ───────────────────────────────────────────────────────────────

function GuideClaudeCode({ serviceUrl }: { serviceUrl: string }) {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>Claude Code 연결 가이드</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 20px", lineHeight: 1.7 }}>
        터미널에서 사용하는 Claude Code CLI에 Memory Store를 연결합니다.
        Claude Code가 이미 설치되어 있고 터미널 사용에 익숙하다면 빠르게 설정할 수 있습니다.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <McpServerPrepSection serviceUrl={serviceUrl} />

        <Step n={6} title="Claude Code에 MCP 서버 등록">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            아래 명령을 실행합니다. 경로와 API 키를 실제 값으로 바꿔 입력하세요.
          </p>
          <CodeBlock label="터미널">{`claude mcp add memory-store \\
  -e MEMORY_STORE_URL=${serviceUrl} \\
  -e MEMORY_STORE_API_KEY=여기에_API_키_입력 \\
  -- node /여기에_mcp-server/index.js_의_전체경로`}</CodeBlock>
          <Tip>💡 등록 후 <Inline>claude mcp list</Inline>를 실행해 memory-store가 목록에 나오면 성공입니다.</Tip>
        </Step>

        <Step n={7} title="연결 확인">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            Claude Code 세션을 시작하고 슬래시 명령으로 확인합니다.
          </p>
          <CodeBlock label="터미널">{`claude`}</CodeBlock>
          <p style={{ fontSize: 12, color: "var(--ink-4)", margin: "6px 0 4px" }}>세션 안에서:</p>
          <CodeBlock>{`/mcp`}</CodeBlock>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "8px 0 0", lineHeight: 1.7 }}>
            <Inline>memory-store</Inline>가 목록에 표시되면 연결 완료입니다.
          </p>
        </Step>
      </div>
    </>
  );
}

// ── VS Code Copilot ───────────────────────────────────────────────────────────

function GuideVSCodeCopilot({ serviceUrl }: { serviceUrl: string }) {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>VS Code Copilot 연결 가이드</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 20px", lineHeight: 1.7 }}>
        GitHub Copilot Chat의 Agent 모드에서 Memory Store를 사용합니다.
        VS Code 1.99 이상, GitHub Copilot 구독이 필요합니다.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <McpServerPrepSection serviceUrl={serviceUrl} />

        <Step n={6} title="VS Code 사용자 설정에 MCP 등록">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ① VS Code에서{" "}
            <kbd style={{ fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--paper-2)", padding: "2px 6px", borderRadius: 3, border: "1px solid var(--paper-line)" }}>⌘ Shift P</kbd>
            {" "}(Windows: <kbd style={{ fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--paper-2)", padding: "2px 6px", borderRadius: 3, border: "1px solid var(--paper-line)" }}>Ctrl Shift P</kbd>)
            를 눌러 명령 팔레트를 열고 <strong>Open User Settings (JSON)</strong>을 검색해 클릭합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ② 열린 JSON 파일에 아래 내용을 추가합니다. (기존 내용이 있다면 마지막 항목 뒤에 추가)
          </p>
          <CodeBlock label="settings.json">{`{
  "mcp": {
    "servers": {
      "memory-store": {
        "type": "stdio",
        "command": "node",
        "args": ["여기에_mcp-server/index.js_의_전체경로"],
        "env": {
          "MEMORY_STORE_URL": "${serviceUrl}",
          "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
        }
      }
    }
  }
}`}</CodeBlock>
        </Step>

        <Step n={7} title="Copilot Chat Agent 모드에서 확인">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ① VS Code 좌측 아이콘에서 <strong>Copilot Chat</strong> 아이콘을 클릭합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ② 채팅 입력창 위쪽에서 모드를 <strong>Agent</strong>로 전환합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ③ 입력창 옆 <strong>도구(🔧) 버튼</strong>을 클릭해 memory-store 도구가 목록에 있는지 확인합니다.
          </p>
          <Note>⚠ <strong>Ask 또는 Edit 모드에서는 MCP 도구가 보이지 않습니다.</strong> 반드시 <strong>Agent 모드</strong>로 전환해야 합니다.</Note>
        </Step>
      </div>
    </>
  );
}

// ── Cursor ────────────────────────────────────────────────────────────────────

function GuideCursor({ serviceUrl }: { serviceUrl: string }) {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>Cursor 연결 가이드</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 20px", lineHeight: 1.7 }}>
        AI 코드 에디터 Cursor에 Memory Store를 연결해, 코딩 중에도 개인 기억에 접근할 수 있습니다.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <McpServerPrepSection serviceUrl={serviceUrl} />

        <Step n={6} title="Cursor MCP 설정 파일 만들기">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            아래 내용으로 파일을 만듭니다.
            모든 프로젝트에서 사용하려면 홈 디렉터리에, 특정 프로젝트에서만 사용하려면 해당 프로젝트 폴더 안에 저장합니다.
          </p>
          <CodeBlock label="저장 위치 — Mac: ~/.cursor/mcp.json  /  Windows: C:\Users\이름\.cursor\mcp.json">{`{
  "mcpServers": {
    "memory-store": {
      "command": "node",
      "args": ["여기에_mcp-server/index.js_의_전체경로"],
      "env": {
        "MEMORY_STORE_URL": "${serviceUrl}",
        "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
      }
    }
  }
}`}</CodeBlock>
        </Step>

        <Step n={7} title="Cursor 재시작 후 연결 확인">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ① Cursor를 완전히 종료하고 다시 실행합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ② 상단 메뉴 <strong>Cursor → Settings → MCP</strong> (또는 좌하단 톱니바퀴 → MCP)에서
            memory-store 항목의 상태가 <strong style={{ color: "var(--success)" }}>● active</strong>인지 확인합니다.
          </p>
          <Tip>💡 Cursor의 Composer(채팅) 창에서 <em>&ldquo;내 취향 불러와줘&rdquo;</em>처럼 자연어로 기억을 요청해보세요.</Tip>
        </Step>
      </div>
    </>
  );
}

// ── ChatGPT ───────────────────────────────────────────────────────────────────

function GuideChatGPT({ serviceUrl }: { serviceUrl: string }) {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>ChatGPT 연결 가이드</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 10px", lineHeight: 1.7 }}>
        ChatGPT는 MCP를 직접 지원하지 않습니다. 대신 <strong>Custom GPT Actions</strong>를 통해 REST API로 연결합니다.
      </p>
      <Note>⚠ ChatGPT <strong>Plus, Team, 또는 Enterprise</strong> 구독이 필요합니다. 무료 계정에서는 Custom GPT를 만들 수 없습니다.</Note>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 20 }}>
        <Step n={1} title="API 키 준비">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, lineHeight: 1.7 }}>
            <strong>API 키</strong> 탭에서 새 키를 발급합니다. ChatGPT 전용으로 별도로 발급하는 것을 권장합니다.
          </p>
        </Step>

        <Step n={2} title="My GPTs 페이지에서 새 GPT 만들기">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ① 아래 주소에 접속합니다.
          </p>
          <div style={{ background: "var(--paper-2)", border: "1px solid var(--paper-line)", borderRadius: 6, padding: "10px 14px", fontSize: 13, margin: "4px 0 10px" }}>
            🌐 <a href="https://chatgpt.com/gpts/mine" target="_blank" rel="noreferrer" style={{ color: "var(--glow-deep)", fontWeight: 600 }}>chatgpt.com/gpts/mine</a>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px", lineHeight: 1.7 }}>
            ② 오른쪽 상단의 <strong>+ Create</strong> 버튼을 클릭합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px", lineHeight: 1.7 }}>
            ③ <strong>Configure</strong> 탭을 클릭합니다.
          </p>
        </Step>

        <Step n={3} title="Actions 설정 — OpenAPI 스펙 입력">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ① Configure 탭 아래쪽 <strong>Actions</strong> 섹션에서 <strong>Create new action</strong>을 클릭합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px", lineHeight: 1.7 }}>
            ② <strong>Schema</strong> 입력란에 아래 내용을 붙여넣습니다. (이미 서비스 주소가 입력되어 있습니다)
          </p>
          <CodeBlock label="OpenAPI Schema (YAML)">{`openapi: "3.1.0"
info:
  title: Memory Store API
  version: "1.0"
servers:
  - url: ${serviceUrl}
paths:
  /api/memories:
    get:
      operationId: getMemories
      summary: 저장된 기억 전체 조회
      parameters:
        - in: query
          name: category
          schema: { type: string }
      responses:
        "200":
          description: OK
    post:
      operationId: saveMemory
      summary: 기억 저장
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [category, key, value]
              properties:
                category:
                  type: string
                  enum: [취향,건강,인간관계,재무,목표,습관,기타]
                key:   { type: string }
                value: { type: string }
      responses:
        "200":
          description: OK
  /api/search:
    get:
      operationId: searchMemories
      summary: 기억 검색
      parameters:
        - in: query
          name: q
          required: true
          schema: { type: string }
      responses:
        "200":
          description: OK`}</CodeBlock>
        </Step>

        <Step n={4} title="인증(Authentication) 설정">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ① Action 편집 화면에서 <strong>Authentication</strong> 항목을 클릭합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px", lineHeight: 1.7 }}>
            ② 아래와 같이 설정합니다.
          </p>
          <div style={{ padding: "12px 16px", background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 8, fontSize: 13, color: "var(--ink-3)", lineHeight: 2, margin: "6px 0" }}>
            <div>• Authentication type: <strong>API Key</strong></div>
            <div>• Auth Type: <strong>Bearer</strong></div>
            <div>• API Key: <strong>발급받은 API 키 입력</strong></div>
          </div>
          <Note>⚠ API 키가 ChatGPT 서버에 저장됩니다. 반드시 이 GPT 전용으로 별도 발급한 키를 사용하세요.</Note>
        </Step>

        <Step n={5} title="GPT Instructions 설정">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            Configure 탭의 <strong>Instructions</strong> 입력란에 아래 내용을 추가합니다.
            이 지침이 GPT에게 Memory Store를 언제, 어떻게 사용할지 알려줍니다.
          </p>
          <CodeBlock>{`대화 시작 시 getMemories 액션을 호출해 사용자의 기억을 불러오세요.
대화 중 사용자에 대해 새로운 사실을 알게 되면 saveMemory 액션으로 저장하세요.
사용자가 특정 주제를 언급하면 searchMemories로 관련 기억을 먼저 조회하세요.`}</CodeBlock>
        </Step>

        <Step n={6} title="저장 및 테스트">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 8px", lineHeight: 1.7 }}>
            ① 오른쪽 상단 <strong>Save</strong> 버튼을 클릭해 GPT를 저장합니다.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px", lineHeight: 1.7 }}>
            ② 저장된 GPT를 열어 대화창에서 테스트합니다.
          </p>
          <CodeBlock>{`내 Memory Store에 저장된 기억을 불러와줘`}</CodeBlock>
          <Tip>💡 GPT가 Memory Store에서 데이터를 가져오면 연결 성공입니다.</Tip>
        </Step>
      </div>
    </>
  );
}

// ── REST API ──────────────────────────────────────────────────────────────────

function GuideRestApi({ serviceUrl }: { serviceUrl: string }) {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>REST API 직접 연결</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 10px", lineHeight: 1.7 }}>
        개발자용 직접 연동 가이드입니다. 모든 요청에{" "}
        <Inline>Authorization: Bearer YOUR_API_KEY</Inline> 헤더를 포함합니다.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Step n={1} title="기억 전체 조회">
          <CodeBlock label={`GET ${serviceUrl}/api/memories`}>{`curl ${serviceUrl}/api/memories \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
          <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 8 }}>
            카테고리 필터: <Inline>/api/memories?category=취향</Inline>
          </p>
        </Step>
        <Step n={2} title="기억 저장 (upsert)">
          <CodeBlock label={`POST ${serviceUrl}/api/memories`}>{`curl -X POST ${serviceUrl}/api/memories \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "취향",
    "key": "음식",
    "value": "라멘을 특히 좋아함"
  }'`}</CodeBlock>
          <Note>category와 key가 같은 기억이 이미 있으면 value만 업데이트됩니다 (upsert).</Note>
        </Step>
        <Step n={3} title="기억 검색">
          <CodeBlock label={`GET ${serviceUrl}/api/search`}>{`curl "${serviceUrl}/api/search?q=음식" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
        </Step>
        <Step n={4} title="기억 삭제">
          <CodeBlock label={`DELETE ${serviceUrl}/api/memories/{id}`}>{`curl -X DELETE ${serviceUrl}/api/memories/MEMORY_ID \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
        </Step>
        <div style={{ background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 8, padding: "16px 18px" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", margin: "0 0 10px", letterSpacing: "0.05em" }}>응답 형식</p>
          <CodeBlock>{`// GET /api/memories
{ "memories": [{ "id", "category", "key", "value", "updatedAt" }] }

// POST /api/memories
{ "memory": { "id", "category", "key", "value" } }

// DELETE /api/memories/{id}
{ "success": true }`}</CodeBlock>
        </div>
      </div>
    </>
  );
}
