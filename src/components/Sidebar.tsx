"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Logo from "./Logo";

const items = [
  { id: "dashboard", label: "기억 지도", icon: "◉", href: "/dashboard" },
  { id: "settings", label: "설정 & API 키", icon: "⚙", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const active = items.find((i) => pathname.startsWith(i.href))?.id ?? "";

  return (
    <nav style={{
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
      <div style={{ padding: "0 8px 24px" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <Logo />
        </Link>
      </div>

      <div style={{ fontSize: 10, color: "var(--ink-4)", padding: "12px 12px 6px", letterSpacing: "0.1em" }}>
        WORKSPACE
      </div>

      {items.map((it) => (
        <Link
          key={it.id}
          href={it.href}
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
          {it.label}
        </Link>
      ))}

      <div style={{ marginTop: "auto", padding: "16px 8px 0", borderTop: "1px dashed var(--paper-line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8 }}>
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
