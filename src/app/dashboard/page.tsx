"use client";

import { useState, useEffect, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

type Memory = {
  id: string;
  category: string;
  key: string;
  value: string;
  updatedAt: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  취향: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  건강: "bg-green-500/20 text-green-300 border-green-500/30",
  인간관계: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  재무: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  목표: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  습관: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  기타: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS["기타"];
}

export default function DashboardPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: "취향", key: "", value: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

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

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  useEffect(() => {
    const timer = setTimeout(() => fetchMemories(search || undefined), 300);
    return () => clearTimeout(timer);
  }, [search, fetchMemories]);

  async function handleAdd() {
    if (!form.key || !form.value) return;
    await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ category: "취향", key: "", value: "" });
    setShowAdd(false);
    fetchMemories(search || undefined);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/memories/${id}`, { method: "DELETE" });
    setMemories((prev) => prev.filter((m) => m.id !== id));
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

  const categories = ["전체", ...Array.from(new Set(memories.map((m) => m.category)))];
  const filtered = activeCategory === "전체" ? memories : memories.filter((m) => m.category === activeCategory);

  return (
    <div className="min-h-screen" style={{ background: "#0f0f13" }}>
      {/* 헤더 */}
      <header className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧠</span>
          <h1 className="text-xl font-bold text-white">Memory Store</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/settings" className="text-sm text-gray-400 hover:text-white transition-colors">
            설정
          </Link>
          <UserButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 검색 + 추가 */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              className="w-full rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              placeholder="메모리 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="text-white font-medium rounded-xl px-5 py-3 transition-colors whitespace-nowrap"
            style={{ background: "#7c3aed" }}
          >
            + 추가
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={
                activeCategory === cat
                  ? { background: "#7c3aed", color: "white", border: "1px solid #7c3aed" }
                  : { background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 추가 폼 */}
        {showAdd && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="text-white font-medium mb-4">새 메모리 추가</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">카테고리</label>
                <select
                  className="w-full rounded-lg px-3 py-2 text-white focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {["취향", "건강", "인간관계", "재무", "목표", "습관", "기타"].map((c) => (
                    <option key={c} value={c} style={{ background: "#1a1a2e" }}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">항목</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="ex: 음식"
                  maxLength={100}
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">내용</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="ex: 라멘을 좋아함"
                  maxLength={1000}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                취소
              </button>
              <button onClick={handleAdd} className="px-4 py-2 text-sm text-white rounded-lg" style={{ background: "#7c3aed" }}>
                저장
              </button>
            </div>
          </div>
        )}

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "전체 메모리", value: memories.length },
            { label: "카테고리", value: categories.length - 1 },
            { label: "현재 표시", value: filtered.length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-gray-400 text-xs mb-1">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* 메모리 목록 */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400">메모리가 없습니다. + 추가를 눌러 시작하세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((memory) => (
              <div
                key={memory.id}
                className="rounded-xl p-4 group transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(memory.category)} shrink-0 mt-0.5`}>
                    {memory.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm mb-1">{memory.key}</p>
                    {editingId === memory.id ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          className="flex-1 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid #7c3aed" }}
                          maxLength={1000}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleEdit(memory.id)}
                          autoFocus
                        />
                        <button onClick={() => handleEdit(memory.id)} className="px-3 py-1.5 text-white text-xs rounded-lg" style={{ background: "#7c3aed" }}>저장</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-gray-300 text-xs rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }}>취소</button>
                      </div>
                    ) : (
                      <p className="text-gray-300 text-sm">{memory.value}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => { setEditingId(memory.id); setEditValue(memory.value); }} className="p-1.5 rounded-lg text-gray-400 hover:text-white" title="수정">✏️</button>
                    <button onClick={() => handleDelete(memory.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400" title="삭제">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
