import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🧠</div>
        <h1 className="text-4xl font-bold text-white mb-4">Memory Store</h1>
        <p className="text-gray-400 text-lg mb-2">어떤 AI를 써도 당신을 기억합니다.</p>
        <p className="text-gray-500 text-sm mb-10">
          ChatGPT, Claude, Gemini — AI가 바뀌어도 취향, 목표, 인간관계가 그대로 이어집니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/sign-up"
            className="px-8 py-3 rounded-xl text-white font-semibold text-lg transition-colors"
            style={{ background: "#7c3aed" }}
          >
            Google로 시작하기
          </Link>
          <Link
            href="/sign-in"
            className="px-8 py-3 rounded-xl font-semibold text-lg transition-colors text-gray-300"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            로그인
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "🔒", title: "개인정보 안전", desc: "Google 계정으로만 가입\n직접 관리 없음" },
            { icon: "🤖", title: "모든 AI 연동", desc: "Claude, ChatGPT 등\n어디서든 나를 기억" },
            { icon: "🆓", title: "무료 시작", desc: "10,000명까지\n완전 무료" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-white text-sm font-medium mb-1">{title}</p>
              <p className="text-gray-500 text-xs whitespace-pre-line">{desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-gray-600 text-xs">
          가입 시 개인정보 처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
