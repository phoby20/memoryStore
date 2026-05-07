import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer style={{
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
      <div style={{ display: "flex", gap: 20 }}>
        <Link href="/terms" style={{ color: "var(--ink-4)", textDecoration: "none" }}>이용약관</Link>
        <Link href="/privacy" style={{ color: "var(--ink-4)", textDecoration: "none" }}>개인정보 처리방침</Link>
      </div>
    </footer>
  );
}
