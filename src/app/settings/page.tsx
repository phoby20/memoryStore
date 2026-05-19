"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type Tab = "aikeys" | "account";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("aikeys");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();

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
    { id: "aikeys", label: "AI 설정" },
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
        <div className="settings-tabs" style={{ display: "flex", gap: 4, marginTop: 24, marginBottom: 28, borderBottom: "1px solid var(--paper-line)", overflowX: "auto" }}>
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

        {/* AI 설정 탭 */}
        {tab === "aikeys" && <AiKeysTab />}

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

// ── AI API 키 설정 ────────────────────────────────────────────────────────────

type AiKeyRecord = { id: string; provider: string; maskedKey: string; updatedAt: string };

const AI_PROVIDERS = [
  { id: "claude", label: "Claude (Anthropic)", hint: "sk-ant-api03-…", link: "https://console.anthropic.com/settings/keys" },
  { id: "openai", label: "OpenAI (GPT-4o, o3…)", hint: "sk-proj-…", link: "https://platform.openai.com/api-keys" },
  { id: "gemini", label: "Gemini (Google AI)", hint: "AIza…", link: "https://aistudio.google.com/apikey" },
];

function AiKeysTab() {
  const [records, setRecords] = useState<AiKeyRecord[]>([]);
  const [inputKey, setInputKey] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/ai-apikeys").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setRecords(data);
    });
  }, []);

  function getRecord(provider: string) {
    return records.find((r) => r.provider === provider);
  }

  async function handleSave(provider: string) {
    const key = inputKey[provider]?.trim();
    if (!key) return;
    setSaving((p) => ({ ...p, [provider]: true }));
    const res = await fetch("/api/ai-apikeys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey: key }),
    });
    if (res.ok) {
      const data = await res.json();
      setRecords((prev) => {
        const next = prev.filter((r) => r.provider !== provider);
        return [...next, { id: data.id, provider: data.provider, maskedKey: "••••••••" + key.slice(-4), updatedAt: new Date().toISOString() }];
      });
      setInputKey((p) => ({ ...p, [provider]: "" }));
      setSaved((p) => ({ ...p, [provider]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [provider]: false })), 2000);
    }
    setSaving((p) => ({ ...p, [provider]: false }));
  }

  async function handleDelete(provider: string) {
    await fetch("/api/ai-apikeys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    setRecords((prev) => prev.filter((r) => r.provider !== provider));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, maxWidth: 580, lineHeight: 1.7 }}>
        AI 채팅을 사용하려면 사용하려는 AI 서비스의 API 키를 등록하세요.
        키는 서버에서 AES-256 암호화되어 저장되며, 채팅 요청 시에만 복호화됩니다.
      </p>

      {AI_PROVIDERS.map((prov) => {
        const rec = getRecord(prov.id);
        return (
          <div key={prov.id} style={{
            background: "var(--paper-0)", border: "1px solid var(--paper-line)",
            borderRadius: 12, padding: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "var(--ink-1)", margin: 0 }}>
                {prov.label}
              </p>
              {rec && (
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(107,142,90,0.15)", color: "var(--success)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  ✓ 등록됨
                </span>
              )}
            </div>

            {rec && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "10px 14px", background: "var(--paper-1)", borderRadius: 8, border: "1px solid var(--paper-line)" }}>
                <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-3)", flex: 1 }}>{rec.maskedKey}</code>
                <span style={{ fontSize: 11, color: "var(--ink-5)", whiteSpace: "nowrap" }}>
                  {new Date(rec.updatedAt).toLocaleDateString("ko-KR")} 업데이트
                </span>
                <button onClick={() => handleDelete(prov.id)} style={{
                  padding: "4px 10px", background: "transparent",
                  border: "1px solid rgba(177,75,62,0.3)", borderRadius: 5,
                  color: "var(--danger)", fontSize: 12, cursor: "pointer",
                }}>삭제</button>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="password"
                value={inputKey[prov.id] ?? ""}
                onChange={(e) => setInputKey((p) => ({ ...p, [prov.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleSave(prov.id)}
                placeholder={prov.hint || "API 키 입력"}
                style={{
                  flex: 1, minWidth: 0, padding: "10px 14px",
                  background: "var(--paper-1)", border: "1px solid var(--paper-line)",
                  borderRadius: 8, fontSize: 13, color: "var(--ink-1)", outline: "none",
                }}
              />
              <button onClick={() => handleSave(prov.id)} disabled={saving[prov.id] || !inputKey[prov.id]?.trim()} style={{
                padding: "10px 20px",
                background: saved[prov.id] ? "var(--success)" : "var(--glow)",
                border: "none", color: "var(--paper-0)", borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
                opacity: (!inputKey[prov.id]?.trim() || saving[prov.id]) ? 0.5 : 1,
              }}>
                {saved[prov.id] ? "✓ 저장됨" : saving[prov.id] ? "저장 중…" : rec ? "교체" : "저장"}
              </button>
            </div>

            {prov.link && (
              <p style={{ fontSize: 12, color: "var(--ink-4)", margin: "8px 0 0" }}>
                API 키 발급: <a href={prov.link} target="_blank" rel="noreferrer" style={{ color: "var(--glow-deep)" }}>{prov.link}</a>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
