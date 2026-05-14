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
    <div style={{ display: "flex", gap: 16, paddingBottom: 20, borderBottom: "1px dashed var(--paper-line)" }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: "var(--glow)", color: "var(--paper-0)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
        flexShrink: 0, marginTop: 1,
      }}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 8px" }}>{title}</p>
        {children}
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: 10,
      padding: "10px 14px",
      background: "rgba(201,123,74,0.07)",
      border: "1px solid rgba(201,123,74,0.2)",
      borderRadius: 6,
      fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}

function ConnectGuide() {
  const [selected, setSelected] = useState<ServiceId>("claude-desktop");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 무료 안내 배너 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: "rgba(107,142,90,0.08)", border: "1px solid rgba(107,142,90,0.25)",
        borderRadius: 8, fontSize: 13, color: "var(--ink-3)",
      }}>
        <span style={{ color: "var(--success)", fontWeight: 600, flexShrink: 0 }}>✓ 무료</span>
        <span><strong style={{ color: "var(--ink-1)" }}>Claude Desktop</strong>과 <strong style={{ color: "var(--ink-1)" }}>Gemini CLI</strong>는 무료로 바로 테스트할 수 있습니다. API 키는 <strong style={{ color: "var(--ink-1)" }}>API 키</strong> 탭에서 먼저 발급하세요.</span>
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
            transition: "all 0.15s",
            position: "relative",
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
        {selected === "claude-desktop" && <GuideClaudeDesktop />}
        {selected === "claude-code"    && <GuideClaudeCode />}
        {selected === "gemini-cli"     && <GuideGeminiCli />}
        {selected === "vscode-copilot" && <GuideVSCodeCopilot />}
        {selected === "cursor"         && <GuideCursor />}
        {selected === "chatgpt"        && <GuideChatGPT />}
        {selected === "rest-api"       && <GuideRestApi />}
      </div>
    </div>
  );
}

function GuideGeminiCli() {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: 0 }}>Gemini CLI 연결</h2>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(107,142,90,0.15)", color: "var(--success)" }}>완전 무료</span>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 6px" }}>
        Google이 2025년 6월 오픈소스로 공개한 터미널용 AI 도구입니다. Google 계정만 있으면 무료로 사용할 수 있으며 MCP를 지원합니다.
      </p>
      <Note>
        💡 Gemini CLI는 무료 티어에서 Gemini 2.5 Pro를 분당 60회 요청까지 무료로 사용할 수 있습니다.
      </Note>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
        <Step n={1} title="Gemini CLI 설치">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>Node.js 18 이상이 필요합니다.</p>
          <CodeBlock label="터미널">{`npm install -g @google/gemini-cli`}</CodeBlock>
          <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 6 }}>또는 설치 없이 바로 실행:</p>
          <CodeBlock>{`npx @google/gemini-cli`}</CodeBlock>
        </Step>
        <Step n={2} title="Google 계정으로 인증">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>
            처음 실행하면 브라우저가 열리며 Google 계정 로그인을 요청합니다.
          </p>
          <CodeBlock label="터미널">{`gemini`}</CodeBlock>
          <Note>Google 계정으로 로그인하면 별도의 API 키 없이 무료로 사용 가능합니다.</Note>
        </Step>
        <Step n={3} title="MCP 서버 파일 준비">
          <CodeBlock label="터미널">{`cd /path/to/mcp-server
npm install`}</CodeBlock>
        </Step>
        <Step n={4} title="Gemini CLI 설정 파일에 MCP 등록">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>
            홈 디렉터리의 <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--paper-2)", padding: "1px 5px", borderRadius: 3 }}>~/.gemini/settings.json</code> 파일을 편집합니다.
          </p>
          <CodeBlock label="~/.gemini/settings.json">{`{
  "mcpServers": {
    "memory-store": {
      "command": "node",
      "args": ["/절대경로/mcp-server/index.js"],
      "env": {
        "MEMORY_STORE_URL": "https://your-domain.com",
        "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
      }
    }
  }
}`}</CodeBlock>
          <Note>⚠ <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>args</code>에는 <strong>절대 경로</strong>를 입력해야 합니다. 예: <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>/Users/username/memory-store/mcp-server/index.js</code></Note>
        </Step>
        <Step n={5} title="연결 확인">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>Gemini CLI를 실행하고 기억을 요청해 봅니다.</p>
          <CodeBlock label="터미널">{`gemini`}</CodeBlock>
          <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 8 }}>실행 후 대화창에서:</p>
          <CodeBlock>{`내 저장된 기억을 불러와줘`}</CodeBlock>
          <Note>💡 Gemini CLI는 <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>/mcp</code> 명령으로 연결된 MCP 서버 목록과 사용 가능한 도구를 확인할 수 있습니다.</Note>
        </Step>
      </div>
    </>
  );
}

