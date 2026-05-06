import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memory Store — AI 개인 비서 메모리",
  description: "AI 비서가 당신을 기억하는 장기 메모리 스토어",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ko" className="h-full">
        <body className="min-h-full flex flex-col" style={{ background: "#0f0f13" }}>
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
