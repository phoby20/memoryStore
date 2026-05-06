import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "#0f0f13" }}>
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🧠</div>
        <h1 className="text-3xl font-bold text-white mb-2">Memory Store</h1>
        <p className="text-gray-400">어떤 AI를 써도 당신을 기억하는 장기 메모리</p>
      </div>
      <SignIn routing="hash" />
    </div>
  );
}