function GuideClaudeDesktop() {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>Claude Desktop 연결</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 24px" }}>MCP(Model Context Protocol)를 통해 Claude Desktop이 대화 중 자동으로 기억을 읽고 저장합니다.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Step n={1} title="MCP 서버 파일 준비">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>
            프로젝트의 <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--paper-2)", padding: "1px 5px", borderRadius: 3 }}>mcp-server/</code> 디렉터리를
            로컬에 복사하고 의존성을 설치합니다.
          </p>
          <CodeBlock label="터미널">{`cd /path/to/mcp-server
npm install`}</CodeBlock>
        </Step>
        <Step n={2} title="Claude Desktop 설정 파일 열기">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>운영체제에 따라 설정 파일 위치가 다릅니다.</p>
          <CodeBlock label="macOS">{`~/Library/Application Support/Claude/claude_desktop_config.json`}</CodeBlock>
          <CodeBlock label="Windows">{`%APPDATA%\\Claude\\claude_desktop_config.json`}</CodeBlock>
        </Step>
        <Step n={3} title="MCP 서버 설정 추가">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>
            아래 내용을 붙여넣고 <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--paper-2)", padding: "1px 5px", borderRadius: 3 }}>args</code>의 경로와 API 키를 수정합니다.
          </p>
          <CodeBlock label="claude_desktop_config.json">{`{
  "mcpServers": {
    "memory-store": {
      "command": "node",
      "args": ["/절대경로/mcp-server/index.js"],
      "env": {
        "MEMORY_STORE_URL": "https://your-domain.com",
        "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
      }
    }
  }
}`}</CodeBlock>
          <Note>⚠ <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>args</code>에는 <strong>절대 경로</strong>를 입력해야 합니다. 예: <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>/Users/username/memory-store/mcp-server/index.js</code></Note>
        </Step>
        <Step n={4} title="Claude Desktop 재시작">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>앱을 완전히 종료한 후 다시 실행합니다. 채팅창 좌하단에 <strong>memory-store</strong> 도구가 표시되면 연결 성공입니다.</p>
          <Note>💡 Claude에게 <em>&ldquo;내 기억 불러와줘&rdquo;</em>라고 말하면 저장된 메모리를 즉시 확인할 수 있습니다.</Note>
        </Step>
      </div>
    </>
  );
}

