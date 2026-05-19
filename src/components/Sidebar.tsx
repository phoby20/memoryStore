"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Logo from "./Logo";
import { useTheme } from "./ThemeProvider";

const items = [
  { id: "chat", label: "채팅", icon: "💬", href: "/chat" },
  { id: "dashboard", label: "기억 지도", icon: "◉", href: "/dashboard" },
  { id: "settings", label: "설정", icon: "⚙", href: "/settings" },
];

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const active = items.find((i) => pathname.startsWith(i.href))?.id ?? "";
  const { theme, toggle } = useTheme();

  return (
    <nav className="sidebar" style={{
      width: 256,
      padding: "28px 18px",
      borderRight: "1px solid var(--paper-line)",
      background: "var(--paper-0)",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      minHeight: "100vh",
      position: "sticky",
      top: 0,
      flexShrink: 0,
    }}>
      <div className="sidebar-logo-area" style={{ padding: "0 8px 24px" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <Logo />
        </Link>
      </div>

      <div className="sidebar-workspace-label" style={{ fontSize: 10, color: "var(--ink-4)", padding: "12px 12px 6px", letterSpacing: "0.1em" }}>
        WORKSPACE
      </div>

      <div className="sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => (
          <Link
            key={it.id}
            href={it.href}
            className="sidebar-nav-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              fontSize: 13,
              color: active === it.id ? "var(--ink-1)" : "var(--ink-3)",
              background: active === it.id ? "var(--paper-2)" : "transparent",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: active === it.id ? 600 : 400,
              transition: "background 0.15s",
            }}
          >
            <span style={{
              width: 16,
              textAlign: "center",
              color: active === it.id ? "var(--glow)" : "var(--ink-4)",
            }}>{it.icon}</span>
            <span className="sidebar-nav-label">{it.label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-bottom" style={{ marginTop: "auto", padding: "16px 8px 0", borderTop: "1px dashed var(--paper-line)" }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            marginBottom: 8,
            background: "transparent",
            border: "1px solid var(--paper-line)",
            borderRadius: 6,
            color: "var(--ink-3)",
            fontSize: 12,
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--paper-2)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)";
          }}
        >
          <span style={{ color: "var(--glow)", display: "flex", alignItems: "center" }}>
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </span>
          {theme === "light" ? "다크 모드" : "라이트 모드"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8 }}>
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
