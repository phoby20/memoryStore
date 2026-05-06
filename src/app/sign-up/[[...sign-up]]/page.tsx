"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

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
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-4xl block mb-3">🧠</Link>
        <h1 className="text-2xl font-bold text-white mb-1">Memory Store</h1>
        <p className="text-gray-400 text-sm">
          {agreed ? "계정을 만들어 시작하세요" : "시작하기 전에 약관을 확인해주세요"}
        </p>
      </div>

      {!agreed ? (
        <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-white font-semibold text-base">서비스 이용 동의</h2>

          {/* 전체 동의 */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-colors" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <input
              type="checkbox"
              checked={termsChecked && privacyChecked}
              onChange={(e) => {
                setTermsChecked(e.target.checked);
                setPrivacyChecked(e.target.checked);
                setShowError(false);
              }}
              className="w-4 h-4 accent-purple-500"
            />
            <span className="text-white text-sm font-medium">전체 동의</span>
          </label>

          <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

          {/* 이용약관 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => { setTermsChecked(e.target.checked); setShowError(false); }}
              className="w-4 h-4 accent-purple-500 mt-0.5 shrink-0"
            />
            <div className="flex-1">
              <span className="text-gray-200 text-sm">
                <span className="text-red-400 mr-1">[필수]</span>
                이용약관 동의
              </span>
              <div>
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-purple-400 hover:text-purple-300 text-xs underline transition-colors"
                >
                  이용약관 전문 보기 →
                </Link>
              </div>
            </div>
          </label>

          {/* 개인정보 처리방침 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyChecked}
              onChange={(e) => { setPrivacyChecked(e.target.checked); setShowError(false); }}
              className="w-4 h-4 accent-purple-500 mt-0.5 shrink-0"
            />
            <div className="flex-1">
              <span className="text-gray-200 text-sm">
                <span className="text-red-400 mr-1">[필수]</span>
                개인정보 수집·이용 동의
              </span>
              <div>
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-purple-400 hover:text-purple-300 text-xs underline transition-colors"
                >
                  개인정보 처리방침 전문 보기 →
                </Link>
              </div>
            </div>
          </label>

          {/* 에러 메시지 */}
          {showError && (
            <p className="text-red-400 text-xs">필수 항목에 모두 동의해주세요.</p>
          )}

          {/* 계속하기 버튼 */}
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-xl text-white font-medium transition-colors"
            style={{ background: termsChecked && privacyChecked ? "#7c3aed" : "rgba(124,58,237,0.3)" }}
          >
            동의하고 계속하기
          </button>

          <p className="text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 transition-colors">
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
