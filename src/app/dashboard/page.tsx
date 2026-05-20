"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Sidebar from "@/components/Sidebar";

type Memory = {
  id: string;
  category: string;
  key: string;
  value: string;
  updatedAt: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  취향: "#C97B4A",
  건강: "#6B8E5A",
  인간관계: "#B14B3E",
  재무: "#C9943C",
  목표: "#8B6F47",
  습관: "#C2A57F",
  기타: "#B5A289",
};

function getCatColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["기타"];
}

const CATEGORIES = ["취향", "건강", "인간관계", "재무", "목표", "습관", "기타"];

export default function DashboardPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"graph" | "list">("graph");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: "취향", key: "", value: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [graphSize, setGraphSize] = useState({ w: 800, h: 560 });

  const fetchMemories = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/search?q=${encodeURIComponent(q)}` : "/api/memories";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMemories(); }, [fetchMemories]);

  useEffect(() => {
    const el = graphRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setGraphSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchMemories(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search, fetchMemories]);

  async function handleAdd() {
    if (!form.key.trim() || !form.value.trim() || submitting) return;
    setSubmitting(true);
    setAddError(null);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAddError(data.error ?? "저장에 실패했습니다. 다시 시도해주세요.");
        return;
      }
      setForm({ category: "취향", key: "", value: "" });
      setShowAdd(false);
      fetchMemories(search || undefined);
    } catch {
      setAddError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/memories/${id}`, { method: "DELETE" });
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function handleEdit(id: string) {
    await fetch(`/api/memories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: editValue }),
    });
    setEditingId(null);
    fetchMemories(search || undefined);
  }

  const categories = useMemo(
    () => ["전체", ...Array.from(new Set(memories.map((m) => m.category)))],
    [memories]
  );

  const filtered = activeCategory === "전체"
    ? memories
    : memories.filter((m) => m.category === activeCategory);

  const selectedMemory = memories.find((m) => m.id === selectedId) ?? null;

  // Spider-web / neural-network graph layout
  const graphNodes = useMemo(() => {
    const cx = graphSize.w / 2;
    const cy = graphSize.h / 2;
    const minDim = Math.min(graphSize.w, graphSize.h);
    const catR = minDim * 0.30;

    // Category hub nodes — vertices of a heptagon
    const catNodes = CATEGORIES.map((cat, i) => {
      const angle = (i / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
      return {
        type: "cat" as const,
        id: `cat_${cat}`,
        cat,
        x: cx + Math.cos(angle) * catR,
        y: cy + Math.sin(angle) * catR * 0.84,
        color: getCatColor(cat),
        count: memories.filter((m) => m.category === cat).length,
      };
    });

    // Memory leaf nodes — arc-spread around their category hub
    const memNodes = memories.slice(0, 30).map((m) => {
      const catNode = catNodes.find((c) => c.cat === m.category) ?? catNodes[catNodes.length - 1];
      const sameCat = memories.filter((x) => x.category === m.category).slice(0, 30);
      const idx = sameCat.findIndex((x) => x.id === m.id);
      const count = sameCat.length;
      const awayAngle = Math.atan2(catNode.y - cy, catNode.x - cx);
      const spread = count <= 1 ? 0 : Math.min(Math.PI * 0.8, (count - 1) * 0.38);
      const angle = count <= 1 ? awayAngle : awayAngle - spread / 2 + (idx / (count - 1)) * spread;
      const memR = 52 + Math.min(count - 1, 4) * 5;
      return {
        type: "mem" as const,
        ...m,
        x: catNode.x + Math.cos(angle) * memR,
        y: catNode.y + Math.sin(angle) * memR,
        catNode,
      };
    });

    return { catNodes, memNodes, cx, cy };
  }, [memories, graphSize]);

  // Web edges: spokes (center→cat) + outer ring + inner star + memory→cat
  const graphEdges = useMemo(() => {
    const { catNodes, memNodes, cx, cy } = graphNodes;
    const edges: Array<{ x1: number; y1: number; x2: number; y2: number; kind: string; color?: string; memId?: string }> = [];

    // Spokes: center → category
    catNodes.forEach((c) => {
      edges.push({ x1: cx, y1: cy, x2: c.x, y2: c.y, kind: "spoke" });
    });

    // Outer ring: adjacent categories
    catNodes.forEach((c, i) => {
      const next = catNodes[(i + 1) % catNodes.length];
      edges.push({ x1: c.x, y1: c.y, x2: next.x, y2: next.y, kind: "ring" });
    });

    // Inner star: skip-3 connections → {7/3} heptagram
    catNodes.forEach((c, i) => {
      const j = (i + Math.floor(catNodes.length / 2)) % catNodes.length;
      edges.push({ x1: c.x, y1: c.y, x2: catNodes[j].x, y2: catNodes[j].y, kind: "inner" });
    });

    // Memory → category
    memNodes.forEach((m) => {
      edges.push({ x1: m.catNode.x, y1: m.catNode.y, x2: m.x, y2: m.y, kind: "mem", color: m.catNode.color, memId: m.id });
    });

    return edges;
  }, [graphNodes]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--paper-1)" }}>
      <Sidebar />

      <main className="app-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div className="dashboard-topbar" style={{
          padding: "24px 32px 0",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 4 }}>
              나의 기억
            </div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink-1)", margin: 0, fontWeight: 600 }}>
              기억 지도
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
            {/* View toggle */}
            <div style={{
              display: "flex",
              background: "var(--paper-2)",
              border: "1px solid var(--paper-line)",
              borderRadius: 8,
              padding: 3,
              gap: 2,
            }}>
              {(["graph", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "6px 14px",
                  fontSize: 12,
                  background: view === v ? "var(--paper-0)" : "transparent",
                  border: "none",
                  borderRadius: 5,
                  color: view === v ? "var(--ink-1)" : "var(--ink-4)",
                  fontWeight: view === v ? 600 : 400,
                  boxShadow: view === v ? "var(--shadow-1)" : "none",
                  cursor: "pointer",
                }}>
                  {v === "graph" ? "그래프" : "목록"}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAdd(true)} style={{
              padding: "8px 16px",
              background: "var(--ink-2)",
              border: "1px solid var(--ink-2)",
              color: "var(--paper-0)",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
            }}>
              + 추가
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, padding: "20px 32px 0" }}>
          {[
            { k: "저장된 기억", v: memories.length, glow: true },
            { k: "카테고리", v: categories.length - 1 },
            { k: "현재 표시", v: filtered.length },
          ].map((s) => (
            <div key={s.k} style={{
              background: "var(--paper-0)", border: "1px solid var(--paper-line)",
              borderRadius: 12, boxShadow: "var(--shadow-1)", padding: "14px 18px",
            }}>
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginBottom: 6 }}>{s.k}</div>
              <div style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26, fontWeight: 600,
                color: s.glow ? "var(--glow-deep)" : "var(--ink-1)",
                lineHeight: 1,
              }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="dashboard-add-form" style={{
            margin: "20px 32px 0",
            background: "var(--paper-0)",
            border: "1px solid var(--paper-line)",
            borderRadius: 12,
            padding: 20,
          }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 16px" }}>새 기억 추가</p>
            <div className="dashboard-add-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 2fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--ink-4)", marginBottom: 4 }}>카테고리</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 6, fontSize: 13, color: "var(--ink-2)", outline: "none" }}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--ink-4)", marginBottom: 4 }}>항목</label>
                <input
                  maxLength={100}
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  placeholder="예: 좋아하는 음식"
                  style={{ width: "100%", padding: "8px 10px", background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 6, fontSize: 13, color: "var(--ink-2)", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--ink-4)", marginBottom: 4 }}>내용</label>
                <input
                  maxLength={1000}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="예: 라멘을 특히 좋아함"
                  style={{ width: "100%", padding: "8px 10px", background: "var(--paper-1)", border: "1px solid var(--paper-line)", borderRadius: 6, fontSize: 13, color: "var(--ink-2)", outline: "none" }}
                />
              </div>
            </div>
            {addError && (
              <div style={{ marginBottom: 10, padding: "8px 12px", background: "rgba(177,75,62,0.08)", border: "1px solid rgba(177,75,62,0.25)", borderRadius: 6, fontSize: 12, color: "var(--danger)" }}>
                {addError}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setShowAdd(false); setAddError(null); }} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--paper-line)", borderRadius: 6, fontSize: 13, color: "var(--ink-3)", cursor: "pointer" }}>취소</button>
              <button onClick={handleAdd} disabled={submitting} style={{ padding: "8px 18px", background: "var(--glow)", border: "1px solid var(--glow)", borderRadius: 6, fontSize: 13, color: "var(--paper-0)", fontWeight: 500, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}>{submitting ? "저장 중…" : "저장"}</button>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="dashboard-content" style={{ flex: 1, display: "flex", gap: 0, padding: "20px 32px 32px" }}>
          {view === "graph" ? (
            <>
              {/* Graph canvas */}
              <div ref={graphRef} style={{
                flex: 1,
                background: "var(--paper-0)",
                border: "1px solid var(--paper-line)",
                borderRadius: 12,
                boxShadow: "var(--shadow-1)",
                overflow: "hidden",
                position: "relative",
                minHeight: 480,
              }}>
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--ink-4)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                    불러오는 중…
                  </div>
                ) : memories.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink-3)", fontStyle: "italic" }}>아직 기억이 없습니다</div>
                    <p style={{ fontSize: 13, color: "var(--ink-4)", margin: 0 }}>+ 추가 버튼을 눌러 첫 번째 기억을 저장하세요</p>
                  </div>
                ) : (
                  <svg viewBox={`0 0 ${graphSize.w} ${graphSize.h}`} style={{ width: "100%", height: "100%", display: "block" }}>
                    <defs>
                      <pattern id="dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                        <circle cx="14" cy="14" r="0.5" fill="var(--paper-line)" opacity="0.5" />
                      </pattern>
                      <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="var(--glow)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width={graphSize.w} height={graphSize.h} fill="url(#dot-grid)" />

                    {/* Center ambient glow */}
                    <circle cx={graphNodes.cx} cy={graphNodes.cy} r={graphSize.w * 0.22} fill="url(#center-glow)" />

                    {/* Web structural edges */}
                    {graphEdges.map((e, i) => {
                      const isMem = e.kind === "mem";
                      const highlighted = isMem && e.memId === selectedId;
                      const dimmed = !!selectedId && !highlighted && isMem;
                      return (
                        <line key={i}
                          x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                          stroke={
                            e.kind === "spoke" ? "var(--glow)"
                            : e.kind === "ring" ? "var(--ink-4)"
                            : e.kind === "inner" ? "var(--ink-5)"
                            : (e.color ?? "var(--paper-line)")
                          }
                          strokeWidth={
                            e.kind === "spoke" ? 1.0
                            : e.kind === "ring" ? 1.4
                            : e.kind === "inner" ? 0.7
                            : highlighted ? 1.6 : 0.9
                          }
                          opacity={
                            e.kind === "spoke" ? 0.28
                            : e.kind === "ring" ? 0.45
                            : e.kind === "inner" ? 0.18
                            : highlighted ? 0.9 : dimmed ? 0.1 : 0.45
                          }
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* Memory leaf nodes */}
                    {graphNodes.memNodes.map((n) => {
                      const sel = selectedId === n.id;
                      const faded = !!selectedId && !sel;
                      return (
                        <g key={n.id} onClick={() => setSelectedId(sel ? null : n.id)} style={{ cursor: "pointer" }}>
                          {sel && (
                            <circle cx={n.x} cy={n.y} r={15} fill="none"
                              stroke={n.catNode.color} strokeWidth="1"
                              strokeDasharray="3 4" opacity="0.7">
                              <animateTransform attributeName="transform" type="rotate"
                                from={`0 ${n.x} ${n.y}`} to={`360 ${n.x} ${n.y}`}
                                dur="8s" repeatCount="indefinite" />
                            </circle>
                          )}
                          <circle cx={n.x} cy={n.y} r={sel ? 9 : 6}
                            fill={n.catNode.color} stroke="var(--paper-0)" strokeWidth="1.4"
                            opacity={faded ? 0.25 : 0.9} />
                          <text x={n.x} y={n.y + (sel ? 9 : 6) + 12}
                            textAnchor="middle" fontSize="9.5" fill="var(--ink-3)"
                            fontFamily="var(--font-sans)" opacity={faded ? 0.3 : 1}>
                            {n.key.length > 7 ? n.key.slice(0, 6) + "…" : n.key}
                          </text>
                        </g>
                      );
                    })}

                    {/* Category hub nodes */}
                    {graphNodes.catNodes.map((c) => {
                      const awayAngle = Math.atan2(c.y - graphNodes.cy, c.x - graphNodes.cx);
                      const lx = c.x + Math.cos(awayAngle) * 28;
                      const ly = c.y + Math.sin(awayAngle) * 28;
                      const hasMemories = c.count > 0;
                      return (
                        <g key={c.id}>
                          <circle cx={c.x} cy={c.y} r={22} fill={c.color} opacity="0.07" />
                          <circle cx={c.x} cy={c.y} r={14} fill={c.color} opacity="0.18"
                            stroke={c.color} strokeWidth={hasMemories ? 1.8 : 0.8} />
                          <circle cx={c.x} cy={c.y} r={8} fill={c.color}
                            stroke="var(--paper-0)" strokeWidth="1.5"
                            opacity={hasMemories ? 1 : 0.4} />
                          <text x={lx} y={ly + 4} textAnchor="middle"
                            fontSize="11" fill="var(--ink-1)" fontFamily="var(--font-sans)" fontWeight="600">
                            {c.cat}
                          </text>
                          {c.count > 0 && (
                            <text x={lx} y={ly + 17} textAnchor="middle"
                              fontSize="9" fill="var(--ink-4)" fontFamily="var(--font-mono)">
                              {c.count}개
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Center "나" node */}
                    <circle cx={graphNodes.cx} cy={graphNodes.cy} r={30} fill="var(--glow)" opacity="0.07" />
                    <circle cx={graphNodes.cx} cy={graphNodes.cy} r={18} fill="var(--glow)" opacity="0.15" />
                    <circle cx={graphNodes.cx} cy={graphNodes.cy} r={11} fill="var(--glow)"
                      stroke="var(--paper-0)" strokeWidth="1.8">
                      <animate attributeName="r" values="11;13;11" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <text x={graphNodes.cx} y={graphNodes.cy + 5} textAnchor="middle"
                      fontSize="11" fill="var(--paper-0)" fontFamily="var(--font-serif)"
                      fontStyle="italic" fontWeight="700">나</text>
                  </svg>
                )}
              </div>

              {/* Right rail — selected memory */}
              <div className="dashboard-right-rail" style={{
                width: 320,
                marginLeft: 16,
                background: "var(--paper-0)",
                border: "1px solid var(--paper-line)",
                borderRadius: 12,
                padding: 20,
                overflowY: "auto",
                flexShrink: 0,
              }}>
                {selectedMemory ? (
                  <>
                    <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 14 }}>선택한 기억</div>
                    <div style={{
                      background: "var(--paper-1)",
                      border: "1px solid var(--paper-line)",
                      borderRadius: 10,
                      padding: 16,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: getCatColor(selectedMemory.category), display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                          {selectedMemory.category}
                        </span>
                        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--ink-5)", fontFamily: "var(--font-mono)" }}>
                          {new Date(selectedMemory.updatedAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <p style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--ink-2)", margin: "0 0 8px", lineHeight: 1.5 }}>
                        {selectedMemory.key}
                      </p>
                      {editingId === selectedMemory.id ? (
                        <div>
                          <input
                            autoFocus
                            maxLength={1000}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleEdit(selectedMemory.id)}
                            style={{ width: "100%", padding: "6px 8px", background: "var(--paper-0)", border: "1px solid var(--glow)", borderRadius: 4, fontSize: 13, color: "var(--ink-2)", outline: "none", marginBottom: 8 }}
                          />
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleEdit(selectedMemory.id)} style={{ flex: 1, padding: "6px", background: "var(--glow)", border: "none", borderRadius: 4, color: "var(--paper-0)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>저장</button>
                            <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "6px", background: "var(--paper-2)", border: "none", borderRadius: 4, color: "var(--ink-3)", fontSize: 12, cursor: "pointer" }}>취소</button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 12px", lineHeight: 1.55 }}>{selectedMemory.value}</p>
                      )}
                      <div style={{ paddingTop: 10, borderTop: "1px dashed var(--paper-line)", display: "flex", gap: 6 }}>
                        <button
                          onClick={() => { setEditingId(selectedMemory.id); setEditValue(selectedMemory.value); }}
                          style={{ flex: 1, padding: "6px", background: "var(--paper-2)", border: "1px solid var(--paper-line)", borderRadius: 4, color: "var(--ink-3)", fontSize: 12, cursor: "pointer" }}
                        >✏️ 편집</button>
                        <button
                          onClick={() => handleDelete(selectedMemory.id)}
                          style={{ flex: 1, padding: "6px", background: "rgba(177,75,62,0.08)", border: "1px solid rgba(177,75,62,0.2)", borderRadius: 4, color: "var(--danger)", fontSize: 12, cursor: "pointer" }}
                        >🗑️ 삭제</button>
                      </div>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 10 }}>같은 카테고리</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {memories.filter((m) => m.category === selectedMemory.category && m.id !== selectedMemory.id).slice(0, 4).map((m) => (
                          <div key={m.id} onClick={() => setSelectedId(m.id)} style={{
                            padding: 10, border: "1px solid var(--paper-line)", borderRadius: 6,
                            background: "var(--paper-1)", cursor: "pointer",
                            display: "flex", gap: 8, alignItems: "flex-start",
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: getCatColor(m.category), display: "inline-block", marginTop: 4, flexShrink: 0 }} />
                            <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.45 }}>
                              <span style={{ fontWeight: 600, color: "var(--ink-2)" }}>{m.key}</span>
                              <br />
                              {m.value.length > 40 ? m.value.slice(0, 38) + "…" : m.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 200, gap: 10 }}>
                    <svg width="40" height="40" viewBox="0 0 26 26" opacity="0.3">
                      <circle cx="13" cy="13" r="11.5" fill="none" stroke="var(--ink-3)" strokeWidth="0.8" />
                      <circle cx="13" cy="13" r="5" fill="var(--glow)" />
                    </svg>
                    <p style={{ fontSize: 13, color: "var(--ink-4)", textAlign: "center", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                      그래프에서 노드를 선택하면<br />기억 내용을 볼 수 있습니다
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* List view */
            <div style={{ flex: 1 }}>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", fontSize: 16 }}>⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="기억을 검색하세요…"
                  style={{
                    width: "100%", padding: "12px 16px 12px 44px",
                    background: "var(--paper-0)", border: "1px solid var(--paper-line)",
                    borderRadius: 10, fontSize: 14, color: "var(--ink-1)", outline: "none",
                    fontFamily: "var(--font-serif)",
                  }}
                />
              </div>

              {/* Category tabs */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                    padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500,
                    background: activeCategory === cat ? "var(--ink-2)" : "var(--paper-2)",
                    color: activeCategory === cat ? "var(--paper-0)" : "var(--ink-3)",
                    border: activeCategory === cat ? "1px solid var(--ink-2)" : "1px solid var(--paper-line)",
                    cursor: "pointer",
                  }}>{cat}</button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "var(--ink-4)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>불러오는 중…</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink-4)", fontStyle: "italic" }}>기억이 없습니다</p>
                  <p style={{ fontSize: 13, color: "var(--ink-5)" }}>+ 추가 버튼을 눌러 시작하세요</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filtered.map((memory) => (
                    <div key={memory.id} style={{
                      background: "var(--paper-0)", border: "1px solid var(--paper-line)",
                      borderRadius: 10, padding: 16,
                      display: "flex", alignItems: "flex-start", gap: 12,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: getCatColor(memory.category), display: "inline-block", marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{memory.category}</span>
                          <span style={{ fontSize: 10, color: "var(--ink-5)", fontFamily: "var(--font-mono)", marginLeft: "auto" }}>
                            {new Date(memory.updatedAt).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 4px" }}>{memory.key}</p>
                        {editingId === memory.id ? (
                          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                            <input
                              autoFocus
                              maxLength={1000}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleEdit(memory.id)}
                              style={{ flex: 1, padding: "6px 10px", background: "var(--paper-1)", border: "1px solid var(--glow)", borderRadius: 5, fontSize: 13, color: "var(--ink-2)", outline: "none" }}
                            />
                            <button onClick={() => handleEdit(memory.id)} style={{ padding: "6px 12px", background: "var(--glow)", border: "none", borderRadius: 5, color: "var(--paper-0)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>저장</button>
                            <button onClick={() => setEditingId(null)} style={{ padding: "6px 12px", background: "var(--paper-2)", border: "none", borderRadius: 5, color: "var(--ink-3)", fontSize: 12, cursor: "pointer" }}>취소</button>
                          </div>
                        ) : (
                          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, lineHeight: 1.55 }}>{memory.value}</p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button
                          onClick={() => { setEditingId(memory.id); setEditValue(memory.value); }}
                          style={{ padding: "5px 8px", background: "transparent", border: "none", color: "var(--ink-4)", fontSize: 14, cursor: "pointer", borderRadius: 4 }}
                          title="편집"
                        >✏️</button>
                        <button
                          onClick={() => handleDelete(memory.id)}
                          style={{ padding: "5px 8px", background: "transparent", border: "none", color: "var(--ink-4)", fontSize: 14, cursor: "pointer", borderRadius: 4 }}
                          title="삭제"
                        >🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
