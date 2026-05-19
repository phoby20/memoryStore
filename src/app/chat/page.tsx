"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  streaming?: boolean;
};

type Conversation = {
  id: string;
  title: string;
  model: string;
  updatedAt: string;
};

const MODELS = [
  { id: "groq:llama-3.3-70b-versatile", label: "Llama 3.3 70B — 무료", provider: "groq" },
  { id: "groq:llama-3.1-8b-instant", label: "Llama 3.1 8B (빠름) — 무료", provider: "groq" },
  { id: "groq:gemma2-9b-it", label: "Gemma 2 9B — 무료", provider: "groq" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", provider: "gemini" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "gemini" },
  { id: "gemini-1.5-flash-latest", label: "Gemini 1.5 Flash", provider: "gemini" },
  { id: "gemini-1.5-pro-latest", label: "Gemini 1.5 Pro", provider: "gemini" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "claude" },
  { id: "claude-opus-4-7", label: "Claude Opus 4.7", provider: "claude" },
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "openai" },
];

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [noApiKey, setNoApiKey] = useState(false);
  const [groqUsage, setGroqUsage] = useState<{ used: number; limit: number } | null>(null);
  const [registeredProviders, setRegisteredProviders] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const availableModels = MODELS.filter(
    (m) => m.provider === "groq" || registeredProviders.includes(m.provider)
  );

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
    }
    setLoadingConvs(false);
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    fetch("/api/ai-apikeys")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRegisteredProviders(data.map((k: { provider: string }) => k.provider));
        }
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversation(id: string) {
    setActiveId(id);
    const res = await fetch(`/api/conversations/${id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
      const saved = data.model as string | undefined;
      const isAvailable = saved && MODELS.find(
        (m) => m.id === saved && (m.provider === "groq" || registeredProviders.includes(m.provider))
      );
      setModel(isAvailable ? saved : MODELS[0].id);
    }
  }

  async function newConversation() {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "새 대화", model }),
    });
    if (res.ok) {
      const data = await res.json();
      setConversations((prev) => [data, ...prev]);
      setActiveId(data.id);
      setMessages([]);
    }
  }

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending || !activeId) return;

    const userMessage = input.trim();
    setInput("");
    setNoApiKey(false);
    setSending(true);

    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, createdAt: now },
      { role: "assistant", content: "", streaming: true },
    ]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, message: userMessage, model }),
      });

      if (!res.ok) {
        const err = await res.json();
        const errMsg = err.error || "오류가 발생했습니다.";
        if (errMsg.includes("API 키")) setNoApiKey(true);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: errMsg, streaming: false };
          return next;
        });
        setSending(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.text) {
              assistantContent += json.text;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: assistantContent, streaming: true };
                return next;
              });
            }
            if (json.titleUpdate) {
              setConversations((prev) =>
                prev.map((c) => c.id === activeId ? { ...c, title: json.titleUpdate } : c)
              );
            }
            if (json.done) {
              const clean = assistantContent.replace(/<<<MEM:\{[\s\S]*?\}>>>/g, "").trim();
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: clean, createdAt: new Date().toISOString(), streaming: false };
                return next;
              });
            }
            if (json.usageUpdate) {
              setGroqUsage(json.usageUpdate);
            }
            if (json.error) {
              if (json.error.includes("API 키")) setNoApiKey(true);
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: json.error, createdAt: new Date().toISOString(), streaming: false };
                return next;
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: "네트워크 오류가 발생했습니다.", streaming: false };
        return next;
      });
    }

    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--paper-1)", overflow: "hidden", width: "100%" }}>
      <Sidebar />

      {/* Conversation list */}
      <div style={{
        width: 240, minWidth: 240, borderRight: "1px solid var(--paper-line)", background: "var(--paper-0)",
        display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh",
      }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--paper-line)" }}>
          <button
            onClick={newConversation}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 16px", background: "var(--glow)", border: "none",
              borderRadius: 8, color: "var(--paper-0)", fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}
          >
            <PlusIcon /> 새 대화
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {loadingConvs ? (
            <p style={{ fontSize: 12, color: "var(--ink-5)", padding: "12px 8px", fontStyle: "italic" }}>불러오는 중…</p>
          ) : conversations.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--ink-5)", padding: "12px 8px", fontStyle: "italic" }}>대화 기록이 없습니다.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 10px",
                  borderRadius: 7, cursor: "pointer", marginBottom: 2,
                  background: activeId === conv.id ? "var(--paper-2)" : "transparent",
                  border: activeId === conv.id ? "1px solid var(--paper-line)" : "1px solid transparent",
                }}
              >
                <span style={{ flex: 1, fontSize: 12, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conv.title}
                </span>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  style={{ background: "none", border: "none", color: "var(--ink-5)", cursor: "pointer", padding: 2, flexShrink: 0, display: "flex", alignItems: "center" }}
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top bar */}
        <div style={{
          padding: "14px 24px", borderBottom: "1px solid var(--paper-line)",
          background: "var(--paper-0)", display: "flex", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
            {activeId
              ? conversations.find((c) => c.id === activeId)?.title || "대화"
              : "새 대화를 시작하세요"}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 8px" }}>
          {!activeId ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, paddingTop: 80 }}>
              <div style={{ fontSize: 40 }}>💬</div>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--ink-2)", margin: 0 }}>
                새 대화를 시작하세요
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-4)", margin: 0, textAlign: "center", maxWidth: 360, lineHeight: 1.7 }}>
                AI가 당신에 대해 기억한 내용을 바탕으로 더욱 개인화된 대화를 나눌 수 있습니다.
              </p>
              {noApiKey && (
                <div style={{ padding: "12px 20px", background: "rgba(177,75,62,0.08)", border: "1px solid rgba(177,75,62,0.25)", borderRadius: 8, fontSize: 13, color: "var(--danger)", textAlign: "center" }}>
                  API 키가 없습니다. <Link href="/settings" style={{ color: "var(--glow-deep)", fontWeight: 600 }}>설정 &rarr; AI 설정</Link>에서 키를 등록해주세요.
                </div>
              )}
              <button onClick={newConversation} style={{
                padding: "10px 24px", background: "var(--glow)", border: "none",
                borderRadius: 8, color: "var(--paper-0)", fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>
                + 새 대화 시작
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, gap: 10 }}>
              <p style={{ fontSize: 13, color: "var(--ink-4)", fontStyle: "italic" }}>메시지를 입력해 대화를 시작하세요.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* No API key warning */}
        {noApiKey && activeId && (
          <div style={{ margin: "0 24px 8px", padding: "10px 16px", background: "rgba(177,75,62,0.08)", border: "1px solid rgba(177,75,62,0.25)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>
            API 키가 없습니다. <Link href="/settings" style={{ color: "var(--glow-deep)", fontWeight: 600 }}>설정 &rarr; AI 설정</Link>에서 키를 등록해주세요.
          </div>
        )}

        {/* Input area */}
        {activeId && (
          <div style={{
            padding: "12px 24px 24px",
            background: "var(--paper-0)", borderTop: "1px solid var(--paper-line)",
          }}>
            {/* Model selector */}
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  padding: "5px 10px", background: "var(--paper-1)", border: "1px solid var(--paper-line)",
                  borderRadius: 6, fontSize: 12, color: "var(--ink-3)", cursor: "pointer", outline: "none",
                }}
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              {model.startsWith("groq:") && groqUsage && (
                <span style={{
                  fontSize: 11, color: groqUsage.used >= groqUsage.limit ? "var(--danger)" : "var(--ink-4)",
                  padding: "3px 8px", background: "var(--paper-2)", borderRadius: 5, border: "1px solid var(--paper-line)",
                }}>
                  오늘 {groqUsage.used} / {groqUsage.limit}회 사용
                </span>
              )}
            </div>

            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "var(--paper-1)", border: "1px solid var(--paper-line)",
              borderRadius: 12, padding: "10px 12px",
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={autoResize}
                onKeyDown={handleKeyDown}
                placeholder="메시지 입력… (Shift+Enter: 줄바꿈)"
                rows={1}
                disabled={sending}
                style={{
                  flex: 1, resize: "none", border: "none", background: "transparent",
                  fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink-1)",
                  outline: "none", lineHeight: 1.6, minHeight: 24, maxHeight: 200,
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: "none",
                  background: input.trim() && !sending ? "var(--glow)" : "var(--paper-3)",
                  color: "var(--paper-0)", cursor: input.trim() && !sending ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background 0.15s",
                }}
              >
                <SendIcon />
              </button>
            </div>
            <p style={{ fontSize: 11, color: "var(--ink-5)", margin: "6px 0 0", textAlign: "center" }}>
              AI 응답 중에 중요한 정보는 자동으로 기억에 저장됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
    }}>
      <div style={{
        maxWidth: "75%", minWidth: 0, padding: "12px 16px",
        background: isUser ? "var(--glow)" : "var(--paper-0)",
        color: isUser ? "var(--paper-0)" : "var(--ink-1)",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        border: isUser ? "none" : "1px solid var(--paper-line)",
        fontSize: 14, lineHeight: 1.7,
        boxShadow: "var(--shadow-1)",
        wordBreak: "break-word", overflowWrap: "break-word",
      }}>
        {message.content ? (
          <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.content}</span>
        ) : message.streaming ? (
          <span style={{ display: "inline-flex", gap: 4, alignItems: "center", color: "var(--ink-4)" }}>
            <span style={{ animation: "pulse-node 1s infinite 0s" }}>●</span>
            <span style={{ animation: "pulse-node 1s infinite 0.2s" }}>●</span>
            <span style={{ animation: "pulse-node 1s infinite 0.4s" }}>●</span>
          </span>
        ) : null}
      </div>
      {message.createdAt && (
        <span style={{
          fontSize: 11, color: "var(--ink-5)",
          marginTop: 4,
          paddingLeft: isUser ? 0 : 4,
          paddingRight: isUser ? 4 : 0,
        }}>
          {formatTime(message.createdAt)}
        </span>
      )}
    </div>
  );
}
