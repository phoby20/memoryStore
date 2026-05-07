"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function SignUpPage() {
  const [agreed, setAgreed] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showError, setShowError] = useState(false);

  function handleContinue() {
    if (!termsChecked || !privacyChecked) {
      setShowError(true);
      return;
    }
    setAgreed(true);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--paper-1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <Logo size={32} />
        <p style={{ marginTop: 10, fontSize: 13, color: "var(--ink-4)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {agreed ? "계정을 만들어 시작하세요" : "시작하기 전에 약관을 확인해주세요"}
        </p>
      </div>

      {!agreed ? (
        <div style={{
          width: "100%", maxWidth: 420,
          background: "var(--paper-0)",
          border: "1px solid var(--paper-line)",
          borderRadius: 14,
          boxShadow: "var(--shadow-2)",
          padding: 28,
        }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 20px" }}>
            서비스 이용 동의
          </p>

          {/* 전체 동의 */}
          <label style={{
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            padding: "12px 16px", borderRadius: 8, marginBottom: 16,
            background: "rgba(201,123,74,0.08)", border: "1px solid rgba(201,123,74,0.25)",
          }}>
            <input
              type="checkbox"
              checked={termsChecked && privacyChecked}
              onChange={(e) => {
                setTermsChecked(e.target.checked);
                setPrivacyChecked(e.target.checked);
                setShowError(false);
              }}
              style={{ width: 16, height: 16, accentColor: "var(--glow)" }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)" }}>전체 동의</span>
          </label>

          <div style={{ height: 1, background: "var(--paper-line)", margin: "0 0 16px" }} />

          {/* 이용약관 */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: 14 }}>
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => { setTermsChecked(e.target.checked); setShowError(false); }}
              style={{ width: 16, height: 16, accentColor: "var(--glow)", marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
                <span style={{ color: "var(--danger)", marginRight: 4, fontSize: 11, fontWeight: 600 }}>[필수]</span>
                이용약관 동의
              </span>
              <div style={{ marginTop: 3 }}>
                <Link href="/terms" target="_blank" style={{ fontSize: 12, color: "var(--glow-deep)", textDecoration: "underline" }}>
                  이용약관 전문 보기 →
                </Link>
              </div>
            </div>
          </label>

          {/* 개인정보 처리방침 */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: 20 }}>
            <input
              type="checkbox"
              checked={privacyChecked}
              onChange={(e) => { setPrivacyChecked(e.target.checked); setShowError(false); }}
              style={{ width: 16, height: 16, accentColor: "var(--glow)", marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
                <span style={{ color: "var(--danger)", marginRight: 4, fontSize: 11, fontWeight: 600 }}>[필수]</span>
                개인정보 수집·이용 동의
              </span>
              <div style={{ marginTop: 3 }}>
                <Link href="/privacy" target="_blank" style={{ fontSize: 12, color: "var(--glow-deep)", textDecoration: "underline" }}>
                  개인정보 처리방침 전문 보기 →
                </Link>
              </div>
            </div>
          </label>

          {showError && (
            <p style={{ fontSize: 12, color: "var(--danger)", margin: "0 0 12px" }}>필수 항목에 모두 동의해주세요.</p>
          )}

          <button onClick={handleContinue} style={{
            width: "100%", padding: "12px",
            background: termsChecked && privacyChecked ? "var(--glow)" : "var(--paper-line)",
            border: "none", borderRadius: 8,
            color: "var(--paper-0)", fontSize: 14, fontWeight: 500,
            cursor: "pointer", transition: "background 0.15s",
          }}>
            동의하고 계속하기
          </button>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--ink-4)" }}>
            이미 계정이 있으신가요?{" "}
            <Link href="/sign-in" style={{ color: "var(--glow-deep)", textDecoration: "none", fontWeight: 500 }}>
              로그인
            </Link>
          </p>
        </div>
      ) : (
        <SignUp routing="hash" />
      )}
    </div>
  );
}