function GuideClaudeCode() {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>Claude Code 연결</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 24px" }}>CLI 환경의 Claude Code에서도 같은 MCP 서버를 사용합니다.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Step n={1} title="MCP 서버 파일 준비">
          <CodeBlock label="터미널">{`cd /path/to/mcp-server
npm install`}</CodeBlock>
        </Step>
        <Step n={2} title="Claude Code에 MCP 서버 등록">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>
            Claude Code CLI의 <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--paper-2)", padding: "1px 5px", borderRadius: 3 }}>mcp add</code> 명령으로 등록합니다.
          </p>
          <CodeBlock label="터미널">{`claude mcp add memory-store \\
  -e MEMORY_STORE_URL=https://your-domain.com \\
  -e MEMORY_STORE_API_KEY=여기에_API_키_입력 \\
  -- node /절대경로/mcp-server/index.js`}</CodeBlock>
        </Step>
        <Step n={3} title="또는 설정 파일 직접 편집">
          <CodeBlock label="~/.claude/claude_desktop_config.json">{`{
  "mcpServers": {
    "memory-store": {
      "command": "node",
      "args": ["/절대경로/mcp-server/index.js"],
      "env": {
        "MEMORY_STORE_URL": "https://your-domain.com",
        "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
      }
    }
  }
}`}</CodeBlock>
        </Step>
        <Step n={4} title="연결 확인">
          <CodeBlock label="터미널">{`claude mcp list`}</CodeBlock>
          <Note>💡 Claude Code 세션에서 <em>&ldquo;/mcp&rdquo;</em> 슬래시 명령으로 연결된 MCP 서버 목록을 확인할 수 있습니다.</Note>
        </Step>
      </div>
    </>
  );
}

function GuideVSCodeCopilot() {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>VS Code Copilot 연결</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 24px" }}>GitHub Copilot Chat (Agent 모드)에서 MCP를 통해 Memory Store를 사용합니다. VS Code 1.99 이상 필요.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Step n={1} title="MCP 서버 파일 준비">
          <CodeBlock label="터미널">{`cd /path/to/mcp-server
npm install`}</CodeBlock>
        </Step>
        <Step n={2} title="VS Code 사용자 설정 열기">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>
            <kbd style={{ fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--paper-2)", padding: "2px 6px", borderRadius: 3, border: "1px solid var(--paper-line)" }}>⌘ Shift P</kbd> → <em>Open User Settings (JSON)</em>
          </p>
        </Step>
        <Step n={3} title="MCP 서버 설정 추가">
          <CodeBlock label="settings.json">{`{
  "mcp": {
    "servers": {
      "memory-store": {
        "type": "stdio",
        "command": "node",
        "args": ["/절대경로/mcp-server/index.js"],
        "env": {
          "MEMORY_STORE_URL": "https://your-domain.com",
          "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
        }
      }
    }
  }
}`}</CodeBlock>
        </Step>
        <Step n={4} title="Copilot Chat에서 확인">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>
            Copilot Chat을 열고 <strong>Agent 모드</strong>로 전환한 뒤, 도구 목록에서 <strong>memory-store</strong>가 보이면 완료입니다.
          </p>
          <Note>⚠ Copilot Chat의 일반 모드(Ask/Edit)가 아닌 <strong>Agent 모드</strong>에서만 MCP 도구가 활성화됩니다.</Note>
        </Step>
      </div>
    </>
  );
}

function GuideCursor() {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>Cursor 연결</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 24px" }}>AI 코드 에디터 Cursor의 MCP 기능으로 코딩 중에도 개인 기억에 접근할 수 있습니다.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Step n={1} title="MCP 서버 파일 준비">
          <CodeBlock label="터미널">{`cd /path/to/mcp-server
npm install`}</CodeBlock>
        </Step>
        <Step n={2} title="Cursor MCP 설정 파일 생성">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>전역 적용은 홈 디렉터리, 프로젝트별 적용은 프로젝트 루트에 파일을 만듭니다.</p>
          <CodeBlock label="~/.cursor/mcp.json  또는  프로젝트/.cursor/mcp.json">{`{
  "mcpServers": {
    "memory-store": {
      "command": "node",
      "args": ["/절대경로/mcp-server/index.js"],
      "env": {
        "MEMORY_STORE_URL": "https://your-domain.com",
        "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
      }
    }
  }
}`}</CodeBlock>
        </Step>
        <Step n={3} title="Cursor 재시작 후 확인">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>
            Cursor를 재시작하고 <strong>Settings → MCP</strong>에서 memory-store 서버 상태가 <strong style={{ color: "var(--success)" }}>●&nbsp;active</strong>인지 확인합니다.
          </p>
          <Note>💡 Cursor Composer(Agent 모드)에서 <em>&ldquo;내 취향 불러와줘&rdquo;</em>처럼 자연어로 기억을 요청할 수 있습니다.</Note>
        </Step>
      </div>
    </>
  );
}

