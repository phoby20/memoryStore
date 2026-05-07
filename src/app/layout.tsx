import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memory Store — AI 개인 비서 메모리",
  description: "AI 비서가 당신을 기억하는 장기 메모리 스토어",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600&family=Noto+Sans+KR:wght@400;500&family=JetBrains+Mono:wght@400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body style={{ minHeight: "100vh" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
