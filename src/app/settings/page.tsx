"use client";

import { useState, useEffect } from "react";
import { UserButton, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ApiKey = {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
};

export default function SettingsPage() {
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

  return (
    <div className="min-h-screen" style={{ background: "#0f0f13" }}>
      <header className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">← 대시보드</Link>
          <span className="text-gray-600">|</span>
          <span className="text-white font-medium">설정</span>
        </div>
        <UserButton />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">

        {/* API 키 관리 */}
        <section>
          <h2 className="text-white font-semibold text-lg mb-1">API 키 관리</h2>
          <p className="text-gray-400 text-sm mb-4">Claude MCP 서버 연결에 사용됩니다.</p>

          <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-sm text-gray-300 mb-3 font-medium">새 API 키 발급</p>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}
                placeholder="키 이름 (예: Claude Desktop)"
                maxLength={50}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2 text-sm text-white rounded-lg whitespace-nowrap"
                style={{ background: "#7c3aed" }}
              >
                발급
              </button>
            </div>
          </div>

          {newlyCreated && (
            <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <p className="text-green-400 text-sm font-medium mb-2">✅ 새 API 키가 발급됐습니다</p>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-green-300 text-xs break-all flex-1">{newlyCreated}</code>
                <button
                  onClick={() => copyKey(newlyCreated)}
                  className="px-3 py-1 text-xs rounded-lg text-green-300 shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)" }}
                >
                  {copied ? "복사됨 ✓" : "복사"}
                </button>
              </div>
              <p className="text-yellow-400 text-xs">⚠️ 지금만 보입니다. 반드시 복사해서 보관하세요.</p>
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-sm">불러오는 중...</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-gray-500 text-sm">발급된 API 키가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{key.name}</p>
                    <p className="text-gray-500 text-xs font-mono">{key.keyPreview}</p>
                  </div>
                  <p className="text-gray-500 text-xs shrink-0">{new Date(key.createdAt).toLocaleDateString("ko-KR")}</p>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-gray-500 hover:text-red-400 text-xs transition-colors shrink-0"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Claude MCP 연결 가이드 */}
        <section>
          <h2 className="text-white font-semibold text-lg mb-1">Claude MCP 연결</h2>
          <p className="text-gray-400 text-sm mb-4">API 키를 발급한 후 아래 설정을 Claude Desktop에 적용하세요.</p>
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-gray-400 text-xs mb-2 font-mono">~/.claude/claude_desktop_config.json</p>
            <pre className="text-green-300 text-xs overflow-x-auto leading-relaxed">{`{
  "mcpServers": {
    "memory-store": {
      "command": "node",
      "args": ["/.../mcp-server/index.js"],
      "env": {
        "MEMORY_STORE_URL": "https://your-domain.com",
        "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
      }
    }
  }
}`}</pre>
          </div>
        </section>

        {/* 개인정보 */}
        <section>
          <h2 className="text-white font-semibold text-lg mb-1">개인정보</h2>
          <p className="text-gray-400 text-sm mb-4">
            서비스 이용과 관련된 개인정보 처리 방침을 확인하세요.
          </p>
          <Link
            href="/privacy"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            개인정보 처리방침 보기 →
          </Link>
        </section>

        {/* 회원 탈퇴 */}
        <section>
          <div className="rounded-xl p-5" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <h2 className="text-red-400 font-semibold mb-1">회원 탈퇴</h2>
            <p className="text-gray-400 text-sm mb-4">
              탈퇴 시 모든 메모리 데이터와 API 키가 <strong className="text-white">즉시 영구 삭제</strong>됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-4 py-2 text-sm rounded-lg text-red-400 transition-colors"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                회원 탈퇴
              </button>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg px-4 py-3 text-sm text-yellow-300" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)" }}>
                  정말로 탈퇴하시겠습니까? 저장된 모든 데이터가 삭제됩니다.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 text-sm rounded-lg text-white transition-colors disabled:opacity-50"
                    style={{ background: "#dc2626" }}
                  >
                    {deleting ? "삭제 중..." : "네, 탈퇴합니다"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 text-sm rounded-lg text-gray-300 transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