function GuideChatGPT() {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>ChatGPT 연결</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 24px" }}>
        ChatGPT는 MCP를 직접 지원하지 않습니다. 대신 <strong>Custom GPT Actions</strong>를 통해 REST API로 연결합니다. ChatGPT Plus/Team/Enterprise 계정 필요.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Step n={1} title="My GPTs에서 새 GPT 만들기">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
            <a href="https://chatgpt.com/gpts/mine" target="_blank" rel="noreferrer" style={{ color: "var(--glow-deep)", textDecoration: "none" }}>chatgpt.com/gpts/mine</a>에서
            <strong> + Create</strong>를 클릭합니다.
          </p>
        </Step>
        <Step n={2} title="Actions 탭 → Create new action">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 6px" }}><strong>Configure</strong> 탭 → <strong>Actions</strong> 섹션 → <strong>Create new action</strong>을 클릭합니다.</p>
        </Step>
        <Step n={3} title="OpenAPI 스펙 입력">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>아래 스펙을 <strong>Schema</strong> 란에 붙여넣고 <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--paper-2)", padding: "1px 5px", borderRadius: 3 }}>your-domain.com</code>을 실제 도메인으로 교체합니다.</p>
          <CodeBlock label="OpenAPI Schema (YAML)">{`openapi: "3.1.0"
info:
  title: Memory Store API
  version: "1.0"
servers:
  - url: https://your-domain.com
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
        <Step n={4} title="Authentication 설정">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>
            <strong>Authentication</strong>을 <strong>API Key</strong>로 설정하고,
            Auth Type은 <strong>Bearer</strong>, API Key 값에 발급받은 키를 입력합니다.
          </p>
          <Note>⚠ API 키는 ChatGPT 서버에 저장됩니다. 반드시 이 GPT 전용으로 별도 키를 발급하세요.</Note>
        </Step>
        <Step n={5} title="GPT Instructions 설정">
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 4px" }}>Configure 탭의 Instructions 란에 아래 내용을 추가합니다.</p>
          <CodeBlock>{`대화 시작 시 getMemories 액션을 호출해 사용자의 기억을 불러오세요.
대화 중 사용자에 대해 새로운 사실을 알게 되면 saveMemory 액션으로 저장하세요.
사용자가 특정 주제를 언급하면 searchMemories로 관련 기억을 먼저 조회하세요.`}</CodeBlock>
        </Step>
      </div>
    </>
  );
}

function GuideRestApi() {
  return (
    <>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 6px" }}>REST API 직접 연결</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 24px" }}>
        모든 요청에 <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--paper-2)", padding: "1px 5px", borderRadius: 3 }}>Authorization: Bearer YOUR_API_KEY</code> 헤더를 포함합니다.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Step n={1} title="기억 전체 조회">
          <CodeBlock label="GET /api/memories">{`curl https://your-domain.com/api/memories \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
          <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 8 }}>
            카테고리 필터: <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--paper-2)", padding: "1px 5px", borderRadius: 3 }}>/api/memories?category=취향</code>
          </p>
        </Step>
        <Step n={2} title="기억 저장 (upsert)">
          <CodeBlock label="POST /api/memories">{`curl -X POST https://your-domain.com/api/memories \\
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
          <CodeBlock label="GET /api/search">{`curl "https://your-domain.com/api/search?q=음식" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
        </Step>
        <Step n={4} title="기억 삭제">
          <CodeBlock label="DELETE /api/memories/{id}">{`curl -X DELETE https://your-domain.com/api/memories/MEMORY_ID \\
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
