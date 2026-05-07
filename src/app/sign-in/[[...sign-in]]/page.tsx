import { SignIn } from "@clerk/nextjs";
import Logo from "@/components/Logo";

export default function SignInPage() {
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
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <Logo size={32} />
        <p style={{ marginTop: 10, fontSize: 13, color: "var(--ink-4)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          어떤 AI를 써도 당신을 기억합니다
        </p>
      </div>
      <SignIn routing="hash" />
    </div>
  );
}
