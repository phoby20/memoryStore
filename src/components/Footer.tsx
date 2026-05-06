import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto py-6 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <p className="text-gray-600 text-xs">© 2026 Memory Store</p>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
            이용약관
          </Link>
          <Link href="/privacy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
            개인정보 처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
